import { z } from 'zod'

export interface Site {
  id: string
  customer: string
  label: string
  street: string
  zip: string
  city: string
  notes: string
}

export const siteFormSchema = z.object({
  label: z.string().optional(),
  street: z.string().optional(),
  zip: z.string().optional(),
  city: z.string().optional(),
  notes: z.string().optional(),
})
export type SiteFormInput = z.infer<typeof siteFormSchema>
