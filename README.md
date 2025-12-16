<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HUZINE OS // V5.2 AUTONOMOUS</title>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&family=Inter:wght@300;400;600;800&display=swap');

        :root {
            --bg-dark: #0B0E14;
            --bg-panel: #151923;
            --bg-input: #1F2433;
            --pro-blue: #0076CE;
            --saas-green: #00DC82;
            --patri-purple: #A855F7;
            --vie-pink: #EC4899;
            --alert-red: #FF3366;
            --warn-orange: #FF9900;
            --star-gold: #FFD700;
            --text-main: #E2E8F0;
            --text-muted: #64748B;
            --border: #2D3748;
        }

        * { margin: 0; padding: 0; box-sizing: border-box; outline: none; }

        body {
            background-color: var(--bg-dark);
            color: var(--text-main);
            font-family: 'Inter', sans-serif;
            height: 100vh;
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }

        /* HEADER */
        header {
            background: var(--bg-panel);
            border-bottom: 1px solid var(--border);
            padding: 0.6rem 1.25rem;
            display: flex;
            align-items: center;
            justify-content: space-between;
            height: 58px;
        }
        header.crisis-active { border-bottom: 2px solid var(--alert-red); }

        .brand { font-family: 'JetBrains Mono', monospace; font-weight: 800; color: var(--pro-blue); font-size: 1rem; display: flex; align-items: center; gap: 8px; }
        .brand span { color: var(--saas-green); }
        .crisis-tag { background: var(--alert-red); color: white; font-size: 0.55rem; padding: 2px 5px; border-radius: 3px; animation: pulse 1s infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }

        .braindump-wrapper { flex: 1; max-width: 400px; margin: 0 1rem; position: relative; }
        .braindump-input {
            width: 100%; background: var(--bg-dark); border: 1px solid var(--border);
            color: var(--saas-green); padding: 7px 10px 7px 30px; border-radius: 6px;
            font-family: 'JetBrains Mono', monospace; font-size: 0.8rem;
        }
        .braindump-input:focus { border-color: var(--saas-green); }
        .braindump-input::placeholder { color: var(--text-muted); }
        .braindump-icon { position: absolute; left: 9px; top: 50%; transform: translateY(-50%); color: var(--text-muted); font-size: 0.85rem; }

        .header-controls { display: flex; gap: 0.4rem; align-items: center; }
        .btn-header {
            background: var(--bg-input); color: var(--text-main); border: 1px solid var(--border);
            padding: 0 9px; font-weight: 600; font-size: 0.65rem; height: 30px; border-radius: 5px;
            cursor: pointer; display: flex; align-items: center; gap: 4px; transition: 0.2s;
        }
        .btn-header:hover { background: var(--border); }
        .btn-header.focus-active { background: var(--saas-green); color: black; border-color: var(--saas-green); }
        .btn-header.crisis { border-color: var(--alert-red); color: var(--alert-red); }
        .btn-header.crisis.active { background: var(--alert-red); color: white; }
        .btn-icon { background: none; border: 1px solid var(--border); color: var(--text-muted); border-radius: 5px; width: 30px; height: 30px; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 0.85rem; }
        .btn-icon:hover { color: var(--text-main); border-color: var(--text-main); }
        #clock { font-family: 'JetBrains Mono'; font-weight: bold; font-size: 0.85rem; }

        /* LAYOUT */
        .container { display: flex; flex: 1; overflow: hidden; }
        .sidebar { width: 65px; background: var(--bg-panel); border-right: 1px solid var(--border); display: flex; flex-direction: column; align-items: center; padding-top: 0.6rem; gap: 0.3rem; }
        .nav-item { width: 48px; height: 48px; border-radius: 10px; display: flex; flex-direction: column; align-items: center; justify-content: center; cursor: pointer; color: var(--text-muted); transition: 0.2s; font-size: 0.55rem; gap: 2px; font-weight: 500; }
        .nav-item i { font-size: 1.1rem; }
        .nav-item:hover { background: var(--bg-input); color: var(--text-main); }
        .nav-item.active { background: rgba(0, 118, 206, 0.15); color: var(--pro-blue); }

        .main-content { flex: 1; padding: 1rem 1.25rem; overflow-y: auto; }
        .view-section { display: none; animation: fadeIn 0.2s ease; }
        .view-section.active { display: block; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

        /* TOP 3 */
        .top3-card {
            background: linear-gradient(135deg, rgba(255,215,0,0.08), rgba(255,215,0,0.02));
            border: 2px solid var(--star-gold); border-radius: 10px; padding: 0.9rem 1rem; margin-bottom: 1rem;
        }
        .top3-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.6rem; }
        .top3-title { font-weight: 700; font-size: 0.9rem; color: var(--star-gold); display: flex; align-items: center; gap: 6px; }
        .top3-count { font-size: 0.7rem; color: var(--text-muted); }
        .top3-list { display: flex; flex-direction: column; gap: 6px; }
        .top3-empty { color: var(--text-muted); font-size: 0.8rem; text-align: center; padding: 0.75rem; }

        /* COCKPIT */
        .cockpit-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.9rem; }
        .day-info { display: flex; flex-direction: column; gap: 3px; }
        .day-badge { padding: 7px 14px; border-radius: 18px; font-weight: 800; text-transform: uppercase; letter-spacing: 1px; font-size: 0.75rem; display: inline-flex; align-items: center; gap: 6px; color: white; }
        .greeting { color: var(--text-muted); font-size: 0.8rem; }

        /* PILLAR GRID */
        .pillar-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 0.75rem;
            margin-bottom: 1rem;
        }

        .pillar-card {
            background: var(--bg-panel);
            border: 1px solid var(--border);
            border-radius: 10px;
            padding: 0.9rem;
            display: flex;
            flex-direction: column;
            transition: opacity 0.3s, filter 0.3s;
            position: relative;
            min-height: 200px;
        }

        .pillar-card.focus { opacity: 1; filter: none; border-width: 2px; }
        .pillar-card.medium { opacity: 0.7; filter: none; }
        .pillar-card.light { opacity: 0.5; filter: saturate(0.7); }
        .pillar-card.faded { opacity: 0.35; filter: saturate(0.5) blur(0.5px); }

        .pillar-card.focus.pro { border-color: var(--pro-blue); }
        .pillar-card.focus.saas { border-color: var(--saas-green); }
        .pillar-card.focus.vie { border-color: var(--vie-pink); }
        .pillar-card.focus.patri { border-color: var(--patri-purple); }

        .pillar-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.6rem; padding-bottom: 0.5rem; border-bottom: 1px solid var(--border); }
        .pillar-title { font-weight: 600; font-size: 0.85rem; display: flex; align-items: center; gap: 5px; }
        .pillar-badge { font-size: 0.6rem; padding: 2px 6px; border-radius: 6px; font-weight: 600; }

        .pillar-focus-tag {
            position: absolute; top: -8px; right: 10px;
            background: var(--star-gold); color: black;
            font-size: 0.55rem; font-weight: 700; padding: 2px 8px;
            border-radius: 4px; text-transform: uppercase;
        }

        /* TASK ROWS */
        .task-row { display: flex; align-items: center; padding: 6px 0; border-bottom: 1px dashed var(--border); transition: background 0.2s; }
        .task-row:last-child { border-bottom: none; }
        .task-row:hover { background: rgba(255,255,255,0.02); }
        .task-check { appearance: none; width: 16px; height: 16px; border: 2px solid var(--text-muted); border-radius: 4px; margin-right: 8px; cursor: pointer; position: relative; transition: 0.2s; flex-shrink: 0; }
        .task-check:checked { background: var(--saas-green); border-color: var(--saas-green); }
        .task-check:checked::after { content: '✓'; position: absolute; color: black; font-weight: bold; font-size: 10px; left: 2px; top: -2px; }
        .task-content { flex: 1; font-size: 0.8rem; line-height: 1.3; cursor: pointer; }
        .task-done .task-content { text-decoration: line-through; color: var(--text-muted); cursor: default; }
        .task-star { background: none; border: none; cursor: pointer; font-size: 0.9rem; color: var(--text-muted); padding: 2px 4px; transition: 0.2s; }
        .task-star:hover { color: var(--star-gold); }
        .task-star.active { color: var(--star-gold); }
        .task-delete { background: none; border: none; color: var(--text-muted); cursor: pointer; opacity: 0; transition: 0.2s; padding: 2px 4px; font-size: 0.8rem; }
        .task-row:hover .task-delete { opacity: 1; }
        .task-delete:hover { color: var(--alert-red); }
        .task-type-dot { width: 6px; height: 6px; border-radius: 50%; margin-right: 6px; flex-shrink: 0; }

        .empty-state { text-align: center; padding: 1rem; color: var(--text-muted); font-size: 0.75rem; }
        .add-task-btn { width: 100%; padding: 6px; background: transparent; border: 1px dashed var(--border); color: var(--text-muted); cursor: pointer; border-radius: 5px; font-size: 0.7rem; margin-top: 8px; transition: 0.2s; }
        .add-task-btn:hover { border-color: var(--text-muted); color: var(--text-main); }

        /* JOURNAL */
        .journal-section { background: var(--bg-panel); border: 1px solid var(--border); border-radius: 10px; overflow: hidden; margin-top: 1rem; }
        .journal-header { display: flex; justify-content: space-between; align-items: center; padding: 0.6rem 0.9rem; cursor: pointer; transition: background 0.2s; }
        .journal-header:hover { background: var(--bg-input); }
        .journal-title { font-size: 0.75rem; font-weight: 600; color: var(--text-muted); }
        .journal-toggle { font-size: 0.75rem; color: var(--text-muted); }
        .journal-body { max-height: 0; overflow: hidden; transition: max-height 0.3s ease; padding: 0 0.9rem; }
        .journal-body.expanded { max-height: 250px; padding: 0.6rem 0.9rem; border-top: 1px solid var(--border); }
        .journal-input-row { display: flex; gap: 6px; margin-bottom: 8px; }
        .journal-input { flex: 1; background: var(--bg-input); border: 1px solid var(--border); border-radius: 5px; padding: 6px 8px; color: var(--text-main); font-family: inherit; font-size: 0.75rem; }
        .journal-input:focus { border-color: var(--pro-blue); }
        .journal-entries { max-height: 100px; overflow-y: auto; }
        .journal-entry { padding: 4px 0; border-bottom: 1px dashed var(--border); font-size: 0.7rem; display: flex; gap: 6px; }
        .journal-entry:last-child { border-bottom: none; }
        .journal-time { color: var(--pro-blue); font-family: 'JetBrains Mono'; font-size: 0.65rem; flex-shrink: 0; }
        .journal-text { color: var(--text-muted); }

        /* TABLES */
        .smart-table { width: 100%; border-collapse: collapse; font-size: 0.8rem; }
        .smart-table th { text-align: left; padding: 8px 6px; color: var(--text-muted); border-bottom: 1px solid var(--border); font-size: 0.65rem; text-transform: uppercase; }
        .smart-table td { padding: 8px 6px; border-bottom: 1px solid var(--border); vertical-align: middle; }
        .add-row-btn { margin-top: 8px; width: 100%; padding: 8px; background: var(--bg-input); border: 1px dashed var(--border); color: var(--text-muted); cursor: pointer; border-radius: 6px; font-size: 0.75rem; transition: 0.2s; }
        .add-row-btn:hover { border-color: var(--text-muted); color: var(--text-main); }

        /* PROJECTS */
        .project-card { background: var(--bg-panel); border: 1px solid var(--border); border-radius: 10px; padding: 1rem; margin-bottom: 0.9rem; }
        .project-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.6rem; }
        .project-title { font-weight: 600; font-size: 0.95rem; display: flex; align-items: center; gap: 6px; }
        .timeline-track { height: 6px; background: var(--bg-input); border-radius: 3px; margin: 8px 0; overflow: hidden; }
        .timeline-bar { height: 100%; background: linear-gradient(90deg, var(--pro-blue), var(--saas-green)); width: 0%; transition: width 0.5s; border-radius: 3px; }
        .project-input-row { display: flex; gap: 6px; margin-top: 8px; }
        .project-input { flex: 1; background: var(--bg-input); border: 1px solid var(--border); border-radius: 5px; padding: 7px 9px; color: var(--text-main); font-family: inherit; font-size: 0.8rem; }
        .project-input:focus { border-color: var(--patri-purple); }

        /* WEEK VIEW */
        .week-grid { display: grid; grid-template-columns: repeat(6, 1fr); gap: 6px; margin-top: 1rem; }
        .week-day { background: var(--bg-panel); border: 1px solid var(--border); border-radius: 8px; padding: 0.6rem; text-align: center; transition: 0.2s; }
        .week-day:hover { border-color: var(--text-muted); }
        .week-day.today { border-color: var(--saas-green); box-shadow: 0 0 8px rgba(0, 220, 130, 0.15); }
        .week-day-name { font-weight: 600; font-size: 0.8rem; margin-bottom: 2px; }
        .week-day-theme { font-size: 0.6rem; color: var(--text-muted); }

        .rules-card { background: var(--bg-panel); border: 1px solid var(--border); border-radius: 10px; padding: 0.9rem; margin-top: 1rem; }
        .rules-card h3 { font-size: 0.85rem; margin-bottom: 0.6rem; color: var(--warn-orange); }
        .rules-list { list-style: none; color: var(--text-muted); font-size: 0.75rem; line-height: 1.7; }
        .rules-list li::before { content: "→ "; color: var(--pro-blue); }

        /* TIMER */
        .timer-float { position: fixed; bottom: 12px; right: 12px; background: var(--bg-panel); border: 1px solid var(--border); padding: 8px 14px; border-radius: 35px; display: flex; align-items: center; gap: 8px; box-shadow: 0 6px 20px rgba(0,0,0,0.4); z-index: 100; }
        .timer-float.active { border-color: var(--saas-green); }
        .timer-float.hidden { display: none; }
        .timer-time { font-family: 'JetBrains Mono'; font-size: 1rem; font-weight: bold; }
        .timer-btn { background: none; border: none; font-size: 0.9rem; cursor: pointer; color: var(--text-main); padding: 2px; transition: 0.2s; }
        .timer-btn:hover { color: var(--saas-green); }
        .timer-btn.active { color: var(--alert-red); }

        /* FOCUS MODE */
        .focus-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: var(--bg-dark); z-index: 500; display: none; flex-direction: column; align-items: center; justify-content: center; }
        .focus-overlay.show { display: flex; }
        .focus-exit { position: absolute; top: 12px; right: 15px; background: none; border: 1px solid var(--border); color: var(--text-muted); padding: 7px 14px; border-radius: 5px; cursor: pointer; font-size: 0.8rem; }
        .focus-exit:hover { color: var(--text-main); border-color: var(--text-main); }
        .focus-type { color: var(--text-muted); font-size: 0.8rem; margin-bottom: 0.6rem; font-weight: 600; }
        .focus-task { font-size: 1.3rem; font-weight: 700; text-align: center; max-width: 500px; margin-bottom: 1.25rem; line-height: 1.4; }
        .focus-timer { font-family: 'JetBrains Mono'; font-size: 3rem; font-weight: bold; color: var(--saas-green); margin-bottom: 1.25rem; }
        .focus-controls { display: flex; gap: 0.6rem; }
        .focus-btn { padding: 9px 20px; border-radius: 7px; border: none; cursor: pointer; font-weight: 600; font-size: 0.85rem; transition: 0.2s; }
        .focus-btn.primary { background: var(--saas-green); color: black; }
        .focus-btn.secondary { background: var(--bg-input); color: var(--text-main); border: 1px solid var(--border); }
        .focus-btn:hover { opacity: 0.9; }

        /* MODALS */
        .modal-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.95); z-index: 999; display: none; justify-content: center; align-items: center; }
        .modal-overlay.show { display: flex; }
        .modal-content { text-align: center; max-width: 380px; padding: 1.75rem; border: 1px solid var(--border); background: var(--bg-panel); border-radius: 14px; }
        .shutdown-icon { font-size: 2.2rem; margin-bottom: 0.6rem; }
        .shutdown-title { font-size: 1.2rem; font-weight: 800; color: var(--warn-orange); margin-bottom: 0.3rem; }
        .shutdown-subtitle { color: var(--text-muted); margin-bottom: 0.9rem; font-size: 0.8rem; }
        .shutdown-checklist { text-align: left; margin: 0.9rem 0; }
        .shutdown-item { display: flex; align-items: center; gap: 8px; padding: 6px 0; border-bottom: 1px dashed var(--border); color: var(--text-muted); font-size: 0.8rem; }
        .shutdown-item:last-child { border-bottom: none; }
        .shutdown-item input[type="checkbox"] { width: 15px; height: 15px; accent-color: var(--saas-green); }
        .shutdown-item input[type="text"] { flex: 1; background: var(--bg-input); border: 1px solid var(--border); border-radius: 5px; padding: 5px; color: var(--text-main); font-size: 0.75rem; }
        .shutdown-btn { background: var(--warn-orange); color: black; border: none; padding: 10px 20px; font-weight: 700; cursor: pointer; width: 100%; border-radius: 7px; font-size: 0.85rem; margin-top: 0.6rem; }
        .shutdown-btn:hover { background: #FFB033; }
        
        /* IMPORT AI MODAL */
        .ai-step { text-align: left; margin-bottom: 1rem; border-bottom: 1px dashed var(--border); padding-bottom: 1rem; }
        .ai-label { font-size: 0.75rem; color: var(--text-muted); font-weight: 600; display: block; margin-bottom: 0.5rem; }
        .import-area { width: 100%; height: 100px; background: var(--bg-input); border: 1px solid var(--border); color: var(--saas-green); font-family: 'JetBrains Mono'; font-size: 0.7rem; padding: 10px; border-radius: 8px; margin-bottom: 10px; }
        .copy-prompt-btn { background: var(--pro-blue); color: white; border: none; padding: 8px 12px; border-radius: 5px; cursor: pointer; font-size: 0.75rem; font-weight: 600; display: flex; align-items: center; gap: 6px; width: 100%; justify-content: center; }
        .copy-prompt-btn:hover { opacity: 0.9; }

        .hidden { display: none !important; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: var(--bg-dark); }
        ::-webkit-scrollbar-thumb { background: var(--border); border-radius: 2px; }

        @media (max-width: 1100px) { .pillar-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 768px) {
            .sidebar { width: 50px; }
            .nav-item { width: 38px; height: 38px; }
            .nav-item span { display: none; }
            .braindump-wrapper { display: none; }
            .pillar-grid { grid-template-columns: 1fr; }
            .week-grid { grid-template-columns: repeat(3, 1fr); }
        }
    </style>
</head>
<body>

<header id="main-header">
    <div class="brand">HUZINE<span>//OS</span><span class="crisis-tag hidden" id="crisis-tag">CRISE</span></div>
    <div class="braindump-wrapper">
        <span class="braindump-icon">⚡</span>
        <input type="text" id="braindump-input" class="braindump-input" placeholder="Capture rapide... (Entrée)">
    </div>
    <div class="header-controls">
        <div id="clock">00:00</div>
        <button class="btn-header" onclick="openAiImport()" style="border-color:var(--patri-purple); color:var(--patri-purple);" title="Importer des tâches IA">📥 IMPORT IA</button>
        <button class="btn-header" id="btn-focus" onclick="toggleFocusMode()">🎯 FOCUS</button>
        <button class="btn-header crisis" id="btn-crisis" onclick="toggleCrisisMode()">🚨</button>
        <button class="btn-header" onclick="exportData()">💾</button>
        <button class="btn-icon" onclick="document.getElementById('import-file').click()">📂</button>
        <input type="file" id="import-file" style="display:none" onchange="importData(this)">
    </div>
</header>

<div class="container">
    <nav class="sidebar">
        <div class="nav-item active" onclick="switchTab('dashboard', this)"><i>🚀</i><span>Day</span></div>
        <div class="nav-item" onclick="switchTab('pro', this)"><i>💼</i><span>Pro</span></div>
        <div class="nav-item" onclick="switchTab('saas', this)"><i>💻</i><span>SaaS</span></div>
        <div class="nav-item" onclick="switchTab('vie', this)"><i>🧬</i><span>Vie</span></div>
        <div class="nav-item" onclick="switchTab('patrimoine', this)"><i>🏗️</i><span>Patri</span></div>
        <div class="nav-item" onclick="switchTab('review', this)"><i>📅</i><span>Plan</span></div>
    </nav>

    <main class="main-content">
        <!-- VUES (Identique V5) -->
        <!-- DASHBOARD -->
        <section id="view-dashboard" class="view-section active">
            <div class="cockpit-header">
                <div class="day-info">
                    <div id="day-badge" class="day-badge">CHARGEMENT...</div>
                    <div class="greeting"><span id="greeting-text">Bonjour</span>, Huzine.</div>
                </div>
                <button onclick="openShutdown()" style="background:transparent; border:1px solid var(--warn-orange); color:var(--warn-orange); padding:7px 12px; border-radius:6px; cursor:pointer; font-weight:600; font-size:0.75rem;">🌙 Shutdown</button>
            </div>

            <!-- TOP 3 -->
            <div class="top3-card">
                <div class="top3-header">
                    <span class="top3-title">⭐ TOP 3 DU JOUR</span>
                    <span class="top3-count" id="top3-count">0/3</span>
                </div>
                <div class="top3-list" id="top3-list">
                    <div class="top3-empty">Clique sur ⭐ pour marquer tes priorités</div>
                </div>
            </div>

            <!-- 4 PILLAR CARDS -->
            <div class="pillar-grid" id="pillar-grid"></div>

            <!-- JOURNAL -->
            <div class="journal-section">
                <div class="journal-header" onclick="toggleJournal()">
                    <span class="journal-title">📝 Journal de transition</span>
                    <span class="journal-toggle" id="journal-toggle">▼ Afficher</span>
                </div>
                <div class="journal-body" id="journal-body">
                    <div class="journal-input-row">
                        <input type="text" id="journal-input" class="journal-input" placeholder="Comment je me sens ?">
                        <button onclick="addJournalEntry()" class="btn-icon" style="width:28px;height:28px;font-size:0.8rem;">+</button>
                    </div>
                    <div class="journal-entries" id="journal-entries"></div>
                </div>
            </div>
        </section>

        <!-- PRO -->
        <section id="view-pro" class="view-section">
            <h2 style="color:var(--pro-blue); margin-bottom:1rem; font-size:1rem;">💼 PRO / Dell</h2>
            <div class="project-card">
                <table class="smart-table">
                    <thead><tr><th width="25"></th><th>Tâche</th><th width="50">⭐</th><th width="35"></th></tr></thead>
                    <tbody id="table-pro-body"></tbody>
                </table>
                <button onclick="addNewTask('pro')" class="add-row-btn">+ Ajouter tâche PRO</button>
            </div>
        </section>

        <!-- SAAS -->
        <section id="view-saas" class="view-section">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:1rem;">
                <h2 style="color:var(--saas-green); font-size:1rem;">💻 SaaS / Nutri-Track</h2>
                <div style="display:flex; gap:6px;">
                    <input type="text" id="input-mrr" placeholder="MRR €" style="background:var(--bg-input); border:1px solid var(--border); padding:5px 8px; color:white; width:80px; border-radius:5px; font-size:0.8rem;" onchange="updateMetrics()">
                    <input type="text" id="input-users" placeholder="Users" style="background:var(--bg-input); border:1px solid var(--border); padding:5px 8px; color:white; width:70px; border-radius:5px; font-size:0.8rem;" onchange="updateMetrics()">
                </div>
            </div>
            <div class="project-card">
                <table class="smart-table">
                    <thead><tr><th width="25"></th><th>Feature / Tâche</th><th width="50">⭐</th><th width="35"></th></tr></thead>
                    <tbody id="table-saas-body"></tbody>
                </table>
                <button onclick="addNewTask('saas')" class="add-row-btn">+ Ajouter tâche SaaS</button>
            </div>
        </section>

        <!-- VIE -->
        <section id="view-vie" class="view-section">
            <h2 style="color:var(--vie-pink); margin-bottom:1rem; font-size:1rem;">🧬 Vie / Admin</h2>
            <div class="project-card">
                <table class="smart-table">
                    <thead><tr><th width="25"></th><th>Tâche</th><th width="50">⭐</th><th width="35"></th></tr></thead>
                    <tbody id="table-vie-body"></tbody>
                </table>
                <button onclick="addNewTask('vie')" class="add-row-btn">+ Ajouter (docteur, admin, famille...)</button>
            </div>
        </section>

        <!-- PATRIMOINE -->
        <section id="view-patrimoine" class="view-section">
            <h2 style="color:var(--patri-purple); margin-bottom:1rem; font-size:1rem;">🏗️ Patrimoine</h2>
            
            <div class="project-card" style="border-left: 3px solid var(--patri-purple);">
                <div class="project-header">
                    <div class="project-title">🇩🇿 Annaba</div>
                    <span style="font-size:0.7rem; color:var(--text-muted);">Fin: <input type="date" id="date-annaba" style="background:none; border:none; color:var(--text-main); font-size:0.7rem;" onchange="saveData()"></span>
                </div>
                <div class="timeline-track"><div class="timeline-bar" id="bar-annaba"></div></div>
                <div id="list-annaba"></div>
                <div class="project-input-row">
                    <input type="text" id="input-annaba" class="project-input" placeholder="Nouveau jalon...">
                    <button onclick="addProjectTask('annaba')" class="btn-icon">+</button>
                </div>
            </div>

            <div class="project-card" style="border-left: 3px solid var(--warn-orange);">
                <div class="project-header">
                    <div class="project-title">🏢 Copropriété</div>
                    <span style="font-size:0.7rem; color:var(--text-muted);">Fin: <input type="date" id="date-copro" style="background:none; border:none; color:var(--text-main); font-size:0.7rem;" onchange="saveData()"></span>
                </div>
                <div class="timeline-track"><div class="timeline-bar" id="bar-copro" style="background: linear-gradient(90deg, var(--warn-orange), var(--patri-purple));"></div></div>
                <div id="list-copro"></div>
                <div class="project-input-row">
                    <input type="text" id="input-copro" class="project-input" placeholder="Nouveau jalon...">
                    <button onclick="addProjectTask('copro')" class="btn-icon">+</button>
                </div>
            </div>

            <div class="project-card">
                <div class="project-header"><div class="project-title">🏠 Airbnb</div><span style="font-size:0.65rem; color:var(--text-muted);">Hebdo</span></div>
                <div id="list-airbnb"></div>
                <div class="project-input-row">
                    <input type="text" id="input-airbnb" class="project-input" placeholder="Tâche récurrente...">
                    <button onclick="addProjectTask('airbnb')" class="btn-icon">+</button>
                </div>
            </div>

            <div class="project-card">
                <div class="project-header"><div class="project-title">🏡 Maison</div><span style="font-size:0.65rem; color:var(--text-muted);">Mensuel</span></div>
                <div id="list-maison"></div>
                <div class="project-input-row">
                    <input type="text" id="input-maison" class="project-input" placeholder="Tâche récurrente...">
                    <button onclick="addProjectTask('maison')" class="btn-icon">+</button>
                </div>
            </div>
        </section>

        <!-- REVIEW -->
        <section id="view-review" class="view-section">
            <h2 style="margin-bottom:1rem; font-size:1rem;">📅 Architecture Semaine</h2>
            <div class="week-grid" id="week-grid"></div>
            <div class="rules-card">
                <h3>⚡ Règles d'Or</h3>
                <ul class="rules-list">
                    <li><strong>18h30-21h30</strong> : Famille INTOUCHABLE</li>
                    <li><strong>22h45</strong> : Shutdown Protocol</li>
                    <li><strong>Top 3</strong> : Max 3 priorités/jour</li>
                    <li><strong>Vendredi</strong> : Patrimoine Friday</li>
                    <li><strong>Week-end</strong> : Vie + Patrimoine focus</li>
                </ul>
            </div>
            <div class="project-card" style="margin-top:1rem;">
                <div class="pillar-header"><span class="pillar-title">📝 Weekly Review</span></div>
                <div style="display:flex; flex-direction:column; gap:10px;">
                    <div>
                        <label style="font-size:0.7rem; color:var(--text-muted); display:block; margin-bottom:3px;">1. Victoire de la semaine ?</label>
                        <input type="text" id="review-win" class="project-input" style="width:100%;" onchange="saveReview()">
                    </div>
                    <div>
                        <label style="font-size:0.7rem; color:var(--text-muted); display:block; margin-bottom:3px;">2. Ce qui n'a pas fonctionné ?</label>
                        <input type="text" id="review-fail" class="project-input" style="width:100%;" onchange="saveReview()">
                    </div>
                    <div>
                        <label style="font-size:0.7rem; color:var(--text-muted); display:block; margin-bottom:3px;">3. PRIORITÉ semaine prochaine ?</label>
                        <input type="text" id="review-priority" class="project-input" style="width:100%;" onchange="saveReview()">
                        <button onclick="createTaskFromPriority()" style="margin-top:6px; background:var(--saas-green); color:black; border:none; padding:7px 14px; border-radius:5px; cursor:pointer; font-size:0.75rem; font-weight:600;">→ Créer comme TOP 3</button>
                    </div>
                </div>
            </div>
        </section>
    </main>
</div>

<!-- TIMER -->
<div class="timer-float" id="timer-float">
    <div class="timer-time" id="timer-display">00:00</div>
    <button class="timer-btn" id="btn-timer-toggle" onclick="toggleTimer()">▶</button>
    <button class="timer-btn" onclick="resetTimer()">↺</button>
</div>

<!-- FOCUS -->
<div class="focus-overlay" id="focus-overlay">
    <button class="focus-exit" onclick="exitFocusMode()">✕ Quitter</button>
    <div class="focus-type" id="focus-type-label">PRO</div>
    <div class="focus-task" id="focus-task-text">Sélectionne une tâche</div>
    <div class="focus-timer" id="focus-timer-display">00:00</div>
    <div class="focus-controls">
        <button class="focus-btn secondary" id="focus-toggle-btn" onclick="toggleFocusTimer()">▶ Timer</button>
        <button class="focus-btn primary" onclick="completeFocusTask()">✓ TERMINÉ</button>
        <button class="focus-btn secondary" onclick="nextFocusTask()">→ SUIVANTE</button>
    </div>
</div>

<!-- SHUTDOWN -->
<div class="modal-overlay" id="shutdown-modal">
    <div class="modal-content">
        <div class="shutdown-icon">🌙</div>
        <div class="shutdown-title">SHUTDOWN</div>
        <div class="shutdown-subtitle">22h45 — Préparation sommeil</div>
        <div class="shutdown-checklist">
            <div class="shutdown-item"><input type="checkbox"><label>Victoire notée</label></div>
            <div class="shutdown-item"><input type="checkbox"><label>Top 3 demain:</label></div>
            <div class="shutdown-item" style="padding-left:23px;"><input type="text" id="shutdown-tomorrow" placeholder="1. / 2. / 3."></div>
            <div class="shutdown-item"><input type="checkbox"><label>Écrans éteints</label></div>
        </div>
        <button onclick="closeShutdown()" class="shutdown-btn">BONNE NUIT 💪</button>
    </div>
</div>

<!-- AI IMPORT MODAL -->
<div class="modal-overlay" id="ai-import-modal">
    <div class="modal-content" style="max-width:500px;">
        <div class="shutdown-title" style="color:var(--patri-purple);">📥 IMPORT IA</div>
        <div class="shutdown-subtitle" style="margin-bottom:1rem;">Transforme tes PDF en tâches instantanément</div>
        
        <div class="ai-step">
            <span class="ai-label">1. GÉNÉRER AVEC L'IA</span>
            <button onclick="copyAgentPrompt()" class="copy-prompt-btn">
                📋 COPIER LE PROMPT AGENT
            </button>
            <div style="font-size:0.65rem; color:var(--text-muted); margin-top:5px;">Colle ça dans ChatGPT + ton document (PDF/Texte)</div>
        </div>

        <div class="ai-step" style="border-bottom:none; margin-bottom:0;">
            <span class="ai-label">2. COLLER LE RÉSULTAT</span>
            <textarea id="ai-import-text" class="import-area" placeholder='Colle le bloc JSON ici (ex: [{"type":"annaba", ...}])'></textarea>
            <div style="display:flex; gap:10px;">
                <button onclick="document.getElementById('ai-import-modal').classList.remove('show')" class="shutdown-btn" style="background:var(--bg-input); color:var(--text-main);">ANNULER</button>
                <button onclick="processAiImport()" class="shutdown-btn" style="background:var(--patri-purple);">IMPORTER</button>
            </div>
        </div>
    </div>
</div>

<script>
// ===============================================
// AGENT PROMPT STRING
// ===============================================
const AGENT_PROMPT = `
# RÔLE :
Tu es mon "Project Slicer" expert (Méthodologie GTD + Agile). Je suis Huzine, Tech Manager (Dell), Père de 3 enfants.

# MISSION :
Analyse le document ou le texte que je te fournis ci-joint.
1. DÉCOUPE ce projet en une liste d'actions concrètes (45-60 min max).
2. CLASSE-les dans les bonnes catégories.
3. GÉNÈRE UNIQUEMENT UN BLOC JSON strict (sans texte avant/après).

# CATÉGORIES VALIDES ("type") :
- "pro" (Dell, Management)
- "saas" (Dev, Nutri-Track)
- "vie" (Admin, Famille, Santé)
- "annaba" (Rénovation Algérie)
- "copro" (Syndic)
- "airbnb" (Gestion locative)
- "maison" (Entretien domicile)

# FORMAT DE SORTIE (JSON LIST) :
[
  {"type": "annaba", "text": "Action précise 1", "priority": "H"},
  {"type": "pro", "text": "Action précise 2", "priority": "M"}
]

Attends mon document.
`;

// ===============================================
// DATA
// ===============================================
const defaultData = {
    tasks: [],
    metrics: { mrr: '0', users: '0' },
    settings: { annabaDate: '', coproDate: '', crisisMode: false },
    journal: [],
    review: { win: '', fail: '', priority: '' }
};

let data = JSON.parse(localStorage.getItem('huzine_os_v5')) || JSON.parse(JSON.stringify(defaultData));
data.tasks.forEach(t => { if (t.todayStar === undefined) t.todayStar = false; });
if (data.settings.crisisMode === undefined) data.settings.crisisMode = false;

// ===============================================
// DAY CONFIG
// ===============================================
const dayConfig = {
    0: { focus: 'vie', medium: 'patri', light: 'pro', faded: 'saas', label: 'WEEK-END', color: 'var(--vie-pink)' },
    1: { focus: 'pro', medium: 'saas', light: 'vie', faded: 'patri', label: 'PRO FOCUS', color: 'var(--pro-blue)' },
    2: { focus: 'saas', medium: 'pro', light: 'vie', faded: 'patri', label: 'SAAS FOCUS', color: 'var(--saas-green)' },
    3: { focus: 'pro', medium: 'patri', light: 'vie', faded: 'saas', label: 'PRO + PATRI', color: 'var(--pro-blue)' },
    4: { focus: 'saas', medium: 'pro', light: 'vie', faded: 'patri', label: 'SAAS FOCUS', color: 'var(--saas-green)' },
    5: { focus: 'patri', medium: 'pro', light: 'vie', faded: 'saas', label: 'PATRIMOINE', color: 'var(--patri-purple)' },
    6: { focus: 'vie', medium: 'patri', light: 'pro', faded: 'saas', label: 'WEEK-END', color: 'var(--vie-pink)' }
};

const pillarInfo = {
    pro: { icon: '💼', name: 'PRO', color: 'var(--pro-blue)', types: ['pro'] },
    saas: { icon: '💻', name: 'SaaS', color: 'var(--saas-green)', types: ['saas'] },
    vie: { icon: '🧬', name: 'Vie', color: 'var(--vie-pink)', types: ['vie'] },
    patri: { icon: '🏗️', name: 'Patrimoine', color: 'var(--patri-purple)', types: ['annaba', 'copro', 'airbnb', 'maison'] }
};

// ===============================================
// INIT
// ===============================================
function init() {
    updateClock();
    setInterval(updateClock, 1000);
    setInterval(checkShutdownTime, 60000);
    
    setupDay();
    renderAll();
    renderWeekGrid();
    loadReview();
    cleanJournalIfNewDay();
    updateCrisisUI();
    
    document.getElementById('braindump-input').addEventListener('keypress', e => {
        if (e.key === 'Enter' && e.target.value.trim()) {
            addTask('vie', e.target.value.trim());
            e.target.value = '';
        }
    });
    
    document.getElementById('journal-input').addEventListener('keypress', e => {
        if (e.key === 'Enter' && e.target.value.trim()) addJournalEntry();
    });
}

function saveData() {
    const dateAnnaba = document.getElementById('date-annaba');
    const dateCopro = document.getElementById('date-copro');
    if (dateAnnaba) data.settings.annabaDate = dateAnnaba.value;
    if (dateCopro) data.settings.coproDate = dateCopro.value;
    localStorage.setItem('huzine_os_v5', JSON.stringify(data));
    renderAll();
}

// ===============================================
// SETUP DAY
// ===============================================
function setupDay() {
    const days = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    const now = new Date();
    const dayIdx = now.getDay();
    const hour = now.getHours();
    const config = dayConfig[dayIdx];

    const badge = document.getElementById('day-badge');
    const greetingText = document.getElementById('greeting-text');

    if (hour < 12) greetingText.textContent = 'Bon matin';
    else if (hour < 18) greetingText.textContent = 'Bon après-midi';
    else greetingText.textContent = 'Bonne soirée';

    badge.textContent = config.label + ' // ' + days[dayIdx];
    badge.style.background = config.color;
}

// ===============================================
// RENDER PILLAR GRID
// ===============================================
function renderPillarGrid() {
    const dayIdx = new Date().getDay();
    const config = dayConfig[dayIdx];
    const grid = document.getElementById('pillar-grid');
    
    const order = [config.focus, config.medium, config.light, config.faded];
    const levels = { [config.focus]: 'focus', [config.medium]: 'medium', [config.light]: 'light', [config.faded]: 'faded' };
    
    grid.innerHTML = order.map(pillarKey => {
        const info = pillarInfo[pillarKey];
        const level = levels[pillarKey];
        const tasks = data.tasks.filter(t => info.types.includes(t.type));
        const activeTasks = tasks.filter(t => !t.done).slice(0, 4);
        const doneCount = tasks.filter(t => t.done).length;
        const totalCount = tasks.length;
        
        return `
            <div class="pillar-card ${level} ${pillarKey}" style="border-top: 3px solid ${info.color};">
                ${level === 'focus' ? '<div class="pillar-focus-tag">FOCUS</div>' : ''}
                <div class="pillar-header">
                    <span class="pillar-title" style="color:${info.color}">${info.icon} ${info.name}</span>
                    <span class="pillar-badge" style="background:${info.color}20; color:${info.color};">${totalCount - doneCount}</span>
                </div>
                <div class="pillar-tasks">
                    ${activeTasks.length === 0 ? '<div class="empty-state">Aucune tâche</div>' : 
                        activeTasks.map(t => `
                            <div class="task-row" data-id="${t.id}">
                                <input type="checkbox" class="task-check" onclick="event.stopPropagation(); toggleTask(${t.id})">
                                <span class="task-content" onclick="startFocusOnTask(${t.id})" style="cursor:pointer;">${escapeHtml(t.text)}</span>
                                <button class="task-star ${t.todayStar ? 'active' : ''}" onclick="event.stopPropagation(); toggleStar(${t.id})">${t.todayStar ? '⭐' : '☆'}</button>
                            </div>
                        `).join('')
                    }
                </div>
                <button class="add-task-btn" onclick="addNewTask('${info.types[0]}')">+ Ajouter</button>
            </div>
        `;
    }).join('');
}

// ===============================================
// TASKS
// ===============================================
function addTask(type, text, priority = 'M') {
    data.tasks.unshift({
        id: Date.now() + Math.floor(Math.random() * 1000),
        type, text, done: false, priority,
        todayStar: false, createdAt: new Date().toISOString()
    });
    saveData();
}

function toggleTask(id) {
    const task = data.tasks.find(t => t.id === id);
    if (task) { task.done = !task.done; if (task.done) task.todayStar = false; saveData(); }
}

function deleteTask(id) {
    data.tasks = data.tasks.filter(t => t.id !== id);
    saveData();
}

function toggleStar(id) {
    const task = data.tasks.find(t => t.id === id);
    if (!task) return;
    const currentStars = data.tasks.filter(t => t.todayStar && !t.done).length;
    if (task.todayStar) { task.todayStar = false; }
    else if (currentStars < 3) { task.todayStar = true; }
    else { alert('Max 3 tâches TOP !'); return; }
    saveData();
}

function addNewTask(type) {
    const text = prompt(`Nouvelle tâche :`);
    if (text && text.trim()) addTask(type, text.trim());
}

function addProjectTask(type) {
    const input = document.getElementById('input-' + type);
    if (input && input.value.trim()) { addTask(type, input.value.trim()); input.value = ''; }
}

// ===============================================
// AI IMPORT LOGIC
// ===============================================
function openAiImport() {
    document.getElementById('ai-import-modal').classList.add('show');
}

function copyAgentPrompt() {
    navigator.clipboard.writeText(AGENT_PROMPT.trim()).then(function() {
        const btn = document.querySelector('.copy-prompt-btn');
        const originalText = btn.innerHTML;
        btn.innerHTML = "✅ PROMPT COPIÉ !";
        setTimeout(() => { btn.innerHTML = originalText; }, 2000);
    }, function(err) {
        alert('Erreur de copie. Sélectionnez le texte manuellement.');
    });
}

function processAiImport() {
    const raw = document.getElementById('ai-import-text').value;
    try {
        // Nettoyage basique si l'utilisateur colle du markdown ```json ... ```
        const cleanRaw = raw.replace(/```json/g, '').replace(/```/g, '').trim();
        const importedTasks = JSON.parse(cleanRaw);
        
        if(!Array.isArray(importedTasks)) throw new Error("Format incorrect");
        
        let count = 0;
        importedTasks.forEach(t => {
            if(t.text && t.type) {
                addTask(t.type, t.text, t.priority || 'M');
                count++;
            }
        });
        
        document.getElementById('ai-import-text').value = '';
        document.getElementById('ai-import-modal').classList.remove('show');
        alert(count + " tâches importées avec succès !");
    } catch(e) {
        alert("Erreur : Le texte collé n'est pas un JSON valide. Demandez à l'IA de corriger.");
    }
}

// ===============================================
// CRISIS MODE
// ===============================================
function toggleCrisisMode() {
    data.settings.crisisMode = !data.settings.crisisMode;
    saveData();
    updateCrisisUI();
}

function updateCrisisUI() {
    const header = document.getElementById('main-header');
    const crisisTag = document.getElementById('crisis-tag');
    const btnCrisis = document.getElementById('btn-crisis');
    if (data.settings.crisisMode) {
        header.classList.add('crisis-active');
        crisisTag.classList.remove('hidden');
        btnCrisis.classList.add('active');
    } else {
        header.classList.remove('crisis-active');
        crisisTag.classList.add('hidden');
        btnCrisis.classList.remove('active');
    }
}

// ===============================================
// RENDER ALL
// ===============================================
function renderAll() {
    renderTop3();
    renderPillarGrid();
    renderTable('table-pro-body', 'pro');
    renderTable('table-saas-body', 'saas');
    renderTable('table-vie-body', 'vie');
    renderProjectList('list-annaba', 'annaba');
    renderProjectList('list-copro', 'copro');
    renderProjectList('list-airbnb', 'airbnb');
    renderProjectList('list-maison', 'maison');

    document.getElementById('input-mrr').value = data.metrics.mrr;
    document.getElementById('input-users').value = data.metrics.users;

    if (document.getElementById('date-annaba')) document.getElementById('date-annaba').value = data.settings.annabaDate || '';
    if (document.getElementById('date-copro')) document.getElementById('date-copro').value = data.settings.coproDate || '';

    updateProjectProgress('annaba');
    updateProjectProgress('copro');
    renderJournal();
}

function renderTop3() {
    const el = document.getElementById('top3-list');
    const countEl = document.getElementById('top3-count');
    const starred = data.tasks.filter(t => t.todayStar && !t.done);
    countEl.textContent = starred.length + '/3';
    
    if (starred.length === 0) {
        el.innerHTML = '<div class="top3-empty">Clique sur ⭐ pour marquer tes priorités</div>';
        return;
    }
    
    const getColor = (type) => {
        if (type === 'pro') return 'var(--pro-blue)';
        if (type === 'saas') return 'var(--saas-green)';
        if (type === 'vie') return 'var(--vie-pink)';
        return 'var(--patri-purple)';
    };
    
    el.innerHTML = starred.map(t => `
        <div class="task-row" data-id="${t.id}">
            <input type="checkbox" class="task-check" onclick="event.stopPropagation(); toggleTask(${t.id})">
            <span class="task-type-dot" style="background:${getColor(t.type)}"></span>
            <span class="task-content" onclick="startFocusOnTask(${t.id})" style="cursor:pointer;">${escapeHtml(t.text)}</span>
            <button class="task-star active" onclick="event.stopPropagation(); toggleStar(${t.id})">⭐</button>
        </div>
    `).join('');
}

function renderTable(elementId, type) {
    const el = document.getElementById(elementId);
    if (!el) return;
    const tasks = data.tasks.filter(t => t.type === type);
    tasks.sort((a, b) => a.done - b.done);

    el.innerHTML = tasks.map(t => `
        <tr class="${t.done ? 'task-done' : ''}">
            <td><input type="checkbox" ${t.done ? 'checked' : ''} onclick="toggleTask(${t.id})" style="cursor:pointer;"></td>
            <td style="${t.done ? 'text-decoration:line-through; color:var(--text-muted);' : ''}">${escapeHtml(t.text)}</td>
            <td><button class="task-star ${t.todayStar ? 'active' : ''}" onclick="toggleStar(${t.id})">${t.todayStar ? '⭐' : '☆'}</button></td>
            <td><button onclick="deleteTask(${t.id})" style="background:none; border:none; color:var(--text-muted); cursor:pointer;">🗑</button></td>
        </tr>
    `).join('');
}

function renderProjectList(elementId, type) {
    const el = document.getElementById(elementId);
    if (!el) return;
    const tasks = data.tasks.filter(t => t.type === type);
    tasks.sort((a, b) => a.done - b.done);

    el.innerHTML = tasks.map(t => `
        <div class="task-row ${t.done ? 'task-done' : ''}">
            <input type="checkbox" class="task-check" ${t.done ? 'checked' : ''} onclick="toggleTask(${t.id})">
            <span class="task-content">${escapeHtml(t.text)}</span>
            <button class="task-star ${t.todayStar ? 'active' : ''}" onclick="toggleStar(${t.id})">${t.todayStar ? '⭐' : '☆'}</button>
            <button class="task-delete" onclick="deleteTask(${t.id})">✕</button>
        </div>
    `).join('');
}

function updateProjectProgress(type) {
    const tasks = data.tasks.filter(t => t.type === type);
    const done = tasks.filter(t => t.done).length;
    const total = tasks.length;
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;
    const bar = document.getElementById('bar-' + type);
    if (bar) bar.style.width = pct + '%';
}

function updateMetrics() {
    data.metrics.mrr = document.getElementById('input-mrr').value || '0';
    data.metrics.users = document.getElementById('input-users').value || '0';
    saveData();
}

// ===============================================
// JOURNAL
// ===============================================
function toggleJournal() {
    const body = document.getElementById('journal-body');
    const toggle = document.getElementById('journal-toggle');
    body.classList.toggle('expanded');
    toggle.textContent = body.classList.contains('expanded') ? '▲ Masquer' : '▼ Afficher';
}

function addJournalEntry(autoText = null) {
    const input = document.getElementById('journal-input');
    const text = autoText || input.value.trim();
    if (!text) return;
    const now = new Date();
    data.journal.unshift({ time: now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }), text, date: now.toDateString() });
    if (!autoText) input.value = '';
    saveData();
}

