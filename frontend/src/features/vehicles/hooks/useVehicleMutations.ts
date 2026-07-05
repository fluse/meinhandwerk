import { useMutation, useQueryClient } from '@tanstack/react-query'
import {
  assignVehicle,
  createVehicle,
  deleteVehicle,
  updateVehicle,
  updateVehicleLocation,
} from '../api/vehicles'
import type { VehicleFormInput } from '../types/vehicle'

function useInvalidateVehicles() {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: ['vehicles'] })
}

export function useCreateVehicle() {
  const invalidate = useInvalidateVehicles()
  return useMutation({
    mutationFn: createVehicle,
    onSuccess: invalidate,
  })
}

export function useUpdateVehicle() {
  const invalidate = useInvalidateVehicles()
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: VehicleFormInput }) =>
      updateVehicle(id, input),
    onSuccess: invalidate,
  })
}

export function useDeleteVehicle() {
  const invalidate = useInvalidateVehicles()
  return useMutation({
    mutationFn: deleteVehicle,
    onSuccess: invalidate,
  })
}

export function useAssignVehicle() {
  const invalidate = useInvalidateVehicles()
  return useMutation({
    mutationFn: ({ id, userId }: { id: string; userId: string | null }) =>
      assignVehicle(id, userId),
    onSuccess: invalidate,
  })
}

export function useUpdateVehicleLocation() {
  const invalidate = useInvalidateVehicles()
  return useMutation({
    mutationFn: ({
      id,
      location,
    }: {
      id: string
      location: { address?: string; lat: number; lng: number }
    }) => updateVehicleLocation(id, location),
    onSuccess: invalidate,
  })
}
