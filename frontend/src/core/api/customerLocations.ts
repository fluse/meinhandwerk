import { pb } from '@/core/api/pocketbase'

export interface CustomerLocation {
  id: string
  name: string
  address: string
  lat: number | null
  lng: number | null
}

/** Leichte, lesende Projektion der `customers`-Collection für die Fahrzeug-Karte – von
 *  mehreren Features geteilt (Fahrzeuge, potenziell weitere Kartenansichten), daher hier
 *  statt in features/customers (Features dürfen nicht voneinander importieren). */
export async function listCustomerLocations(): Promise<CustomerLocation[]> {
  const records = await pb.collection('customers').getFullList({ sort: 'name' })
  return records
    .map((r) => ({
      id: r.id,
      name: r.name || r.contact || '—',
      address: [r.street, [r.zip, r.city].filter(Boolean).join(' ')].filter(Boolean).join(', '),
      lat: typeof r.lat === 'number' && r.lat !== 0 ? r.lat : null,
      lng: typeof r.lng === 'number' && r.lng !== 0 ? r.lng : null,
    }))
    .filter((c) => c.lat != null && c.lng != null)
}
