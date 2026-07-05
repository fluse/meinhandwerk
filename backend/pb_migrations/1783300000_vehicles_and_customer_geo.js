/// <reference path="../pb_data/types.d.ts" />

// Fahrzeugverwaltung: Mitarbeiter können sich Firmenfahrzeugen zuordnen und deren Standort
// (manuell per Geolocation-Button oder Adresse) pflegen, sichtbar für alle auf einer Karte
// zusammen mit den (ebenfalls hier um lat/lng erweiterten) Kunden-Adressen.

const CHEF_OR_BUERO = '@request.auth.role = "chef" || @request.auth.role = "buero"'
const AUTH = "@request.auth.id != ''"

migrate(
  (app) => {
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
    vehicles.fields.add(new AutodateField({ name: 'created', onCreate: true, onUpdate: false }))
    vehicles.fields.add(new AutodateField({ name: 'updated', onCreate: true, onUpdate: true }))

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

    const customers = app.findCollectionByNameOrId('customers')
    customers.fields.add(new NumberField({ name: 'lat', min: -90, max: 90 }))
    customers.fields.add(new NumberField({ name: 'lng', min: -180, max: 180 }))
    app.save(customers)
  },
  (app) => {
    app.delete(app.findCollectionByNameOrId('vehicles'))

    const customers = app.findCollectionByNameOrId('customers')
    customers.fields.removeByName('lat')
    customers.fields.removeByName('lng')
    app.save(customers)
  }
)
