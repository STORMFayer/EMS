import { useState, type ReactNode } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { LayoutGrid, LogOut } from 'lucide-react'
import { useAuth } from '@/auth/AuthContext'
import { ROLE_LABELS, isDirection } from '@/lib/supabase'
import { TILE_SECTIONS, type TabKey } from '@/lib/tiles'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { HomeTiles } from '@/components/ui/HomeTiles'
import { SectionHeader } from '@/components/ui/SectionHeader'
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

const TAB_CONTENT: Record<TabKey, ReactNode> = {
  services: <ServicesTab />,
  absence: <AbsenceTab />,
  registre: <RegistreTab />,
  prestations: <PrestationsTab />,
  agenda: <AgendaTab />,
  dossier_medical: <DossierMedicalTab />,
  aide: <AideTab />,
  historique: <HistoriqueTab />,
  gestion: <GestionTab />,
}

export function Dashboard() {
  const { staff, signOut } = useAuth()
  const [view, setView] = useState<TabKey | 'home'>('home')

  if (!staff) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
        <span className="w-8 h-8 border-2 border-[var(--ink)]/20 border-t-red rounded-full animate-spin" />
      </div>
    )
  }

  const visibleTabs = TILE_SECTIONS.filter((s) => !s.direction || isDirection(staff.role)).map((s) => s.key)
  const activeSection = view === 'home' ? null : TILE_SECTIONS.find((s) => s.key === view) ?? null

  return (
    <div className="min-h-screen flex bg-[var(--bg)]">
      <aside className="w-16 sm:w-20 shrink-0 flex flex-col items-center py-5 gap-4 bg-[var(--sidebar-bg)] border-r border-[var(--ink)]/8">
        <button
          type="button"
          onClick={() => setView('home')}
          aria-label="Accueil"
          className={cn(
            'w-10 h-10 rounded-xl flex items-center justify-center cursor-pointer transition-colors',
            view === 'home' ? 'bg-red text-white' : 'bg-[var(--ink)]/5 text-[var(--ink)]/60 hover:bg-[var(--ink)]/10 hover:text-[var(--ink)]',
          )}
        >
          <LayoutGrid size={18} />
        </button>

        <div className="flex-1" />

        {staff.avatar_url ? (
          <img src={staff.avatar_url} alt="" className="w-9 h-9 rounded-full border border-[var(--ink)]/15" />
        ) : (
          <div className="w-9 h-9 rounded-full bg-[var(--ink)]/10 border border-[var(--ink)]/15" />
        )}

        <ThemeToggle />

        <button
          type="button"
          onClick={signOut}
          aria-label="Déconnexion"
          className="w-10 h-10 rounded-xl bg-[var(--ink)]/5 text-[var(--ink)]/60 hover:bg-[var(--ink)]/10 hover:text-[var(--ink)] transition-colors flex items-center justify-center cursor-pointer"
        >
          <LogOut size={17} />
        </button>
      </aside>

      <main className="flex-1 min-w-0 px-4 py-6 sm:px-8 sm:py-8 flex flex-col gap-6 overflow-y-auto">
        <AnimatePresence mode="wait">
          {view === 'home' ? (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col gap-6 max-w-5xl w-full mx-auto"
            >
              <div>
                <h1 className="font-display font-black text-xl text-[var(--ink)]">Bonjour, {staff.full_name}</h1>
                <p className="text-[var(--ink)]/40 text-sm">{ROLE_LABELS[staff.role]}</p>
              </div>
              <HomeTiles tabs={visibleTabs} onSelect={(key) => setView(key)} />
            </motion.div>
          ) : (
            <motion.div
              key={view}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
              className="flex flex-col gap-6 max-w-5xl w-full mx-auto"
            >
              {activeSection && (
                <SectionHeader
                  label={activeSection.label}
                  icon={activeSection.icon}
                  color={activeSection.color}
                  onBack={() => setView('home')}
                />
              )}
              {TAB_CONTENT[view]}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  )
}
