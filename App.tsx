import React, { useState, useEffect, useRef } from 'react';
import { 
    AppData, Task, TaskType, ViewType, DailyProgress, 
    Settings, Metrics, JournalEntry, ReviewData, DayConfig, AgendaEvent
} from './types';
import { 
    DAY_CONFIGS, getTaskDuration, 
    getPillarKey, getThemeColor, getGreeting,
    INITIAL_DATA
} from './utils';
import { syncService } from './services/sync';
import { Button, Input, Card, SmartTable } from './components/UI';
import { Icons } from './components/Icons';
import TaskRow from './components/TaskRow';
import { FocusOverlay, ShutdownModal, AiImportModal } from './components/Overlays';
import CommandCenter from './components/CommandCenter';

// --- AGENDA COMPONENT ---
const AgendaWidget: React.FC<{ events: AgendaEvent[], onAdd: (e: AgendaEvent) => void, onDelete: (id: number) => void }> = ({ events, onAdd, onDelete }) => {
    const [newTitle, setNewTitle] = useState("");
    const [newDate, setNewDate] = useState("");

    const getDaysRemaining = (dateStr: string) => {
        const target = new Date(dateStr);
        const today = new Date();
        today.setHours(0,0,0,0);
        target.setHours(0,0,0,0);
        const diff = target.getTime() - today.getTime();
        return Math.ceil(diff / (1000 * 60 * 60 * 24));
    };

    const sorted = [...events].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return (
        <Card className="p-4 bg-gradient-to-b from-slate-900 to-slate-950 border-slate-800">
            <h3 className="text-sm font-bold text-slate-400 mb-3 flex items-center gap-2"><Icons.Calendar size={14}/> AGENDA STRATÉGIQUE</h3>
            <div className="space-y-2 mb-4">
                {sorted.length === 0 && <div className="text-xs text-slate-600 italic">Rien de prévu.</div>}
                {sorted.map(ev => {
                    const days = getDaysRemaining(ev.date);
                    let colorClass = "bg-white/5 border-white/5 text-slate-300";
                    let alertIcon = null;

                    if (days === 0) {
                        colorClass = "bg-red-900/20 border-red-500/50 text-red-400 animate-pulse-soft";
                        alertIcon = <Icons.AlertTriangle size={12} />;
                    } else if (days > 0 && days <= 3) {
                        colorClass = "bg-orange-900/20 border-orange-500/40 text-orange-400";
                    }

                    return (
                        <div key={ev.id} className={`flex justify-between items-center p-2 rounded border text-xs ${colorClass}`}>
                            <div className="flex flex-col">
                                <span className="font-bold flex items-center gap-1">
                                    {alertIcon} {days === 0 ? "AUJOURD'HUI" : `J-${days}`}
                                </span>
                                <span className="opacity-90">{ev.title}</span>
                            </div>
                            <button onClick={() => onDelete(ev.id)} className="text-slate-500 hover:text-red-500"><Icons.X size={14}/></button>
                        </div>
                    );
                })}
            </div>
            <div className="flex gap-2">
                <Input type="date" className="w-24 text-[10px] p-1 h-8" value={newDate} onChange={e => setNewDate(e.target.value)} />
                <Input placeholder="Événement..." className="text-[10px] p-1 h-8" value={newTitle} onChange={e => setNewTitle(e.target.value)} />
                <Button className="h-8 w-8 px-0" onClick={() => {
                    if(newTitle && newDate) {
                        onAdd({ id: Date.now(), title: newTitle, date: newDate });
                        setNewTitle(""); setNewDate("");
                    }
                }}>+</Button>
            </div>
        </Card>
    );
};

// --- SETTINGS MODAL ---
const SettingsModal: React.FC<{ 
    active: boolean, 
    onClose: () => void, 
    data: AppData, 
    onSave: (s: Settings) => void 
}> = ({ active, onClose, data, onSave }) => {
    const [token, setToken] = useState(data.settings.sync.githubToken);
    const [gist, setGist] = useState(data.settings.sync.gistId);

    if(!active) return null;
    return (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
            <div className="bg-[#0F1115] border border-white/10 rounded-xl p-6 w-full max-w-sm">
                <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2"><Icons.Cloud size={18}/> SYNCHRONISATION GIST</h2>
                <div className="space-y-4 mb-6">
                    <div>
                        <label className="text-xs text-slate-500 block mb-1">GitHub Personal Access Token (Repo Scope)</label>
                        <Input type="password" value={token} onChange={e => setToken(e.target.value)} placeholder="ghp_..." />
                    </div>
                    <div>
                        <label className="text-xs text-slate-500 block mb-1">Gist ID</label>
                        <Input value={gist} onChange={e => setGist(e.target.value)} placeholder="32 caractères..." />
                    </div>
                </div>
                <div className="flex gap-2">
                    <Button variant="ghost" className="flex-1" onClick={onClose}>Annuler</Button>
                    <Button variant="primary" className="flex-1" onClick={() => {
                        onSave({ ...data.settings, sync: { ...data.settings.sync, githubToken: token, gistId: gist } });
                        onClose();
                    }}>Enregistrer</Button>
                </div>
            </div>
        </div>
    );
};

