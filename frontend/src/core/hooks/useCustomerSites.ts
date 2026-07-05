import { useQuery } from '@tanstack/react-query'
import { listSitesByCustomer } from '@/core/api/customerSites'

export function useCustomerSites(customerId: string) {
  return useQuery({
    queryKey: ['customer-sites', customerId],
    queryFn: () => listSitesByCustomer(customerId),
    enabled: !!customerId,
  })
}
