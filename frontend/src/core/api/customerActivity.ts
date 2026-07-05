import { pb } from '@/core/api/pocketbase'

export interface CustomerActivityItem {
  id: string
  title: string
  date: string
  status: string
}

/** Schlanker Direktzugriff auf `orders`/`projects` für die Rückschau ("Aufträge/Projekte
 *  dieses Kunden") auf der Kundenkarte – von features/customers benötigt, darf aber nicht
 *  aus features/scheduling bzw. features/projects importieren (Features importieren sich
 *  nicht), daher hier in core/. */
export async function listOrdersForCustomer(customerId: string): Promise<CustomerActivityItem[]> {
  const records = await pb.collection('orders').getFullList({
    filter: pb.filter('customer = {:id}', { id: customerId }),
    sort: '-date',
  })
  return records.map((r) => ({
    id: r.id,
    title: r.title ?? '',
    date: r.date ?? '',
    status: r.status ?? '',
  }))
}

export async function listProjectsForCustomer(customerId: string): Promise<CustomerActivityItem[]> {
  const records = await pb.collection('projects').getFullList({
    filter: pb.filter('customer = {:id}', { id: customerId }),
    sort: '-date',
  })
  return records.map((r) => ({
    id: r.id,
    title: r.title ?? '',
    date: r.date ?? '',
    status: r.status ?? '',
  }))
}
