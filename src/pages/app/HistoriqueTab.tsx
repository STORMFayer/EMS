import { useEffect, useState, type ReactNode } from 'react'
import { useAuth } from '@/auth/AuthContext'
import { supabase, STOCK_ITEM_LABELS, type Shift, type StockMovement } from '@/lib/supabase'
import { Card } from '@/components/ui/Card'

function formatDateTime(iso: string) {
  const d = new Date(iso)
  return d.toLocaleDateString('fr-FR') + ' ' + d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
}

export function HistoriqueTab({ staffId }: { staffId?: string }) {
  const { staff } = useAuth()
  const targetId = staffId ?? staff?.id
  const [shifts, setShifts] = useState<Shift[]>([])
  const [movements, setMovements] = useState<StockMovement[]>([])

  useEffect(() => {
    if (!targetId) return
    supabase
      .from('shifts')
      .select('*')
      .eq('staff_id', targetId)
      .order('started_at', { ascending: false })
      .limit(30)
      .then(({ data }) => {
        if (data) setShifts(data)
      })
    supabase
      .from('stock_movements')
      .select('*')
      .eq('staff_id', targetId)
      .order('created_at', { ascending: false })
      .limit(50)
      .then(({ data }) => {
        if (data) setMovements(data)
      })
  }, [targetId])

  const enCours = shifts.filter((s) => !s.ended_at)
  const finis = shifts.filter((s) => s.ended_at)
  const recoltes = movements.filter((m) => m.source === 'recolte')
  const fabrications = movements.filter((m) => m.source === 'fabrication')
  const registre = movements.filter((m) => m.source === 'registre_depot' || m.source === 'registre_retrait')

  return (
    <div className="flex flex-col gap-4">
      <HistorySection title="Services en cours">
        {enCours.map((s) => (
          <p key={s.id} className="text-white/70 text-sm">
            {formatDateTime(s.started_at)} → ... | {s.unit_name ?? '—'} | {s.status_label ?? ''}
          </p>
        ))}
        {enCours.length === 0 && <Empty />}
      </HistorySection>

      <HistorySection title="Services finis">
        {finis.map((s) => (
          <p key={s.id} className="text-white/70 text-sm">
            {formatDateTime(s.started_at)} → {s.ended_at ? formatTime(s.ended_at) : '—'} | {s.unit_name ?? '—'} | {s.status_label ?? ''}
          </p>
        ))}
        {finis.length === 0 && <Empty />}
      </HistorySection>

      <HistorySection title="Récoltes">
        {recoltes.map((m) => (
          <p key={m.id} className="text-white/70 text-sm">
            {STOCK_ITEM_LABELS[m.item_key]} | {formatDateTime(m.created_at)} x{m.delta} | {m.lieu}
          </p>
        ))}
        {recoltes.length === 0 && <Empty />}
      </HistorySection>

      <HistorySection title="Fabrications">
        {fabrications.map((m) => (
          <p key={m.id} className="text-white/70 text-sm">
            {STOCK_ITEM_LABELS[m.item_key]} | {formatDateTime(m.created_at)} x{m.delta} | {m.lieu}
          </p>
        ))}
        {fabrications.length === 0 && <Empty />}
      </HistorySection>

      <HistorySection title="Registre">
        {registre.map((m) => (
          <p key={m.id} className="text-white/70 text-sm">
            {formatDateTime(m.created_at)} | {m.delta > 0 ? 'Dépôt' : 'Retrait'} {STOCK_ITEM_LABELS[m.item_key]} x{Math.abs(m.delta)} | {m.lieu}
          </p>
        ))}
        {registre.length === 0 && <Empty />}
      </HistorySection>
    </div>
  )
}

function HistorySection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card className="p-5 animate-fade-up">
      <h2 className="text-white font-bold text-sm mb-3">{title}</h2>
      <div className="flex flex-col gap-1">{children}</div>
    </Card>
  )
}

function Empty() {
  return <p className="text-white/30 text-sm">—</p>
}
