import { useEffect, useState, type ReactNode } from 'react'
import { useAuth } from '@/auth/AuthContext'
import { supabase, STOCK_ITEM_LABELS, type Shift, type StockMovement } from '@/lib/supabase'
import { Card } from '@/components/ui/Card'

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleDateString('fr-FR') + ' ' + new Date(iso).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
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
      <HistorySection title="Services en cours" index={0}>
        {enCours.map((s, i) => (
          <Row key={s.id} i={i}>
            {formatDateTime(s.started_at)} → ... | {s.unit_name ?? '—'} | {s.status_label ?? ''}
          </Row>
        ))}
        {enCours.length === 0 && <Empty />}
      </HistorySection>

      <HistorySection title="Services finis" index={1}>
        {finis.map((s, i) => (
          <Row key={s.id} i={i}>
            {formatDateTime(s.started_at)} → {s.ended_at ? formatTime(s.ended_at) : '—'} | {s.unit_name ?? '—'} | {s.status_label ?? ''}
          </Row>
        ))}
        {finis.length === 0 && <Empty />}
      </HistorySection>

      <HistorySection title="Récoltes" index={2}>
        {recoltes.map((m, i) => (
          <Row key={m.id} i={i}>
            {STOCK_ITEM_LABELS[m.item_key]} | {formatDateTime(m.created_at)} x{m.delta} | {m.lieu}
          </Row>
        ))}
        {recoltes.length === 0 && <Empty />}
      </HistorySection>

      <HistorySection title="Fabrications" index={3}>
        {fabrications.map((m, i) => (
          <Row key={m.id} i={i}>
            {STOCK_ITEM_LABELS[m.item_key]} | {formatDateTime(m.created_at)} x{m.delta} | {m.lieu}
          </Row>
        ))}
        {fabrications.length === 0 && <Empty />}
      </HistorySection>

      <HistorySection title="Registre" index={4}>
        {registre.map((m, i) => (
          <Row key={m.id} i={i}>
            {formatDateTime(m.created_at)} | {m.delta > 0 ? 'Dépôt' : 'Retrait'} {STOCK_ITEM_LABELS[m.item_key]} x{Math.abs(m.delta)} | {m.lieu}
          </Row>
        ))}
        {registre.length === 0 && <Empty />}
      </HistorySection>
    </div>
  )
}

function HistorySection({ title, index, children }: { title: string; index: number; children: ReactNode }) {
  return (
    <Card className="p-5 animate-fade-up" style={{ animationDelay: `${index * 60}ms` }}>
      <h2 className="text-white font-bold text-sm mb-3">{title}</h2>
      <div className="flex flex-col gap-1">{children}</div>
    </Card>
  )
}

function Row({ i, children }: { i: number; children: ReactNode }) {
  return (
    <p className="stagger-row text-white/70 text-sm" style={{ animationDelay: `${i * 30}ms` }}>
      {children}
    </p>
  )
}

function Empty() {
  return <p className="text-white/30 text-sm">—</p>
}
