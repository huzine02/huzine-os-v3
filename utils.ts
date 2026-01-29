import { AppData, Task, TaskType, DayConfig } from './types';

const DEFAULT_CONTEXT = `# CONTEXTE HUZINE

## SITUATION
- Tech Manager Dell (TAM), 44 ans, père de 3 enfants
- Remote maximisé, évalué trimestriellement
- Objectif : minimum effort PRO → maximum résultat

## PROJETS
- 💼 PRO (Dell) — 45% temps
- 💻 SaaS — 30% temps, objectif 15K€/an
- 🏗️ Patrimoine — 15% (Annaba + Extension)
- 🏠 Airbnb — 5%, automatisé
- 🧬 Vie — 5%, admin famille

## TYPES TÂCHES
pro, saas, annaba, extension, copro, airbnb, maison, vie`;

const DEFAULT_BLUEPRINT = `# BLUEPRINT ELITE — PRINCIPES

## MINDSET
- "Vends à 20 personnes AVANT de coder"
- "Cette feature augmente la conversion ?"
- "Manuel jusqu'à 10 clients, puis auto"
- "Vitesse > Perfection"

## PHASES
### Mois 1 — Validation
- Objectif : 10 clients + MVP
- Cible : 990€
- Focus : Landing page + Pré-vente
- Rappel : "Pas de code si pas de paiement"

### Mois 2 — Produit
- Objectif : Features + Contenu
- Cible : Onboarding auto
- Focus : Polish UI, 1 vidéo/jour
- Rappel : "Features selon feedback uniquement"

### Mois 3 — Scale
- Objectif : 50 clients = 950€ MRR
- Cible : Pipeline automatisé
- Focus : Conversion gratuit → payant
- Rappel : "Peux partir 2 semaines, SaaS tourne"`;

export const INITIAL_DATA: AppData = {
    tasks: [],
    agenda: [],
    metrics: { mrr: '0', users: '0' },
    settings: { 
        annabaDate: '', 
        coproDate: '', 
        crisisMode: false,
        sync: { githubToken: '', gistId: '', lastSync: '' }
    },
    journal: [],
    review: { win: '', fail: '', priority: '' },
    dailyProgress: { pro: 0, saas: 0, patri: 0, vie: 0, lastReset: new Date().toDateString() },
    blueprint: {
        phase: 1,
        week: 1,
        mrr: '0',
        clients: '0',
        principles: DEFAULT_BLUEPRINT
    },
    context: DEFAULT_CONTEXT
};

export const PHASE_DATA: Record<number, {name: string, objective: string, target: number, reminder: string}> = {
    1: { name: "Validation", objective: "10 clients + MVP", target: 990, reminder: "Vends AVANT de coder. Pas de feature si pas de paiement." },
    2: { name: "Produit", objective: "Features + Contenu", target: 500, reminder: "Features selon feedback uniquement. Polish UI." },
    3: { name: "Scale", objective: "50 clients", target: 950, reminder: "Focus conversion. Pipeline automatisé." }
};

export const DAY_CONFIGS: Record<number, DayConfig> = {
    1: { name: 'Lundi', label: '🚀 LAUNCH', theme: '#7C3AED', office: false, budgets: { pro: 1, saas: 0, patri: 4, vie: 1 } },
    2: { name: 'Mardi', label: '🎭 THEATRE', theme: '#2563EB', office: true, budgets: { pro: 4, saas: 0, patri: 3, vie: 0 } },
    3: { name: 'Mercredi', label: '📞 PIVOT', theme: '#DB2777', office: false, budgets: { pro: 1, saas: 0, patri: 1, vie: 3 } },
    4: { name: 'Jeudi', label: '💻 TECH', theme: '#0D9F6E', office: true, budgets: { pro: 4, saas: 3, patri: 0, vie: 0 } },
    5: { name: 'Vendredi', label: '📊 CLOSING', theme: '#2563EB', office: false, budgets: { pro: 3, saas: 0, patri: 0, vie: 1 } },
    6: { name: 'Samedi', label: '🧘‍♂️ OFF', theme: '#64748B', office: false, budgets: { pro: 0, saas: 0, patri: 0, vie: 0 } },
    0: { name: 'Dimanche', label: '🧘‍♂️ OFF', theme: '#64748B', office: false, budgets: { pro: 0, saas: 0, patri: 0, vie: 0 } }
};

export const getTaskDuration = (text: string): number => {
    const match = text.match(/\((\d+)\)/);
    if (match && match[1]) {
        return parseInt(match[1], 10) / 60;
    }
    return 0.5; // Default 30 min
};

export const getPillarKey = (type: TaskType): keyof Omit<AppData['dailyProgress'], 'lastReset'> => {
    if (['annaba', 'copro', 'airbnb', 'maison'].includes(type)) return 'patri';
    return type as keyof Omit<AppData['dailyProgress'], 'lastReset'>;
};

export const getThemeColor = (type: TaskType | string) => {
    switch(type) {
        case 'pro': return 'text-pro';
        case 'saas': return 'text-saas';
        case 'vie': return 'text-vie';
        case 'patri':
        case 'annaba':
        case 'copro':
        case 'airbnb':
        case 'maison': return 'text-patri';
        default: return 'text-slate-400';
    }
};

export const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Bon matin';
    if (h < 18) return 'Bon après-midi';
    return 'Bonne soirée';
};