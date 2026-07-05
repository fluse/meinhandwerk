import { Pencil, Trash2 } from 'lucide-react'
import type { Site } from '../types/site'

interface SiteRowProps {
  site: Site
  onEdit: () => void
  onDelete: () => void
}

export function SiteRow({ site: s, onEdit, onDelete }: SiteRowProps) {
  const address = [s.street, [s.zip, s.city].filter(Boolean).join(' ')].filter(Boolean).join(', ')

  return (
    <div className="mb-2 flex items-center justify-between gap-2 rounded-xl border border-border bg-card px-3.5 py-2.5">
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold text-ink">{s.label || address || 'Baustelle'}</div>
        {s.label && address && <div className="truncate text-xs text-muted">{address}</div>}
      </div>
      <div className="flex flex-none items-center gap-4">
        <button
          type="button"
          onClick={onEdit}
          title="Baustelle bearbeiten"
          className="cursor-pointer text-sage-deep"
        >
          <Pencil size={15} />
        </button>
        <button
          type="button"
          onClick={onDelete}
          title="Baustelle entfernen"
          className="cursor-pointer text-danger"
        >
          <Trash2 size={15} />
        </button>
      </div>
    </div>
  )
}
