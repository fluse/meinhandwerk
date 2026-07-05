/// <reference path="../pb_data/types.d.ts" />

// Geokoordinaten für Kunden (für die Fahrzeug-Karte) werden serverseitig aus Straße/PLZ/Ort
// aufgelöst (Nominatim/OpenStreetMap, kostenlos, kein API-Key) – der Nutzer setzt lat/lng nie
// manuell im Formular. Ein evtl. vom Client mitgeschickter lat/lng-Wert wird hier bewusst
// überschrieben, damit die Koordinaten immer zur gespeicherten Adresse passen.

function buildAddress(record) {
  const street = record.get('street')
  const zip = record.get('zip')
  const city = record.get('city')
  return [street, [zip, city].filter(Boolean).join(' ')].filter(Boolean).join(', ')
}

function geocodeAddress(address) {
  try {
    const res = $http.send({
      url: 'https://nominatim.openstreetmap.org/search?format=json&limit=1&q=' + encodeURIComponent(address),
      method: 'GET',
      headers: { 'User-Agent': 'Handwerkerkalender/1.0' },
      timeout: 10,
    })
    if (res.statusCode !== 200) return null
    const results = res.json
    const first = Array.isArray(results) ? results[0] : null
    if (!first) return null
    return { lat: Number(first.lat), lng: Number(first.lon) }
  } catch (err) {
    console.log('Geocoding fehlgeschlagen: ' + err)
    return null
  }
}

onRecordCreate((e) => {
  const address = buildAddress(e.record)
  const coords = address ? geocodeAddress(address) : null
  e.record.set('lat', coords ? coords.lat : 0)
  e.record.set('lng', coords ? coords.lng : 0)
  e.next()
}, 'customers')

onRecordUpdate((e) => {
  const address = buildAddress(e.record)

  let addressChanged = true
  try {
    const existing = e.app.findRecordById('customers', e.record.id)
    addressChanged = buildAddress(existing) !== address
  } catch (err) {
    addressChanged = true
  }

  if (!address) {
    e.record.set('lat', 0)
    e.record.set('lng', 0)
  } else if (addressChanged) {
    const coords = geocodeAddress(address)
    if (coords) {
      e.record.set('lat', coords.lat)
      e.record.set('lng', coords.lng)
    }
  }
  e.next()
}, 'customers')
