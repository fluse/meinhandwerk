import { pb } from '@/core/api/pocketbase'

export interface CustomerSiteLookup {
  id: string
  label: string
  street: string
  zip: string
  city: string
  /** street/zip/city als ein zusammengesetzter String, für Formulare mit einem einzelnen Adressfeld. */
  address: string
}

/** Schlanker Direktzugriff auf die `sites`-Collection für die Baustellen-Auswahl in
 *  Auftrags-/Projektformularen – von mehreren Features geteilt (Scheduling, Projects),
 *  daher hier statt in features/customers (Features importieren sich nicht). */
export async function listSitesByCustomer(customerId: string): Promise<CustomerSiteLookup[]> {
  const records = await pb.collection('sites').getFullList({
    filter: pb.filter('customer = {:id}', { id: customerId }),
    sort: 'label',
  })
  return records.map((r) => {
    const address = [r.street, [r.zip, r.city].filter(Boolean).join(' ')].filter(Boolean).join(', ')
    return {
      id: r.id,
      label: r.label || address || 'Baustelle',
      street: r.street ?? '',
      zip: r.zip ?? '',
      city: r.city ?? '',
      address,
    }
  })
}
