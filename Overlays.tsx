import React, { useState, useEffect } from 'react';
import { Task, AGENT_PROMPT } from '../types';
import { Icons } from './Icons';
import { Button, Input } from './UI';

// --- FOCUS OVERLAY ---
export const FocusOverlay: React.FC<{
    task: Task | null;
    active: boolean;
    onClose: () => void;
    onComplete: () => void;
    onNext: () => void;
}> = ({ task, active, onClose, onComplete, onNext }) => {
    const [seconds, setSeconds] = useState(0);
    const [isRunning, setIsRunning] = useState(false);

    useEffect(() => {
        let interval: any;
        if (active && isRunning) {
            interval = setInterval(() => setSeconds(s => s + 1), 1000);
        }
        return () => clearInterval(interval);
    }, [active, isRunning]);

    useEffect(() => {
        if(active) { setSeconds(0); setIsRunning(false); }
    }, [task, active]);

    const fmtTime = (s: number) => {
        const m = Math.floor(s / 60).toString().padStart(2, '0');
        const sec = (s % 60).toString().padStart(2, '0');
        return `${m}:${sec}`;
    };

    if (!active || !task) return null;

    return (
        <div className="fixed inset-0 z-50 bg-gradient-to-b from-[#050505] to-[#0A0C10] flex flex-col items-center justify-center animate-slide-up">
            <button onClick={onClose} className="absolute top-8 right-8 p-3 rounded-full border border-white/10 hover:bg-white/10 text-slate-400">
                <Icons.X size={24} />
            </button>

            <div className="px-4 py-1.5 rounded-full border border-pro/20 bg-pro/10 text-pro text-xs font-bold tracking-widest uppercase mb-8">
                {task.type}
            </div>

            <h1 className="text-4xl md:text-5xl font-bold text-center text-white max-w-3xl leading-tight mb-8 px-4">
                {task.text}
            </h1>

            <div className="font-mono text-6xl text-slate-500 mb-12 opacity-80">
                {fmtTime(seconds)}
            </div>

            <div className="flex items-center gap-4">
                <button 
                    onClick={() => setIsRunning(!isRunning)}
                    className="h-12 px-8 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 font-medium text-lg flex items-center gap-2"
                >
                    {isRunning ? <><Icons.Square size={18} fill="currentColor" /> Pause</> : <><Icons.Play size={18} fill="currentColor" /> Timer</>}
                </button>
                
                <button 
                    onClick={onComplete}
                    className="h-12 px-10 rounded-full bg-white text-black font-bold text-lg hover:scale-105 transition-transform shadow-[0_0_30px_rgba(255,255,255,0.15)]"
                >
                    ✓ TERMINÉ
                </button>

                <button 
                    onClick={onNext}
                    className="h-12 w-12 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 flex items-center justify-center"
                >
                    <Icons.ArrowRight size={20} />
                </button>
            </div>
        </div>
    );
};

// --- SHUTDOWN MODAL ---
export const ShutdownModal: React.FC<{
    active: boolean;
    onClose: () => void;
    onSaveNextDay: (tasks: string) => void;
}> = ({ active, onClose, onSaveNextDay }) => {
    const [nextDayTasks, setNextDayTasks] = useState("");
    
    if (!active) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-[fadeIn_0.2s_ease-out]">
            <div className="bg-[#0F1115] border border-white/10 rounded-2xl p-8 max-w-md w-full shadow-2xl text-center">
                <h2 className="text-2xl font-bold text-white mb-2">🌙 SHUTDOWN</h2>
                <p className="text-slate-400 mb-8">22h45 — Préparation sommeil</p>

                <div className="space-y-4 text-left mb-8">
                    <label className="flex items-center gap-3 text-slate-300 cursor-pointer">
                        <input type="checkbox" className="w-5 h-5 rounded border-slate-600 bg-transparent text-saas focus:ring-0 checked:bg-saas checked:border-saas" />
                        <span>Victoire du jour notée</span>
                    </label>
                    <label className="flex items-center gap-3 text-slate-300 cursor-pointer">
                        <input type="checkbox" className="w-5 h-5 rounded border-slate-600 bg-transparent text-saas focus:ring-0 checked:bg-saas checked:border-saas" />
                        <span>Écrans éteints</span>
                    </label>
                    
                    <div className="pt-2">
                        <label className="block text-sm text-slate-500 mb-2">Top 3 Demain :</label>
                        <Input 
                            value={nextDayTasks}
                            onChange={(e) => setNextDayTasks(e.target.value)}
                            placeholder="1. / 2. / 3."
                        />
                    </div>
                </div>

                <Button 
                    className="w-full py-3 bg-white text-black hover:bg-slate-200 font-bold"
                    onClick={() => { onSaveNextDay(nextDayTasks); onClose(); }}
                >
                    BONNE NUIT 💪
                </Button>
            </div>
        </div>
    );
};

// --- AI IMPORT MODAL ---
export const AiImportModal: React.FC<{
    active: boolean;
    onClose: () => void;
    onImport: (json: string) => void;
}> = ({ active, onClose, onImport }) => {
    const [jsonInput, setJsonInput] = useState("");
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(AGENT_PROMPT.trim());
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!active) return null;

    return (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-[#0F1115] border border-patri/30 rounded-2xl p-6 max-w-lg w-full shadow-[0_0_40px_rgba(124,58,237,0.1)]">
                <h2 className="text-xl font-bold text-patri mb-1 flex items-center gap-2">
                    📥 IMPORT IA
                </h2>
                <p className="text-slate-500 text-sm mb-6">Transforme tes PDF/Notes en tâches via LLM.</p>

                <button 
                    onClick={handleCopy}
                    className="w-full mb-4 py-3 border border-blue-500/30 bg-blue-500/10 text-blue-400 rounded-lg text-sm font-semibold hover:bg-blue-500/20 transition-colors flex items-center justify-center gap-2"
                >
                    {copied ? <Icons.Check size={16}/> : <Icons.Copy size={16}/>}
                    {copied ? "PROMPT COPIÉ !" : "1. COPIER LE PROMPT AGENT"}
                </button>

                <textarea
                    className="w-full h-32 bg-white/[0.03] border border-white/10 rounded-lg p-3 text-xs font-mono text-saas placeholder:text-slate-600 focus:outline-none resize-none mb-6"
                    placeholder='2. Colle le bloc JSON ici (ex: [{"type":"annaba", "text":"...", "priority":"H"}])'
                    value={jsonInput}
                    onChange={(e) => setJsonInput(e.target.value)}
                />

                <div className="flex gap-3">
                    <Button variant="ghost" onClick={onClose} className="flex-1">ANNULER</Button>
                    <Button 
                        variant="primary" 
                        onClick={() => { onImport(jsonInput); setJsonInput(''); }}
                        className="flex-1 bg-patri border-patri hover:bg-purple-700 text-white"
                    >
                        IMPORTER
                    </Button>
                </div>
            </div>
        </div>
    );
};