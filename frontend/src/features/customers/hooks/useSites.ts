import { useQuery } from '@tanstack/react-query'
import { listSitesForCustomer } from '../api/sites'

export function useSites(customerId: string) {
  return useQuery({
    queryKey: ['sites', customerId],
    queryFn: () => listSitesForCustomer(customerId),
    enabled: !!customerId,
  })
}