function renderJournal() {
    const el = document.getElementById('journal-entries');
    const today = new Date().toDateString();
    const todayEntries = data.journal.filter(j => j.date === today);
    if (todayEntries.length === 0) { el.innerHTML = '<div style="color:var(--text-muted); font-size:0.7rem; padding:6px 0;">Aucune entrée.</div>'; return; }
    el.innerHTML = todayEntries.map(j => `<div class="journal-entry"><span class="journal-time">[${j.time}]</span><span class="journal-text">${escapeHtml(j.text)}</span></div>`).join('');
}

function cleanJournalIfNewDay() {
    data.journal = data.journal.filter(j => { const d = new Date(j.date); return (new Date() - d) / 86400000 < 7; });
    saveData();
}

// ===============================================
// WEEKLY REVIEW
// ===============================================
function saveReview() {
    data.review.win = document.getElementById('review-win').value;
    data.review.fail = document.getElementById('review-fail').value;
    data.review.priority = document.getElementById('review-priority').value;
    saveData();
}

function loadReview() {
    document.getElementById('review-win').value = data.review.win || '';
    document.getElementById('review-fail').value = data.review.fail || '';
    document.getElementById('review-priority').value = data.review.priority || '';
}

function createTaskFromPriority() {
    const priority = document.getElementById('review-priority').value.trim();
    if (!priority) { alert('Remplis la priorité !'); return; }
    const type = prompt('Type ? (pro / saas / vie)', 'pro');
    if (!['pro', 'saas', 'vie'].includes(type)) { alert('Type invalide'); return; }
    addTask(type, priority, 'H');
    const task = data.tasks.find(t => t.text === priority && !t.done);
    if (task) task.todayStar = true;
    saveData();
    alert('Tâche créée et marquée TOP 3 !');
}

