import { z } from 'zod'

export interface Vehicle {
  id: string
  name: string
  plate: string
  assignedTo: string
  assignedToName: string
  address: string
  lat: number | null
  lng: number | null
  locationUpdatedAt: string
  notes: string
}

export const vehicleFormSchema = z.object({
  name: z.string().min(1, 'Name ist erforderlich.'),
  plate: z.string().optional(),
  notes: z.string().optional(),
})
export type VehicleFormInput = z.infer<typeof vehicleFormSchema>
