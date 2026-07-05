/// <reference path="../pb_data/types.d.ts" />

// Chef/Büro sollen das Passwort eines Mitarbeiters zurücksetzen können, wenn dieser es
// vergessen hat. Ein normales updateRule-passendes Update von "password" verlangt bei
// Auth-Collections zusätzlich "oldPassword" (das der Chef nicht kennt). Die "manageRule"
// schaltet für berechtigte Requests den Superuser-artigen Verwaltungsmodus frei, der Passwörter
// ohne oldPassword setzen darf.
const CHEF_OR_BUERO = '@request.auth.role = "chef" || @request.auth.role = "buero"'

migrate(
  (app) => {
    const usersCollection = app.findCollectionByNameOrId('users')
    usersCollection.manageRule = CHEF_OR_BUERO
    app.save(usersCollection)
  },
  (app) => {
    const usersCollection = app.findCollectionByNameOrId('users')
    usersCollection.manageRule = null
    app.save(usersCollection)
  }
)
