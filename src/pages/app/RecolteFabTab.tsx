import { useState } from 'react'
import { useAuth } from '@/auth/AuthContext'
import { supabase, RECOLTE_ITEMS, FABRICATION_ITEMS, STOCK_ITEM_LABELS, type StockItemKey } from '@/lib/supabase'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Field } from '@/components/ui/Field'
import { Input } from '@/components/ui/Input'
import { Select } from '@/components/ui/Select'

const LIEU = 'Morgue'

function ProductionForm({
  title,
  items,
  source,
  buttonLabel,
  delay,
}: {
  title: string
  items: StockItemKey[]
  source: 'recolte' | 'fabrication'
  buttonLabel: string
  delay?: number
}) {
  const { staff } = useAuth()
  const [objet, setObjet] = useState<StockItemKey | ''>('')
  const [quantite, setQuantite] = useState(1)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  async function handleSubmit() {
    if (!staff || !objet || submitting) return
    setSubmitting(true)
    setError(null)
    setSuccess(false)
    const { error: err } = await supabase.from('stock_movements').insert({
      staff_id: staff.id,
      item_key: objet,
      delta: quantite,
      source,
      lieu: LIEU,
    })
    setSubmitting(false)
    if (err) {
      setError(err.message)
      return
    }
    setSuccess(true)
    setObjet('')
    setQuantite(1)
  }

  return (
    <Card className="p-5" delay={delay}>
      <h2 className="text-white font-bold text-sm mb-4">{title}</h2>
      {error && <p className="text-red-300 text-xs mb-3 animate-pop-in">{error}</p>}
      {success && <p className="text-green-300 text-xs mb-3 animate-pop-in">Enregistré.</p>}
      <div className="flex flex-col gap-4 mb-4">
        <Field label="Objet">
          <Select value={objet} onChange={(e) => setObjet(e.target.value as StockItemKey)}>
            <option value="">Choisir...</option>
            {items.map((key) => (
              <option key={key} value={key}>
                {STOCK_ITEM_LABELS[key]}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Lieu">
          <Input value={LIEU} disabled />
        </Field>
        <Field label="Quantité">
          <Input type="number" min={1} value={quantite} onChange={(e) => setQuantite(Number(e.target.value))} />
        </Field>
      </div>
      <Button variant="red" className="w-full" disabled={submitting || !objet} onClick={handleSubmit}>
        {buttonLabel}
      </Button>
    </Card>
  )
}

export function RecolteFabTab() {
  return (
    <div className="flex flex-col gap-6">
      <ProductionForm title="Récolte" items={RECOLTE_ITEMS} source="recolte" buttonLabel="Valider récolte" />
      <ProductionForm title="Fabrication" items={FABRICATION_ITEMS} source="fabrication" buttonLabel="Valider fabrication" delay={0.08} />
    </div>
  )
}
