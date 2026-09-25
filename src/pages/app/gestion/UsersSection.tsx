import { useCallback, useEffect, useState } from 'react'
import { supabase, displayRoleLabel, STATUS_LABELS, type Staff, type SousGrade, type Affiliation } from '@/lib/supabase'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { Select } from '@/components/ui/Select'
import { AnimatedList, AnimatedListItem } from '@/components/ui/AnimatedList'

export function UsersSection() {
  const [staffList, setStaffList] = useState<Staff[]>([])
  const [sousGrades, setSousGrades] = useState<SousGrade[]>([])
  const [affiliations, setAffiliations] = useState<Affiliation[]>([])
  const [sgEdits, setSgEdits] = useState<Record<string, string>>({})
  const [affEdits, setAffEdits] = useState<Record<string, string>>({})

  const fetchAll = useCallback(async () => {
    const [{ data: s }, { data: sg }, { data: aff }] = await Promise.all([
      supabase.from('staff').select('*').neq('role', 'membre').order('full_name'),
      supabase.from('sous_grades').select('*').order('position'),
      supabase.from('affiliations').select('*').order('position'),
    ])
    if (s) setStaffList(s)
    if (sg) setSousGrades(sg)
    if (aff) setAffiliations(aff)
  }, [])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  function sgValue(s: Staff) {
    return sgEdits[s.id] ?? s.sous_grade_id ?? ''
  }
  function affValue(s: Staff) {
    return affEdits[s.id] ?? s.affiliation_id ?? ''
  }
  function availableAffiliations(s: Staff) {
    const sg = sgValue(s)
    return affiliations.filter((a) => !a.sous_grade_id || a.sous_grade_id === sg)
  }

  async function saveGrades(id: string) {
    const sg = sgEdits[id]
    const aff = affEdits[id]
    const patch: Record<string, unknown> = {}
    if (sg !== undefined) patch.sous_grade_id = sg || null
    if (aff !== undefined) patch.affiliation_id = aff || null
    if (Object.keys(patch).length === 0) return
    await supabase.from('staff').update(patch).eq('id', id)
    setSgEdits((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
    setAffEdits((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
    await fetchAll()
  }

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[var(--ink)] font-bold text-sm">Utilisateurs</h2>
        <p className="text-[var(--ink)]/30 text-xs">Grade lu automatiquement depuis Discord · sous-grade et affiliation à définir manuellement</p>
      </div>
      <AnimatedList className="flex flex-col gap-2">
        {staffList.map((s) => (
          <AnimatedListItem key={s.id} className="rounded-xl border border-[var(--ink)]/8 bg-[var(--ink)]/[0.02] px-3.5 py-2.5 flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-[var(--ink)] text-sm font-semibold truncate">{s.full_name}</p>
                <p className="text-[var(--ink)]/40 text-xs">{s.discord_id ?? '—'}</p>
              </div>
              {displayRoleLabel(s.role) && <Badge variant="gray">{displayRoleLabel(s.role)}</Badge>}
              <Badge variant={s.status === 'en_service' ? 'green' : s.status === 'en_pause' ? 'amber' : 'gray'}>
                {STATUS_LABELS[s.status]}
              </Badge>
            </div>
            <div className="grid sm:grid-cols-[1fr_1fr_auto] gap-2">
              <Select
                value={sgValue(s)}
                onChange={(e) => {
                  setSgEdits((prev) => ({ ...prev, [s.id]: e.target.value }))
                  setAffEdits((prev) => ({ ...prev, [s.id]: '' }))
                }}
              >
                <option value="">— Sous-grade —</option>
                {sousGrades.map((sg) => (
                  <option key={sg.id} value={sg.id}>
                    {sg.label}
                  </option>
                ))}
              </Select>
              <Select value={affValue(s)} onChange={(e) => setAffEdits((prev) => ({ ...prev, [s.id]: e.target.value }))}>
                <option value="">— Affiliation —</option>
                {availableAffiliations(s).map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.label}
                  </option>
                ))}
              </Select>
              <Button size="sm" variant="ghost" onClick={() => saveGrades(s.id)}>
                OK
              </Button>
            </div>
          </AnimatedListItem>
        ))}
      </AnimatedList>
    </Card>
  )
}
