/// <reference path="../pb_data/types.d.ts" />

// Hält customer/site auf orders und projects konsistent, ohne dem Client zu vertrauen
// (AGENTS.md: "Never trust the client"):
// 1. Wird ein Auftrag über ein Projekt angelegt (Feld "project"), aber ohne eigene
//    customer/site-Angabe, werden diese vom Projekt übernommen. Das Frontend schickt das
//    normalerweise schon selbst mit (URL-Parameter beim "In Kalender einplanen"-Flow) –
//    das hier ist nur die serverseitige Absicherung, falls das umgangen wird.
// 2. Ist eine Baustelle (site) gesetzt, ist sie autoritativ: customer wird zwingend auf
//    site.customer gesetzt, damit nie eine Baustelle mit einem abweichenden Kunden
//    kombiniert werden kann.
//
// Die Logik ist bewusst in jeden Hook-Callback hineinkopiert statt in eine gemeinsame
// Modul-Funktion ausgelagert: PocketBase führt jeden onRecord*-Callback isoliert aus,
// Top-Level-Hilfsfunktionen derselben Datei sind darin nicht zuverlässig sichtbar
// ("ReferenceError: ... is not defined" zur Laufzeit trotz Definition im selben File).

onRecordCreate((e) => {
  const projectId = e.record.get('project')
  if (projectId && !e.record.get('customer')) {
    try {
      const project = e.app.findRecordById('projects', projectId)
      if (project.get('customer')) e.record.set('customer', project.get('customer'))
      if (!e.record.get('site') && project.get('site')) e.record.set('site', project.get('site'))
    } catch (err) {
      // Projekt existiert nicht (mehr) – Auftrag trotzdem ohne Kundenübernahme speichern.
    }
  }

  const siteId = e.record.get('site')
  if (siteId) {
    try {
      const site = e.app.findRecordById('sites', siteId)
      e.record.set('customer', site.get('customer'))
    } catch (err) {
      // Baustelle existiert nicht (mehr) – bestehenden customer-Wert unangetastet lassen.
    }
  }

  e.next()
}, 'orders')

onRecordUpdate((e) => {
  const siteId = e.record.get('site')
  if (siteId) {
    try {
      const site = e.app.findRecordById('sites', siteId)
      e.record.set('customer', site.get('customer'))
    } catch (err) {
      // Baustelle existiert nicht (mehr) – bestehenden customer-Wert unangetastet lassen.
    }
  }
  e.next()
}, 'orders')

onRecordCreate((e) => {
  const siteId = e.record.get('site')
  if (siteId) {
    try {
      const site = e.app.findRecordById('sites', siteId)
      e.record.set('customer', site.get('customer'))
    } catch (err) {
      // Baustelle existiert nicht (mehr) – bestehenden customer-Wert unangetastet lassen.
    }
  }
  e.next()
}, 'projects')

onRecordUpdate((e) => {
  const siteId = e.record.get('site')
  if (siteId) {
    try {
      const site = e.app.findRecordById('sites', siteId)
      e.record.set('customer', site.get('customer'))
    } catch (err) {
      // Baustelle existiert nicht (mehr) – bestehenden customer-Wert unangetastet lassen.
    }
  }
  e.next()
}, 'projects')
