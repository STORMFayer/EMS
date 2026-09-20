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

export const DIRECTION_ROLES: StaffRole[] = ['directeur', 'directeur_adjoint', 'directeur_centre']

export function isDirection(role: StaffRole | undefined | null) {
  return !!role && DIRECTION_ROLES.includes(role)
}

export interface Staff {
  id: string
  discord_id: string | null
  full_name: string
  avatar_url: string | null
  role: StaffRole
  status: DutyStatus
  shift_started_at: string | null
  unit_id: string | null
  created_at: string
}

export type EmergencyCode = '1' | '2' | '3'

export const CODE_LABELS: Record<EmergencyCode, string> = {
  '1': 'Code 1 · Routine',
  '2': 'Code 2 · Urgent',
  '3': 'Code 3 · Feux & sirènes',
}

export interface Unit {
  id: string
  name: string
  sector: string | null
  code: EmergencyCode | null
  vehicule: string | null
  commentaire: string | null
  defibrillateur: boolean
  status: DutyStatus
  created_at: string
}

export interface Shift {
  id: number
  staff_id: string
  unit_name: string | null
  sector: string | null
  code: EmergencyCode | null
  vehicule: string | null
  commentaire: string | null
  defibrillateur: boolean
  status_label: string | null
  started_at: string
  ended_at: string | null
  created_at: string
}

export const INTERVENTION_SHORTCUTS = [
  'M.A.R.U.',
  'A.S.G.',
  'M.R.G.',
  'D.W.B.',
  'Don du sang',
  'Superviseur (M.T.T.)',
  'G.O.P.S.',
  'P.S.S.',
]

export function slugify(label: string) {
  return label
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
}

export type AbsenceStatus = 'en_attente' | 'validee' | 'refusee'

export interface Absence {
  id: number
  staff_id: string
  start_date: string
  end_date: string
  motif: string | null
  status: AbsenceStatus
  created_at: string
}

export const ABSENCE_STATUS_LABELS: Record<AbsenceStatus, string> = {
  en_attente: 'En attente',
  validee: 'Validée',
  refusee: 'Refusée',
}

export type StockItemKey =
  | 'medicaments'
  | 'methadone'
  | 'trousse_de_soin'
  | 'pince_a_epiler'
  | 'creme_brulures'
  | 'poche_de_glace'
  | 'sedatif'
  | 'kit_de_suture'
  | 'bandage'
  | 'vicodin_5mg'
  | 'morphine_30mg'
  | 'percocet_5mg'
  | 'percocet_10mg'
  | 'percocet_30mg'
  | 'defibrillateur'
  | 'morceaux_de_tissus'
  | 'produit_chimique'
  | 'kit_de_nettoyage'
  | 'kit_de_reparation'

export const STOCK_ITEM_LABELS: Record<StockItemKey, string> = {
  medicaments: 'Medicaments',
  methadone: 'Méthadone',
  trousse_de_soin: 'Trousse de soin',
  pince_a_epiler: 'Pince à épiler',
  creme_brulures: 'Crème pour brûlures',
  poche_de_glace: 'Poche de glace',
  sedatif: 'Sédatif',
  kit_de_suture: 'Kit de suture',
  bandage: 'Bandage',
  vicodin_5mg: 'Vicodin 5Mg',
  morphine_30mg: 'Morphine 30mg',
  percocet_5mg: 'Percocet 5mg',
  percocet_10mg: 'Percocet 10mg',
  percocet_30mg: 'Percocet 30mg',
  defibrillateur: 'Défibrilateur',
  morceaux_de_tissus: 'Morceaux de tissus',
  produit_chimique: 'Produit Chimique',
  kit_de_nettoyage: 'Kit de nettoyage',
  kit_de_reparation: 'Kit de réparation',
}

export type StockMovementSource = 'registre_depot' | 'registre_retrait'

export interface StockMovement {
  id: number
  staff_id: string
  item_key: StockItemKey
  delta: number
  source: StockMovementSource
  lieu: string
  created_at: string
}

export interface StockRow {
  item_key: StockItemKey
  quantity: number
}

export interface PrestationType {
  id: string
  label: string
  tarif: number
  created_at: string
}

export interface Prestation {
  id: number
  staff_id: string
  prestation_type_id: string
  montant: number
  is_public: boolean
  details: string | null
  created_at: string
}

export type AppointmentType = 'cas' | 'cappa' | 'visite_medicale' | 'autre'

export const APPOINTMENT_TYPE_LABELS: Record<AppointmentType, string> = {
  cas: 'CAS',
  cappa: 'CAPPA',
  visite_medicale: 'Visite médicale',
  autre: 'Autre',
}

export interface Appointment {
  id: number
  staff_id: string
  type: AppointmentType
  title: string | null
  scheduled_at: string
  created_at: string
}

export interface OpTemplate {
  id: string
  label: string
  motif: string
  procede: string
  prescription: string
  created_at: string
}

export interface HelpArticle {
  id: number
  title: string
  image_url: string | null
  content: string | null
  position: number
  created_at: string
}
