import { useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { LogOut, Siren } from 'lucide-react'
import { useAuth } from '@/auth/AuthContext'
import { ROLE_LABELS, isDirection } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Pulse } from '@/components/Pulse'
import { cn } from '@/lib/utils'
import { ServicesTab } from './app/ServicesTab'
import { AbsenceTab } from './app/AbsenceTab'
import { RegistreTab } from './app/RegistreTab'
import { PrestationsTab } from './app/PrestationsTab'
import { AgendaTab } from './app/AgendaTab'
import { DossierMedicalTab } from './app/DossierMedicalTab'
import { HistoriqueTab } from './app/HistoriqueTab'
import { GestionTab } from './app/GestionTab'
import { AideTab } from './app/AideTab'

type TabKey = 'services' | 'absence' | 'registre' | 'prestations' | 'agenda' | 'dossier_medical' | 'aide' | 'historique' | 'gestion'

const BASE_TABS: { key: TabKey; label: string }[] = [
  { key: 'services', label: 'Services' },
  { key: 'absence', label: 'Absence' },
  { key: 'registre', label: 'Registre' },
  { key: 'prestations', label: 'Prestations' },
  { key: 'agenda', label: 'Agenda' },
  { key: 'dossier_medical', label: 'Dossier médical' },
  { key: 'aide', label: 'Aide' },
  { key: 'historique', label: 'Historique' },
]

const slideVariants = {
  enter: (dir: number) => ({ opacity: 0, x: dir >= 0 ? 50 : -50 }),
  center: { opacity: 1, x: 0 },
  exit: (dir: number) => ({ opacity: 0, x: dir >= 0 ? -50 : 50 }),
}

export function Dashboard() {
  const { staff, signOut } = useAuth()
  const [tab, setTab] = useState<TabKey>('services')
  const [direction, setDirection] = useState(0)
  const tabOrderRef = useRef<TabKey[]>([])

  if (!staff) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#090d14]">
        <span className="w-8 h-8 border-2 border-white/20 border-t-red rounded-full animate-spin" />
      </div>
    )
  }

  const tabs = isDirection(staff.role) ? [...BASE_TABS, { key: 'gestion' as TabKey, label: 'Gestion' }] : BASE_TABS
  tabOrderRef.current = tabs.map((t) => t.key)
  const onDuty = staff.status === 'en_service'

  function handleTabClick(key: TabKey) {
    const order = tabOrderRef.current
    setDirection(order.indexOf(key) >= order.indexOf(tab) ? 1 : -1)
    setTab(key)
  }

  return (
    <div className="relative min-h-screen bg-[#090d14] px-4 py-6 sm:px-8 sm:py-10 overflow-hidden">
      <Pulse className="opacity-60" />

      <div className="relative z-10 max-w-5xl mx-auto flex flex-col gap-6">
        <motion.header
          className="flex items-center justify-between"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ type: 'spring', stiffness: 260, damping: 24 }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red/15 border-2 border-red/30 flex items-center justify-center animate-float animate-siren-swap">
              <Siren size={18} className="text-red-light" />
            </div>
            <div>
              <h1 className="font-display font-black text-lg text-neon-red leading-tight">EMS Dashboard</h1>
              <p className="text-white/40 text-xs">{tabs.find((t) => t.key === tab)?.label}</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={signOut}>
            <LogOut size={14} /> Déconnexion
          </Button>
        </motion.header>

        <Card className={cn('p-4 flex items-center gap-3', onDuty && 'animate-card-glow border-green/30')} from="left">
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

        <div className="flex flex-wrap gap-2">
          {tabs.map((t, i) => (
            <motion.button
              key={t.key}
              type="button"
              onClick={() => handleTabClick(t.key)}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ type: 'spring', stiffness: 340, damping: 26, delay: i * 0.05 }}
              whileHover={{ y: -2 }}
              whileTap={{ scale: 0.95 }}
              className={cn(
                'relative px-4 py-2 rounded-full text-xs font-bold uppercase tracking-[1px] cursor-pointer',
                tab === t.key ? 'text-neon-red' : 'text-white/50 hover:text-white/80',
              )}
            >
              {tab === t.key && (
                <motion.span
                  layoutId="active-tab-pill"
                  className="absolute inset-0 rounded-full neon-ring bg-red/15"
                  transition={{ type: 'spring', stiffness: 380, damping: 32 }}
                />
              )}
              {tab !== t.key && <span className="absolute inset-0 rounded-full border border-white/10 bg-white/5" />}
              <span className="relative z-10">{t.label}</span>
            </motion.button>
          ))}
        </div>

        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={tab}
            custom={direction}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          >
            {tab === 'services' && <ServicesTab />}
            {tab === 'absence' && <AbsenceTab />}
            {tab === 'registre' && <RegistreTab />}
            {tab === 'prestations' && <PrestationsTab />}
            {tab === 'agenda' && <AgendaTab />}
            {tab === 'dossier_medical' && <DossierMedicalTab />}
            {tab === 'aide' && <AideTab />}
            {tab === 'historique' && <HistoriqueTab />}
            {tab === 'gestion' && isDirection(staff.role) && <GestionTab />}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
}
