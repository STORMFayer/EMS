import { ROLE_LABELS, type StaffRole, type SousGrade, type Affiliation } from '@/lib/supabase'
import { Select } from '@/components/ui/Select'
import { Field } from '@/components/ui/Field'

const ROLE_KEYS = Object.keys(ROLE_LABELS) as StaffRole[]

export interface Eligibility {
  grade: StaffRole | ''
  sous_grade_id: string
  affiliation_id: string
}

export function EligibilitySelector({
  value,
  onChange,
  sousGrades,
  affiliations,
}: {
  value: Eligibility
  onChange: (next: Eligibility) => void
  sousGrades: SousGrade[]
  affiliations: Affiliation[]
}) {
  const availableAffiliations = affiliations.filter((a) => !a.sous_grade_id || a.sous_grade_id === value.sous_grade_id)

  return (
    <div className="grid sm:grid-cols-3 gap-3">
      <Field label="Grade (optionnel)">
        <Select value={value.grade} onChange={(e) => onChange({ ...value, grade: e.target.value as StaffRole | '' })}>
          <option value="">— tous —</option>
          {ROLE_KEYS.map((r) => (
            <option key={r} value={r}>
              {ROLE_LABELS[r]}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Sous-grade (optionnel)">
        <Select
          value={value.sous_grade_id}
          onChange={(e) => onChange({ ...value, sous_grade_id: e.target.value, affiliation_id: '' })}
        >
          <option value="">— tous —</option>
          {sousGrades.map((sg) => (
            <option key={sg.id} value={sg.id}>
              {sg.label}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Affiliation (optionnel)">
        <Select value={value.affiliation_id} onChange={(e) => onChange({ ...value, affiliation_id: e.target.value })}>
          <option value="">— toutes —</option>
          {availableAffiliations.map((a) => (
            <option key={a.id} value={a.id}>
              {a.label}
            </option>
          ))}
        </Select>
      </Field>
    </div>
  )
}
