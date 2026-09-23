import { useCallback, useEffect, useState } from 'react'
import { Trash2 } from 'lucide-react'
import { supabase, type Appointment, type AppointmentTypeRow, type Staff } from '@/lib/supabase'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { AnimatedList, AnimatedListItem } from '@/components/ui/AnimatedList'

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR') + ' ' + new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

export function RdvSection() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [staffList, setStaffList] = useState<Staff[]>([])
  const [types, setTypes] = useState<AppointmentTypeRow[]>([])
  const [typeEdits, setTypeEdits] = useState<Record<string, string>>({})
  const [newTypeLabel, setNewTypeLabel] = useState('')

  const fetchAll = useCallback(async () => {
    const [{ data: a }, { data: s }, { data: t }] = await Promise.all([
      supabase.from('appointments').select('*').order('scheduled_at', { ascending: true }),
      supabase.from('staff').select('*'),
      supabase.from('appointment_types').select('*').order('position'),
    ])
    if (a) setAppointments(a)
    if (s) setStaffList(s)
    if (t) setTypes(t)
  }, [])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  async function handleDelete(id: number) {
    await supabase.from('appointments').delete().eq('id', id)
    await fetchAll()
  }

  async function saveType(id: string) {
    const label = typeEdits[id]
    if (label === undefined) return
    await supabase.from('appointment_types').update({ label }).eq('id', id)
    setTypeEdits((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
    await fetchAll()
  }

  async function deleteType(id: string) {
    await supabase.from('appointment_types').delete().eq('id', id)
    await fetchAll()
  }

  async function addType() {
    if (!newTypeLabel.trim()) return
    const id = newTypeLabel.trim().toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '')
    await supabase.from('appointment_types').insert({ id, label: newTypeLabel.trim(), position: types.length })
    setNewTypeLabel('')
    await fetchAll()
  }

  const staffById = new Map(staffList.map((s) => [s.id, s]))
  const typeLabel = (id: string) => types.find((t) => t.id === id)?.label ?? id

  return (
    <div className="flex flex-col gap-6">
      <Card className="p-5">
        <h2 className="text-[var(--ink)] font-bold text-sm mb-4">Types de rendez-vous</h2>
        <AnimatedList className="flex flex-col gap-2 mb-4">
          {types.map((t) => (
            <AnimatedListItem key={t.id} className="flex items-center gap-2 rounded-lg border border-[var(--ink)]/8 bg-[var(--ink)]/[0.02] px-3 py-2">
              <Input
                className="flex-1"
                value={typeEdits[t.id] ?? t.label}
                onChange={(e) => setTypeEdits((prev) => ({ ...prev, [t.id]: e.target.value }))}
              />
              <Button size="sm" variant="ghost" onClick={() => saveType(t.id)}>
                OK
              </Button>
              <Button size="sm" variant="ghost" onClick={() => deleteType(t.id)}>
                <Trash2 size={13} />
              </Button>
            </AnimatedListItem>
          ))}
        </AnimatedList>
        <div className="flex gap-2">
          <Input placeholder="Nouveau type (ex: Bilan annuel)" value={newTypeLabel} onChange={(e) => setNewTypeLabel(e.target.value)} />
          <Button size="sm" onClick={addType}>Ajouter</Button>
        </div>
      </Card>

      <Card className="p-5" delay={0.06}>
        <h2 className="text-[var(--ink)] font-bold text-sm mb-4">Tous les rendez-vous</h2>
        <AnimatedList className="flex flex-col gap-2">
          {appointments.map((a) => (
            <AnimatedListItem key={a.id} className="flex items-center justify-between rounded-xl border border-[var(--ink)]/8 bg-[var(--ink)]/[0.02] px-3.5 py-2.5">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="cyan">{typeLabel(a.type)}</Badge>
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
    </div>
  )
}
