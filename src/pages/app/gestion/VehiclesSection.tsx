import { useEffect, useState } from 'react'
import { Trash2 } from 'lucide-react'
import { supabase, ROLE_LABELS, type Vehicle, type SousGrade, type Affiliation } from '@/lib/supabase'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { EligibilitySelector, type Eligibility } from '@/components/ui/EligibilitySelector'
import { AnimatedList, AnimatedListItem } from '@/components/ui/AnimatedList'

const EMPTY: Eligibility = { grade: '', sous_grade_id: '', affiliation_id: '' }

export function VehiclesSection() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [sousGrades, setSousGrades] = useState<SousGrade[]>([])
  const [affiliations, setAffiliations] = useState<Affiliation[]>([])
  const [newName, setNewName] = useState('')
  const [newElig, setNewElig] = useState<Eligibility>(EMPTY)

  const fetchAll = () => {
    Promise.all([
      supabase.from('vehicles').select('*').order('name'),
      supabase.from('sous_grades').select('*').order('position'),
      supabase.from('affiliations').select('*').order('position'),
    ]).then(([{ data: v }, { data: sg }, { data: aff }]) => {
      if (v) setVehicles(v)
      if (sg) setSousGrades(sg)
      if (aff) setAffiliations(aff)
    })
  }

  useEffect(fetchAll, [])

  async function addVehicle() {
    if (!newName.trim()) return
    await supabase.from('vehicles').insert({
      name: newName.trim(),
      grade: newElig.grade || null,
      sous_grade_id: newElig.sous_grade_id || null,
      affiliation_id: newElig.affiliation_id || null,
    })
    setNewName('')
    setNewElig(EMPTY)
    fetchAll()
  }

  async function deleteVehicle(id: number) {
    await supabase.from('vehicles').delete().eq('id', id)
    fetchAll()
  }

  const sousGradeLabel = (id: string | null) => sousGrades.find((sg) => sg.id === id)?.label
  const affiliationLabel = (id: string | null) => affiliations.find((a) => a.id === id)?.label

  return (
    <Card className="p-5">
      <h2 className="text-[var(--ink)] font-bold text-sm mb-4">Véhicules</h2>
      <AnimatedList className="flex flex-col gap-2 mb-4">
        {vehicles.map((v) => (
          <AnimatedListItem key={v.id} className="flex items-center justify-between rounded-xl border border-[var(--ink)]/8 bg-[var(--ink)]/[0.02] px-3.5 py-2.5">
            <div>
              <p className="text-[var(--ink)] text-sm font-semibold">{v.name}</p>
              <p className="text-[var(--ink)]/40 text-xs">
                {v.grade ? ROLE_LABELS[v.grade] : null}
                {v.grade && (sousGradeLabel(v.sous_grade_id) || affiliationLabel(v.affiliation_id)) ? ' · ' : ''}
                {sousGradeLabel(v.sous_grade_id)}
                {sousGradeLabel(v.sous_grade_id) && affiliationLabel(v.affiliation_id) ? ' · ' : ''}
                {affiliationLabel(v.affiliation_id)}
                {!v.grade && !v.sous_grade_id && !v.affiliation_id ? 'Accessible à tous' : ''}
              </p>
            </div>
            <Button size="sm" variant="ghost" onClick={() => deleteVehicle(v.id)}>
              <Trash2 size={13} />
            </Button>
          </AnimatedListItem>
        ))}
        {vehicles.length === 0 && <p className="text-[var(--ink)]/30 text-sm text-center py-4">Aucun véhicule.</p>}
      </AnimatedList>

      <div className="rounded-lg border border-[var(--ink)]/8 bg-[var(--ink)]/[0.02] p-3 flex flex-col gap-3">
        <p className="text-[var(--ink)]/40 text-xs uppercase tracking-[1.5px] font-semibold">Nouveau véhicule</p>
        <Input placeholder="Nom (ex: VAPID JIY715)" value={newName} onChange={(e) => setNewName(e.target.value)} />
        <EligibilitySelector value={newElig} onChange={setNewElig} sousGrades={sousGrades} affiliations={affiliations} />
        <Button size="sm" onClick={addVehicle}>Ajouter</Button>
      </div>
    </Card>
  )
}
