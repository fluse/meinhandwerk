import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createSite, deleteSite, updateSite } from '../api/sites'
import type { SiteFormInput } from '../types/site'

function useInvalidateSites(customerId: string) {
  const queryClient = useQueryClient()
  return () => queryClient.invalidateQueries({ queryKey: ['sites', customerId] })
}

export function useCreateSite(customerId: string) {
  const invalidate = useInvalidateSites(customerId)
  return useMutation({
    mutationFn: (input: SiteFormInput) => createSite(customerId, input),
    onSuccess: invalidate,
  })
}

export function useUpdateSite(customerId: string) {
  const invalidate = useInvalidateSites(customerId)
  return useMutation({
    mutationFn: ({ id, input }: { id: string; input: SiteFormInput }) => updateSite(id, input),
    onSuccess: invalidate,
  })
}

export function useDeleteSite(customerId: string) {
  const invalidate = useInvalidateSites(customerId)
  return useMutation({
    mutationFn: deleteSite,
    onSuccess: invalidate,
  })
}
