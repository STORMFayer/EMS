import { useCallback, useEffect, useState } from 'react'
import { supabase, type Staff, type Absence } from '@/lib/supabase'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { AnimatedList, AnimatedListItem } from '@/components/ui/AnimatedList'

export function AbsencesSection() {
  const [staffList, setStaffList] = useState<Staff[]>([])
  const [absences, setAbsences] = useState<Absence[]>([])

  const fetchAll = useCallback(async () => {
    const [{ data: s }, { data: a }] = await Promise.all([
      supabase.from('staff').select('*').order('full_name'),
      supabase.from('absences').select('*').order('created_at', { ascending: false }),
    ])
    if (s) setStaffList(s)
    if (a) setAbsences(a)
  }, [])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  async function setAbsenceStatus(id: number, status: 'validee' | 'refusee') {
    await supabase.from('absences').update({ status }).eq('id', id)
    await fetchAll()
  }

  const pendingAbsences = absences.filter((a) => a.status === 'en_attente')

  return (
    <Card className="p-5">
      <h2 className="text-[var(--ink)] font-bold text-sm mb-4">Absences en attente</h2>
      <AnimatedList className="flex flex-col gap-2">
        {pendingAbsences.map((a) => {
          const owner = staffList.find((s) => s.id === a.staff_id)
          return (
            <AnimatedListItem
              key={a.id}
              className="flex items-center justify-between rounded-xl border border-[var(--ink)]/8 bg-[var(--ink)]/[0.02] px-3.5 py-2.5"
            >
              <div>
                <p className="text-[var(--ink)] text-sm font-semibold">{owner?.full_name ?? a.staff_id}</p>
                <p className="text-[var(--ink)]/40 text-xs">
                  {a.start_date} → {a.end_date} {a.motif ? `· ${a.motif}` : ''}
                </p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="green" onClick={() => setAbsenceStatus(a.id, 'validee')}>
                  Valider
                </Button>
                <Button size="sm" variant="red" onClick={() => setAbsenceStatus(a.id, 'refusee')}>
                  Refuser
                </Button>
              </div>
            </AnimatedListItem>
          )
        })}
        {pendingAbsences.length === 0 && <p className="text-[var(--ink)]/30 text-sm text-center py-4">Aucune absence en attente.</p>}
      </AnimatedList>
    </Card>
  )
}
