import { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import { ConfirmDialog } from '@/core/components/ConfirmDialog'
import { useCustomer } from '../hooks/useCustomer'
import { useDeleteCustomer } from '../hooks/useCustomerMutations'
import { CustomerForm } from '../components/CustomerForm'

export function CustomerFormPage() {
  const { customerId } = useParams<{ customerId: string }>()
  const navigate = useNavigate()
  const { data: customer, isLoading } = useCustomer(customerId)
  const del = useDeleteCustomer()
  const [confirmDelete, setConfirmDelete] = useState(false)

  if (customerId && isLoading) {
    return <p className="text-sm text-muted">Kunde wird geladen…</p>
  }

  const goBack = () => navigate(-1)

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-2">
        <h1 className="text-lg font-bold text-ink">
          {customerId ? 'Kunde bearbeiten' : 'Neuer Kunde'}
        </h1>
        {customerId && (
          <button
            type="button"
            onClick={() => setConfirmDelete(true)}
            title="Kunde löschen"
            className="cursor-pointer rounded-md p-1.5 text-danger hover:bg-red-50"
          >
            <Trash2 size={18} />
          </button>
        )}
      </div>
      <CustomerForm customer={customer} onDone={goBack} onCancel={goBack} />

      <ConfirmDialog
        open={confirmDelete}
        title="Kunde löschen?"
        description="Dieser Vorgang kann nicht rückgängig gemacht werden."
        confirmLabel="Löschen"
        onCancel={() => setConfirmDelete(false)}
        onConfirm={() => {
          setConfirmDelete(false)
          if (customerId) del.mutate(customerId, { onSuccess: goBack })
        }}
      />
    </div>
  )
}
