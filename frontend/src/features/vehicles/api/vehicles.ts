import type { RecordModel } from 'pocketbase'
import { pb } from '@/core/api/pocketbase'
import type { Vehicle, VehicleFormInput } from '../types/vehicle'

function toVehicle(r: RecordModel): Vehicle {
  return {
    id: r.id,
    name: r.name ?? '',
    plate: r.plate ?? '',
    assignedTo: r.assignedTo ?? '',
    assignedToName: r.expand?.assignedTo?.name ?? '',
    address: r.address ?? '',
    lat: typeof r.lat === 'number' && r.lat !== 0 ? r.lat : null,
    lng: typeof r.lng === 'number' && r.lng !== 0 ? r.lng : null,
    locationUpdatedAt: r.locationUpdatedAt ?? '',
    notes: r.notes ?? '',
  }
}

export async function listVehicles(): Promise<Vehicle[]> {
  const records = await pb
    .collection('vehicles')
    .getFullList({ sort: 'name', expand: 'assignedTo' })
  return records.map(toVehicle)
}

export async function createVehicle(input: VehicleFormInput): Promise<Vehicle> {
  return toVehicle(
    await pb.collection('vehicles').create({
      name: input.name,
      plate: input.plate ?? '',
      notes: input.notes ?? '',
    }),
  )
}

export async function updateVehicle(id: string, input: VehicleFormInput): Promise<Vehicle> {
  return toVehicle(
    await pb.collection('vehicles').update(id, {
      name: input.name,
      plate: input.plate ?? '',
      notes: input.notes ?? '',
    }),
  )
}

export async function deleteVehicle(id: string): Promise<void> {
  await pb.collection('vehicles').delete(id)
}

export async function assignVehicle(id: string, userId: string | null): Promise<Vehicle> {
  return toVehicle(await pb.collection('vehicles').update(id, { assignedTo: userId ?? '' }))
}

export async function updateVehicleLocation(
  id: string,
  location: { address?: string; lat: number; lng: number },
): Promise<Vehicle> {
  return toVehicle(
    await pb.collection('vehicles').update(id, {
      address: location.address ?? '',
      lat: location.lat,
      lng: location.lng,
      locationUpdatedAt: new Date().toISOString(),
    }),
  )
}
