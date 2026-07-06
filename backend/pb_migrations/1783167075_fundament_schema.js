/// <reference path="../pb_data/types.d.ts" />

// Komplettes Datenmodell der Handwerkerkalender-App in einer einzigen Migration.
// Da wir uns noch vor dem Produktiv-Rollout befinden (keine echten Daten im Bestand),
// wurden die ursprünglich schrittweise gewachsenen Migrationen (Fundament, Feed/Event-Regeln,
// created/updated-Felder, User-manageRule, Fahrzeuge & Kunden-Geo, Kunden-Verknüpfung,
// optionaler Kundenname, Firmenstammdaten) zu diesem einen Stand zusammengeführt. Neue
// Schemaänderungen kommen ab jetzt wieder als eigene, zusätzliche Migrationen dazu.

const CHEF_OR_BUERO = '@request.auth.role = "chef" || @request.auth.role = "buero"'
const AUTH = "@request.auth.id != ''"

// Felder müssen per FieldsList.add() angehängt werden statt über die "fields"-Option des
// Collection-Konstruktors – sonst kennt der Rule-Parser beim anschließenden app.save() die
// Feldnamen noch nicht ("unknown field ...").
function addFields(collection, fields) {
  for (const field of fields) {
    collection.fields.add(field)
  }
}

function withTimestamps(collection) {
  collection.fields.add(new AutodateField({ name: 'created', onCreate: true, onUpdate: false }))
  collection.fields.add(new AutodateField({ name: 'updated', onCreate: true, onUpdate: true }))
}

