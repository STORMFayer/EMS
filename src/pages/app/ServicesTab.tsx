import { useCallback, useEffect, useMemo, useState } from 'react'
import { Play, Square, RefreshCw } from 'lucide-react'
import { useAuth } from '@/auth/AuthContext'
import { supabase, ROLE_LABELS, STATUS_LABELS, type Staff, type Unit, type DutyStatus } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Field } from '@/components/ui/Field'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { cn } from '@/lib/utils'

const STATUS_BADGE: Record<DutyStatus, 'green' | 'amber' | 'gray'> = {
  en_service: 'green',
  en_pause: 'amber',
  hors_service: 'gray',
}

const STATUS_ORDER: Record<DutyStatus, number> = { en_service: 0, en_pause: 1, hors_service: 2 }

function formatDuration(startIso: string, now: number) {
  const minutes = Math.max(0, Math.floor((now - new Date(startIso).getTime()) / 60000))
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return h > 0 ? `${h}h ${m}min` : `${m}min`
}

export function ServicesTab() {
  const { staff, refreshStaff } = useAuth()
  const [roster, setRoster] = useState<Staff[]>([])
  const [units, setUnits] = useState<Unit[]>([])
  const [now, setNow] = useState(Date.now())
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [newUnitName, setNewUnitName] = useState('')
  const [joinUnitId, setJoinUnitId] = useState('')
  const [sector, setSector] = useState('')
  const [statut, setStatut] = useState<DutyStatus>('en_service')

  const fetchAll = useCallback(async () => {
    const [{ data: staffData }, { data: unitData }] = await Promise.all([
      supabase.from('staff').select('*').order('full_name'),
      supabase.from('units').select('*').order('created_at', { ascending: false }),
    ])
    if (staffData) setRoster(staffData)
    if (unitData) setUnits(unitData)
  }, [])

  useEffect(() => {
    fetchAll()
    const channel = supabase
      .channel('services-tab')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'staff' }, fetchAll)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'units' }, fetchAll)
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchAll])

  useEffect(() => {
    const tick = setInterval(() => setNow(Date.now()), 30000)
    return () => clearInterval(tick)
  }, [])

  const unitsById = useMemo(() => new Map(units.map((u) => [u.id, u])), [units])

  const activeUnits = useMemo(() => units.filter((u) => roster.some((s) => s.unit_id === u.id)), [units, roster])

  const sortedRoster = useMemo(
    () => [...roster].sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status] || a.full_name.localeCompare(b.full_name)),
    [roster],
  )

  const counts = useMemo(
    () =>
      roster.reduce(
        (acc, s) => {
          acc[s.status] += 1
          return acc
        },
        { en_service: 0, en_pause: 0, hors_service: 0 } as Record<DutyStatus, number>,
      ),
    [roster],
  )

  async function handlePrendreService() {
    if (!staff || submitting) return
    setSubmitting(true)
    setError(null)
    try {
      let unitId = staff.unit_id
      let unitName = staff.unit_id ? unitsById.get(staff.unit_id)?.name ?? null : null
      let unitSector = staff.unit_id ? unitsById.get(staff.unit_id)?.sector ?? null : null

      if (newUnitName.trim()) {
        const { data, error: unitErr } = await supabase
          .from('units')
          .insert({ name: newUnitName.trim(), sector: sector.trim() || null, status: statut })
          .select()
          .single()
        if (unitErr || !data) throw new Error(unitErr?.message ?? "Création d'unité impossible")
        unitId = data.id
        unitName = data.name
        unitSector = data.sector
      } else if (joinUnitId) {
        unitId = joinUnitId
        unitName = unitsById.get(joinUnitId)?.name ?? null
        unitSector = sector.trim() || unitsById.get(joinUnitId)?.sector || null
      }

      if (!unitId) throw new Error("Choisis un nom d'unité ou une unité existante.")

      const isNewShift = !staff.shift_started_at
      const startedAt = staff.shift_started_at ?? new Date().toISOString()

      const { error: staffErr } = await supabase
        .from('staff')
        .update({ unit_id: unitId, status: statut, shift_started_at: startedAt })
        .eq('id', staff.id)
      if (staffErr) throw new Error(staffErr.message)

      if (isNewShift) {
        await supabase.from('shifts').insert({
          staff_id: staff.id,
          unit_name: unitName,
          sector: unitSector,
          status_label: statut,
          started_at: startedAt,
        })
      } else {
        await supabase
          .from('shifts')
          .update({ status_label: statut, unit_name: unitName, sector: unitSector })
          .eq('staff_id', staff.id)
          .is('ended_at', null)
      }

      setNewUnitName('')
      setJoinUnitId('')
      await Promise.all([refreshStaff(), fetchAll()])
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setSubmitting(false)
    }
  }

  async function handleFin() {
    if (!staff || submitting) return
    setSubmitting(true)
    setError(null)
    try {
      await supabase.from('staff').update({ unit_id: null, status: 'hors_service', shift_started_at: null }).eq('id', staff.id)
      await supabase.from('shifts').update({ ended_at: new Date().toISOString() }).eq('staff_id', staff.id).is('ended_at', null)
      await Promise.all([refreshStaff(), fetchAll()])
    } finally {
      setSubmitting(false)
    }
  }

  if (!staff) return null

  return (
    <div className="flex flex-col gap-6">
      <Card className="p-5 animate-fade-up">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-bold text-sm">Prise de service</h2>
          <Button variant="ghost" size="sm" onClick={fetchAll}>
            <RefreshCw size={13} /> Synchroniser
          </Button>
        </div>
        {error && <p className="text-red-300 text-xs mb-3">{error}</p>}
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <Field label="Nom d'unité (créer)">
            <Input
              placeholder="Unité Alpha"
              value={newUnitName}
              onChange={(e) => {
                setNewUnitName(e.target.value)
                if (e.target.value) setJoinUnitId('')
              }}
            />
          </Field>
          <Field label="Rejoindre une unité existante">
            <Select
              value={joinUnitId}
              onChange={(e) => {
                setJoinUnitId(e.target.value)
                if (e.target.value) setNewUnitName('')
              }}
            >
              <option value="">— unités —</option>
              {activeUnits.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <Field label="Secteur">
            <Input placeholder="Ex: Sandy Shores" value={sector} onChange={(e) => setSector(e.target.value)} />
          </Field>
          <Field label="Statut">
            <Select value={statut} onChange={(e) => setStatut(e.target.value as DutyStatus)}>
              <option value="en_service">EN SERVICE</option>
              <option value="en_pause">EN PAUSE</option>
            </Select>
          </Field>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="green" disabled={submitting} onClick={handlePrendreService} className="flex-1">
            <Play size={14} /> Prendre service
          </Button>
          <Button variant="red" disabled={submitting || staff.status === 'hors_service'} onClick={handleFin} className="flex-1">
            <Square size={14} /> Fin (si actif)
          </Button>
        </div>
      </Card>

      <div className="grid grid-cols-3 gap-3">
        <StatTile label="En service" value={counts.en_service} variant="green" />
        <StatTile label="En pause" value={counts.en_pause} variant="amber" />
        <StatTile label="Hors service" value={counts.hors_service} variant="gray" />
      </div>

      <Card className="p-5 animate-fade-up">
        <h2 className="text-white/60 text-xs uppercase tracking-[2px] font-bold mb-4">Services actifs</h2>
        <div className="flex flex-col gap-2">
          {activeUnits.map((unit) => (
            <div key={unit.id} className="rounded-xl border border-white/8 bg-white/[0.02] px-3.5 py-2.5">
              <div className="flex items-center justify-between mb-1">
                <p className="text-white text-sm font-semibold">{unit.name}</p>
                <Badge variant={STATUS_BADGE[unit.status]}>{STATUS_LABELS[unit.status]}</Badge>
              </div>
              {unit.sector && <p className="text-white/40 text-xs mb-1">Secteur : {unit.sector}</p>}
              <p className="text-white/40 text-xs">{roster.filter((s) => s.unit_id === unit.id).map((s) => s.full_name).join(', ')}</p>
            </div>
          ))}
          {activeUnits.length === 0 && <p className="text-white/30 text-sm text-center py-4">Aucun service actif.</p>}
        </div>
      </Card>

      <Card className="p-5 animate-fade-up">
        <h2 className="text-white/60 text-xs uppercase tracking-[2px] font-bold mb-4">Effectif ({roster.length})</h2>
        <div className="flex flex-col gap-2">
          {sortedRoster.map((member) => (
            <div
              key={member.id}
              className={cn(
                'flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.02] px-3.5 py-2.5',
                member.id === staff.id && 'border-red/30 bg-red/5',
              )}
            >
              {member.avatar_url ? (
                <img src={member.avatar_url} alt="" className="w-9 h-9 rounded-full border border-white/15" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-white/10 border border-white/15" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-semibold truncate">{member.full_name}</p>
                <p className="text-white/40 text-xs">
                  {ROLE_LABELS[member.role]}
                  {member.unit_id && unitsById.get(member.unit_id) ? ` · ${unitsById.get(member.unit_id)!.name}` : ''}
                </p>
              </div>
              {member.status !== 'hors_service' && member.shift_started_at && (
                <span className="text-white/30 text-xs hidden sm:block">{formatDuration(member.shift_started_at, now)}</span>
              )}
              <Badge variant={STATUS_BADGE[member.status]}>{STATUS_LABELS[member.status]}</Badge>
            </div>
          ))}
          {sortedRoster.length === 0 && <p className="text-white/30 text-sm text-center py-6">Aucun agent enregistré.</p>}
        </div>
      </Card>
    </div>
  )
}

function StatTile({ label, value, variant }: { label: string; value: number; variant: 'green' | 'amber' | 'gray' }) {
  const colors = { green: 'text-green-400', amber: 'text-amber-400', gray: 'text-white/50' }
  return (
    <Card className="p-4 text-center">
      <p className={cn('font-display font-black text-2xl', colors[variant])}>{value}</p>
      <p className="text-white/40 text-[11px] uppercase tracking-[1.5px] mt-1">{label}</p>
    </Card>
  )
}
