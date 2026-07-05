import { Pencil, Trash2 } from 'lucide-react'
import type { TeamMember } from '../types/member'

interface MemberCardProps {
  member: TeamMember
  isSelf: boolean
  onEdit: () => void
  onDelete: () => void
}

export function MemberCard({ member, isSelf, onEdit, onDelete }: MemberCardProps) {
  const contact = [member.phone, member.email].filter(Boolean).join(' · ')

  return (
    <div className="mb-2 flex items-center justify-between gap-2 rounded-xl border border-border bg-card px-3.5 py-2.5">
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold text-ink">
          {member.name}
          {isSelf ? ' (du)' : ''}
        </div>
        <div className="truncate text-xs text-muted">{contact || 'kein Kontakt hinterlegt'}</div>
      </div>
      <div className="flex flex-none items-center gap-4">
        <button
          type="button"
          onClick={onEdit}
          title="Mitarbeiter bearbeiten"
          className="cursor-pointer text-sage-deep"
        >
          <Pencil size={15} />
        </button>
        {!isSelf && (
          <button
            type="button"
            onClick={onDelete}
            title="Mitarbeiter entfernen"
            className="cursor-pointer text-danger"
          >
            <Trash2 size={15} />
          </button>
        )}
      </div>
    </div>
  )
}
