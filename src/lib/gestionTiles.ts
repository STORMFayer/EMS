import {
  Users,
  Siren,
  CalendarOff,
  Wallet,
  SlidersHorizontal,
  HelpCircle,
  Banknote,
  CalendarClock,
  History,
  Archive,
  Car,
  type LucideIcon,
} from 'lucide-react'

export type GestionKey =
  | 'users'
  | 'services'
  | 'absences'
  | 'tarifs'
  | 'codes'
  | 'aide'
  | 'payes'
  | 'archive'
  | 'rdv'
  | 'vehicles'
  | 'historique'

export interface GestionSection {
  key: GestionKey
  label: string
  icon: LucideIcon
  color: string
  directionOnly?: boolean
}

export const GESTION_SECTIONS: GestionSection[] = [
  { key: 'users', label: 'Utilisateurs', icon: Users, color: 'var(--tile-services)', directionOnly: true },
  { key: 'services', label: 'Services', icon: Siren, color: 'var(--tile-absence)', directionOnly: true },
  { key: 'absences', label: 'Absences', icon: CalendarOff, color: 'var(--tile-registre)', directionOnly: true },
  { key: 'tarifs', label: 'Tarifs prestations', icon: Wallet, color: 'var(--tile-prestations)', directionOnly: true },
  { key: 'codes', label: 'Codes & interventions', icon: SlidersHorizontal, color: 'var(--tile-dossier)', directionOnly: true },
  { key: 'aide', label: 'Aide', icon: HelpCircle, color: 'var(--tile-aide)' },
  { key: 'payes', label: 'Gestion des payes', icon: Banknote, color: 'var(--tile-payes)', directionOnly: true },
  { key: 'archive', label: 'Archive', icon: Archive, color: 'var(--tile-archive)', directionOnly: true },
  { key: 'rdv', label: 'RDV', icon: CalendarClock, color: 'var(--tile-rdv)', directionOnly: true },
  { key: 'vehicles', label: 'Véhicules', icon: Car, color: 'var(--tile-vehicles)', directionOnly: true },
  { key: 'historique', label: 'Historique', icon: History, color: 'var(--tile-historique)', directionOnly: true },
]