function renderWeekGrid() {
    const weekDays = [
        { name: 'Lun', theme: 'PRO', color: 'var(--pro-blue)', idx: 1 },
        { name: 'Mar', theme: 'SaaS', color: 'var(--saas-green)', idx: 2 },
        { name: 'Mer', theme: 'PRO+Patri', color: 'var(--pro-blue)', idx: 3 },
        { name: 'Jeu', theme: 'SaaS', color: 'var(--saas-green)', idx: 4 },
        { name: 'Ven', theme: 'Patrimoine', color: 'var(--patri-purple)', idx: 5 },
        { name: 'W-E', theme: 'Vie', color: 'var(--vie-pink)', idx: 0 }
    ];
    const today = new Date().getDay();
    document.getElementById('week-grid').innerHTML = weekDays.map(d => `
        <div class="week-day ${d.idx === today || (d.idx === 0 && (today === 0 || today === 6)) ? 'today' : ''}">
            <div class="week-day-name" style="color:${d.color}">${d.name}</div>
            <div class="week-day-theme">${d.theme}</div>
        </div>
    `).join('');
}

// ===============================================
// FOCUS MODE
// ===============================================
let focusModeActive = false, focusTimerInterval = null, focusSeconds = 0, currentFocusTaskId = null;

function startFocusOnTask(taskId) {
    const task = data.tasks.find(t => t.id === taskId);
    if (!task || task.done) return;
    currentFocusTaskId = taskId;
    document.getElementById('focus-task-text').textContent = task.text;
    const colors = { pro: 'var(--pro-blue)', saas: 'var(--saas-green)', vie: 'var(--vie-pink)' };
    document.getElementById('focus-type-label').textContent = task.type.toUpperCase();
    document.getElementById('focus-type-label').style.color = colors[task.type] || 'var(--patri-purple)';
    focusSeconds = 0;
    document.getElementById('focus-timer-display').textContent = '00:00';
    document.getElementById('focus-toggle-btn').textContent = '▶ Timer';
    document.getElementById('focus-overlay').classList.add('show');
    document.getElementById('btn-focus').classList.add('focus-active');
    document.getElementById('timer-float').classList.add('hidden');
    focusModeActive = true;
}

