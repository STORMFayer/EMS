import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
)

export type StaffRole =
  | 'directeur'
  | 'directeur_adjoint'
  | 'directeur_centre'
  | 'chef_pole'
  | 'chef_service'
  | 'chef_chirurgie'
  | 'chirurgien_expert'
  | 'chirurgien_vacataire'
  | 'chirurgien_specialise'
  | 'chirurgien'
  | 'medecin_chef'
  | 'urgentiste'
  | 'generaliste'
  | 'resident'
  | 'interne'
  | 'externe'
  | 'infirmier'
  | 'ambulancier'
  | 'aide_soignant'
  | 'membre'

export type DutyStatus = 'en_service' | 'en_pause' | 'hors_service'

export const ROLE_LABELS: Record<StaffRole, string> = {
  directeur: 'Directeur',
  directeur_adjoint: 'Directeur-Adjoint',
  directeur_centre: 'Directeur de centre',
  chef_pole: 'Chef de Pôle',
  chef_service: 'Chef de service',
  chef_chirurgie: 'Chef de chirurgie',
  chirurgien_expert: 'Chirurgien expert',
  chirurgien_vacataire: 'Chirurgien vacataire',
  chirurgien_specialise: 'Chirurgien spécialisé',
  chirurgien: 'Chirurgien',
  medecin_chef: 'Médecin-chef',
  urgentiste: 'Urgentiste',
  generaliste: 'Généraliste',
  resident: 'Résident',
  interne: 'Interne',
  externe: 'Externe',
  infirmier: 'Infirmier',
  ambulancier: 'Ambulancier',
  aide_soignant: 'Aide-soignant',
  membre: 'Membre E.M.S',
}

export const STATUS_LABELS: Record<DutyStatus, string> = {
  en_service: 'En service',
  en_pause: 'En pause',
  hors_service: 'Hors service',
}

export const DISCORD_INVITE_URL = 'https://discord.gg/BqPNg7Ngt'

export interface Staff {
  id: string
  discord_id: string | null
  full_name: string
  avatar_url: string | null
  role: StaffRole
  status: DutyStatus
  shift_started_at: string | null
  created_at: string
}
