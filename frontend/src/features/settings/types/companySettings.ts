import { z } from 'zod'

export interface CompanySettings {
  id: string
  companyName: string
  street: string
  zip: string
  city: string
  logoUrl: string
}

export const companySettingsFormSchema = z.object({
  companyName: z.string().min(1, 'Firmenname ist erforderlich.'),
  street: z.string().optional(),
  zip: z.string().optional(),
  city: z.string().optional(),
})
export type CompanySettingsFormInput = z.infer<typeof companySettingsFormSchema>