// --- MAIN COMPONENT ---
export default function App() {
    // --- STATE ---
    const [data, setData] = useState<AppData>(INITIAL_DATA);
    const [apiKey, setApiKey] = useState(""); // Managed separately from AppData for security
    const [currentView, setCurrentView] = useState<ViewType>('dashboard');
    const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }));
    
    // UI State
    const [focusTask, setFocusTask] = useState<Task | null>(null);
    const [showShutdown, setShowShutdown] = useState(false);
    const [showImport, setShowImport] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [isJournalExpanded, setIsJournalExpanded] = useState(false);
    const [braindumpText, setBraindumpText] = useState("");
    const [journalInput, setJournalInput] = useState("");
    const [syncStatus, setSyncStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

    // --- REFS ---
    const fileInputRef = useRef<HTMLInputElement>(null);

    // --- EFFECT: INIT & PERSISTENCE ---
    useEffect(() => {
        // Load Public Data
        const savedData = localStorage.getItem('huzine_os_hybrid');
        if (savedData) {
            try {
                const parsed = JSON.parse(savedData);
                const migrated = { 
                    ...INITIAL_DATA, 
                    ...parsed, 
                    agenda: parsed.agenda || [], // Migration v6
                    settings: { ...INITIAL_DATA.settings, ...parsed.settings } // Migration v6
                };
                if ((migrated as any).apiConfig) delete (migrated as any).apiConfig;
                setData(migrated);
            } catch (e) {
                console.error("Data corrupted", e);
            }
        }

        // Load Secrets (Separate Storage)
        const savedSecrets = localStorage.getItem('huzine_secrets');
        if (savedSecrets) {
            try {
                const secrets = JSON.parse(savedSecrets);
                if (secrets.claudeKey) setApiKey(secrets.claudeKey);
            } catch (e) { console.error("Secrets corrupted", e); }
        }
    }, []);

    // Initial Sync Pull
    useEffect(() => {
        const { githubToken, gistId } = data.settings.sync;
        if (githubToken && gistId && syncStatus === 'idle') {
            handleSyncPull();
        }
    }, [data.settings.sync.githubToken]);

    useEffect(() => {
        if (data !== INITIAL_DATA) {
            localStorage.setItem('huzine_os_hybrid', JSON.stringify(data));
        }
    }, [data]);

    useEffect(() => {
        localStorage.setItem('huzine_secrets', JSON.stringify({ claudeKey: apiKey }));
    }, [apiKey]);

    // --- EFFECT: CLOCK & CHECKS ---
    useEffect(() => {
        const timer = setInterval(() => {
            const now = new Date();
            setCurrentTime(now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }));
            
            if (now.getHours() === 22 && now.getMinutes() === 45 && !showShutdown) {
                setShowShutdown(true);
            }
        }, 1000);

        const today = new Date().toDateString();
        if (data.dailyProgress.lastReset !== today) {
            setData(prev => ({
                ...prev,
                dailyProgress: { ...INITIAL_DATA.dailyProgress, lastReset: today }
            }));
        }

        return () => clearInterval(timer);
    }, [data.dailyProgress.lastReset, showShutdown]);

    // --- HELPERS ---
    const getDayConfig = (): DayConfig => {
        const dayIdx = new Date().getDay();
        return DAY_CONFIGS[dayIdx] || DAY_CONFIGS[1];
    };
    const dayConfig = getDayConfig();

    const handleSyncPull = async () => {
        const { githubToken, gistId } = data.settings.sync;
        if(!githubToken || !gistId) return;
        setSyncStatus('loading');
        const remoteData = await syncService.loadFromGist(githubToken, gistId);
        if(remoteData) {
            // Merge intelligent : On garde les secrets locaux
            setData(prev => ({ ...remoteData, settings: { ...remoteData.settings, sync: prev.settings.sync } }));
            setSyncStatus('success');
            setTimeout(() => setSyncStatus('idle'), 2000);
        } else {
            setSyncStatus('error');
        }
    };

    const handleSyncPush = async () => {
        const { githubToken, gistId } = data.settings.sync;
        if(!githubToken || !gistId) { setShowSettings(true); return; }
        setSyncStatus('loading');
        const success = await syncService.saveToGist(githubToken, gistId, data);
        setSyncStatus(success ? 'success' : 'error');
        setTimeout(() => setSyncStatus('idle'), 2000);
    };

    // --- ACTIONS ---
    const updateTask = (id: number, updates: Partial<Task>) => {
        setData(prev => {
            const newTasks = prev.tasks.map(t => {
                if (t.id !== id) return t;
                const updated = { ...t, ...updates };
                
                if (updates.done !== undefined) {
                    const pillar = getPillarKey(t.type);
                    const duration = getTaskDuration(t.text);
                    const currentProg = prev.dailyProgress[pillar];
                    
                    let newProg = currentProg;
                    if (updated.done) {
                        newProg += duration;
                        updated.todayStar = false; 
                    } else {
                        newProg = Math.max(0, currentProg - duration);
                    }
                    
                    prev.dailyProgress[pillar] = newProg;
                }
                return updated;
            });
            return { ...prev, tasks: newTasks };
        });
    };

    const toggleStar = (id: number) => {
        const task = data.tasks.find(t => t.id === id);
        if (!task) return;
        
        if (task.todayStar) {
            updateTask(id, { todayStar: false });
        } else {
            const count = data.tasks.filter(t => t.todayStar && !t.done).length;
            if (count >= 3) {
                alert("Max 3 tâches prioritaires !");
                return;
            }
            updateTask(id, { todayStar: true });
        }
    };

    const addTask = (type: TaskType, text: string, priority: 'H'|'M'|'L' = 'M') => {
        const newTask: Task = {
            id: Date.now() + Math.random(),
            type,
            text,
            done: false,
            priority,
            todayStar: false,
            createdAt: new Date().toISOString()
        };
        setData(prev => ({ ...prev, tasks: [newTask, ...prev.tasks] }));
    };

    const addMultipleTasks = (tasks: any[]) => {
        const newTasks = tasks.map(t => ({
            id: Date.now() + Math.random(),
            type: t.type,
            text: t.text,
            done: false,
            priority: t.priority || 'M',
            todayStar: false,
            createdAt: new Date().toISOString()
        } as Task));
        
        setData(prev => ({ ...prev, tasks: [...newTasks, ...prev.tasks] }));
        alert(`${newTasks.length} tâches ajoutées depuis le Command Center.`);
        setCurrentView('dashboard');
    };

    const deleteTask = (id: number) => {
        const task = data.tasks.find(t => t.id === id);
        if (task && task.done) {
            const pillar = getPillarKey(task.type);
            const duration = getTaskDuration(task.text);
            setData(prev => ({
                ...prev,
                dailyProgress: {
                    ...prev.dailyProgress,
                    [pillar]: Math.max(0, prev.dailyProgress[pillar] - duration)
                },
                tasks: prev.tasks.filter(t => t.id !== id)
            }));
        } else {
            setData(prev => ({ ...prev, tasks: prev.tasks.filter(t => t.id !== id) }));
        }
    };

    const handleBraindump = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && braindumpText.trim()) {
            addTask('vie', braindumpText.trim());
            setBraindumpText("");
        }
    };

    const addJournal = (text: string) => {
        const entry: JournalEntry = {
            text,
            time: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
            date: new Date().toDateString()
        };
        setData(prev => ({ ...prev, journal: [entry, ...prev.journal] }));
    };

    const importData = (jsonStr: string) => {
        try {
            const clean = jsonStr.replace(/```json/g, '').replace(/```/g, '').trim();
            const imported = JSON.parse(clean);
            if (Array.isArray(imported)) {
                let count = 0;
                imported.forEach((t: any) => {
                    if (t.type && t.text) {
                        addTask(t.type, t.text, t.priority || 'M');
                        count++;
                    }
                });
                alert(`${count} tâches importées.`);
                setShowImport(false);
            }
        } catch (e) {
            alert("JSON Invalide");
        }
    };

    const exportData = () => {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `huzine_os_${new Date().toISOString().split('T')[0]}.json`;
        a.click();
    };

    // --- RENDER HELPERS ---
    const activeTasks = data.tasks.filter(t => !t.done);
    const top3 = activeTasks.filter(t => t.todayStar);

    // --- VIEW COMPONENT: PILLAR CARD ---
    const PillarCard = ({ pKey, icon, title, color, type }: any) => {
        const tasks = data.tasks.filter(t => (type === 'patri' ? ['annaba','copro','airbnb','maison'].includes(t.type) : t.type === type));
        const active = tasks.filter(t => !t.done).slice(0, 5);
        const doneCount = tasks.filter(t => t.done).length;
        const total = tasks.length;
        
        const budget = dayConfig.budgets[pKey as keyof typeof dayConfig.budgets];
        const current = data.dailyProgress[pKey as keyof Omit<DailyProgress, 'lastReset'>];
        const pct = budget > 0 ? Math.min((current / budget) * 100, 100) : 0;
        
        const isFocus = budget >= 3;
        const isOff = budget === 0;
        const shouldBlur = dayConfig.office && type !== 'pro';

        return (
            <div className={`relative flex flex-col p-5 rounded-2xl border transition-all duration-300 min-h-[260px]
                ${isFocus ? `bg-bg-glass border-${color} shadow-[0_8px_30px_-5px_rgba(0,0,0,0.4)] ring-1 ring-${color}` : 'bg-bg-glass border-white/5'}
                ${isOff ? 'opacity-60 grayscale-[0.6]' : ''}
            `}>
                {isFocus && <div className="absolute -top-3 right-4 bg-black border border-current text-xs font-bold px-2 py-0.5 rounded text-white tracking-wider z-10">FOCUS</div>}
                
                <div className="flex justify-between items-center mb-3 pb-3 border-b border-white/5">
                    <span className={`font-semibold flex items-center gap-2 ${getThemeColor(type)}`}>
                        {icon} {title}
                    </span>
                    <span className="text-xs font-mono bg-white/5 px-2 py-0.5 rounded text-slate-400">
                        {total - doneCount}
                    </span>
                </div>

                <div className="mb-4">
                    {isOff ? (
                         <div className="text-[10px] font-mono text-slate-500 flex justify-between mb-1">
                             <span>OFF TODAY</span><span>--</span>
                         </div>
                    ) : (
                        <div className="text-[10px] font-mono text-slate-500 flex justify-between mb-1">
                            <span>Obj: {budget}h</span><span>{current.toFixed(1)}h</span>
                        </div>
                    )}
                    <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                        <div className="h-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: isOff ? 'transparent' : (color === 'pro' ? '#2563EB' : color === 'saas' ? '#0D9F6E' : color === 'vie' ? '#DB2777' : '#7C3AED') }}></div>
                    </div>
                </div>

                <div className="flex-1 flex flex-col gap-1 overflow-y-auto">
                    {active.length === 0 ? (
                        <div className="text-xs text-slate-600 italic py-4 text-center">Rien à signaler.</div>
                    ) : (
                        active.map(t => (
                            <TaskRow 
                                key={t.id} task={t} 
                                onToggle={(id) => updateTask(id, { done: !t.done })}
                                onDelete={deleteTask}
                                onStar={toggleStar}
                                onFocus={(id) => setFocusTask(t)}
                                isBlurred={shouldBlur}
                            />
                        ))
                    )}
                </div>
                
                <button 
                    onClick={() => {
                        const txt = prompt("Nouvelle tâche " + title + " ?");
                        if(txt) addTask(type === 'patri' ? 'annaba' : type, txt);
                    }}
                    className="mt-4 w-full py-2.5 border border-dashed border-white/10 rounded text-xs text-slate-500 hover:text-white hover:bg-white/5 transition-colors"
                >
                    + Ajouter
                </button>
            </div>
        );
    };

    return (
        <div className={`flex flex-col h-screen ${data.settings.crisisMode ? 'border-4 border-alert rounded-none' : ''}`}>
            
            {/* --- HEADER --- */}
            <header className={`h-16 flex items-center justify-between px-6 bg-bg-deep/70 backdrop-blur-xl border-b border-white/5 z-40 ${data.settings.crisisMode ? 'bg-red-900/10' : ''}`}>
                <div className="flex items-center gap-3 font-mono font-bold text-base tracking-tight">
                    HUZINE<span className="font-normal text-slate-500">//OS v6.0</span>
                    {data.settings.crisisMode && <span className="bg-red-500/10 text-red-500 text-[10px] px-2 py-0.5 rounded border border-red-500/20 animate-pulse-soft">CRISE</span>}
                    {dayConfig.office && <span className="bg-orange-500/10 text-orange-500 text-[10px] px-2 py-0.5 rounded border border-orange-500/20 flex items-center gap-1">🏢 BUREAU</span>}
                </div>

                <div className="hidden md:flex flex-1 max-w-md mx-8 relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"><Icons.Zap size={14} /></span>
                    <input 
                        type="text" 
                        value={braindumpText}
                        onChange={(e) => setBraindumpText(e.target.value)}
                        onKeyDown={handleBraindump}
                        placeholder="Capture rapide... (Entrée)"
                        className="w-full bg-white/[0.03] border border-white/[0.06] text-slate-200 rounded-lg py-2 pl-9 pr-4 text-sm focus:bg-white/5 focus:border-slate-500 focus:outline-none transition-all"
                    />
                </div>

                <div className="flex items-center gap-3">
                    <div className="font-mono font-bold mr-2 text-sm text-slate-400">{currentTime}</div>
                    
                    {/* SYNC BUTTON */}
                    <div className="relative group">
                        <Button variant="ghost" className={`w-9 px-0 ${syncStatus === 'error' ? 'text-red-500' : syncStatus === 'success' ? 'text-green-500' : ''}`} onClick={handleSyncPush} title="Sync Gist">
                             {syncStatus === 'loading' ? <Icons.Loader size={18}/> : <Icons.Cloud size={18} />}
                        </Button>
                        <div className={`absolute top-1 right-1 w-2 h-2 rounded-full ${data.settings.sync.githubToken ? 'bg-green-500' : 'bg-slate-700'}`}></div>
                    </div>

                    <Button variant="ghost" className="w-9 px-0" onClick={() => setShowSettings(true)} title="Réglages">
                        <Icons.Settings size={18} />
                    </Button>
                    
                    <Button variant={currentView === 'command' ? 'primary' : 'outline'} className="text-patri border-patri/30 text-xs" onClick={() => setCurrentView('command')} title="Command Center (IA)">
                        <Icons.Brain size={16} /> IA
                    </Button>
                    
                    <Button variant="outline" onClick={() => {
                        const t = top3[0] || activeTasks[0];
                        if(t) setFocusTask(t);
                        else alert("Aucune tâche !");
                    }} title="Lancer le Mode Focus">
                        <Icons.Target size={16} /> FOCUS
                    </Button>
                    
                    <Button variant={data.settings.crisisMode ? 'alert' : 'outline'} className="w-9 px-0" onClick={() => setData(p => ({ ...p, settings: { ...p.settings, crisisMode: !p.settings.crisisMode } }))} title="Mode Crise">
                        <Icons.Flame size={18} />
                    </Button>
                    
                    <Button variant="ghost" className="w-9 px-0" onClick={exportData} title="Backup Local">
                        <Icons.Save size={18} />
                    </Button>
                    
                    <input type="file" ref={fileInputRef} className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if(f) { const r = new FileReader(); r.onload = (ev) => { try { setData(JSON.parse(ev.target?.result as string)); alert("Restauré !"); } catch(err) { alert("Fichier invalide"); } }; r.readAsText(f); } }} />
                </div>
            </header>

            {/* --- LAYOUT --- */}
            <div className="flex flex-1 overflow-hidden">
                {/* SIDEBAR */}
                <nav className="w-[72px] bg-bg-surface/60 backdrop-blur-md border-r border-white/5 flex flex-col items-center py-6 gap-3 z-30">
                    {[
                        { id: 'dashboard', icon: <Icons.Activity size={20} />, label: 'Day' },
                        { id: 'command', icon: <Icons.Brain size={20} />, label: 'Brain' },
                        { id: 'pro', icon: <Icons.Briefcase size={20} />, label: 'Pro' },
                        { id: 'saas', icon: <Icons.Globe size={20} />, label: 'SaaS' },
                        { id: 'vie', icon: <Icons.Heart size={20} />, label: 'Vie' },
                        { id: 'patrimoine', icon: <Icons.Building size={20} />, label: 'Patri' },
                        { id: 'review', icon: <Icons.Calendar size={20} />, label: 'Plan' },
                    ].map(item => (
                        <button 
                            key={item.id}
                            onClick={() => setCurrentView(item.id as ViewType)}
                            className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center gap-1 transition-all relative
                                ${currentView === item.id 
                                    ? 'bg-white/[0.06] text-white shadow-[inset_0_0_0_1px_rgba(255,255,255,0.05)]' 
                                    : 'text-slate-500 hover:text-white hover:bg-white/[0.03] hover:scale-105'}
                            `}
                        >
                            {currentView === item.id && <div className="absolute left-[-2px] top-3 bottom-3 w-[3px] bg-white rounded-r-md shadow-[2px_0_8px_rgba(255,255,255,0.2)]"></div>}
                            <div className={currentView === item.id ? '' : 'grayscale opacity-70'}>{item.icon}</div>
                            <span className="text-[9px] font-medium">{item.label}</span>
                        </button>
                    ))}
                </nav>

                {/* MAIN CONTENT */}
                <main className="flex-1 overflow-y-auto p-8 lg:p-12 scroll-smooth">
                    <div className="max-w-7xl mx-auto w-full animate-slide-up">
                        
                        {currentView === 'command' && (
                            <CommandCenter 
                                data={data} 
                                apiKey={apiKey}
                                onApiKeyChange={setApiKey}
                                onUpdateData={(newData) => setData(prev => ({ ...prev, ...newData }))}
                                onAddTasks={addMultipleTasks}
                            />
                        )}

                        {currentView === 'dashboard' && (
                            <>
                                <div className="flex justify-between items-end mb-8">
                                    <div>
                                        <div className="inline-flex items-center px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide text-white mb-2 shadow-lg" style={{ backgroundColor: dayConfig.theme }}>
                                            {dayConfig.name} // {dayConfig.label}
                                        </div>
                                        <h1 className="text-xl font-light text-slate-400">
                                            {getGreeting()}, <span className="font-semibold text-white">Huzine</span>.
                                        </h1>
                                    </div>
                                    <Button variant="outline" className="text-gold border-gold/20 hover:border-gold/50" onClick={() => setShowShutdown(true)}>🌙 Shutdown</Button>
                                </div>

                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                                    {/* AGENDA WIDGET (NEW v6) */}
                                    <div className="lg:col-span-1">
                                        <AgendaWidget 
                                            events={data.agenda} 
                                            onAdd={(ev) => setData(p => ({ ...p, agenda: [...p.agenda, ev] }))}
                                            onDelete={(id) => setData(p => ({ ...p, agenda: p.agenda.filter(e => e.id !== id) }))}
                                        />
                                    </div>

                                    {/* TOP 3 */}
                                    <div className="lg:col-span-2 p-6 rounded-2xl bg-gradient-to-b from-[#14171C]/60 to-[#0A0C10]/90 border border-gold/10 relative shadow-[0_0_60px_rgba(245,158,11,0.03)] backdrop-blur-xl">
                                        <div className="flex justify-between items-center mb-5">
                                            <span className="font-semibold text-sm text-gold flex items-center gap-2 drop-shadow-sm">
                                                <Icons.Star size={16} fill="currentColor" /> TOP 3 DU JOUR
                                            </span>
                                            <span className="font-mono text-xs bg-white/5 px-2 py-1 rounded text-slate-400">
                                                {top3.length}/3
                                            </span>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            {top3.length === 0 ? (
                                                <div className="text-slate-500 italic text-center py-4 border border-dashed border-white/5 rounded">
                                                    Aucune priorité définie. Clique sur ★.
                                                </div>
                                            ) : (
                                                top3.map(t => (
                                                    <TaskRow 
                                                        key={t.id} task={t} 
                                                        onToggle={(id) => updateTask(id, { done: !t.done })}
                                                        onDelete={deleteTask}
                                                        onStar={toggleStar}
                                                        onFocus={(id) => setFocusTask(t)}
                                                        showTypeDot
                                                        isBlurred={dayConfig.office && t.type !== 'pro'}
                                                    />
                                                ))
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* PILLARS */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                                    <PillarCard pKey="pro" icon={<Icons.Briefcase size={16}/>} title="PRO" color="pro" type="pro" />
                                    <PillarCard pKey="saas" icon={<Icons.Globe size={16}/>} title="SaaS" color="saas" type="saas" />
                                    <PillarCard pKey="patri" icon={<Icons.Building size={16}/>} title="Patri" color="patri" type="patri" />
                                    <PillarCard pKey="vie" icon={<Icons.Heart size={16}/>} title="Vie" color="vie" type="vie" />
                                </div>

                                {/* JOURNAL */}
                                <div className="bg-bg-glass border border-white/5 rounded-2xl overflow-hidden">
                                    <div 
                                        className="p-4 flex justify-between items-center cursor-pointer hover:bg-white/[0.02]"
                                        onClick={() => setIsJournalExpanded(!isJournalExpanded)}
                                    >
                                        <span className="font-medium text-sm flex items-center gap-2">📝 Journal de transition</span>
                                        <span className="text-xs text-slate-500 flex items-center gap-1">
                                            {isJournalExpanded ? <Icons.ChevronUp size={14} /> : <Icons.ChevronDown size={14} />}
                                            {isJournalExpanded ? 'Masquer' : 'Afficher'}
                                        </span>
                                    </div>
                                    {isJournalExpanded && (
                                        <div className="px-5 pb-5 pt-0 border-t border-white/5 animate-slide-up">
                                            <div className="mt-4 mb-4">
                                                <Input 
                                                    placeholder="Comment je me sens ?" 
                                                    value={journalInput}
                                                    onChange={(e) => setJournalInput(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if(e.key === 'Enter' && journalInput.trim()) {
                                                            addJournal(journalInput);
                                                            setJournalInput('');
                                                        }
                                                    }}
                                                />
                                            </div>
                                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                                {data.journal.filter(j => j.date === new Date().toDateString()).length === 0 && (
                                                    <div className="text-xs text-slate-600 italic">Vide pour l'instant.</div>
                                                )}
                                                {data.journal.filter(j => j.date === new Date().toDateString()).map((j, i) => (
                                                    <div key={i} className="text-sm border-b border-white/5 pb-2 last:border-0 flex gap-3">
                                                        <span className="font-mono text-xs text-pro opacity-80 min-w-[45px]">{j.time}</span>
                                                        <span className="text-slate-300">{j.text}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}

                        {/* --- OTHER VIEWS (Simplified) --- */}
                        {(currentView === 'pro' || currentView === 'vie') && (
                            <>
                                <h2 className={`text-xl font-bold mb-4 flex items-center gap-2 ${getThemeColor(currentView)}`}>
                                    {currentView === 'pro' ? '💼 PRO / Dell' : '🧬 Vie / Admin'}
                                </h2>
                                <Card className="p-6">
                                    <SmartTable>
                                        <tbody>
                                            {data.tasks.filter(t => t.type === currentView).sort((a,b) => Number(a.done) - Number(b.done)).map(t => (
                                                <tr key={t.id} className="border-b border-white/5 last:border-0">
                                                    <td className="py-2"><TaskRow task={t} onToggle={(id) => updateTask(id, { done: !t.done })} onDelete={deleteTask} onStar={toggleStar} onFocus={(id) => setFocusTask(t)} /></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </SmartTable>
                                    <Button className="w-full mt-4" variant="ghost" onClick={() => {
                                        const t = prompt("Nouvelle tâche ?");
                                        if(t) addTask(currentView as TaskType, t);
                                    }}>+ Ajouter</Button>
                                </Card>
                            </>
                        )}

                        {currentView === 'saas' && (
                            <>
                                <div className="flex justify-between items-center mb-4">
                                    <h2 className="text-xl font-bold text-saas">💻 SaaS / Nutri-Track</h2>
                                    <div className="flex gap-2">
                                        <input className="bg-bg-surface border border-white/10 rounded px-2 py-1 text-xs w-20 text-white" placeholder="MRR €" value={data.metrics.mrr} onChange={(e) => setData(p => ({...p, metrics: {...p.metrics, mrr: e.target.value}}))} />
                                        <input className="bg-bg-surface border border-white/10 rounded px-2 py-1 text-xs w-16 text-white" placeholder="Users" value={data.metrics.users} onChange={(e) => setData(p => ({...p, metrics: {...p.metrics, users: e.target.value}}))} />
                                    </div>
                                </div>
                                <Card className="p-6">
                                    <SmartTable>
                                        <tbody>
                                            {data.tasks.filter(t => t.type === 'saas').sort((a,b) => Number(a.done) - Number(b.done)).map(t => (
                                                <tr key={t.id} className="border-b border-white/5 last:border-0">
                                                    <td className="py-2"><TaskRow task={t} onToggle={(id) => updateTask(id, { done: !t.done })} onDelete={deleteTask} onStar={toggleStar} onFocus={(id) => setFocusTask(t)} /></td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </SmartTable>
                                    <Button className="w-full mt-4" variant="ghost" onClick={() => {
                                        const t = prompt("Nouvelle feature ?");
                                        if(t) addTask('saas', t);
                                    }}>+ Ajouter</Button>
                                </Card>
                            </>
                        )}

                        {currentView === 'patrimoine' && (
                            <div className="space-y-6">
                                <h2 className="text-xl font-bold text-patri mb-4">🏗️ Patrimoine</h2>
                                {[
                                    { id: 'annaba', title: '🇩🇿 Annaba', color: '#7C3AED' },
                                    { id: 'copro', title: '🏢 Copropriété', color: '#F59E0B' },
                                    { id: 'airbnb', title: '🏠 Airbnb', color: '#2563EB' },
                                    { id: 'maison', title: '🏡 Maison', color: '#10B981' }
                                ].map(proj => (
                                    <Card key={proj.id} className="p-6" borderLeftColor={proj.color}>
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="font-bold text-lg">{proj.title}</h3>
                                            {(proj.id === 'annaba' || proj.id === 'copro') && (
                                                <input type="date" className="bg-transparent border-none text-xs text-slate-500" value={proj.id === 'annaba' ? data.settings.annabaDate : data.settings.coproDate} onChange={(e) => setData(p => ({...p, settings: {...p.settings, [proj.id === 'annaba' ? 'annabaDate' : 'coproDate']: e.target.value}}))} />
                                            )}
                                        </div>
                                        <div className="space-y-1">
                                            {data.tasks.filter(t => t.type === proj.id).map(t => (
                                                <TaskRow key={t.id} task={t} onToggle={(id) => updateTask(id, { done: !t.done })} onDelete={deleteTask} onStar={toggleStar} onFocus={(id) => setFocusTask(t)} />
                                            ))}
                                        </div>
                                        <div className="flex gap-2 mt-4">
                                            <Input 
                                                placeholder="Nouveau jalon..." 
                                                onKeyDown={(e) => {
                                                    if(e.key === 'Enter' && e.currentTarget.value) {
                                                        addTask(proj.id as TaskType, e.currentTarget.value);
                                                        e.currentTarget.value = '';
                                                    }
                                                }}
                                            />
                                            <Button variant="ghost" className="w-10">+</Button>
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}

                        {currentView === 'review' && (
                            <div>
                                <h2 className="text-xl font-bold mb-6">📅 Architecture Semaine</h2>
                                <div className="grid grid-cols-3 md:grid-cols-6 gap-4 mb-8">
                                    {Object.values(DAY_CONFIGS).slice(0,6).map((d, i) => { // Just showing Mon-Sat for grid
                                        const isToday = new Date().getDay() === (i+1)%7; // simple mapping
                                        return (
                                        <div key={i} className={`p-4 rounded-xl border ${isToday ? 'bg-saas/10 border-saas shadow-[0_4px_15px_rgba(13,159,110,0.1)]' : 'bg-white/[0.02] border-white/5'} text-center`}>
                                            <div className="text-sm font-bold mb-1" style={{color: isToday ? '#0D9F6E' : d.theme}}>{d.name}</div>
                                            <div className="text-[10px] text-slate-500 font-mono tracking-tighter">{d.label}</div>
                                        </div>
                                    )})}
                                </div>
                                <Card className="p-6">
                                    <h3 className="font-bold text-lg mb-4">📝 Weekly Review</h3>
                                    <div className="space-y-4">
                                        <div>
                                            <label className="text-xs text-slate-500 block mb-1">1. Victoire de la semaine ?</label>
                                            <Input value={data.review.win} onChange={(e) => setData(p => ({...p, review: {...p.review, win: e.target.value}}))} />
                                        </div>
                                        <div>
                                            <label className="text-xs text-slate-500 block mb-1">2. Ce qui n'a pas fonctionné ?</label>
                                            <Input value={data.review.fail} onChange={(e) => setData(p => ({...p, review: {...p.review, fail: e.target.value}}))} />
                                        </div>
                                        <div>
                                            <label className="text-xs text-slate-500 block mb-1">3. PRIORITÉ semaine prochaine ?</label>
                                            <div className="flex gap-2">
                                                <Input value={data.review.priority} onChange={(e) => setData(p => ({...p, review: {...p.review, priority: e.target.value}}))} />
                                                <Button variant="primary" className="bg-saas border-saas" onClick={() => {
                                                    if(data.review.priority) {
                                                        const type = prompt("Type?", "pro") as TaskType;
                                                        if(type) {
                                                            addTask(type, data.review.priority, 'H');
                                                            alert("Ajouté aux priorités !");
                                                        }
                                                    }
                                                }}>→ Créer TOP 3</Button>
                                            </div>
                                        </div>
                                    </div>
                                </Card>
                            </div>
                        )}
                    </div>
                </main>
            </div>

            {/* --- OVERLAYS --- */}
            <FocusOverlay 
                active={!!focusTask} 
                task={focusTask} 
                onClose={() => setFocusTask(null)}
                onComplete={() => {
                    if (focusTask) {
                        updateTask(focusTask.id, { done: true });
                        addJournal(`✓ ${focusTask.text} (Focus)`);
                        setFocusTask(null);
                    }
                }}
                onNext={() => {
                    const next = top3.find(t => t.id !== focusTask?.id) || activeTasks.find(t => t.id !== focusTask?.id);
                    if (next) setFocusTask(next);
                    else { alert("Terminé !"); setFocusTask(null); }
                }}
            />
            
            <ShutdownModal 
                active={showShutdown} 
                onClose={() => setShowShutdown(false)}
                onSaveNextDay={(txt) => {
                    if(txt) alert("Noté pour demain : " + txt);
                }}
            />

            <AiImportModal 
                active={showImport} 
                onClose={() => setShowImport(false)}
                onImport={importData}
            />

            <SettingsModal 
                active={showSettings} 
                onClose={() => setShowSettings(false)} 
                data={data}
                onSave={(s) => setData(p => ({ ...p, settings: s }))}
            />
        </div>
    );
}