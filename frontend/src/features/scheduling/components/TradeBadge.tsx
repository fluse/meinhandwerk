import {
  Droplet,
  Eye,
  Flame,
  Hammer,
  Palmtree,
  Snowflake,
  Syringe,
  Zap,
  type LucideIcon,
} from 'lucide-react'
import { colorVar } from '@/core/lib/cssVar'
import { TRADES, type Trade } from '../types/order'

export const TRADE_ICONS: Record<Trade, LucideIcon> = {
  heizung: Flame,
  sanitaer: Droplet,
  elektro: Zap,
  klima: Snowflake,
  innenausbau: Hammer,
  besichtigung: Eye,
  urlaub: Palmtree,
  krank: Syringe,
}

export function TradeIcon({ trade, size = 14 }: { trade: Trade; size?: number }) {
  const Icon = TRADE_ICONS[trade]
  // lucide setzt den color-Prop als rohes SVG-stroke-Attribut – darin löst der Browser
  // CSS-Custom-Properties (var(...)) nicht zuverlässig auf (Icon wird unsichtbar/transparent).
  // Über style.color + das lucide-Default stroke="currentColor" läuft die Auflösung stattdessen
  // durch die normale CSS-Kaskade, wo var() zuverlässig funktioniert.
  return (
    <Icon
      size={size}
      style={{
        color: colorVar(trade === 'innenausbau' ? 'trade-innenausbau-dot' : `trade-${trade}`),
      }}
    />
  )
}

export function TradeBadge({ trade }: { trade: Trade }) {
  return (
    <span
      className="whitespace-nowrap rounded-md px-2 py-0.5 text-[11px] font-bold"
      style={{
        background: colorVar(`trade-${trade}`),
        color: colorVar(`trade-${trade}-fg`),
        border:
          trade === 'innenausbau' ? `1px solid ${colorVar('trade-innenausbau-border')}` : 'none',
      }}
    >
      {TRADES[trade]}
    </span>
  )
}
