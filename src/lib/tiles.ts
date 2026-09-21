import {
  Siren,
  UserX,
  Package,
  Receipt,
  CalendarClock,
  Stethoscope,
  HelpCircle,
  History,
  ShieldCheck,
  type LucideIcon,
} from 'lucide-react'

export type TabKey =
  | 'services'
  | 'absence'
  | 'registre'
  | 'prestations'
  | 'agenda'
  | 'dossier_medical'
  | 'aide'
  | 'historique'
  | 'gestion'

export interface TileSection {
  key: TabKey
  label: string
  icon: LucideIcon
  color: string
  direction?: boolean
}

export const TILE_SECTIONS: TileSection[] = [
  { key: 'services', label: 'Services', icon: Siren, color: 'var(--tile-services)' },
  { key: 'absence', label: 'Absence', icon: UserX, color: 'var(--tile-absence)' },
  { key: 'registre', label: 'Registre', icon: Package, color: 'var(--tile-registre)' },
  { key: 'prestations', label: 'Prestations', icon: Receipt, color: 'var(--tile-prestations)' },
  { key: 'agenda', label: 'Agenda', icon: CalendarClock, color: 'var(--tile-agenda)' },
  { key: 'dossier_medical', label: 'Dossier médical', icon: Stethoscope, color: 'var(--tile-dossier)' },
  { key: 'aide', label: 'Aide', icon: HelpCircle, color: 'var(--tile-aide)' },
  { key: 'historique', label: 'Historique', icon: History, color: 'var(--tile-historique)' },
  { key: 'gestion', label: 'Gestion', icon: ShieldCheck, color: 'var(--tile-gestion)', direction: true },
]
