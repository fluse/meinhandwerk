import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateCompanySettings } from '../api/companySettings'
import type { CompanySettingsFormInput } from '../types/companySettings'
import { companySettingsQueryKey } from './useCompanySettings'

interface UpdateCompanySettingsArgs {
  id: string
  input: CompanySettingsFormInput & { logo?: File }
}

export function useUpdateCompanySettings() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, input }: UpdateCompanySettingsArgs) => updateCompanySettings(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: companySettingsQueryKey })
    },
  })
}
