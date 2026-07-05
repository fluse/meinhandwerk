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

function applyProjectBackstop(e) {
  const projectId = e.record.get('project')
  if (!projectId || e.record.get('customer')) return
  try {
    const project = e.app.findRecordById('projects', projectId)
    if (project.get('customer')) e.record.set('customer', project.get('customer'))
    if (!e.record.get('site') && project.get('site')) e.record.set('site', project.get('site'))
  } catch (err) {
    // Projekt existiert nicht (mehr) – Auftrag trotzdem ohne Kundenübernahme speichern.
  }
}

function applySiteAuthority(e) {
  const siteId = e.record.get('site')
  if (!siteId) return
  try {
    const site = e.app.findRecordById('sites', siteId)
    e.record.set('customer', site.get('customer'))
  } catch (err) {
    // Baustelle existiert nicht (mehr) – bestehenden customer-Wert unangetastet lassen.
  }
}

onRecordCreate((e) => {
  applyProjectBackstop(e)
  applySiteAuthority(e)
  e.next()
}, 'orders')

onRecordUpdate((e) => {
  applySiteAuthority(e)
  e.next()
}, 'orders')

onRecordCreate((e) => {
  applySiteAuthority(e)
  e.next()
}, 'projects')

onRecordUpdate((e) => {
  applySiteAuthority(e)
  e.next()
}, 'projects')