function toggleFocusMode() {
    if (focusModeActive) { exitFocusMode(); return; }
    let task = data.tasks.find(t => t.todayStar && !t.done);
    if (!task) task = data.tasks.find(t => !t.done && ['pro', 'saas', 'vie'].includes(t.type));
    if (task) startFocusOnTask(task.id); else alert('Aucune tâche active !');
}

function exitFocusMode() {
    document.getElementById('focus-overlay').classList.remove('show');
    document.getElementById('btn-focus').classList.remove('focus-active');
    document.getElementById('timer-float').classList.remove('hidden');
    focusModeActive = false; currentFocusTaskId = null;
    clearInterval(focusTimerInterval); focusTimerInterval = null; focusSeconds = 0;
}

function completeFocusTask() {
    if (!currentFocusTaskId) return;
    const task = data.tasks.find(t => t.id === currentFocusTaskId);
    if (task) { task.done = true; task.todayStar = false; addJournalEntry(`✓ ${task.text}`); saveData(); }
    nextFocusTask();
}

function nextFocusTask() {
    clearInterval(focusTimerInterval); focusTimerInterval = null; focusSeconds = 0;
    document.getElementById('focus-timer-display').textContent = '00:00';
    document.getElementById('focus-toggle-btn').textContent = '▶ Timer';
    let next = data.tasks.find(t => t.todayStar && !t.done && t.id !== currentFocusTaskId);
    if (!next) next = data.tasks.find(t => !t.done && ['pro', 'saas', 'vie'].includes(t.type) && t.id !== currentFocusTaskId);
    if (next) startFocusOnTask(next.id);
    else { document.getElementById('focus-task-text').textContent = '🎉 Tout est terminé !'; document.getElementById('focus-type-label').textContent = 'BRAVO'; currentFocusTaskId = null; }
}

