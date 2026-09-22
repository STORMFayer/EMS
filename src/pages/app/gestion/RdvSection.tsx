import { useCallback, useEffect, useState } from 'react'
import { Trash2 } from 'lucide-react'
import { supabase, APPOINTMENT_TYPE_LABELS, type Appointment, type Staff } from '@/lib/supabase'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { AnimatedList, AnimatedListItem } from '@/components/ui/AnimatedList'

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR') + ' ' + new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

export function RdvSection() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [staffList, setStaffList] = useState<Staff[]>([])

  const fetchAll = useCallback(async () => {
    const [{ data: a }, { data: s }] = await Promise.all([
      supabase.from('appointments').select('*').order('scheduled_at', { ascending: true }),
      supabase.from('staff').select('*'),
    ])
    if (a) setAppointments(a)
    if (s) setStaffList(s)
  }, [])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  async function handleDelete(id: number) {
    await supabase.from('appointments').delete().eq('id', id)
    await fetchAll()
  }

  const staffById = new Map(staffList.map((s) => [s.id, s]))

  return (
    <Card className="p-5">
      <h2 className="text-[var(--ink)] font-bold text-sm mb-4">Tous les rendez-vous</h2>
      <AnimatedList className="flex flex-col gap-2">
        {appointments.map((a) => (
          <AnimatedListItem key={a.id} className="flex items-center justify-between rounded-xl border border-[var(--ink)]/8 bg-[var(--ink)]/[0.02] px-3.5 py-2.5">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Badge variant="cyan">{APPOINTMENT_TYPE_LABELS[a.type]}</Badge>
                <p className="text-[var(--ink)] text-sm font-semibold">{formatDateTime(a.scheduled_at)}</p>
              </div>
              <p className="text-[var(--ink)]/40 text-xs">
                {staffById.get(a.staff_id)?.full_name ?? 'Agent'} {a.title ? `· ${a.title}` : ''}
              </p>
            </div>
            <Button size="sm" variant="ghost" onClick={() => handleDelete(a.id)}>
              <Trash2 size={13} />
            </Button>
          </AnimatedListItem>
        ))}
        {appointments.length === 0 && <p className="text-[var(--ink)]/30 text-sm text-center py-4">Aucun rendez-vous.</p>}
      </AnimatedList>
    </Card>
  )
}
