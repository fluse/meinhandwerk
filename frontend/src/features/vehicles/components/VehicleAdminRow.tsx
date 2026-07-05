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
      <button
        type="button"
        onClick={onEdit}
        className="cursor-pointer text-xs font-bold text-sage-deep hover:underline"
      >
        Bearbeiten
      </button>
      <button
        type="button"
        onClick={onDelete}
        className="cursor-pointer text-xs font-semibold text-danger hover:underline"
      >
        Entfernen
      </button>
    </div>
  )
}