function toggleFocusTimer() {
    const btn = document.getElementById('focus-toggle-btn');
    if (focusTimerInterval) { clearInterval(focusTimerInterval); focusTimerInterval = null; btn.textContent = '▶ Reprendre'; }
    else { focusTimerInterval = setInterval(() => { focusSeconds++; const m = String(Math.floor(focusSeconds/60)).padStart(2,'0'), s = String(focusSeconds%60).padStart(2,'0'); document.getElementById('focus-timer-display').textContent = m+':'+s; }, 1000); btn.textContent = '⏸ Pause'; }
}

// ===============================================
// TIMER
// ===============================================
let timerInterval = null, timerSeconds = 0, isTimerRunning = false;
function toggleTimer() {
    const btn = document.getElementById('btn-timer-toggle'), tf = document.getElementById('timer-float');
    if (isTimerRunning) { clearInterval(timerInterval); isTimerRunning = false; btn.textContent = '▶'; btn.classList.remove('active'); tf.classList.remove('active'); }
    else { timerInterval = setInterval(() => { timerSeconds++; document.getElementById('timer-display').textContent = String(Math.floor(timerSeconds/60)).padStart(2,'0')+':'+String(timerSeconds%60).padStart(2,'0'); }, 1000); isTimerRunning = true; btn.textContent = '⏸'; btn.classList.add('active'); tf.classList.add('active'); }
}
function resetTimer() { clearInterval(timerInterval); isTimerRunning = false; timerSeconds = 0; document.getElementById('timer-display').textContent = '00:00'; document.getElementById('btn-timer-toggle').textContent = '▶'; document.getElementById('btn-timer-toggle').classList.remove('active'); document.getElementById('timer-float').classList.remove('active'); }

