import type { CSSProperties, FormEvent, MouseEvent, ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { X } from 'lucide-react'
import { useBodyScrollLock } from '@/core/hooks/useBodyScrollLock'

interface OverlayProps {
  /** @default true — für Dialoge, die nur bedingt gemountet werden. */
  open?: boolean
  /** 'center' für kompakte Dialoge, 'sheet' für ein Bottom-Sheet. */
  variant?: 'center' | 'sheet'
  /** Bei 'sheet': ab dem sm-Breakpoint mittig statt am unteren Rand anzeigen. */
  responsive?: boolean
  /** Verzichtet auf die Standard-Panel-Klassen (Größe/Rundung/Padding) für Sonderfälle. */
  bare?: boolean
  /** @default true bei variant 'sheet', sonst false */
  showHandle?: boolean
  /** Rendert das Panel als <form>, statt als <div>. */
  onSubmit?: (e: FormEvent<HTMLFormElement>) => void
  /** Schließt den Dialog bei Klick auf das Backdrop (Klicks im Panel schließen nicht). */
  onBackdropClick?: () => void
  /** Zeigt oben rechts im Panel einen fest angehefteten Schließen-Button (bleibt beim Scrollen sichtbar). */
  onClose?: () => void
  panelClassName?: string
  panelStyle?: CSSProperties
  children: ReactNode
}

/** Gemeinsamer Overlay-Rahmen für alle Dialog-/Sheet-Komponenten.
 * Sperrt das Hintergrund-Scrollen, solange er offen ist. */
export function Overlay({
  open = true,
  variant = 'center',
  responsive = false,
  bare = false,
  showHandle = variant === 'sheet',
  onSubmit,
  onBackdropClick,
  onClose,
  panelClassName = '',
  panelStyle,
  children,
}: OverlayProps) {
  useBodyScrollLock(open)

  if (!open) return null

  const alignClass =
    variant === 'sheet'
      ? responsive
        ? 'items-end sm:items-center'
        : 'items-end'
      : 'items-center px-4'
  const panelBaseClass = bare
    ? ''
    : variant === 'sheet'
      ? `max-h-[92vh] w-full max-w-lg overflow-y-auto rounded-t-2xl bg-card p-5${
          responsive ? ' sm:rounded-2xl' : ''
        }`
      : 'w-full max-w-sm rounded-lg bg-card p-5 shadow-xl'
  const panelClass = [panelBaseClass, panelClassName].filter(Boolean).join(' ')
  const showHandleBar = showHandle && !bare
  const stopPropagation = onBackdropClick
    ? (e: MouseEvent<HTMLElement>) => e.stopPropagation()
    : undefined
  // Handle-Linie und Schließen-Button sitzen zusammen in einer Zeile, die per negativem Rand bis
  // an den Panel-Rand reicht (statt im p-5-Innenabstand zu bleiben) und dank eigenem Hintergrund
  // + position:sticky oben kleben bleibt – so scrollt darunter nichts sichtbar durch, während der
  // restliche Inhalt wegscrollt.
  const header = (showHandleBar || onClose) && (
    <div
      className={`sticky -top-5 z-10 -mx-5 -mt-5 mb-3.5 flex items-center justify-center bg-card px-5 pt-5 pb-4 ${
        variant === 'sheet' ? 'rounded-t-2xl' : 'rounded-t-lg'
      }`}
    >
      {showHandleBar && <div className="h-1 w-10 rounded-full bg-border" />}
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Schließen"
          className="absolute right-3 top-2 rounded-full p-1.5 text-muted hover:bg-page hover:text-sage-deep"
        >
          <X size={18} />
        </button>
      )}
    </div>
  )

  // Per Portal direkt an <body> gerendert: sonst würde ein Overlay, das innerhalb des sticky
  // Headers ausgelöst wird (z. B. die Meldungen-Glocke), im lokalen Stacking-Context des Headers
  // gefangen bleiben und trotz z-50 hinter der ebenfalls sticky positionierten BottomNav liegen.
  return createPortal(
    <div
      className={`fixed inset-0 z-50 flex justify-center bg-black/25 backdrop-blur-[2px] ${alignClass}`}
      onClick={onBackdropClick}
    >
      {onSubmit ? (
        <form
          onSubmit={onSubmit}
          className={panelClass}
          style={panelStyle}
          onClick={stopPropagation}
        >
          {header}
          {children}
        </form>
      ) : (
        <div className={panelClass} style={panelStyle} onClick={stopPropagation}>
          {header}
          {children}
        </div>
      )}
    </div>,
    document.body,
  )
}
