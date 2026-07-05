import { useState } from 'react'
import { ConfirmDialog } from '@/core/components/ConfirmDialog'
import { useVehicles } from '../hooks/useVehicles'
import { useDeleteVehicle } from '../hooks/useVehicleMutations'
import { VehicleAdminRow } from '../components/VehicleAdminRow'
import { AddVehicleForm } from '../components/AddVehicleForm'
import { EditVehicleDialog } from '../components/EditVehicleDialog'
import type { Vehicle } from '../types/vehicle'

export function VehicleSettingsPage() {
  const { data: vehicles, isLoading, isError } = useVehicles()
  const deleteVehicle = useDeleteVehicle()
  const [editing, setEditing] = useState<Vehicle | null>(null)
  const [removing, setRemoving] = useState<Vehicle | null>(null)

  if (isLoading) {
    return <p className="text-sm text-muted">Fahrzeuge werden geladen…</p>
  }

  if (isError || !vehicles) {
    return <p className="text-sm text-danger">Fahrzeuge konnten nicht geladen werden.</p>
  }

  return (
    <div>
      {vehicles.length === 0 && (
        <div className="mb-1.5 text-sm text-muted">Noch keine Fahrzeuge.</div>
      )}
      {vehicles.map((v) => (
        <VehicleAdminRow
          key={v.id}
          vehicle={v}
          onEdit={() => setEditing(v)}
          onDelete={() => setRemoving(v)}
        />
      ))}

      <AddVehicleForm />

      {editing && <EditVehicleDialog vehicle={editing} onClose={() => setEditing(null)} />}

      <ConfirmDialog
        open={removing != null}
        title={`${removing?.name} entfernen?`}
        description="Der Fahrzeugeintrag wird gelöscht und kann nicht rückgängig gemacht werden."
        confirmLabel="Entfernen"
        onCancel={() => setRemoving(null)}
        onConfirm={() => {
          if (removing) deleteVehicle.mutate(removing.id)
          setRemoving(null)
        }}
      />
    </div>
  )
}
