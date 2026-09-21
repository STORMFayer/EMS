import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { supabase, type Appointment } from '@/lib/supabase'
import { TILE_SECTIONS, type TabKey } from '@/lib/tiles'
import { cn } from '@/lib/utils'

function formatUpcoming(iso: string) {
  const d = new Date(iso)
  const day = d.toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })
  const time = d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
  return `${day} · ${time}`
}

export function HomeTiles({ tabs, onSelect }: { tabs: TabKey[]; onSelect: (key: TabKey) => void }) {
  const [enService, setEnService] = useState(0)
  const [absencesEnAttente, setAbsencesEnAttente] = useState(0)
  const [nextAppointment, setNextAppointment] = useState<Appointment | null>(null)

  useEffect(() => {
    supabase
      .from('staff')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'en_service')
      .then(({ count }) => setEnService(count ?? 0))
    supabase
      .from('absences')
      .select('id', { count: 'exact', head: true })
      .eq('status', 'en_attente')
      .then(({ count }) => setAbsencesEnAttente(count ?? 0))
    supabase
      .from('appointments')
      .select('*')
      .gte('scheduled_at', new Date().toISOString())
      .order('scheduled_at', { ascending: true })
      .limit(1)
      .then(({ data }) => setNextAppointment(data?.[0] ?? null))
  }, [])

  const sections = TILE_SECTIONS.filter((s) => tabs.includes(s.key))

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
      {sections.map((section, i) => {
        const Icon = section.icon
        const big = section.key === 'services'
        let stat: string | null = null
        if (section.key === 'services') stat = `${enService}`
        if (section.key === 'absence') stat = `${absencesEnAttente}`
        if (section.key === 'agenda') stat = nextAppointment ? formatUpcoming(nextAppointment.scheduled_at) : 'Aucun RDV'

        return (
          <motion.button
            key={section.key}
            type="button"
            onClick={() => onSelect(section.key)}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 26, delay: i * 0.04 }}
            whileHover={{ y: -3, scale: 1.015 }}
            whileTap={{ scale: 0.98 }}
            className={cn(
              'relative rounded-2xl p-4 flex flex-col justify-between text-left text-white cursor-pointer min-h-[110px] sm:min-h-[130px] overflow-hidden',
              big && 'col-span-2 sm:col-span-2 min-h-[150px] sm:min-h-[170px]',
            )}
            style={{ background: section.color }}
          >
            <Icon size={big ? 26 : 20} />
            <div>
              {stat && <p className={cn('font-display font-black leading-tight', big ? 'text-3xl' : 'text-sm')}>{stat}</p>}
              <p className={cn('font-semibold opacity-90', big ? 'text-sm mt-1' : 'text-xs mt-1')}>{section.label}</p>
            </div>
          </motion.button>
        )
      })}
    </div>
  )
}
