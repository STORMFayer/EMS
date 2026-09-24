import { useCallback, useEffect, useState } from 'react'
import { supabase, displayRoleLabel, STATUS_LABELS, type Staff, type SousGrade, type Affiliation } from '@/lib/supabase'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { AnimatedList, AnimatedListItem } from '@/components/ui/AnimatedList'

export function UsersSection() {
  const [staffList, setStaffList] = useState<Staff[]>([])
  const [sousGrades, setSousGrades] = useState<SousGrade[]>([])
  const [affiliations, setAffiliations] = useState<Affiliation[]>([])

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

  const sousGradeLabel = (id: string | null) => sousGrades.find((sg) => sg.id === id)?.label
  const affiliationLabel = (id: string | null) => affiliations.find((a) => a.id === id)?.label

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-[var(--ink)] font-bold text-sm">Utilisateurs</h2>
        <p className="text-[var(--ink)]/30 text-xs">Grade, sous-grade et affiliation lus automatiquement depuis Discord</p>
      </div>
      <AnimatedList className="flex flex-col gap-2">
        {staffList.map((s) => (
          <AnimatedListItem key={s.id} className="flex items-center gap-3 rounded-xl border border-[var(--ink)]/8 bg-[var(--ink)]/[0.02] px-3.5 py-2.5">
            <div className="flex-1 min-w-0">
              <p className="text-[var(--ink)] text-sm font-semibold truncate">{s.full_name}</p>
              <p className="text-[var(--ink)]/40 text-xs">{s.discord_id ?? '—'}</p>
            </div>
            <div className="flex flex-wrap justify-end gap-1.5">
              {displayRoleLabel(s.role) && <Badge variant="gray">{displayRoleLabel(s.role)}</Badge>}
              {sousGradeLabel(s.sous_grade_id) && <Badge variant="cyan">{sousGradeLabel(s.sous_grade_id)}</Badge>}
              {affiliationLabel(s.affiliation_id) && <Badge variant="red">{affiliationLabel(s.affiliation_id)}</Badge>}
            </div>
            <Badge variant={s.status === 'en_service' ? 'green' : s.status === 'en_pause' ? 'amber' : 'gray'}>
              {STATUS_LABELS[s.status]}
            </Badge>
          </AnimatedListItem>
        ))}
      </AnimatedList>
    </Card>
  )
}
