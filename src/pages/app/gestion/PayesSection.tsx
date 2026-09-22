import { useEffect, useState } from 'react'
import { supabase, type Staff, type Prestation } from '@/lib/supabase'
import { Card } from '@/components/ui/Card'
import { AnimatedList, AnimatedListItem } from '@/components/ui/AnimatedList'

const COMMISSION_RATE = 0.2

interface PayRow {
  staffId: string
  name: string
  count: number
  total: number
  commission: number
}

export function PayesSection() {
  const [rows, setRows] = useState<PayRow[]>([])

  useEffect(() => {
    Promise.all([
      supabase.from('staff').select('*'),
      supabase.from('prestations').select('*'),
    ]).then(([{ data: staffList }, { data: prestations }]) => {
      const staffById = new Map((staffList ?? []).map((s: Staff) => [s.id, s]))
      const byStaff = new Map<string, { count: number; total: number }>()
      for (const p of (prestations ?? []) as Prestation[]) {
        const entry = byStaff.get(p.staff_id) ?? { count: 0, total: 0 }
        entry.count += 1
        entry.total += p.montant
        byStaff.set(p.staff_id, entry)
      }
      const built: PayRow[] = [...byStaff.entries()]
        .map(([staffId, { count, total }]) => ({
          staffId,
          name: staffById.get(staffId)?.full_name ?? staffId,
          count,
          total,
          commission: Math.round(total * COMMISSION_RATE),
        }))
        .sort((a, b) => b.commission - a.commission)
      setRows(built)
    })
  }, [])

  const totalCommissions = rows.reduce((acc, r) => acc + r.commission, 0)

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[var(--ink)] font-bold text-sm">Gestion des payes</h2>
        <p className="text-[var(--ink)]/40 text-xs">Commission {COMMISSION_RATE * 100}% · total dû : {totalCommissions}$</p>
      </div>
      <AnimatedList className="flex flex-col gap-2">
        {rows.map((r) => (
          <AnimatedListItem key={r.staffId} className="flex items-center justify-between rounded-xl border border-[var(--ink)]/8 bg-[var(--ink)]/[0.02] px-3.5 py-2.5">
            <div>
              <p className="text-[var(--ink)] text-sm font-semibold">{r.name}</p>
              <p className="text-[var(--ink)]/40 text-xs">{r.count} prestation{r.count > 1 ? 's' : ''} · {r.total}$ facturés</p>
            </div>
            <p className="text-[var(--ink)] font-bold text-sm">{r.commission}$</p>
          </AnimatedListItem>
        ))}
        {rows.length === 0 && <p className="text-[var(--ink)]/30 text-sm text-center py-4">Aucune prestation enregistrée.</p>}
      </AnimatedList>
    </Card>
  )
}
