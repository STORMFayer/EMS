import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/auth/AuthContext'
import { supabase, STOCK_ITEM_LABELS, type StockItemKey, type StockRow } from '@/lib/supabase'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Field } from '@/components/ui/Field'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'
import { AnimatedNumber } from '@/components/ui/AnimatedNumber'

const ITEM_KEYS = Object.keys(STOCK_ITEM_LABELS) as StockItemKey[]

export function RegistreTab() {
  const { staff } = useAuth()
  const [action, setAction] = useState<'registre_depot' | 'registre_retrait'>('registre_depot')
  const [objet, setObjet] = useState<StockItemKey | ''>('')
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

  async function handleSubmit() {
    if (!staff || !objet || submitting) return
    setSubmitting(true)
    setError(null)
    setSuccess(false)
    const delta = action === 'registre_depot' ? quantite : -quantite
    const { error: err } = await supabase
      .from('stock_movements')
      .insert({ staff_id: staff.id, item_key: objet, delta, source: action, lieu: lieu.trim() || 'Morgue' })
    setSubmitting(false)
    if (err) {
      setError(err.message.includes('Stock insuffisant') ? 'Stock insuffisant.' : err.message)
      return
    }
    setSuccess(true)
    setObjet('')
    setQuantite(1)
    await fetchStock()
  }

  return (
    <div className="flex flex-col gap-6">
      <Card className="p-5 animate-fade-up">
        <h2 className="text-white font-bold text-sm mb-4">Registre</h2>
        {error && <p className="text-red-300 text-xs mb-3 animate-pop-in">{error}</p>}
        {success && <p className="text-green-300 text-xs mb-3 animate-pop-in">Enregistré.</p>}
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <Field label="Action">
            <Select value={action} onChange={(e) => setAction(e.target.value as typeof action)}>
              <option value="registre_depot">Dépôt</option>
              <option value="registre_retrait">Retrait</option>
            </Select>
          </Field>
          <Field label="Objet (Stock)">
            <Select value={objet} onChange={(e) => setObjet(e.target.value as StockItemKey)}>
              <option value="">Choisir...</option>
              {ITEM_KEYS.map((key) => (
                <option key={key} value={key}>
                  {STOCK_ITEM_LABELS[key]}
                </option>
              ))}
            </Select>
          </Field>
        </div>
        <div className="grid sm:grid-cols-2 gap-4 mb-4">
          <Field label="Lieu">
            <Input value={lieu} onChange={(e) => setLieu(e.target.value)} />
          </Field>
          <Field label="Quantité">
            <Input type="number" min={1} value={quantite} onChange={(e) => setQuantite(Number(e.target.value))} />
          </Field>
        </div>
        <Button variant="red" className="w-full" disabled={submitting || !objet} onClick={handleSubmit}>
          Valider
        </Button>
      </Card>

      <Card className="p-5 animate-fade-up">
        <h2 className="text-white/60 text-xs uppercase tracking-[2px] font-bold mb-4">Stock actuel</h2>
        <div className="grid sm:grid-cols-2 gap-2">
          {stock.map((row, i) => (
            <div
              key={row.item_key}
              className="stagger-row hover-lift flex items-center justify-between rounded-lg border border-white/8 bg-white/[0.02] px-3 py-2"
              style={{ animationDelay: `${i * 25}ms` }}
            >
              <span className="text-white/70 text-xs">{STOCK_ITEM_LABELS[row.item_key]}</span>
              <span className="text-white font-bold text-sm">
                <AnimatedNumber value={row.quantity} />
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}
