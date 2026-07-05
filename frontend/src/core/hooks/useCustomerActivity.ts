import { useQuery } from '@tanstack/react-query'
import { listOrdersForCustomer, listProjectsForCustomer } from '@/core/api/customerActivity'

export function useOrdersForCustomer(customerId: string) {
  return useQuery({
    queryKey: ['customerActivity', 'orders', customerId],
    queryFn: () => listOrdersForCustomer(customerId),
    enabled: !!customerId,
  })
}

export function useProjectsForCustomer(customerId: string) {
  return useQuery({
    queryKey: ['customerActivity', 'projects', customerId],
    queryFn: () => listProjectsForCustomer(customerId),
    enabled: !!customerId,
  })
}
