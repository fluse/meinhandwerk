/** Kostenloses On-Demand-Geocoding über Nominatim (OpenStreetMap) – kein API-Key nötig.
 *  Wird sowohl von Kunden- als auch von Fahrzeug-Standort-Formularen genutzt, daher hier
 *  in core/ statt in einem einzelnen Feature. Nur gezielt per Button-Klick aufrufen, nicht
 *  automatisch bei jedem Tastendruck (Nominatim-Nutzungsrichtlinie: ca. 1 Anfrage/Sekunde). */
export interface GeocodeResult {
  lat: number
  lng: number
}

export async function geocodeAddress(query: string): Promise<GeocodeResult | null> {
  const q = query.trim()
  if (!q) return null

  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`
  const res = await fetch(url)
  if (!res.ok) return null

  const results: Array<{ lat: string; lon: string }> = await res.json()
  const first = results[0]
  if (!first) return null

  return { lat: Number(first.lat), lng: Number(first.lon) }
}
