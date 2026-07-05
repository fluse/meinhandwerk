import type { RecordModel } from 'pocketbase'
import { pb } from '@/core/api/pocketbase'
import type { Site, SiteFormInput } from '../types/site'

function toSite(r: RecordModel): Site {
  return {
    id: r.id,
    customer: r.customer ?? '',
    label: r.label ?? '',
    street: r.street ?? '',
    zip: r.zip ?? '',
    city: r.city ?? '',
    notes: r.notes ?? '',
  }
}

function toPayload(input: SiteFormInput) {
  return {
    label: input.label ?? '',
    street: input.street ?? '',
    zip: input.zip ?? '',
    city: input.city ?? '',
    notes: input.notes ?? '',
  }
}

export async function listSitesForCustomer(customerId: string): Promise<Site[]> {
  const records = await pb.collection('sites').getFullList({
    filter: pb.filter('customer = {:id}', { id: customerId }),
    sort: 'label',
  })
  return records.map(toSite)
}

export async function createSite(customerId: string, input: SiteFormInput): Promise<Site> {
  return toSite(await pb.collection('sites').create({ ...toPayload(input), customer: customerId }))
}

export async function updateSite(id: string, input: SiteFormInput): Promise<Site> {
  return toSite(await pb.collection('sites').update(id, toPayload(input)))
}

export async function deleteSite(id: string): Promise<void> {
  await pb.collection('sites').delete(id)
}
