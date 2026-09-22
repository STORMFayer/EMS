import { useCallback, useEffect, useState } from 'react'
import { supabase, slugify, type PrestationType } from '@/lib/supabase'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { AnimatedList, AnimatedListItem } from '@/components/ui/AnimatedList'

function uniqueSlug(label: string, existing: string[]) {
  const base = slugify(label) || 'item'
  if (!existing.includes(base)) return base
  let i = 2
  while (existing.includes(`${base}_${i}`)) i++
  return `${base}_${i}`
}

export function TarifsSection() {
  const [prestationTypes, setPrestationTypes] = useState<PrestationType[]>([])
  const [tarifEdits, setTarifEdits] = useState<Record<string, number>>({})
  const [labelEdits, setLabelEdits] = useState<Record<string, string>>({})
  const [newTypeLabel, setNewTypeLabel] = useState('')
  const [newTypeTarif, setNewTypeTarif] = useState(0)

  const fetchAll = useCallback(async () => {
    const { data } = await supabase.from('prestation_types').select('*').order('label')
    if (data) setPrestationTypes(data)
  }, [])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  async function saveTarif(id: string) {
    const tarif = tarifEdits[id]
    const label = labelEdits[id]
    if (tarif === undefined && label === undefined) return
    const patch: Record<string, unknown> = {}
    if (tarif !== undefined) patch.tarif = tarif
    if (label !== undefined) patch.label = label
    await supabase.from('prestation_types').update(patch).eq('id', id)
    setTarifEdits((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
    setLabelEdits((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
    await fetchAll()
  }

  async function addPrestationType() {
    if (!newTypeLabel.trim()) return
    const id = uniqueSlug(newTypeLabel, prestationTypes.map((t) => t.id))
    await supabase.from('prestation_types').insert({ id, label: newTypeLabel.trim(), tarif: newTypeTarif })
    setNewTypeLabel('')
    setNewTypeTarif(0)
    await fetchAll()
  }

  return (
    <Card className="p-5">
      <h2 className="text-[var(--ink)] font-bold text-sm mb-4">Tarifs prestations</h2>
      <AnimatedList className="flex flex-col gap-2 mb-4">
        {prestationTypes.map((t) => (
          <AnimatedListItem key={t.id} className="flex items-center gap-2 rounded-lg border border-[var(--ink)]/8 bg-[var(--ink)]/[0.02] px-3 py-2">
            <Input
              className="flex-1"
              value={labelEdits[t.id] ?? t.label}
              onChange={(e) => setLabelEdits((prev) => ({ ...prev, [t.id]: e.target.value }))}
            />
            <Input
              type="number"
              className="w-24"
              value={tarifEdits[t.id] ?? t.tarif}
              onChange={(e) => setTarifEdits((prev) => ({ ...prev, [t.id]: Number(e.target.value) }))}
            />
            <Button size="sm" variant="ghost" onClick={() => saveTarif(t.id)}>
              OK
            </Button>
          </AnimatedListItem>
        ))}
      </AnimatedList>
      <div className="grid sm:grid-cols-2 gap-2">
        <Input placeholder="Libellé (ex: Soins)" value={newTypeLabel} onChange={(e) => setNewTypeLabel(e.target.value)} />
        <div className="flex gap-2">
          <Input type="number" placeholder="Tarif" value={newTypeTarif} onChange={(e) => setNewTypeTarif(Number(e.target.value))} />
          <Button size="sm" onClick={addPrestationType}>Ajouter</Button>
        </div>
      </div>
    </Card>
  )
}
