/// <reference path="../pb_data/types.d.ts" />

// Bugfix: das Kundenformular erlaubt bewusst "nur Ansprechpartner, keine Firma" (z. B. private
// Kunden ohne Firmennamen) – die Zod-Validierung im Frontend (customerFormSchema.refine) prüft
// entsprechend "name ODER contact", aber das Backend-Feld "name" war weiterhin required=true.
// Dadurch schlug das Anlegen eines Kunden ohne Firmennamen mit 400 fehl. Backend an die
// eigentlich gewollte Validierung angleichen.

migrate(
  (app) => {
    const customers = app.findCollectionByNameOrId('customers')
    customers.fields.getByName('name').required = false
    app.save(customers)
  },
  (app) => {
    const customers = app.findCollectionByNameOrId('customers')
    customers.fields.getByName('name').required = true
    app.save(customers)
  }
)
