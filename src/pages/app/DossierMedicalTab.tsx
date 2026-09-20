import { useEffect, useState } from 'react'
import { ClipboardCheck, Copy } from 'lucide-react'
import { supabase, type OpTemplate } from '@/lib/supabase'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Field } from '@/components/ui/Field'
import { Input } from '@/components/ui/Input'
import { Textarea } from '@/components/ui/Textarea'
import { AnimatedList, AnimatedListItem } from '@/components/ui/AnimatedList'
import { cn } from '@/lib/utils'

export function DossierMedicalTab() {
  const [templates, setTemplates] = useState<OpTemplate[]>([])
  const [patient, setPatient] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [motif, setMotif] = useState('')
  const [procede, setProcede] = useState('')
  const [prescription, setPrescription] = useState('')
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    supabase
      .from('op_templates')
      .select('*')
      .order('label')
      .then(({ data }) => {
        if (data) setTemplates(data)
      })
  }, [])

  function applyTemplate(id: string) {
    const tpl = templates.find((t) => t.id === id)
    if (!tpl) return
    setSelectedId(id)
    setMotif(tpl.motif)
    setProcede(tpl.procede)
    setPrescription(tpl.prescription)
    setCopied(false)
  }

  const generated = [
    `Patient : ${patient || '—'}`,
    `Motif : ${motif || '—'}`,
    '',
    'Procédé :',
    procede || '—',
    '',
    'Prescription :',
    prescription || '—',
  ].join('\n')

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(generated)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <Card className="p-5">
        <h2 className="text-[var(--ink)] font-bold text-sm mb-4">Dossier médical</h2>
        <div className="mb-4">
          <Field label="Patient">
            <Input placeholder="Nom du patient" value={patient} onChange={(e) => setPatient(e.target.value)} />
          </Field>
        </div>

        <h3 className="text-[var(--ink)]/60 text-xs uppercase tracking-[2px] font-bold mb-3">Type d'opération</h3>
        <AnimatedList className="grid sm:grid-cols-2 gap-2 mb-5">
          {templates.map((tpl) => (
            <AnimatedListItem key={tpl.id}>
              <button
                type="button"
                onClick={() => applyTemplate(tpl.id)}
                className={cn(
                  'w-full text-left rounded-xl border px-3.5 py-2.5 text-sm font-semibold transition-colors cursor-pointer',
                  selectedId === tpl.id
                    ? 'border-red/50 bg-red/10 text-neon-red'
                    : 'border-[var(--ink)]/8 bg-[var(--ink)]/[0.02] text-[var(--ink)]/70 hover:bg-[var(--ink)]/[0.05] hover:text-[var(--ink)]',
                )}
              >
                {tpl.label}
              </button>
            </AnimatedListItem>
          ))}
        </AnimatedList>
        {templates.length === 0 && <p className="text-[var(--ink)]/30 text-sm text-center py-4 mb-5">Aucun type d'opération configuré. La Direction peut en ajouter depuis Gestion.</p>}

        <div className="grid gap-4 mb-4">
          <Field label="Motif">
            <Input value={motif} onChange={(e) => setMotif(e.target.value)} placeholder="Se remplit automatiquement..." />
          </Field>
          <Field label="Procédé">
            <Textarea rows={4} value={procede} onChange={(e) => setProcede(e.target.value)} placeholder="Se remplit automatiquement selon le type d'opération sélectionné..." />
          </Field>
          <Field label="Prescription">
            <Textarea rows={3} value={prescription} onChange={(e) => setPrescription(e.target.value)} placeholder="Se remplit automatiquement selon le type d'opération sélectionné..." />
          </Field>
        </div>
      </Card>

      <Card className="p-5" delay={0.1}>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[var(--ink)]/60 text-xs uppercase tracking-[2px] font-bold">Texte à coller</h2>
          <Button size="sm" variant={copied ? 'green' : 'ghost'} onClick={handleCopy}>
            {copied ? <ClipboardCheck size={13} /> : <Copy size={13} />}
            {copied ? 'Copié !' : 'Copier'}
          </Button>
        </div>
        <pre className="whitespace-pre-wrap rounded-xl border border-[var(--ink)]/8 bg-[var(--ink)]/[0.02] px-4 py-3 text-[var(--ink)]/80 text-sm font-mono leading-relaxed">
          {generated}
        </pre>
      </Card>
    </div>
  )
}
