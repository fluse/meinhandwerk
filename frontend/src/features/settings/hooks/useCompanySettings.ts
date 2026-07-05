import { useQuery } from '@tanstack/react-query'
import { getCompanySettings } from '../api/companySettings'

export const companySettingsQueryKey = ['companySettings'] as const

export function useCompanySettings() {
  return useQuery({
    queryKey: companySettingsQueryKey,
    queryFn: getCompanySettings,
  })
}
