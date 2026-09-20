export interface OpTemplate {
  id: string
  label: string
  motif: string
  procede: string
  prescription: string
}

export const OP_TEMPLATES: OpTemplate[] = [
  {
    id: 'fusillade_retrait_balle',
    label: 'Fusillade · Retrait de balle',
    motif: 'Plaie par arme à feu',
    procede:
      "Désinfection de la zone, exploration de la plaie, extraction du(des) projectile(s), hémostase, lavage à la solution saline, suture des tissus par plans, pansement compressif.",
    prescription: 'Antalgique (Morphine 30mg), antibiothérapie large spectre, contrôle du pansement sous 48h.',
  },
  {
    id: 'fracture_pose_platre',
    label: 'Fracture · Immobilisation',
    motif: 'Traumatisme avec suspicion de fracture',
    procede:
      "Examen clinique, réduction si déplacement, immobilisation par attelle/plâtre, contrôle de la sensibilité et de la mobilité distale.",
    prescription: 'Antalgique (Percocet 5mg), repos et immobilisation stricte, contrôle à 3 semaines.',
  },
  {
    id: 'plaie_arme_blanche',
    label: 'Plaie par arme blanche',
    motif: "Plaie pénétrante par arme blanche",
    procede:
      "Désinfection, exploration de la profondeur de plaie, vérification de l'absence de lésion vasculaire/organe, suture par plans, pansement.",
    prescription: 'Antalgique standard, antibiothérapie, vaccination antitétanique à vérifier.',
  },
  {
    id: 'accident_route_polytrauma',
    label: 'Accident de la route · Polytraumatisme',
    motif: 'Polytraumatisme suite à accident de la route',
    procede:
      "Bilan lésionnel complet, immobilisation cervicale, pose de voie veineuse, remplissage vasculaire, prise en charge des lésions par ordre de priorité vitale.",
    prescription: 'Antalgique majeur (Morphine 30mg), surveillance constante, examens complémentaires si disponibles.',
  },
  {
    id: 'overdose',
    label: 'Overdose / Intoxication',
    motif: 'Suspicion de surdosage médicamenteux ou intoxication',
    procede:
      "Mise en sécurité des voies aériennes, surveillance des constantes, pose de voie veineuse, administration d'antidote si identifié, lavage gastrique si indiqué.",
    prescription: 'Surveillance rapprochée, réévaluation à 1h, orientation vers suivi si récidive.',
  },
  {
    id: 'arret_cardiaque',
    label: 'Arrêt cardio-respiratoire',
    motif: 'Arrêt cardio-respiratoire',
    procede:
      "Réanimation cardio-pulmonaire, défibrillation si rythme choquable, intubation, administration d'adrénaline selon protocole, surveillance post-réanimation.",
    prescription: 'Surveillance continue en observation, bilan cardiaque complet dès que possible.',
  },
  {
    id: 'brulure',
    label: 'Brûlure',
    motif: 'Brûlure thermique ou chimique',
    procede:
      "Refroidissement de la zone, évaluation de la surface et du degré, nettoyage, application de crème pour brûlures, pansement stérile non adhérent.",
    prescription: 'Antalgique, crème pour brûlures à renouveler quotidiennement, contrôle sous 48h.',
  },
]
