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
