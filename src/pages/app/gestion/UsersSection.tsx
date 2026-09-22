import { useCallback, useEffect, useState } from 'react'
import { supabase, ROLE_LABELS, STATUS_LABELS, type Staff, type StaffRole } from '@/lib/supabase'
import { Card } from '@/components/ui/Card'
import { Select } from '@/components/ui/Select'
import { Badge } from '@/components/ui/Badge'
import { AnimatedList, AnimatedListItem } from '@/components/ui/AnimatedList'

const ROLE_KEYS = Object.keys(ROLE_LABELS) as StaffRole[]

export function UsersSection() {
  const [staffList, setStaffList] = useState<Staff[]>([])

  const fetchAll = useCallback(async () => {
    const { data } = await supabase.from('staff').select('*').order('full_name')
    if (data) setStaffList(data)
  }, [])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  async function changeRole(staffId: string, role: StaffRole) {
    await supabase.from('staff').update({ role }).eq('id', staffId)
    await fetchAll()
  }

  return (
    <Card className="p-5">
      <h2 className="text-[var(--ink)] font-bold text-sm mb-4">Utilisateurs</h2>
      <AnimatedList className="flex flex-col gap-2">
        {staffList.map((s) => (
          <AnimatedListItem key={s.id} className="flex items-center gap-3 rounded-xl border border-[var(--ink)]/8 bg-[var(--ink)]/[0.02] px-3.5 py-2.5">
            <div className="flex-1 min-w-0">
              <p className="text-[var(--ink)] text-sm font-semibold truncate">{s.full_name}</p>
              <p className="text-[var(--ink)]/40 text-xs">{s.discord_id ?? '—'}</p>
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
  )
}
