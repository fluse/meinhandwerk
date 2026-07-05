import { pb } from '@/core/api/pocketbase'

export interface CustomerLookup {
  id: string
  label: string
  phone: string
  street: string
  zip: string
  city: string
  /** street/zip/city als ein zusammengesetzter String, für Formulare mit einem einzelnen Adressfeld. */
  address: string
}

/** Schlanker Direktzugriff auf die `customers`-Collection für die Kunden-Auswahl in
 *  Auftrags-/Projektformularen – von mehreren Features geteilt (Scheduling, Projects),
 *  daher hier statt in features/customers (Features importieren sich nicht). */
export async function listCustomerLookup(): Promise<CustomerLookup[]> {
  const records = await pb.collection('customers').getFullList({ sort: 'name' })
  return records.map((r) => ({
    id: r.id,
    label: r.name || r.contact || '',
    phone: r.phone ?? '',
    street: r.street ?? '',
    zip: r.zip ?? '',
    city: r.city ?? '',
    address: [r.street, [r.zip, r.city].filter(Boolean).join(' ')].filter(Boolean).join(', '),
  }))
}
