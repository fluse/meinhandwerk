import { useQuery } from '@tanstack/react-query'
import { listCustomerLocations } from '@/core/api/customerLocations'

export function useCustomerLocations() {
  return useQuery({
    queryKey: ['customerLocations'],
    queryFn: listCustomerLocations,
  })
}
