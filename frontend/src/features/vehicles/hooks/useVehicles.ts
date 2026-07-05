import { useQuery } from '@tanstack/react-query'
import { listVehicles } from '../api/vehicles'

export function useVehicles() {
  return useQuery({
    queryKey: ['vehicles'],
    queryFn: listVehicles,
  })
}
