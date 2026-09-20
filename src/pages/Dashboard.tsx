import { useState } from 'react'
import { LogOut, Siren } from 'lucide-react'
import { useAuth } from '@/auth/AuthContext'
import { ROLE_LABELS, isDirection } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Pulse } from '@/components/Pulse'
import { cn } from '@/lib/utils'
import { ServicesTab } from './app/ServicesTab'
import { AbsenceTab } from './app/AbsenceTab'
import { RecolteFabTab } from './app/RecolteFabTab'
import { RegistreTab } from './app/RegistreTab'
import { HistoriqueTab } from './app/HistoriqueTab'
import { GestionTab } from './app/GestionTab'

type TabKey = 'services' | 'absence' | 'recolte_fab' | 'registre' | 'historique' | 'gestion'

const BASE_TABS: { key: TabKey; label: string }[] = [
  { key: 'services', label: 'Services' },
  { key: 'absence', label: 'Absence' },
  { key: 'recolte_fab', label: 'Récolte/Fab' },
  { key: 'registre', label: 'Registre' },
  { key: 'historique', label: 'Historique' },
]

export function Dashboard() {
  const { staff, signOut } = useAuth()
  const [tab, setTab] = useState<TabKey>('services')

  if (!staff) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#090d14]">
        <span className="w-8 h-8 border-2 border-white/20 border-t-red rounded-full animate-spin" />
      </div>
    )
  }

  const tabs = isDirection(staff.role) ? [...BASE_TABS, { key: 'gestion' as TabKey, label: 'Gestion' }] : BASE_TABS
  const onDuty = staff.status === 'en_service'

  return (
    <div className="relative min-h-screen bg-[#090d14] px-4 py-6 sm:px-8 sm:py-10 overflow-hidden">
      <Pulse className="opacity-60" />

      <div className="relative z-10 max-w-5xl mx-auto flex flex-col gap-6">
        <header className="flex items-center justify-between animate-fade-up">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red/15 border border-red/30 flex items-center justify-center animate-float">
              <Siren size={18} className="text-red-light" />
            </div>
            <div>
              <h1 className="font-display font-black text-lg text-white leading-tight">EMS Dashboard</h1>
              <p className="text-white/40 text-xs">{tabs.find((t) => t.key === tab)?.label}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={signOut}>
            <LogOut size={14} /> Déconnexion
          </Button>
        </header>

        <Card className={cn('p-4 flex items-center gap-3 animate-fade-up', onDuty && 'animate-card-glow border-green/30')}>
          <div className="relative">
            {staff.avatar_url ? (
              <img
                src={staff.avatar_url}
                alt=""
                className={cn('w-11 h-11 rounded-full border-2 transition-colors', onDuty ? 'border-green' : 'border-white/15')}
              />
            ) : (
              <div className={cn('w-11 h-11 rounded-full bg-white/10 border-2 transition-colors', onDuty ? 'border-green' : 'border-white/15')} />
            )}
            {onDuty && <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-green-400 border-2 border-[#0d1420] animate-status-pulse" />}
          </div>
          <div>
            <p className="text-white font-bold text-sm">{staff.full_name}</p>
            <p className="text-white/40 text-xs">{ROLE_LABELS[staff.role]}</p>
          </div>
        </Card>

        <div className="flex flex-wrap gap-2 animate-fade-up">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={cn(
                'px-4 py-2 rounded-full text-xs font-bold uppercase tracking-[1px] border cursor-pointer transition-all duration-300',
                tab === t.key
                  ? 'bg-red/15 border-red/40 text-white scale-105 shadow-[0_4px_16px_rgba(225,29,46,0.25)]'
                  : 'bg-white/5 border-white/10 text-white/50 hover:text-white/80 hover:border-white/25 hover:-translate-y-0.5',
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div key={tab} className="animate-tab-in">
          {tab === 'services' && <ServicesTab />}
          {tab === 'absence' && <AbsenceTab />}
          {tab === 'recolte_fab' && <RecolteFabTab />}
          {tab === 'registre' && <RegistreTab />}
          {tab === 'historique' && <HistoriqueTab />}
          {tab === 'gestion' && isDirection(staff.role) && <GestionTab />}
        </div>
      </div>
    </div>
  )
}
