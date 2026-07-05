/// <reference path="../pb_data/types.d.ts" />

// Kunden-Verknüpfung für Aufträge/Projekte (siehe Plan "Kunden-Verknüpfung für
// Aufträge/Projekte + Baustellen"): echte Relation statt Freitext-Abgleich, damit Daten
// nicht doppelt gepflegt werden müssen und eine Auswertung pro Kunde möglich wird.
// "Baustellen" lösen dabei das Problem, dass die Einsatzadresse von der Kundenadresse
// abweichen kann, ohne die Kundenadresse selbst zu verbiegen.

const CHEF_OR_BUERO = '@request.auth.role = "chef" || @request.auth.role = "buero"'
const AUTH = "@request.auth.id != ''"

migrate(
  (app) => {
    const customers = app.findCollectionByNameOrId('customers')

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
    sites.fields.add(new AutodateField({ name: 'created', onCreate: true, onUpdate: false }))
    sites.fields.add(new AutodateField({ name: 'updated', onCreate: true, onUpdate: true }))
    sites.listRule = AUTH
    sites.viewRule = AUTH
    sites.createRule = CHEF_OR_BUERO
    sites.updateRule = CHEF_OR_BUERO
    sites.deleteRule = CHEF_OR_BUERO
    app.save(sites)

    const orders = app.findCollectionByNameOrId('orders')
    orders.fields.add(new RelationField({ name: 'customer', collectionId: customers.id, maxSelect: 1 }))
    orders.fields.add(new RelationField({ name: 'site', collectionId: sites.id, maxSelect: 1 }))
    app.save(orders)

    const projects = app.findCollectionByNameOrId('projects')
    projects.fields.add(
      new RelationField({ name: 'customer', collectionId: customers.id, maxSelect: 1 })
    )
    projects.fields.add(new RelationField({ name: 'site', collectionId: sites.id, maxSelect: 1 }))
    app.save(projects)
  },
  (app) => {
    const orders = app.findCollectionByNameOrId('orders')
    orders.fields.removeByName('customer')
    orders.fields.removeByName('site')
    app.save(orders)

    const projects = app.findCollectionByNameOrId('projects')
    projects.fields.removeByName('customer')
    projects.fields.removeByName('site')
    app.save(projects)

    app.delete(app.findCollectionByNameOrId('sites'))
  }
)
