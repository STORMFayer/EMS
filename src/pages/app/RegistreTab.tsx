import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/auth/AuthContext'
import { supabase, STOCK_ITEM_LABELS, type StockItemKey, type StockRow } from '@/lib/supabase'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Field } from '@/components/ui/Field'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { AnimatedNumber } from '@/components/ui/AnimatedNumber'
import { AnimatedList, AnimatedListItem } from '@/components/ui/AnimatedList'
import { cn } from '@/lib/utils'

const ITEM_KEYS = Object.keys(STOCK_ITEM_LABELS) as StockItemKey[]

export function RegistreTab() {
  const { staff } = useAuth()
  const [action, setAction] = useState<'registre_depot' | 'registre_retrait'>('registre_depot')
  const [selected, setSelected] = useState<Set<StockItemKey>>(new Set())
  const [lieu, setLieu] = useState('Morgue')
  const [quantite, setQuantite] = useState(1)
  const [stock, setStock] = useState<StockRow[]>([])
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const fetchStock = useCallback(async () => {
    const { data } = await supabase.from('stock').select('*').order('item_key')
    if (data) setStock(data)
  }, [])

  useEffect(() => {
    fetchStock()
    const channel = supabase
      .channel('registre-stock')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'stock' }, fetchStock)
      .subscribe()
    return () => {
      supabase.removeChannel(channel)
    }
  }, [fetchStock])

  function toggleItem(key: StockItemKey) {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }

  async function handleSubmit() {
    if (!staff || selected.size === 0 || submitting) return
    setSubmitting(true)
    setError(null)
    setSuccess(false)
    const delta = action === 'registre_depot' ? quantite : -quantite
    const rows = [...selected].map((item_key) => ({
      staff_id: staff.id,
      item_key,
      delta,
      source: action,
      lieu: lieu.trim() || 'Morgue',
    }))
    const { error: err } = await supabase.from('stock_movements').insert(rows)
    setSubmitting(false)
    if (err) {
      setError(err.message.includes('Stock insuffisant') ? 'Stock insuffisant pour un des objets sélectionnés.' : err.message)
      return
    }
    setSuccess(true)
    setSelected(new Set())
    setQuantite(1)
    await fetchStock()
  }

  return (
    <div className="flex flex-col gap-6">
      <Card className="p-5">
        <h2 className="text-[var(--ink)] font-bold text-sm mb-4">Registre</h2>
        {error && <p className="text-red-300 text-xs mb-3 animate-pop-in">{error}</p>}
        {success && <p className="text-green-300 text-xs mb-3 animate-pop-in">Enregistré.</p>}
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <Field label="Action">
            <Select value={action} onChange={(e) => setAction(e.target.value as typeof action)}>
              <option value="registre_depot">Dépôt</option>
              <option value="registre_retrait">Retrait</option>
            </Select>
          </Field>
          <Field label="Lieu">
            <Input value={lieu} onChange={(e) => setLieu(e.target.value)} />
          </Field>
        </div>
        <div className="mb-4">
          <Field label="Quantité (par objet)">
            <Input type="number" min={1} value={quantite} onChange={(e) => setQuantite(Number(e.target.value))} />
          </Field>
        </div>

        <h3 className="text-[var(--ink)]/40 text-xs uppercase tracking-[1.5px] font-semibold mb-2">Objets (sélection multiple)</h3>
        <AnimatedList className="grid sm:grid-cols-2 gap-2 mb-4">
          {ITEM_KEYS.map((key) => {
            const active = selected.has(key)
            return (
              <AnimatedListItem key={key}>
                <button
                  type="button"
                  onClick={() => toggleItem(key)}
                  className={cn(
                    'w-full text-left rounded-lg border px-3 py-2 text-sm transition-colors cursor-pointer',
                    active
                      ? 'border-red/50 bg-red/10 text-neon-red font-semibold'
                      : 'border-[var(--ink)]/8 bg-[var(--ink)]/[0.02] text-[var(--ink)]/70 hover:bg-[var(--ink)]/[0.05] hover:text-[var(--ink)]',
                  )}
                >
                  {STOCK_ITEM_LABELS[key]}
                </button>
              </AnimatedListItem>
            )
          })}
        </AnimatedList>

        <Button variant="red" className="w-full" disabled={submitting || selected.size === 0} onClick={handleSubmit}>
          Valider {selected.size > 0 ? `(${selected.size} objet${selected.size > 1 ? 's' : ''})` : ''}
        </Button>
      </Card>

      <Card className="p-5" delay={0.1}>
        <h2 className="text-[var(--ink)]/60 text-xs uppercase tracking-[2px] font-bold mb-4">Stock actuel</h2>
        <AnimatedList className="grid sm:grid-cols-2 gap-2">
          {stock.map((row) => (
            <AnimatedListItem
              key={row.item_key}
              className="flex items-center justify-between rounded-lg border border-[var(--ink)]/8 bg-[var(--ink)]/[0.02] px-3 py-2"
            >
              <span className="text-[var(--ink)]/70 text-xs">{STOCK_ITEM_LABELS[row.item_key]}</span>
              <span className="text-[var(--ink)] font-bold text-sm">
                <AnimatedNumber value={row.quantity} />
              </span>
            </AnimatedListItem>
          ))}
        </AnimatedList>
      </Card>
    </div>
  )
}
