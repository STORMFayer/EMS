import { useCallback, useEffect, useMemo, useState } from 'react'
import { LogOut, Siren, Pause, Play, Square } from 'lucide-react'
import { useAuth } from '@/auth/AuthContext'
import { supabase, ROLE_LABELS, STATUS_LABELS, type Staff, type DutyStatus } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'

const STATUS_BADGE: Record<DutyStatus, 'green' | 'amber' | 'gray'> = {
  en_service: 'green',
  en_pause: 'amber',
  hors_service: 'gray',
}

const STATUS_ORDER: Record<DutyStatus, number> = {
  en_service: 0,
  en_pause: 1,
  hors_service: 2,
}

function formatDuration(startIso: string, now: number) {
  const minutes = Math.max(0, Math.floor((now - new Date(startIso).getTime()) / 60000))
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return h > 0 ? `${h}h ${m}min` : `${m}min`
}

export function Dashboard() {
  const { staff, signOut, refreshStaff } = useAuth()
  const [roster, setRoster] = useState<Staff[]>([])
  const [now, setNow] = useState(Date.now())
  const [updating, setUpdating] = useState(false)

  const fetchRoster = useCallback(async () => {
    const { data } = await supabase.from('staff').select('*').order('full_name')
    if (data) setRoster(data)
  }, [])

  useEffect(() => {
    fetchRoster()

    const channel = supabase
      .channel('staff-roster')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'staff' }, () => {
        fetchRoster()
      })
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchRoster])

  useEffect(() => {
    const tick = setInterval(() => setNow(Date.now()), 30000)
    return () => clearInterval(tick)
  }, [])

  const sortedRoster = useMemo(
    () => [...roster].sort((a, b) => STATUS_ORDER[a.status] - STATUS_ORDER[b.status] || a.full_name.localeCompare(b.full_name)),
    [roster],
  )

  const counts = useMemo(() => {
    return roster.reduce(
      (acc, s) => {
        acc[s.status] += 1
        return acc
      },
      { en_service: 0, en_pause: 0, hors_service: 0 } as Record<DutyStatus, number>,
    )
  }, [roster])

  async function updateStatus(newStatus: DutyStatus) {
    if (!staff || updating) return
    setUpdating(true)
    const patch: Partial<Staff> =
      newStatus === 'hors_service'
        ? { status: newStatus, shift_started_at: null }
        : { status: newStatus, shift_started_at: staff.shift_started_at ?? new Date().toISOString() }

    await supabase.from('staff').update(patch).eq('id', staff.id)
    await refreshStaff()
    setUpdating(false)
  }

  if (!staff) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#090d14]">
        <span className="w-8 h-8 border-2 border-white/20 border-t-red rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#090d14] px-4 py-6 sm:px-8 sm:py-10">
      <div className="max-w-5xl mx-auto flex flex-col gap-6">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red/15 border border-red/30 flex items-center justify-center">
              <Siren size={18} className="text-red-light" />
            </div>
            <div>
              <h1 className="font-display font-black text-lg text-white leading-tight">EMS Dashboard</h1>
              <p className="text-white/40 text-xs">Effectif de service</p>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={signOut}>
            <LogOut size={14} /> Déconnexion
          </Button>
        </header>

        <Card className="p-5 flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-6 animate-fade-up">
          <div className="flex items-center gap-3 flex-1">
            {staff.avatar_url ? (
              <img src={staff.avatar_url} alt="" className="w-12 h-12 rounded-full border border-white/15" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-white/10 border border-white/15" />
            )}
            <div>
              <p className="text-white font-bold text-sm">{staff.full_name}</p>
              <p className="text-white/40 text-xs">{ROLE_LABELS[staff.role]}</p>
            </div>
            <Badge variant={STATUS_BADGE[staff.status]} className="ml-2">
              {staff.status === 'en_service' && <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-status-pulse" />}
              {STATUS_LABELS[staff.status]}
            </Badge>
            {staff.status !== 'hors_service' && staff.shift_started_at && (
              <span className="text-white/40 text-xs">{formatDuration(staff.shift_started_at, now)}</span>
            )}
          </div>

          <div className="flex gap-2">
            {staff.status !== 'en_service' && (
              <Button size="sm" variant="green" disabled={updating} onClick={() => updateStatus('en_service')}>
                <Play size={13} /> Prendre son service
              </Button>
            )}
            {staff.status === 'en_service' && (
              <Button size="sm" variant="ghost" disabled={updating} onClick={() => updateStatus('en_pause')}>
                <Pause size={13} /> Pause
              </Button>
            )}
            {staff.status !== 'hors_service' && (
              <Button size="sm" variant="red" disabled={updating} onClick={() => updateStatus('hors_service')}>
                <Square size={13} /> Terminer
              </Button>
            )}
          </div>
        </Card>

        <div className="grid grid-cols-3 gap-3">
          <StatTile label="En service" value={counts.en_service} variant="green" />
          <StatTile label="En pause" value={counts.en_pause} variant="amber" />
          <StatTile label="Hors service" value={counts.hors_service} variant="gray" />
        </div>

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
                  <p className="text-white/40 text-xs">{ROLE_LABELS[member.role]}</p>
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
    </div>
  )
}

function StatTile({ label, value, variant }: { label: string; value: number; variant: 'green' | 'amber' | 'gray' }) {
  const colors = {
    green: 'text-green-400',
    amber: 'text-amber-400',
    gray: 'text-white/50',
  }
  return (
    <Card className="p-4 text-center">
      <p className={cn('font-display font-black text-2xl', colors[variant])}>{value}</p>
      <p className="text-white/40 text-[11px] uppercase tracking-[1.5px] mt-1">{label}</p>
    </Card>
  )
}
