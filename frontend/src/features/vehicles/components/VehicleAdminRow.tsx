import { Pencil, Trash2 } from 'lucide-react'
import type { Vehicle } from '../types/vehicle'

interface VehicleAdminRowProps {
  vehicle: Vehicle
  onEdit: () => void
  onDelete: () => void
}

export function VehicleAdminRow({ vehicle: v, onEdit, onDelete }: VehicleAdminRowProps) {
  const info = [v.plate, v.assignedToName ? `bei ${v.assignedToName}` : 'nicht zugeordnet']
    .filter(Boolean)
    .join(' · ')

  return (
    <div className="mb-2 flex items-center justify-between gap-2 rounded-xl border border-border bg-card px-3.5 py-2.5">
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold text-ink">{v.name}</div>
        <div className="truncate text-xs text-muted">{info}</div>
      </div>
      <div className="flex flex-none items-center gap-4">
        <button
          type="button"
          onClick={onEdit}
          title="Fahrzeug bearbeiten"
          className="cursor-pointer text-sage-deep"
        >
          <Pencil size={15} />
        </button>
        <button
          type="button"
          onClick={onDelete}
          title="Fahrzeug entfernen"
          className="cursor-pointer text-danger"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  )
}
