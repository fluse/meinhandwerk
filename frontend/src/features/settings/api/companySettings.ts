import type { RecordModel } from 'pocketbase'
import { pb } from '@/core/api/pocketbase'
import type { CompanySettings, CompanySettingsFormInput } from '../types/companySettings'

function toCompanySettings(r: RecordModel): CompanySettings {
  return {
    id: r.id,
    companyName: r.companyName ?? '',
    street: r.street ?? '',
    zip: r.zip ?? '',
    city: r.city ?? '',
    logoUrl: r.logo ? pb.files.getURL(r, r.logo) : '',
  }
}

export async function getCompanySettings(): Promise<CompanySettings> {
  const record = await pb.collection('company_settings').getFirstListItem('')
  return toCompanySettings(record)
}

interface UpdateCompanySettingsInput extends CompanySettingsFormInput {
  logo?: File
}

export async function updateCompanySettings(
  id: string,
  input: UpdateCompanySettingsInput,
): Promise<CompanySettings> {
  const formData = new FormData()
  formData.append('companyName', input.companyName)
  formData.append('street', input.street ?? '')
  formData.append('zip', input.zip ?? '')
  formData.append('city', input.city ?? '')
  if (input.logo) {
    formData.append('logo', input.logo)
  }
  const record = await pb.collection('company_settings').update(id, formData)
  return toCompanySettings(record)
}