migrate(
  (app) => {
    // --- users (eingebaute Auth-Collection erweitert) -----------------------------------
    const usersCollection = app.findCollectionByNameOrId('users')
    usersCollection.fields.add(
      new SelectField({
        name: 'role',
        required: true,
        values: ['chef', 'buero', 'monteur', 'helfer'],
        maxSelect: 1,
      })
    )
    usersCollection.fields.add(new TextField({ name: 'phone' }))
    usersCollection.listRule = AUTH
    usersCollection.viewRule = AUTH
    usersCollection.createRule = CHEF_OR_BUERO
    usersCollection.updateRule = `id = @request.auth.id || (${CHEF_OR_BUERO})`
    usersCollection.deleteRule = CHEF_OR_BUERO
    // Erlaubt Chef/Büro, Passwörter von Mitarbeitern ohne "oldPassword" zurückzusetzen.
    usersCollection.manageRule = CHEF_OR_BUERO
    app.save(usersCollection)

    // --- customers ------------------------------------------------------------------------
    const customers = new Collection({ type: 'base', name: 'customers' })
    addFields(customers, [
      new TextField({ name: 'kdnr' }),
      // Bewusst nicht required: das Kundenformular erlaubt "nur Ansprechpartner, keine Firma"
      // (z. B. private Kunden ohne Firmennamen) – Validierung "name ODER contact" läuft im
      // Frontend (Zod-Refine).
      new TextField({ name: 'name' }),
      new TextField({ name: 'contact' }),
      new TextField({ name: 'street' }),
      new TextField({ name: 'zip' }),
      new TextField({ name: 'city' }),
      new TextField({ name: 'phone' }),
      new TextField({ name: 'email' }),
      new TextField({ name: 'notes', max: 5000 }),
      new TextField({ name: 'source' }),
      // Geokoordinaten für die Fahrzeug-Karte, serverseitig per Hook aus der Adresse aufgelöst.
      new NumberField({ name: 'lat', min: -90, max: 90 }),
      new NumberField({ name: 'lng', min: -180, max: 180 }),
    ])
    withTimestamps(customers)
    customers.listRule = AUTH
    customers.viewRule = AUTH
    customers.createRule = CHEF_OR_BUERO
    customers.updateRule = CHEF_OR_BUERO
    customers.deleteRule = CHEF_OR_BUERO
    app.save(customers)

    // --- sites (Baustellen) ----------------------------------------------------------------
    // Löst das Problem, dass die Einsatzadresse von der Kundenadresse abweichen kann, ohne
    // die Kundenadresse selbst zu verbiegen.
    const sites = new Collection({ type: 'base', name: 'sites' })
    sites.fields.add(
      // required + cascadeDelete: eine Baustelle ohne Kunde ist sinnlos; wird der Kunde
      // gelöscht, werden seine Baustellen automatisch mitgelöscht statt als Datenleiche
      // mit leerem Pflichtfeld zurückzubleiben.
      new RelationField({
        name: 'customer',
        required: true,
        collectionId: customers.id,
        maxSelect: 1,
        cascadeDelete: true,
      })
    )
    sites.fields.add(new TextField({ name: 'label' }))
    sites.fields.add(new TextField({ name: 'street' }))
    sites.fields.add(new TextField({ name: 'zip' }))
    sites.fields.add(new TextField({ name: 'city' }))
    sites.fields.add(new TextField({ name: 'notes', max: 2000 }))
    withTimestamps(sites)
    sites.listRule = AUTH
    sites.viewRule = AUTH
    sites.createRule = CHEF_OR_BUERO
    sites.updateRule = CHEF_OR_BUERO
    sites.deleteRule = CHEF_OR_BUERO
    app.save(sites)

    // --- orders -----------------------------------------------------------------------------
    // Ohne die "project"-Relation angelegt, weil projects.scheduledOrder im Gegenzug auf
    // orders zeigt; das Feld wird unten nachträglich ergänzt.
    const orders = new Collection({ type: 'base', name: 'orders' })
    addFields(orders, [
      new TextField({ name: 'title', required: true }),
      new SelectField({
        name: 'trade',
        required: true,
        maxSelect: 1,
        values: [
          'heizung',
          'sanitaer',
          'elektro',
          'klima',
          'innenausbau',
          'besichtigung',
          'urlaub',
          'krank',
        ],
      }),
      new TextField({ name: 'date', required: true, pattern: '^\\d{4}-\\d{2}-\\d{2}$' }),
      new TextField({ name: 'from', pattern: '^\\d{2}:\\d{2}$' }),
      new TextField({ name: 'to', pattern: '^\\d{2}:\\d{2}$' }),
      new TextField({ name: 'client' }),
      new TextField({ name: 'phone' }),
      new TextField({ name: 'address' }),
      new TextField({ name: 'material', max: 5000 }),
      new TextField({ name: 'desc', max: 5000 }),
      new TextField({ name: 'note', max: 5000 }),
      new RelationField({
        name: 'assigned',
        collectionId: app.findCollectionByNameOrId('users').id,
        maxSelect: 999,
      }),
      new SelectField({
        name: 'status',
        required: true,
        maxSelect: 1,
        values: ['offen', 'erledigt'],
      }),
      new RelationField({
        name: 'closedBy',
        collectionId: app.findCollectionByNameOrId('users').id,
        maxSelect: 1,
      }),
      new DateField({ name: 'closedAt' }),
      new BoolField({ name: 'rapportSigned' }),
      new TextField({ name: 'rapportReason', max: 2000 }),
      new RelationField({ name: 'customer', collectionId: customers.id, maxSelect: 1 }),
      new RelationField({ name: 'site', collectionId: sites.id, maxSelect: 1 }),
    ])
    withTimestamps(orders)
    orders.listRule = AUTH
    orders.viewRule = AUTH
    orders.createRule = CHEF_OR_BUERO
    // Monteure dürfen zugewiesene Aufträge ebenfalls schreiben (Status/Foto/Zeit/Rapport-Zusatz).
    // Eine Beschränkung auf einzelne Felder ist über API-Rules allein nicht möglich; das
    // Verhindern von Stammdaten-Änderungen durch Monteure erfordert einen pb_hook (siehe Plan Abschnitt 8).
    orders.updateRule = `(${CHEF_OR_BUERO}) || assigned.id ?= @request.auth.id`
    orders.deleteRule = CHEF_OR_BUERO
    app.save(orders)

    // --- projects -----------------------------------------------------------------------------
    const projects = new Collection({ type: 'base', name: 'projects' })
    addFields(projects, [
      new TextField({ name: 'projnr' }),
      new TextField({ name: 'title' }),
      new TextField({ name: 'client' }),
      new TextField({ name: 'street' }),
      new TextField({ name: 'zip' }),
      new TextField({ name: 'city' }),
      new TextField({ name: 'phone' }),
      new NumberField({ name: 'value' }),
      new TextField({ name: 'date' }),
      new TextField({ name: 'desc', max: 5000 }),
      new SelectField({
        name: 'status',
        required: true,
        maxSelect: 1,
        values: ['offen', 'eingeplant', 'erledigt'],
      }),
      new RelationField({
        name: 'scheduledOrder',
        collectionId: orders.id,
        maxSelect: 1,
      }),
      new RelationField({ name: 'customer', collectionId: customers.id, maxSelect: 1 }),
      new RelationField({ name: 'site', collectionId: sites.id, maxSelect: 1 }),
    ])
    withTimestamps(projects)
    projects.listRule = AUTH
    projects.viewRule = AUTH
    projects.createRule = CHEF_OR_BUERO
    projects.updateRule = CHEF_OR_BUERO
    projects.deleteRule = CHEF_OR_BUERO
    app.save(projects)

    addFields(orders, [
      new RelationField({
        name: 'project',
        collectionId: projects.id,
        maxSelect: 1,
      }),
    ])
    app.save(orders)

    // --- order_reads --------------------------------------------------------------------------
    const orderReads = new Collection({ type: 'base', name: 'order_reads' })
    orderReads.fields.add(
      new RelationField({ name: 'order', required: true, collectionId: orders.id, maxSelect: 1 })
    )
    orderReads.fields.add(
      new RelationField({
        // "user" ist als Rule-Feldname bei PocketBase reserviert (Filter-Resolver-Konflikt),
        // daher hier "reader" statt der wörtlichen Vorlagen-Bezeichnung.
        name: 'reader',
        required: true,
        collectionId: app.findCollectionByNameOrId('users').id,
        maxSelect: 1,
      })
    )
    orderReads.fields.add(new AutodateField({ name: 'readAt', onCreate: true, onUpdate: false }))
    withTimestamps(orderReads)
    orderReads.listRule = AUTH
    orderReads.viewRule = AUTH
    orderReads.createRule = 'reader = @request.auth.id'
    orderReads.deleteRule = `reader = @request.auth.id || (${CHEF_OR_BUERO})`
    app.save(orderReads)

    // --- order_photos --------------------------------------------------------------------------
    const orderPhotos = new Collection({ type: 'base', name: 'order_photos' })
    addFields(orderPhotos, [
      new RelationField({ name: 'order', required: true, collectionId: orders.id, maxSelect: 1 }),
      new FileField({
        name: 'file',
        required: true,
        maxSelect: 1,
        maxSize: 8388608,
        mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
      }),
      new RelationField({
        name: 'uploadedBy',
        required: true,
        collectionId: app.findCollectionByNameOrId('users').id,
        maxSelect: 1,
      }),
    ])
    withTimestamps(orderPhotos)
    orderPhotos.listRule = AUTH
    orderPhotos.viewRule = AUTH
    orderPhotos.createRule = `@request.body.uploadedBy = @request.auth.id && (order.assigned.id ?= @request.auth.id || (${CHEF_OR_BUERO}))`
    orderPhotos.deleteRule = `uploadedBy = @request.auth.id || (${CHEF_OR_BUERO})`
    app.save(orderPhotos)

    // --- rapports & rapport_materials -----------------------------------------------------------
    const rapports = new Collection({ type: 'base', name: 'rapports' })
    addFields(rapports, [
      new RelationField({ name: 'order', required: true, collectionId: orders.id, maxSelect: 1 }),
      new RelationField({
        name: 'author',
        required: true,
        collectionId: app.findCollectionByNameOrId('users').id,
        maxSelect: 1,
      }),
      new TextField({ name: 'text', max: 5000 }),
      new FileField({
        name: 'signature',
        maxSelect: 1,
        maxSize: 2097152,
        mimeTypes: ['image/png', 'image/jpeg'],
      }),
      new TextField({ name: 'signedName' }),
      new TextField({ name: 'date', required: true, pattern: '^\\d{4}-\\d{2}-\\d{2}$' }),
    ])
    withTimestamps(rapports)
    rapports.listRule = AUTH
    rapports.viewRule = AUTH
    rapports.createRule = `@request.body.author = @request.auth.id && (order.assigned.id ?= @request.auth.id || (${CHEF_OR_BUERO}))`
    rapports.updateRule = `author = @request.auth.id || (${CHEF_OR_BUERO})`
    rapports.deleteRule = `author = @request.auth.id || (${CHEF_OR_BUERO})`
    app.save(rapports)

    const rapportMaterials = new Collection({ type: 'base', name: 'rapport_materials' })
    addFields(rapportMaterials, [
      new RelationField({
        name: 'rapport',
        required: true,
        collectionId: rapports.id,
        maxSelect: 1,
      }),
      new NumberField({ name: 'qty' }),
      new TextField({ name: 'unit' }),
      new TextField({ name: 'desc' }),
    ])
    withTimestamps(rapportMaterials)
    rapportMaterials.listRule = AUTH
    rapportMaterials.viewRule = AUTH
    rapportMaterials.createRule = `rapport.author = @request.auth.id || (${CHEF_OR_BUERO})`
    rapportMaterials.updateRule = `rapport.author = @request.auth.id || (${CHEF_OR_BUERO})`
    rapportMaterials.deleteRule = `rapport.author = @request.auth.id || (${CHEF_OR_BUERO})`
    app.save(rapportMaterials)

    // --- timelog ---------------------------------------------------------------------------------
    const timelog = new Collection({ type: 'base', name: 'timelog' })
    addFields(timelog, [
      new RelationField({
        name: 'employee',
        required: true,
        collectionId: app.findCollectionByNameOrId('users').id,
        maxSelect: 1,
      }),
      new TextField({ name: 'date', required: true, pattern: '^\\d{4}-\\d{2}-\\d{2}$' }),
      new TextField({ name: 'von', pattern: '^\\d{2}:\\d{2}$' }),
      new TextField({ name: 'bis', pattern: '^\\d{2}:\\d{2}$' }),
      new NumberField({ name: 'hours' }),
      new TextField({ name: 'travelVon', pattern: '^\\d{2}:\\d{2}$' }),
      new TextField({ name: 'travelBis', pattern: '^\\d{2}:\\d{2}$' }),
      new NumberField({ name: 'travel' }),
      new RelationField({ name: 'order', collectionId: orders.id, maxSelect: 1 }),
      new TextField({ name: 'note', max: 2000 }),
    ])
    withTimestamps(timelog)
    timelog.listRule = AUTH
    timelog.viewRule = AUTH
    timelog.createRule = `employee = @request.auth.id || (${CHEF_OR_BUERO})`
    timelog.updateRule = `employee = @request.auth.id || (${CHEF_OR_BUERO})`
    timelog.deleteRule = `employee = @request.auth.id || (${CHEF_OR_BUERO})`
    app.save(timelog)

    // --- feed_posts & feed_comments -----------------------------------------------------------
    // updateRule ist bewusst für JEDEN authentifizierten Nutzer offen (nicht nur Autor/Chef/Büro),
    // da Liken (feed_posts.likes) keine Stammdaten-Änderung ist. PocketBase-API-Rules können nicht
    // auf einzelne Felder beschränkt werden (gleiche Einschränkung wie bei orders.updateRule) –
    // vollständige Feld-Reglementierung würde einen pb_hook erfordern (Plan Abschnitt 8).
    const feedPosts = new Collection({ type: 'base', name: 'feed_posts' })
    addFields(feedPosts, [
      new RelationField({
        name: 'author',
        required: true,
        collectionId: app.findCollectionByNameOrId('users').id,
        maxSelect: 1,
      }),
      new TextField({ name: 'text', required: true, max: 5000 }),
      new SelectField({
        name: 'category',
        required: true,
        maxSelect: 1,
        values: ['werkzeug', 'sauberkeit', 'frage', 'info', 'lob', 'fahrzeug'],
      }),
      new FileField({
        name: 'image',
        maxSelect: 1,
        maxSize: 8388608,
        mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
      }),
      new BoolField({ name: 'pinned' }),
      new BoolField({ name: 'resolved' }),
      new RelationField({
        name: 'likes',
        collectionId: app.findCollectionByNameOrId('users').id,
        maxSelect: 999,
      }),
    ])
    withTimestamps(feedPosts)
    feedPosts.listRule = AUTH
    feedPosts.viewRule = AUTH
    feedPosts.createRule = '@request.body.author = @request.auth.id'
    feedPosts.updateRule = AUTH
    feedPosts.deleteRule = `author = @request.auth.id || (${CHEF_OR_BUERO})`
    app.save(feedPosts)

    const feedComments = new Collection({ type: 'base', name: 'feed_comments' })
    addFields(feedComments, [
      new RelationField({
        name: 'post',
        required: true,
        collectionId: feedPosts.id,
        maxSelect: 1,
      }),
      new RelationField({
        name: 'author',
        required: true,
        collectionId: app.findCollectionByNameOrId('users').id,
        maxSelect: 1,
      }),
      new TextField({ name: 'text', required: true, max: 2000 }),
    ])
    withTimestamps(feedComments)
    feedComments.listRule = AUTH
    feedComments.viewRule = AUTH
    feedComments.createRule = '@request.body.author = @request.auth.id'
    feedComments.updateRule = `author = @request.auth.id || (${CHEF_OR_BUERO})`
    feedComments.deleteRule = `author = @request.auth.id || (${CHEF_OR_BUERO})`
    app.save(feedComments)

    // --- events -------------------------------------------------------------------------------
    // updateRule bewusst für jeden authentifizierten Nutzer offen, da Zusagen (rsvp) keine
    // Stammdaten-Änderung sind (siehe Begründung bei feed_posts oben).
    const events = new Collection({ type: 'base', name: 'events' })
    addFields(events, [
      new TextField({ name: 'title', required: true }),
      new SelectField({
        name: 'type',
        required: true,
        maxSelect: 1,
        values: ['fest', 'feier', 'schulung', 'info'],
      }),
      new TextField({ name: 'date', pattern: '^\\d{4}-\\d{2}-\\d{2}$' }),
      new TextField({ name: 'time', pattern: '^\\d{2}:\\d{2}$' }),
      new TextField({ name: 'location' }),
      new TextField({ name: 'desc', max: 5000 }),
      new RelationField({
        name: 'by',
        required: true,
        collectionId: app.findCollectionByNameOrId('users').id,
        maxSelect: 1,
      }),
      new RelationField({
        name: 'rsvp',
        collectionId: app.findCollectionByNameOrId('users').id,
        maxSelect: 999,
      }),
    ])
    withTimestamps(events)
    events.listRule = AUTH
    events.viewRule = AUTH
    events.createRule = CHEF_OR_BUERO
    events.updateRule = AUTH
    events.deleteRule = CHEF_OR_BUERO
    app.save(events)

    // --- vehicles -----------------------------------------------------------------------------
    // Mitarbeiter können sich Firmenfahrzeugen zuordnen und deren Standort (manuell per
    // Geolocation-Button oder Adresse) pflegen, sichtbar für alle auf einer Karte zusammen mit
    // den Kunden-Adressen.
    const vehicles = new Collection({ type: 'base', name: 'vehicles' })
    vehicles.fields.add(new TextField({ name: 'name', required: true }))
    vehicles.fields.add(new TextField({ name: 'plate' }))
    vehicles.fields.add(
      new RelationField({
        name: 'assignedTo',
        collectionId: app.findCollectionByNameOrId('users').id,
        maxSelect: 1,
      })
    )
    vehicles.fields.add(new TextField({ name: 'address' }))
    vehicles.fields.add(new NumberField({ name: 'lat', min: -90, max: 90 }))
    vehicles.fields.add(new NumberField({ name: 'lng', min: -180, max: 180 }))
    // Bewusst ein normales Datumsfeld statt AutodateField(onUpdate) – sonst würde jede
    // Stammdaten-Änderung (z. B. Notiz bearbeiten) fälschlich als Standort-Update erscheinen.
    // Wird nur explizit vom Client gesetzt, wenn lat/lng tatsächlich aktualisiert werden.
    vehicles.fields.add(new DateField({ name: 'locationUpdatedAt' }))
    vehicles.fields.add(new TextField({ name: 'notes', max: 2000 }))
    withTimestamps(vehicles)
    vehicles.listRule = AUTH
    vehicles.viewRule = AUTH
    vehicles.createRule = CHEF_OR_BUERO
    // PocketBase prüft Update-Rules gegen Alt- UND Neu-Zustand des Datensatzes (beide müssen
    // passen). Freies Fahrzeug (assignedTo:'' -> eigene Id) erfüllt beide Seiten über die
    // verschiedenen Klauseln; ein bereits fremd zugeordnetes Fahrzeug scheitert schon am
    // Alt-Zustand. Bekannte Einschränkung analog "orders": der zugeordnete Nutzer könnte
    // theoretisch auch name/plate/notes mitändern, da PB-Rules nicht feldweise greifen –
    // für v1 akzeptiert.
    vehicles.updateRule = `(${CHEF_OR_BUERO}) || assignedTo = @request.auth.id || assignedTo = ''`
    vehicles.deleteRule = CHEF_OR_BUERO
    app.save(vehicles)

    // --- company_settings ----------------------------------------------------------------------
    // Firmenstammdaten (Name, Logo, Firmensitz) für die "Allgemein"-Einstellungen. Name und Logo
    // werden im Header und auf dem Login-Screen angezeigt, daher sind list/view bewusst öffentlich
    // (auch für nicht angemeldete Nutzer auf dem Login-Screen lesbar). Es gibt bewusst kein
    // deleteRule, da die Collection als Singleton (genau ein Datensatz) gepflegt wird.
    const companySettings = new Collection({ type: 'base', name: 'company_settings' })
    addFields(companySettings, [
      new TextField({ name: 'companyName', required: true }),
      new TextField({ name: 'street' }),
      new TextField({ name: 'zip' }),
      new TextField({ name: 'city' }),
      new FileField({
        name: 'logo',
        maxSelect: 1,
        maxSize: 5242880,
        mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'],
      }),
    ])
    companySettings.listRule = ''
    companySettings.viewRule = ''
    companySettings.createRule = CHEF_OR_BUERO
    companySettings.updateRule = CHEF_OR_BUERO
    companySettings.deleteRule = null
    app.save(companySettings)

    const record = new Record(companySettings)
    record.set('companyName', 'Hahn Energie & Bau')
    app.save(record)
  },
  (app) => {
    app.delete(app.findCollectionByNameOrId('company_settings'))
    app.delete(app.findCollectionByNameOrId('vehicles'))
    app.delete(app.findCollectionByNameOrId('events'))
    app.delete(app.findCollectionByNameOrId('feed_comments'))
    app.delete(app.findCollectionByNameOrId('feed_posts'))
    app.delete(app.findCollectionByNameOrId('timelog'))
    app.delete(app.findCollectionByNameOrId('rapport_materials'))
    app.delete(app.findCollectionByNameOrId('rapports'))
    app.delete(app.findCollectionByNameOrId('order_photos'))
    app.delete(app.findCollectionByNameOrId('order_reads'))

    const orders = app.findCollectionByNameOrId('orders')
    orders.fields.removeByName('project')
    orders.fields.removeByName('customer')
    orders.fields.removeByName('site')
    app.save(orders)

    app.delete(app.findCollectionByNameOrId('projects'))
    app.delete(app.findCollectionByNameOrId('orders'))
    app.delete(app.findCollectionByNameOrId('sites'))
    app.delete(app.findCollectionByNameOrId('customers'))

    const usersCollection = app.findCollectionByNameOrId('users')
    usersCollection.fields.removeByName('role')
    usersCollection.fields.removeByName('phone')
    usersCollection.listRule = null
    usersCollection.viewRule = null
    usersCollection.createRule = null
    usersCollection.updateRule = null
    usersCollection.deleteRule = null
    usersCollection.manageRule = null
    app.save(usersCollection)
  }
)
