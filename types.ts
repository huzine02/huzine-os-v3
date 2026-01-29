export type TaskType = 'pro' | 'saas' | 'vie' | 'annaba' | 'copro' | 'airbnb' | 'maison';
export type ViewType = 'dashboard' | 'pro' | 'saas' | 'vie' | 'patrimoine' | 'review' | 'command' | 'agenda';
export type Priority = 'H' | 'M' | 'L';

export interface Task {
  id: number;
  type: TaskType;
  text: string;
  done: boolean;
  priority: Priority;
  todayStar: boolean;
  createdAt: string;
}

export interface JournalEntry {
  time: string;
  text: string;
  date: string;
}

export interface Metrics {
  mrr: string;
  users: string;
}

export interface ReviewData {
  win: string;
  fail: string;
  priority: string;
}

export interface DailyProgress {
  pro: number;
  saas: number;
  patri: number;
  vie: number;
  lastReset: string;
}

export interface SyncConfig {
  githubToken: string;
  gistId: string;
  lastSync: string;
}

export interface AgendaEvent {
  id: number;
  title: string;
  date: string; // YYYY-MM-DD
}

export interface Settings {
  annabaDate: string;
  coproDate: string;
  crisisMode: boolean;
  sync: SyncConfig;
}

export interface Blueprint {
  phase: number;
  week: number;
  mrr: string;
  clients: string;
  principles: string;
}

export interface AppData {
  tasks: Task[];
  agenda: AgendaEvent[];
  metrics: Metrics;
  settings: Settings;
  journal: JournalEntry[];
  review: ReviewData;
  dailyProgress: DailyProgress;
  blueprint: Blueprint;
  context: string;
}

export interface DayConfig {
  name: string;
  label: string;
  theme: string;
  office: boolean;
  budgets: {
    pro: number;
    saas: number;
    patri: number;
    vie: number;
  };
}

export const AGENT_PROMPT = `
# RÔLE :
Tu es mon "Project Slicer" expert (Méthodologie GTD + Agile). Je suis Huzine, Tech Manager (Dell).

# MISSION :
Analyse le document ou texte fourni.
1. DÉCOUPE ce projet en actions concrètes (45-60 min max).
2. CLASSE-les dans les bonnes catégories.
3. GÉNÈRE UNIQUEMENT UN BLOC JSON strict.

# CATÉGORIES ("type") :
- "pro" (Dell)
- "saas" (Nutri-Track)
- "vie" (Admin/Famille)
- "annaba" (Rénov Algérie)
- "copro" (Syndic)
- "airbnb"
- "maison"

# FORMAT DE SORTIE (JSON LIST) :
[
  {"type": "annaba", "text": "Appeler archi pour plan (30)", "priority": "H"},
  {"type": "pro", "text": "Revue trimestrielle (60)", "priority": "M"}
]
`;