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
} from '@/lib/supabase'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { Input } from '@/components/ui/Input'
import { Badge } from '@/components/ui/Badge'
import { HistoriqueTab } from './HistoriqueTab'

const ROLE_KEYS = Object.keys(ROLE_LABELS) as StaffRole[]

export function GestionTab() {
  const [staffList, setStaffList] = useState<Staff[]>([])
  const [units, setUnits] = useState<Unit[]>([])
  const [absences, setAbsences] = useState<Absence[]>([])
  const [stock, setStock] = useState<StockRow[]>([])
  const [stockEdits, setStockEdits] = useState<Record<string, number>>({})
  const [searchStaffId, setSearchStaffId] = useState('')

  const fetchAll = useCallback(async () => {
    const [{ data: s }, { data: u }, { data: a }, { data: st }] = await Promise.all([
      supabase.from('staff').select('*').order('full_name'),
      supabase.from('units').select('*'),
      supabase.from('absences').select('*').order('created_at', { ascending: false }),
      supabase.from('stock').select('*').order('item_key'),
    ])
    if (s) setStaffList(s)
    if (u) setUnits(u)
    if (a) setAbsences(a)
    if (st) setStock(st)
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

  const unitsById = new Map(units.map((u) => [u.id, u]))
  const pendingAbsences = absences.filter((a) => a.status === 'en_attente')
  const activeStaff = staffList.filter((s) => s.status !== 'hors_service')

  return (
    <div className="flex flex-col gap-6">
      <Card className="p-5 animate-fade-up">
        <h2 className="text-white font-bold text-sm mb-4">Utilisateurs</h2>
        <div className="flex flex-col gap-2">
          {staffList.map((s) => (
            <div key={s.id} className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.02] px-3.5 py-2.5">
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
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-5 animate-fade-up">
        <h2 className="text-white font-bold text-sm mb-4">Services</h2>
        <div className="flex flex-col gap-2">
          {activeStaff.map((s) => (
            <div key={s.id} className="flex items-center justify-between rounded-xl border border-white/8 bg-white/[0.02] px-3.5 py-2.5">
              <div>
                <p className="text-white text-sm font-semibold">{s.full_name}</p>
                <p className="text-white/40 text-xs">{s.unit_id ? unitsById.get(s.unit_id)?.name ?? '—' : '—'}</p>
              </div>
              <Button size="sm" variant="red" onClick={() => forceEnd(s.id)}>
                Terminer
              </Button>
            </div>
          ))}
          {activeStaff.length === 0 && <p className="text-white/30 text-sm text-center py-4">Aucun service actif.</p>}
        </div>
      </Card>

      <Card className="p-5 animate-fade-up">
        <h2 className="text-white font-bold text-sm mb-4">Absences en attente</h2>
        <div className="flex flex-col gap-2">
          {pendingAbsences.map((a) => {
            const owner = staffList.find((s) => s.id === a.staff_id)
            return (
              <div key={a.id} className="flex items-center justify-between rounded-xl border border-white/8 bg-white/[0.02] px-3.5 py-2.5">
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
              </div>
            )
          })}
          {pendingAbsences.length === 0 && <p className="text-white/30 text-sm text-center py-4">Aucune absence en attente.</p>}
        </div>
      </Card>

      <Card className="p-5 animate-fade-up">
        <h2 className="text-white font-bold text-sm mb-4">Stock</h2>
        <div className="grid sm:grid-cols-2 gap-2">
          {stock.map((row) => (
            <div key={row.item_key} className="flex items-center gap-2 rounded-lg border border-white/8 bg-white/[0.02] px-3 py-2">
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
            </div>
          ))}
        </div>
      </Card>

      <Card className="p-5 animate-fade-up">
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
