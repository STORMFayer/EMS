import { useEffect, useState } from 'react'
import { supabase, type Staff, type Payout } from '@/lib/supabase'
import { Card } from '@/components/ui/Card'
import { AnimatedList, AnimatedListItem } from '@/components/ui/AnimatedList'

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR') + ' ' + new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

export function ArchiveSection() {
  const [payouts, setPayouts] = useState<Payout[]>([])
  const [staffList, setStaffList] = useState<Staff[]>([])

  useEffect(() => {
    Promise.all([
      supabase.from('payouts').select('*').order('paid_at', { ascending: false }),
      supabase.from('staff').select('*'),
    ]).then(([{ data: p }, { data: s }]) => {
      if (p) setPayouts(p)
      if (s) setStaffList(s)
    })
  }, [])

  const staffById = new Map(staffList.map((s) => [s.id, s]))
  const paidById = (id: string | null) => (id ? staffById.get(id)?.full_name ?? id : '—')

  return (
    <Card className="p-5">
      <h2 className="text-[var(--ink)] font-bold text-sm mb-4">Archive des payes</h2>
      <AnimatedList className="flex flex-col gap-2">
        {payouts.map((p) => (
          <AnimatedListItem key={p.id} className="flex items-center justify-between rounded-xl border border-[var(--ink)]/8 bg-[var(--ink)]/[0.02] px-3.5 py-2.5">
            <div>
              <p className="text-[var(--ink)] text-sm font-semibold">{staffById.get(p.staff_id)?.full_name ?? p.staff_id}</p>
              <p className="text-[var(--ink)]/40 text-xs">
                {formatDateTime(p.paid_at)} · {p.services_count} service{p.services_count > 1 ? 's' : ''} · {p.prestations_count} prestation{p.prestations_count > 1 ? 's' : ''} ({p.prestations_total}$) · payé par {paidById(p.paid_by)}
              </p>
            </div>
            <p className="text-[var(--ink)] font-bold text-sm">{p.commission}$</p>
          </AnimatedListItem>
        ))}
        {payouts.length === 0 && <p className="text-[var(--ink)]/30 text-sm text-center py-4">Aucune paye archivée pour le moment.</p>}
      </AnimatedList>
    </Card>
  )
}
