import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY,
)

export type StaffRole = 'medecin' | 'infirmier' | 'ambulancier' | 'chef_service'
export type DutyStatus = 'en_service' | 'en_pause' | 'hors_service'

export const ROLE_LABELS: Record<StaffRole, string> = {
  medecin: 'Médecin',
  infirmier: 'Infirmier',
  ambulancier: 'Ambulancier',
  chef_service: 'Chef de service',
}

export const STATUS_LABELS: Record<DutyStatus, string> = {
  en_service: 'En service',
  en_pause: 'En pause',
  hors_service: 'Hors service',
}

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
