import { useCallback, useEffect, useState } from 'react'
import { Trash2 } from 'lucide-react'
import { supabase, type EmergencyCodeRow, type InterventionShortcut } from '@/lib/supabase'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { AnimatedList, AnimatedListItem } from '@/components/ui/AnimatedList'

export function CodesSection() {
  const [codes, setCodes] = useState<EmergencyCodeRow[]>([])
  const [codeEdits, setCodeEdits] = useState<Record<string, string>>({})
  const [shortcuts, setShortcuts] = useState<InterventionShortcut[]>([])
  const [shortcutEdits, setShortcutEdits] = useState<Record<number, string>>({})
  const [newShortcut, setNewShortcut] = useState('')

  const fetchAll = useCallback(async () => {
    const [{ data: c }, { data: s }] = await Promise.all([
      supabase.from('emergency_codes').select('*').order('position'),
      supabase.from('intervention_shortcuts').select('*').order('position'),
    ])
    if (c) setCodes(c)
    if (s) setShortcuts(s)
  }, [])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  async function saveCode(code: string) {
    const label = codeEdits[code]
    if (label === undefined) return
    await supabase.from('emergency_codes').update({ label }).eq('code', code)
    setCodeEdits((prev) => {
      const next = { ...prev }
      delete next[code]
      return next
    })
    await fetchAll()
  }

  async function saveShortcut(id: number) {
    const label = shortcutEdits[id]
    if (label === undefined) return
    await supabase.from('intervention_shortcuts').update({ label }).eq('id', id)
    setShortcutEdits((prev) => {
      const next = { ...prev }
      delete next[id]
      return next
    })
    await fetchAll()
  }

  async function deleteShortcut(id: number) {
    await supabase.from('intervention_shortcuts').delete().eq('id', id)
    await fetchAll()
  }

  async function addShortcut() {
    if (!newShortcut.trim()) return
    await supabase.from('intervention_shortcuts').insert({ label: newShortcut.trim(), position: shortcuts.length })
    setNewShortcut('')
    await fetchAll()
  }

  return (
    <div className="flex flex-col gap-6">
      <Card className="p-5">
        <h2 className="text-[var(--ink)] font-bold text-sm mb-4">Codes d'urgence</h2>
        <AnimatedList className="flex flex-col gap-2">
          {codes.map((c) => (
            <AnimatedListItem key={c.code} className="flex items-center gap-2 rounded-lg border border-[var(--ink)]/8 bg-[var(--ink)]/[0.02] px-3 py-2">
              <span className="text-[var(--ink)]/50 text-xs w-16 shrink-0">Code {c.code}</span>
              <Input
                className="flex-1"
                value={codeEdits[c.code] ?? c.label}
                onChange={(e) => setCodeEdits((prev) => ({ ...prev, [c.code]: e.target.value }))}
              />
              <Button size="sm" variant="ghost" onClick={() => saveCode(c.code)}>
                OK
              </Button>
            </AnimatedListItem>
          ))}
        </AnimatedList>
      </Card>

      <Card className="p-5" delay={0.06}>
        <h2 className="text-[var(--ink)] font-bold text-sm mb-4">Interventions rapides</h2>
        <AnimatedList className="flex flex-col gap-2 mb-4">
          {shortcuts.map((s) => (
            <AnimatedListItem key={s.id} className="flex items-center gap-2 rounded-lg border border-[var(--ink)]/8 bg-[var(--ink)]/[0.02] px-3 py-2">
              <Input
                className="flex-1"
                value={shortcutEdits[s.id] ?? s.label}
                onChange={(e) => setShortcutEdits((prev) => ({ ...prev, [s.id]: e.target.value }))}
              />
              <Button size="sm" variant="ghost" onClick={() => saveShortcut(s.id)}>
                OK
              </Button>
              <Button size="sm" variant="ghost" onClick={() => deleteShortcut(s.id)}>
                <Trash2 size={13} />
              </Button>
            </AnimatedListItem>
          ))}
          {shortcuts.length === 0 && <p className="text-[var(--ink)]/30 text-sm text-center py-4">Aucune intervention configurée.</p>}
        </AnimatedList>
        <div className="flex gap-2">
          <Input placeholder="Nouvelle intervention (ex: M.A.R.U.)" value={newShortcut} onChange={(e) => setNewShortcut(e.target.value)} />
          <Button size="sm" onClick={addShortcut}>Ajouter</Button>
        </div>
      </Card>
    </div>
  )
}
