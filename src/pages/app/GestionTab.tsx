import { useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useAuth } from '@/auth/AuthContext'
import { isDirection } from '@/lib/supabase'
import { GESTION_SECTIONS, type GestionKey } from '@/lib/gestionTiles'
import { SectionHeader } from '@/components/ui/SectionHeader'
import { UsersSection } from './gestion/UsersSection'
import { ServicesSection } from './gestion/ServicesSection'
import { AbsencesSection } from './gestion/AbsencesSection'
import { TarifsSection } from './gestion/TarifsSection'
import { CodesSection } from './gestion/CodesSection'
import { AideSection } from './gestion/AideSection'
import { PayesSection } from './gestion/PayesSection'
import { RdvSection } from './gestion/RdvSection'
import { HistoriqueSection } from './gestion/HistoriqueSection'

const SECTION_CONTENT: Record<GestionKey, ReactNode> = {
  users: <UsersSection />,
  services: <ServicesSection />,
  absences: <AbsencesSection />,
  tarifs: <TarifsSection />,
  codes: <CodesSection />,
  aide: <AideSection />,
  payes: <PayesSection />,
  rdv: <RdvSection />,
  historique: <HistoriqueSection />,
}

export function GestionTab() {
  const { staff } = useAuth()
  const [view, setView] = useState<GestionKey | 'home'>('home')

  const sections = GESTION_SECTIONS.filter((s) => !s.directionOnly || isDirection(staff?.role))
  const activeSection = view === 'home' ? null : sections.find((s) => s.key === view) ?? null

  return (
    <AnimatePresence mode="wait">
      {view === 'home' ? (
        <motion.div
          key="gestion-home"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
          className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4"
        >
          {sections.map((s, i) => {
            const Icon = s.icon
            return (
              <motion.button
                key={s.key}
                type="button"
                onClick={() => setView(s.key)}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 300, damping: 26, delay: i * 0.04 }}
                whileHover={{ y: -3, scale: 1.015 }}
                whileTap={{ scale: 0.98 }}
                className="rounded-2xl p-4 flex flex-col justify-between text-left text-white cursor-pointer min-h-[110px] sm:min-h-[130px]"
                style={{ background: s.color }}
              >
                <Icon size={20} />
                <p className="text-xs font-semibold opacity-90 mt-1">{s.label}</p>
              </motion.button>
            )
          })}
        </motion.div>
      ) : (
        <motion.div
          key={view}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
          className="flex flex-col gap-6"
        >
          {activeSection && (
            <SectionHeader label={activeSection.label} icon={activeSection.icon} color={activeSection.color} onBack={() => setView('home')} />
          )}
          {SECTION_CONTENT[view]}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
