import { useState } from 'react'
import type { ChangeEventHandler } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/core/components/Button'
import { ConfirmDialog } from '@/core/components/ConfirmDialog'
import { useCustomerLookup } from '@/core/hooks/useCustomerLookup'
import { useCustomerSites } from '@/core/hooks/useCustomerSites'
import {
  PROJECT_STATUS_LABELS,
  PROJECT_STATUS_VALUES,
  projectFormSchema,
  type Project,
  type ProjectFormInput,
} from '../types/project'
import { useCreateProject, useDeleteProject, useUpdateProject } from '../hooks/useProjectMutations'

const fieldClass =
  'w-full rounded-md border border-border px-3 py-2 text-sm focus:border-sage focus:outline-none'

interface ProjectFormProps {
  project?: Project
  onDone: () => void
  onCancel: () => void
}

export function ProjectForm({ project, onDone, onCancel }: ProjectFormProps) {
  const create = useCreateProject()
  const update = useUpdateProject()
  const del = useDeleteProject()
  const { data: customers = [] } = useCustomerLookup()
  const [confirmDelete, setConfirmDelete] = useState(false)
  const {
    register,
    handleSubmit,
    control,
    getValues,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ProjectFormInput>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: project
      ? { ...project, value: project.value != null ? String(project.value) : '' }
      : {
          projnr: '',
          title: '',
          client: '',
          street: '',
          zip: '',
          city: '',
          phone: '',
          value: '',
          date: '',
          desc: '',
          status: 'offen',
          customer: '',
          site: '',
        },
  })

  const customerId = watch('customer')
  const { data: sites = [] } = useCustomerSites(customerId ?? '')

  const { onChange: onCustomerChange, ...customerField } = register('customer')
  const handleCustomerChange: ChangeEventHandler<HTMLSelectElement> = (e) => {
    onCustomerChange(e)
    setValue('site', '')
    const match = customers.find((cu) => cu.id === e.target.value)
    if (match) {
      if (!getValues('client')) setValue('client', match.label)
      if (!getValues('phone') && match.phone) setValue('phone', match.phone)
      if (!getValues('street') && match.street) setValue('street', match.street)
      if (!getValues('zip') && match.zip) setValue('zip', match.zip)
      if (!getValues('city') && match.city) setValue('city', match.city)
    }
  }

  const { onChange: onSiteChange, ...siteField } = register('site')
  const handleSiteChange: ChangeEventHandler<HTMLSelectElement> = (e) => {
    onSiteChange(e)
    const match = sites.find((s) => s.id === e.target.value)
    if (match) {
      setValue('street', match.street)
      setValue('zip', match.zip)
      setValue('city', match.city)
    }
  }

  const onSubmit = (input: ProjectFormInput) => {
    if (project) {
      update.mutate({ id: project.id, input }, { onSuccess: onDone })
    } else {
      create.mutate(input, { onSuccess: onDone })
    }
  }

  const isPending = create.isPending || update.isPending

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="mx-auto max-w-lg pb-10">
      <div className="mb-3 flex flex-col gap-1">
        <label className="text-xs font-medium text-muted" htmlFor="projnr">
          Auftrags-/Projekt-Nr (TAIFUN)
        </label>
        <input id="projnr" className={fieldClass} placeholder="optional" {...register('projnr')} />
      </div>

      <div className="mb-3 flex flex-col gap-1">
        <label className="text-xs font-medium text-muted" htmlFor="title">
          Bezeichnung *
        </label>
        <input
          id="title"
          className={fieldClass}
          placeholder="z. B. Heizungstausch EFH"
          {...register('title')}
        />
        {errors.title && <p className="text-xs text-danger">{errors.title.message}</p>}
      </div>

      <div className="mb-3 flex flex-col gap-1">
        <label className="text-xs font-medium text-muted" htmlFor="customer">
          Kunde (optional)
        </label>
        <select
          id="customer"
          className={fieldClass}
          {...customerField}
          onChange={handleCustomerChange}
        >
          <option value="">— Kein Kunde / Freitext —</option>
          {customers.map((cu) => (
            <option key={cu.id} value={cu.id}>
              {cu.label}
            </option>
          ))}
        </select>
      </div>

      {customerId && (
        <div className="mb-3 flex flex-col gap-1">
          <label className="text-xs font-medium text-muted" htmlFor="site">
            Baustelle (optional)
          </label>
          <select id="site" className={fieldClass} {...siteField} onChange={handleSiteChange}>
            <option value="">— Kundenadresse verwenden —</option>
            {sites.map((s) => (
              <option key={s.id} value={s.id}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="mb-3 flex flex-col gap-1">
        <label className="text-xs font-medium text-muted" htmlFor="client">
          Name / Firma
        </label>
        <input
          id="client"
          className={fieldClass}
          placeholder="Name / Firma"
          {...register('client')}
        />
      </div>

      <div className="mb-3 flex flex-col gap-1">
        <label className="text-xs font-medium text-muted" htmlFor="street">
          Straße
        </label>
        <input id="street" className={fieldClass} {...register('street')} />
      </div>

      <div className="mb-3 flex gap-2.5">
        <div className="flex w-[38%] flex-col gap-1">
          <label className="text-xs font-medium text-muted" htmlFor="zip">
            PLZ
          </label>
          <input id="zip" className={fieldClass} {...register('zip')} />
        </div>
        <div className="flex flex-1 flex-col gap-1">
          <label className="text-xs font-medium text-muted" htmlFor="city">
            Ort
          </label>
          <input id="city" className={fieldClass} {...register('city')} />
        </div>
      </div>

      <div className="mb-3 flex flex-col gap-1">
        <label className="text-xs font-medium text-muted" htmlFor="phone">
          Telefon
        </label>
        <input id="phone" type="tel" className={fieldClass} {...register('phone')} />
      </div>

      <div className="mb-3 flex gap-2.5">
        <div className="flex flex-1 flex-col gap-1">
          <label className="text-xs font-medium text-muted" htmlFor="value">
            Betrag (€)
          </label>
          <input id="value" className={fieldClass} placeholder="optional" {...register('value')} />
        </div>
        <div className="flex flex-1 flex-col gap-1">
          <label className="text-xs font-medium text-muted" htmlFor="date">
            Datum
          </label>
          <input id="date" type="date" className={fieldClass} {...register('date')} />
        </div>
      </div>

      <div className="mb-3 flex flex-col gap-1">
        <label className="text-xs font-medium text-muted" htmlFor="desc">
          Beschreibung
        </label>
        <textarea
          id="desc"
          className={`${fieldClass} min-h-[70px] resize-y`}
          {...register('desc')}
        />
      </div>

      <div className="mb-3">
        <div className="mb-1 text-xs font-medium text-muted">Status</div>
        <Controller
          control={control}
          name="status"
          render={({ field }) => (
            <div className="flex gap-1.5">
              {PROJECT_STATUS_VALUES.map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => field.onChange(status)}
                  className={`flex-1 rounded-lg border px-1 py-2 text-xs font-bold ${
                    field.value === status
                      ? 'border-sage bg-page text-sage-deep'
                      : 'border-border text-muted'
                  }`}
                >
                  {PROJECT_STATUS_LABELS[status]}
                </button>
              ))}
            </div>
          )}
        />
      </div>

      <div className="mt-2 flex gap-2.5">
        <Button type="button" variant="secondary" className="flex-1" onClick={onCancel}>
          Abbrechen
        </Button>
        <Button type="submit" className="flex-1" disabled={isPending}>
          {project ? 'Speichern' : 'Anlegen'}
        </Button>
      </div>

      {project && (
        <Button
          type="button"
          variant="danger"
          className="mt-2.5 w-full"
          onClick={() => setConfirmDelete(true)}
        >
          Projekt löschen
        </Button>
      )}

      <ConfirmDialog
        open={confirmDelete}
        title="Projekt löschen?"
        description="Dieser Vorgang kann nicht rückgängig gemacht werden."
        confirmLabel="Löschen"
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => {
          if (project) del.mutate(project.id, { onSuccess: onDone })
          setConfirmDelete(false)
        }}
      />
    </form>
  )
}
