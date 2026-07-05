/// <reference path="../pb_data/types.d.ts" />

// Firmenstammdaten (Name, Logo, Firmensitz) für die "Allgemein"-Einstellungen. Name und Logo
// werden im Header und auf dem Login-Screen angezeigt, daher sind list/view bewusst öffentlich
// (auch für nicht angemeldete Nutzer auf dem Login-Screen lesbar). Es gibt bewusst kein
// deleteRule, da die Collection als Singleton (genau ein Datensatz) gepflegt wird.
const CHEF_OR_BUERO = '@request.auth.role = "chef" || @request.auth.role = "buero"'

function addFields(collection, fields) {
  for (const field of fields) collection.fields.add(field)
}

migrate(
  (app) => {
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
  }
)
