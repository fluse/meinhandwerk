/// <reference path="../pb_data/types.d.ts" />

// Geokoordinaten für Kunden (für die Fahrzeug-Karte) werden serverseitig aus Straße/PLZ/Ort
// aufgelöst (Nominatim/OpenStreetMap, kostenlos, kein API-Key) – der Nutzer setzt lat/lng nie
// manuell im Formular. Ein evtl. vom Client mitgeschickter lat/lng-Wert wird hier bewusst
// überschrieben, damit die Koordinaten immer zur gespeicherten Adresse passen.
//
// Die Adress-/Geocoding-Logik ist bewusst in jeden Hook-Callback hineinkopiert statt in eine
// gemeinsame Modul-Funktion ausgelagert: PocketBase führt jeden onRecord*-Callback isoliert aus,
// Top-Level-Hilfsfunktionen derselben Datei sind darin nicht zuverlässig sichtbar
// ("ReferenceError: ... is not defined" zur Laufzeit trotz Definition im selben File).

onRecordCreate((e) => {
  const street = e.record.get('street')
  const zip = e.record.get('zip')
  const city = e.record.get('city')
  const address = [street, [zip, city].filter(Boolean).join(' ')].filter(Boolean).join(', ')

  let coords = null
  if (address) {
    try {
      const res = $http.send({
        url:
          'https://nominatim.openstreetmap.org/search?format=json&limit=1&q=' +
          encodeURIComponent(address),
        method: 'GET',
        headers: { 'User-Agent': 'Handwerkerkalender/1.0' },
        timeout: 10,
      })
      const results = res.statusCode === 200 ? res.json : null
      const first = Array.isArray(results) ? results[0] : null
      if (first) coords = { lat: Number(first.lat), lng: Number(first.lon) }
    } catch (err) {
      // Kein Netz/Timeout/ungültige Antwort – ohne Koordinaten speichern statt den Save zu blockieren.
    }
  }

  e.record.set('lat', coords ? coords.lat : 0)
  e.record.set('lng', coords ? coords.lng : 0)
  e.next()
}, 'customers')

onRecordUpdate((e) => {
  const street = e.record.get('street')
  const zip = e.record.get('zip')
  const city = e.record.get('city')
  const address = [street, [zip, city].filter(Boolean).join(' ')].filter(Boolean).join(', ')

  let addressChanged = true
  try {
    const existing = e.app.findRecordById('customers', e.record.id)
    const existingAddress = [existing.get('street'), [existing.get('zip'), existing.get('city')].filter(Boolean).join(' ')]
      .filter(Boolean)
      .join(', ')
    addressChanged = existingAddress !== address
  } catch (err) {
    addressChanged = true
  }

  if (!address) {
    e.record.set('lat', 0)
    e.record.set('lng', 0)
  } else if (addressChanged) {
    try {
      const res = $http.send({
        url:
          'https://nominatim.openstreetmap.org/search?format=json&limit=1&q=' +
          encodeURIComponent(address),
        method: 'GET',
        headers: { 'User-Agent': 'Handwerkerkalender/1.0' },
        timeout: 10,
      })
      const results = res.statusCode === 200 ? res.json : null
      const first = Array.isArray(results) ? results[0] : null
      if (first) {
        e.record.set('lat', Number(first.lat))
        e.record.set('lng', Number(first.lon))
      }
    } catch (err) {
      // Kein Netz/Timeout/ungültige Antwort – bestehende Koordinaten unangetastet lassen.
    }
  }
  e.next()
}, 'customers')