// ===============================================
// CLOCK & SHUTDOWN
// ===============================================
function updateClock() { document.getElementById('clock').textContent = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }); }
function checkShutdownTime() { const n = new Date(); if (n.getHours() === 22 && n.getMinutes() === 45) openShutdown(); }
function openShutdown() { document.getElementById('shutdown-modal').classList.add('show'); }
function closeShutdown() { document.getElementById('shutdown-modal').classList.remove('show'); }

// ===============================================
// NAV
// ===============================================
function switchTab(viewId, btn) {
    document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
    document.getElementById('view-' + viewId).classList.add('active');
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    if (btn) btn.classList.add('active');
}

// ===============================================
// EXPORT/IMPORT
// ===============================================
function exportData() { const a = document.createElement('a'); a.href = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(data, null, 2)); a.download = 'huzine_v5_' + new Date().toISOString().slice(0, 10) + '.json'; a.click(); }
function importData(input) { const f = input.files[0]; if (!f) return; const r = new FileReader(); r.onload = e => { try { data = JSON.parse(e.target.result); saveData(); alert('Restauré !'); location.reload(); } catch { alert('Fichier invalide'); } }; r.readAsText(f); }
function escapeHtml(t) { const d = document.createElement('div'); d.textContent = t; return d.innerHTML; }

init();
</script>
</body>
</html>
