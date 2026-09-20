import { useCallback, useEffect, useState } from 'react'
import {
  supabase,
  ROLE_LABELS,
  STATUS_LABELS,
  STOCK_ITEM_LABELS,
  type Staff,
  type StaffRole,
  type Absence,
  type StockRow,
  type Unit,
  type PrestationType,
} from '@/lib/supabase'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { AnimatedList, AnimatedListItem } from '@/components/ui/AnimatedList'
import { HistoriqueTab } from './HistoriqueTab'

const ROLE_KEYS = Object.keys(ROLE_LABELS) as StaffRole[]

export function GestionTab() {
  const [staffList, setStaffList] = useState<Staff[]>([])
  const [units, setUnits] = useState<Unit[]>([])
  const [absences, setAbsences] = useState<Absence[]>([])
  const [stock, setStock] = useState<StockRow[]>([])
  const [stockEdits, setStockEdits] = useState<Record<string, number>>({})
  const [prestationTypes, setPrestationTypes] = useState<PrestationType[]>([])
  const [tarifEdits, setTarifEdits] = useState<Record<string, number>>({})
  const [newTypeId, setNewTypeId] = useState('')
  const [newTypeLabel, setNewTypeLabel] = useState('')
  const [newTypeTarif, setNewTypeTarif] = useState(0)
  const [searchStaffId, setSearchStaffId] = useState('')

  const fetchAll = useCallback(async () => {
    const [{ data: s }, { data: u }, { data: a }, { data: st }, { data: pt }] = await Promise.all([
      supabase.from('staff').select('*').order('full_name'),
      supabase.from('units').select('*'),
      supabase.from('absences').select('*').order('created_at', { ascending: false }),
      supabase.from('stock').select('*').order('item_key'),
      supabase.from('prestation_types').select('*').order('label'),
    ])
    if (s) setStaffList(s)
    if (u) setUnits(u)
    if (a) setAbsences(a)
    if (st) setStock(st)
    if (pt) setPrestationTypes(pt)
  }, [])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  async function changeRole(staffId: string, role: StaffRole) {
    await supabase.from('staff').update({ role }).eq('id', staffId)
    await fetchAll()
  }

  async function forceEnd(staffId: string) {
    await supabase.from('staff').update({ unit_id: null, status: 'hors_service', shift_started_at: null }).eq('id', staffId)
    await supabase.from('shifts').update({ ended_at: new Date().toISOString() }).eq('staff_id', staffId).is('ended_at', null)
    await fetchAll()
  }

  async function setAbsenceStatus(id: number, status: 'validee' | 'refusee') {
    await supabase.from('absences').update({ status }).eq('id', id)
    await fetchAll()
  }

  async function saveStock(itemKey: string) {
    const value = stockEdits[itemKey]
    if (value === undefined) return
    await supabase.from('stock').update({ quantity: value }).eq('item_key', itemKey)
    setStockEdits((prev) => {
      const next = { ...prev }
      delete next[itemKey]
      return next
    })
    await fetchAll()
  }

  async function saveTarif(id: string) {
    const value = tarifEdits[id]
    if (value === undefined) return
    await supabase.from('prestation_types').update({ tarif: value }).eq('id', id)
    setTarifEdits((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
    await fetchAll()
  }

  async function addPrestationType() {
    if (!newTypeId.trim() || !newTypeLabel.trim()) return
    await supabase.from('prestation_types').insert({ id: newTypeId.trim(), label: newTypeLabel.trim(), tarif: newTypeTarif })
    setNewTypeId('')
    setNewTypeLabel('')
    setNewTypeTarif(0)
    await fetchAll()
  }

  const unitsById = new Map(units.map((u) => [u.id, u]))
  const pendingAbsences = absences.filter((a) => a.status === 'en_attente')
  const activeStaff = staffList.filter((s) => s.status !== 'hors_service')

  return (
    <div className="flex flex-col gap-6">
      <Card className="p-5">
        <h2 className="text-white font-bold text-sm mb-4">Utilisateurs</h2>
        <AnimatedList className="flex flex-col gap-2">
          {staffList.map((s) => (
            <AnimatedListItem key={s.id} className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.02] px-3.5 py-2.5">
              <div className="flex-1 min-w-0">
                <p className="text-white text-sm font-semibold truncate">{s.full_name}</p>
                <p className="text-white/40 text-xs">{s.discord_id ?? '—'}</p>
              </div>
              <Select className="w-auto" value={s.role} onChange={(e) => changeRole(s.id, e.target.value as StaffRole)}>
                {ROLE_KEYS.map((r) => (
                  <option key={r} value={r}>
                    {ROLE_LABELS[r]}
                  </option>
                ))}
              </Select>
              <Badge variant={s.status === 'en_service' ? 'green' : s.status === 'en_pause' ? 'amber' : 'gray'}>
                {STATUS_LABELS[s.status]}
              </Badge>
            </AnimatedListItem>
          ))}
        </AnimatedList>
      </Card>

      <Card className="p-5" delay={0.06}>
        <h2 className="text-white font-bold text-sm mb-4">Services</h2>
        <AnimatedList className="flex flex-col gap-2">
          {activeStaff.map((s) => (
            <AnimatedListItem
              key={s.id}
              className="flex items-center justify-between rounded-xl border border-white/8 bg-white/[0.02] px-3.5 py-2.5"
            >
              <div>
                <p className="text-white text-sm font-semibold">{s.full_name}</p>
                <p className="text-white/40 text-xs">{s.unit_id ? unitsById.get(s.unit_id)?.name ?? '—' : '—'}</p>
              </div>
              <Button size="sm" variant="red" onClick={() => forceEnd(s.id)}>
                Terminer
              </Button>
            </AnimatedListItem>
          ))}
          {activeStaff.length === 0 && <p className="text-white/30 text-sm text-center py-4">Aucun service actif.</p>}
        </AnimatedList>
      </Card>

      <Card className="p-5" delay={0.12}>
        <h2 className="text-white font-bold text-sm mb-4">Absences en attente</h2>
        <AnimatedList className="flex flex-col gap-2">
          {pendingAbsences.map((a) => {
            const owner = staffList.find((s) => s.id === a.staff_id)
            return (
              <AnimatedListItem
                key={a.id}
                className="flex items-center justify-between rounded-xl border border-white/8 bg-white/[0.02] px-3.5 py-2.5"
              >
                <div>
                  <p className="text-white text-sm font-semibold">{owner?.full_name ?? a.staff_id}</p>
                  <p className="text-white/40 text-xs">
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
          {pendingAbsences.length === 0 && <p className="text-white/30 text-sm text-center py-4">Aucune absence en attente.</p>}
        </AnimatedList>
      </Card>

      <Card className="p-5" delay={0.18}>
        <h2 className="text-white font-bold text-sm mb-4">Stock</h2>
        <AnimatedList className="grid sm:grid-cols-2 gap-2">
          {stock.map((row) => (
            <AnimatedListItem key={row.item_key} className="flex items-center gap-2 rounded-lg border border-white/8 bg-white/[0.02] px-3 py-2">
              <span className="text-white/70 text-xs flex-1">{STOCK_ITEM_LABELS[row.item_key]}</span>
              <Input
                type="number"
                className="w-20"
                value={stockEdits[row.item_key] ?? row.quantity}
                onChange={(e) => setStockEdits((prev) => ({ ...prev, [row.item_key]: Number(e.target.value) }))}
              />
              <Button size="sm" variant="ghost" onClick={() => saveStock(row.item_key)}>
                OK
              </Button>
            </AnimatedListItem>
          ))}
        </AnimatedList>
      </Card>

      <Card className="p-5" delay={0.24}>
        <h2 className="text-white font-bold text-sm mb-4">Tarifs prestations</h2>
        <AnimatedList className="flex flex-col gap-2 mb-4">
          {prestationTypes.map((t) => (
            <AnimatedListItem key={t.id} className="flex items-center gap-2 rounded-lg border border-white/8 bg-white/[0.02] px-3 py-2">
              <span className="text-white/70 text-xs flex-1">{t.label}</span>
              <Input
                type="number"
                className="w-24"
                value={tarifEdits[t.id] ?? t.tarif}
                onChange={(e) => setTarifEdits((prev) => ({ ...prev, [t.id]: Number(e.target.value) }))}
              />
              <Button size="sm" variant="ghost" onClick={() => saveTarif(t.id)}>
                OK
              </Button>
            </AnimatedListItem>
          ))}
        </AnimatedList>
        <div className="grid sm:grid-cols-3 gap-2">
          <Input placeholder="id (ex: soins)" value={newTypeId} onChange={(e) => setNewTypeId(e.target.value)} />
          <Input placeholder="Libellé" value={newTypeLabel} onChange={(e) => setNewTypeLabel(e.target.value)} />
          <div className="flex gap-2">
            <Input type="number" placeholder="Tarif" value={newTypeTarif} onChange={(e) => setNewTypeTarif(Number(e.target.value))} />
            <Button size="sm" onClick={addPrestationType}>Ajouter</Button>
          </div>
        </div>
      </Card>

      <Card className="p-5" delay={0.28}>
        <h2 className="text-white font-bold text-sm mb-4">Historique par utilisateur</h2>
        <Select className="mb-4" value={searchStaffId} onChange={(e) => setSearchStaffId(e.target.value)}>
          <option value="">Choisir un agent...</option>
          {staffList.map((s) => (
            <option key={s.id} value={s.id}>
              {s.full_name}
            </option>
          ))}
        </Select>
        {searchStaffId && <HistoriqueTab staffId={searchStaffId} />}
      </Card>
    </div>
  )
}
