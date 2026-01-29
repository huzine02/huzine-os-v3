import { AppData, Task } from '../types';
import { PHASE_DATA } from '../utils';

export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';

async function callClaude(apiKey: string, systemPrompt: string, messages: any[]) {
    if (!apiKey) throw new Error("Clé API manquante");

    const response = await fetch(CLAUDE_API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': apiKey,
            'anthropic-version': '2023-06-01',
            'anthropic-dangerous-direct-browser-access': 'true'
        },
        body: JSON.stringify({
            model: 'claude-3-5-sonnet-20240620', // Utilisation de Sonnet 3.5 pour la vitesse/intelligence
            max_tokens: 2048,
            system: systemPrompt,
            messages: messages
        })
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error?.message || 'Erreur API Claude');
    }

    const data = await response.json();
    return data.content[0].text;
}

export const aiService = {
    // 1. GENERATE TASKS (Express Mode)
    async generateTasks(
        apiKey: string, 
        context: string, 
        blueprint: AppData['blueprint'], 
        userInput: string, 
        mode: 'auto' | 'tasks' | 'analysis',
        fileBase64?: string,
        fileType?: string
    ) {
        const phase = PHASE_DATA[blueprint.phase] || PHASE_DATA[1];
        const systemPrompt = `Tu es l'assistant stratégique de Huzine.
        
CONTEXTE :
${context}

BLUEPRINT (Phase ${blueprint.phase} - ${phase.name}) :
- Objectif : ${phase.objective}
- MRR Actuel : ${blueprint.mrr}€ / Cible : ${phase.target}€

MODE : ${mode === 'analysis' ? 'ANALYSE DÉTAILLÉE' : mode === 'tasks' ? 'TÂCHES UNIQUEMENT' : 'AUTO'}

INSTRUCTION :
Analyse l'entrée utilisateur (et le fichier si présent).
Génère une réponse avec :
1. Une courte analyse stratégique (HTML tags <analysis>...</analysis>)
2. Une liste de tâches JSON (HTML tags <tasks>...</tasks>) respectant ce format : [{"type":"pro|saas|...", "text":"Action (30)", "priority":"H|M|L", "time":30}]`;

        const messages = [];
        if (fileBase64) {
            messages.push({
                role: 'user',
                content: [
                    {
                        type: "image",
                        source: {
                            type: "base64",
                            media_type: fileType || "image/png",
                            data: fileBase64.split(',')[1]
                        }
                    },
                    { type: "text", text: userInput || "Analyse ce document et extrais les actions." }
                ]
            });
        } else {
            messages.push({ role: 'user', content: userInput });
        }

        return await callClaude(apiKey, systemPrompt, messages);
    },

    // 2. STRATEGIC CHECK
    async strategicCheck(apiKey: string, blueprint: AppData['blueprint'], action: string) {
        const phase = PHASE_DATA[blueprint.phase] || PHASE_DATA[1];
        const systemPrompt = `Tu es un conseiller stratégique strict.

CONTEXTE BLUEPRINT :
- Phase actuelle : Mois ${blueprint.phase} (${phase.name})
- Objectif : ${phase.objective}
- Principe clé : "${phase.reminder}"

PRINCIPES GLOBAUX :
${blueprint.principles}

MISSION :
L'utilisateur veut faire : "${action}"
1. Est-ce ALIGNÉ avec la phase actuelle ?
2. Si NON : explique pourquoi et propose mieux.
3. Si OUI : valide et génère les tâches.

FORMAT SORTIE :
<verdict>ALIGNÉ ou NON_ALIGNÉ</verdict>
<analysis>Ton analyse</analysis>
<recommendation>Conseil</recommendation>
<tasks>[JSON si aligné, sinon vide]</tasks>`;

        return await callClaude(apiKey, systemPrompt, [{ role: 'user', content: action }]);
    },

    // 3. CHAT COACH
    async chat(apiKey: string, context: string, blueprint: AppData['blueprint'], history: ChatMessage[]) {
        const phase = PHASE_DATA[blueprint.phase] || PHASE_DATA[1];
        const systemPrompt = `Tu es un coach de productivité expert pour Huzine.
        
CONTEXTE :
${context}

PHASE ACTUELLE (${phase.name}) :
- Objectif : ${phase.objective}
- Rappel : "${phase.reminder}"

COMPORTEMENT :
- Pose 1-2 questions max pour clarifier.
- Sois concis, direct, orienté action.
- Aide à débloquer ou prioriser.`;

        return await callClaude(apiKey, systemPrompt, history);
    },

    // HELPER: Parse output to extract parts
    parseResponse(text: string) {
        const analysisMatch = text.match(/<analysis>([\s\S]*?)<\/analysis>/);
        const tasksMatch = text.match(/<tasks>([\s\S]*?)<\/tasks>/);
        const verdictMatch = text.match(/<verdict>([\s\S]*?)<\/verdict>/);
        const recMatch = text.match(/<recommendation>([\s\S]*?)<\/recommendation>/);

        let tasks: Task[] = [];
        if (tasksMatch) {
            try {
                // Nettoyage basique avant parsing
                const cleanJson = tasksMatch[1].trim();
                tasks = JSON.parse(cleanJson);
            } catch (e) { console.error("JSON Parse Error", e); }
        }

        return {
            analysis: analysisMatch ? analysisMatch[1].trim() : '',
            tasks: tasks.map(t => ({...t, id: Date.now() + Math.random(), done: false, todayStar: false, createdAt: new Date().toISOString()})),
            verdict: verdictMatch ? verdictMatch[1].trim() : null,
            recommendation: recMatch ? recMatch[1].trim() : null,
            raw: text
        };
    }
};