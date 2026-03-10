/* www/js/modules/timer.js - V2.0 */
/* 計時器系統：倒數 / 番茄鐘 / 正計時 */
/* 從背包使用「時間」類道具觸發，或直接呼叫 SQ.Timer.open() */

window.SQ = window.SQ || {};
window.SQ.Timer = {

    // ── 狀態 ────────────────────────────────────────────
    _state: null,   // null | 'idle' | 'running' | 'paused' | 'break' | 'done'
    _interval: null,
    _el: null,      // 浮層 DOM
	_startTime: 0,  // 👈 新增：用來記錄真實世界的開始時間
    _alertEnabled: true, // 👈 新增：控制是否發出音效與震動
    // 預設番茄鐘設定
    POMODORO_WORK:  25 * 60,
    POMODORO_BREAK: 5  * 60,

    // ── 開啟計時器浮層 ──────────────────────────────────
    open: function(opts = {}) {
        if (this._el) this._el.remove();
        this._opts = opts; 

        // 👈 新增這段：強制將傳入的 defaultMinutes 轉換為秒數！
        this._currentMode = opts.defaultMode || 'countdown';
        if (opts.defaultMinutes) {
            this._currentTotal = opts.defaultMinutes * 60;
        } else {
            this._currentTotal = 15 * 60; // 預設 15 分鐘
        }
        this._currentElapsed = 0; // 重置已過時間

        this._render('idle');
    },

    close: function() {
        this._stop();
        if (this._el) {
            this._el.style.opacity = '0';
            this._el.style.transform = 'scale(0.95)';
            setTimeout(() => { if (this._el) { this._el.remove(); this._el = null; } }, 250);
        }
        this._state = null;
    },

    // ── 主渲染 ──────────────────────────────────────────
    _render: function(state, data = {}) {
        this._state = state;

        // 第一次建立浮層
        if (!this._el) {
            this._el = document.createElement('div');
            this._el.id = 'sq-timer-layer';
            this._el.style.cssText = `
                position: absolute; /* 絕對定位 */
                top: 0; left: 0; right: 0; bottom: 0; 
                z-index: 10000;
                background: rgba(10,10,18,0.96);
                display: flex; flex-direction: column;
                align-items: center; justify-content: center;
                opacity: 0; transition: opacity 0.25s, transform 0.25s;
                transform: scale(0.97);
                font-family: inherit;
            `;
            
            // 抓取你的遊戲外框容器 (根據你的專案結構可能是 app 或 mobile-wrapper)
            const container = document.getElementById('app') || document.querySelector('.mobile-wrapper') || document.body;
            
            // 👈 核心修正：強制父容器變成 relative，這樣計時器就絕對逃不出去了！
            if (container !== document.body) {
                container.style.position = 'relative';
                container.style.overflow = 'hidden'; 
            }
            
            container.appendChild(this._el);
            
            // (確保你的主容器 CSS 有加上 position: relative; overflow: hidden; 喔！)

            requestAnimationFrame(() => requestAnimationFrame(() => {
                this._el.style.opacity = '1';
                this._el.style.transform = 'scale(1)';
            }));
        }

        const mode    = data.mode    || this._currentMode    || 'countdown';
        const total   = data.total   || this._currentTotal   || (15 * 60);
        const elapsed = data.elapsed || this._currentElapsed || 0;
        const phase   = data.phase   || this._currentPhase   || 'work'; // 'work' | 'break'

        // 儲存目前值供外部更新用
        this._currentMode    = mode;
        this._currentTotal   = total;
        this._currentElapsed = elapsed;
        this._currentPhase   = phase;

        const remaining = Math.max(0, total - elapsed);
        const progress  = mode === 'stopwatch' ? Math.min(elapsed / 3600, 1) : (total > 0 ? (total - remaining) / total : 0);

        const mins = String(Math.floor(remaining / 60)).padStart(2, '0');
        const secs = String(remaining % 60).padStart(2, '0');
        const timeDisplay = mode === 'stopwatch'
            ? `${String(Math.floor(elapsed/60)).padStart(2,'0')}:${String(elapsed%60).padStart(2,'0')}`
            : `${mins}:${secs}`;

        // 圓形進度環參數
        const R  = 110;
        const C  = 2 * Math.PI * R;
        const dash = C * (1 - progress);

        // 顏色主題
        const colors = {
            countdown: { ring:'#f0a500', glow:'rgba(240,165,0,0.3)', text:'#ffd166' },
            pomodoro:  { ring: phase==='work' ? '#e55a5a' : '#4caf87', glow: phase==='work' ? 'rgba(229,90,90,0.3)' : 'rgba(76,175,135,0.3)', text: phase==='work' ? '#ff8080' : '#66ffcc' },
            stopwatch: { ring:'#5b8af0', glow:'rgba(91,138,240,0.3)', text:'#80a8ff' },
            focus:     { ring:'#ef5350', glow:'rgba(239,83,80,0.3)',  text:'#ff8a80' },
        };
        const col = colors[mode] || colors.countdown;

        // 模式標籤
        const modeLabels = {
            countdown: '⏳ 倒數計時',
            pomodoro:  phase === 'work' ? '🍅 專注中' : '☕ 休息中',
            stopwatch: '⏱️ 正計時',
            focus:     '🔒 FOCUS LOCK',
        };

        // 控制按鈕
        const isRunning = state === 'running' || state === 'break_running';
        const isDone    = state === 'done';

        const btnStyle = (bg, fg='#fff') =>
            `padding:14px 28px; border-radius:50px; border:none; cursor:pointer;
             background:${bg}; color:${fg}; font-size:1rem; font-weight:700;
             letter-spacing:0.05em; transition:all 0.15s; user-select:none;`;

        // 模式選擇（idle 時顯示）
        const modeSelector = state === 'idle' ? `
            <div style="display:flex; gap:10px; margin-bottom:24px;">
                ${['countdown','pomodoro','focus','stopwatch'].map(m => {
                    const isPro = !window.SQ.Sub || window.SQ.Sub.isProOrTrial();
                    const locked = m === 'focus' && !isPro;
                    const labels = { countdown:'⏳ 倒數', pomodoro:'🍅 番茄', focus:'🔒 專注鎖', stopwatch:'⏱️ 正計時' };
                    const proLabels = { countdown:'⏳ 倒數', pomodoro:'🍅 番茄', focus:'🔒 Focus', stopwatch:'⏱️ 正計時' };
                    return `
                    <div onclick="window.SQ.Timer._selectMode('${m}')"
                         style="padding:8px 12px; border-radius:50px; cursor:pointer; font-size:0.82rem;
                                font-weight:600; transition:all 0.15s; position:relative;
                                background:${mode===m ? col.ring : 'rgba(255,255,255,0.07)'};
                                color:${mode===m ? '#111' : (locked ? 'rgba(255,255,255,0.25)' : 'rgba(255,255,255,0.5)')};
                                border:${locked ? '1px dashed rgba(255,255,255,0.15)' : 'none'};">
                        ${isPro ? proLabels[m] : labels[m]}
                    </div>`;
                }).join('')}
            </div>` : '';

        // 時間設定（countdown + idle）
        const timeSetHtml = (state === 'idle' && mode === 'countdown') ? `
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:20px;">
                <button onclick="window.SQ.Timer._adjustTime(-5)"
                        style="${btnStyle('rgba(255,255,255,0.08)','rgba(255,255,255,0.7)')} padding:8px 14px; font-size:1.1rem;">−5</button>
                <button onclick="window.SQ.Timer._adjustTime(-1)"
                        style="${btnStyle('rgba(255,255,255,0.08)','rgba(255,255,255,0.7)')} padding:8px 14px;">−1</button>
                <span style="font-size:1.1rem; color:rgba(255,255,255,0.5); min-width:60px; text-align:center;">
                    ${Math.floor(total/60)} 分鐘
                </span>
                <button onclick="window.SQ.Timer._adjustTime(1)"
                        style="${btnStyle('rgba(255,255,255,0.08)','rgba(255,255,255,0.7)')} padding:8px 14px;">+1</button>
                <button onclick="window.SQ.Timer._adjustTime(5)"
                        style="${btnStyle('rgba(255,255,255,0.08)','rgba(255,255,255,0.7)')} padding:8px 14px; font-size:1.1rem;">+5</button>
            </div>` : '';

        // 番茄鐘說明
        const pomodoroHint = (state === 'idle' && mode === 'pomodoro') ? `
            <div style="margin-bottom:16px; font-size:0.82rem; color:rgba(255,255,255,0.35);
                        text-align:center; line-height:1.6;">
                25 分鐘專注 → 5 分鐘休息
            </div>` : '';

        // 完成畫面
        const doneTitle = mode === 'countdown' ? '⏰ 時間到！' : '🎉 專注完成！';
        const doneHtml = isDone ? `
            <div style="text-align:center; margin-bottom:24px; animation: sq-pop 0.4s ease;">
                <div style="font-size:3rem; margin-bottom:8px;">${mode === 'countdown' ? '⏰' : '🎉'}</div>
                <div style="font-size:1.2rem; font-weight:700; color:#fff;">${doneTitle}</div>
                <div style="font-size:0.9rem; color:rgba(255,255,255,0.5); margin-top:4px;">
                    ${ mode === 'stopwatch'
                        ? `共計時 ${String(Math.floor(elapsed/60)).padStart(2,'0')}:${String(elapsed%60).padStart(2,'0')}`
                        : (mode === 'countdown' ? `倒數 ${Math.floor(total/60)} 分鐘結束` : `專注了 ${Math.floor(total/60)} 分鐘`) }
                </div>
            </div>` : '';

        // 主控制按鈕
        let ctrlHtml = '';
        if (isDone) {
            ctrlHtml = `
                <div style="display:flex; gap:12px;">
                    <button onclick="window.SQ.Timer._restart()"
                            style="${btnStyle('rgba(255,255,255,0.1)', 'rgba(255,255,255,0.8)')}">
                        🔄 再來一次
                    </button>
                    <button onclick="window.SQ.Timer.close()"
                            style="${btnStyle(col.ring, '#111')}">
                        ✅ 完成
                    </button>
                </div>`;
        } else if (state === 'idle') {
            ctrlHtml = `
                <button onclick="window.SQ.Timer._start()"
                        style="${btnStyle(col.ring, '#111')} min-width:140px;">
                    ▶ 開始
                </button>`;
        } else {
            ctrlHtml = `
                <div style="display:flex; gap:12px;">
                    <button onclick="window.SQ.Timer._togglePause()"
                            style="${btnStyle(isRunning ? 'rgba(255,255,255,0.12)' : col.ring, isRunning ? 'rgba(255,255,255,0.8)' : '#111')} min-width:100px;">
                        ${isRunning ? '⏸ 暫停' : '▶ 繼續'}
                    </button>
                    <button onclick="window.SQ.Timer._finishEarly()"
                            style="${btnStyle('rgba(220,60,60,0.25)', '#ff8080')} padding:14px 20px;">
                        ■ 結束
                    </button>
                </div>`;
        }

        // 相位標籤（番茄鐘）
        const phaseTag = (mode === 'pomodoro' && state !== 'idle') ? `
            <div style="font-size:0.85rem; font-weight:600; letter-spacing:0.1em;
                        color:${col.text}; margin-bottom:8px; text-transform:uppercase;">
                ${phase === 'work' ? '🍅 FOCUS' : '☕ BREAK'}
            </div>` : '';

        this._el.innerHTML = `
            <style>
                @keyframes sq-pop { from { transform:scale(0.8); opacity:0; } to { transform:scale(1); opacity:1; } }
                @keyframes sq-pulse { 0%,100%{ box-shadow:0 0 0 0 ${col.glow}; } 50%{ box-shadow:0 0 0 16px transparent; } }
                #sq-timer-ring { filter: drop-shadow(0 0 12px ${col.glow}); }
                #sq-timer-ring circle.track { transition: stroke-dashoffset 1s linear; }
            </style>
            <!-- 關閉按鈕 -->
            <button onclick="window.SQ.Timer.close()"
                    style="position:absolute; top:20px; right:20px; background:rgba(255,255,255,0.07);
                           border:none; border-radius:50%; width:40px; height:40px; cursor:pointer;
                           color:rgba(255,255,255,0.4); font-size:1.2rem; display:flex;
                           align-items:center; justify-content:center; z-index:10001;">✕</button>

            <!-- 模式標籤 -->
            <div style="font-size:0.85rem; color:rgba(255,255,255,0.4); letter-spacing:0.12em;
                        margin-bottom:20px; text-transform:uppercase;">
                ${modeLabels[mode] || ''}
            </div>

            ${modeSelector}
            ${pomodoroHint}
            ${doneHtml}

            <!-- 圓形進度環 -->
            ${!isDone ? `
            <div style="position:relative; margin-bottom:28px;">
			<button id="sq-timer-alert-btn" onclick="window.SQ.Timer._toggleAlert()"
                        style="position:absolute; top:0px; right:0px; background:rgba(255,255,255,0.12);
                               border:none; border-radius:50%; width:42px; height:42px; cursor:pointer;
                               color:rgba(255,255,255,0.9); font-size:1.2rem; display:flex;
                               align-items:center; justify-content:center; transition: 0.2s; z-index:10;
                               box-shadow: 0 4px 10px rgba(0,0,0,0.3);">
                    ${this._alertEnabled !== false ? '🔔' : '🔕'}
                </button>
                <svg id="sq-timer-ring" width="260" height="260" viewBox="0 0 260 260">
                    <!-- 背景環 -->
                    <circle cx="130" cy="130" r="${R}"
                            fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="10"/>
                    <!-- 進度環 -->
                    <circle class="track" cx="130" cy="130" r="${R}"
                            fill="none" stroke="${col.ring}" stroke-width="10"
                            stroke-linecap="round"
                            stroke-dasharray="${C.toFixed(1)}"
                            stroke-dashoffset="${dash.toFixed(1)}"
                            transform="rotate(-90 130 130)"/>
                </svg>
                <!-- 中央時間顯示 -->
                <div style="position:absolute; inset:0; display:flex; flex-direction:column;
                            align-items:center; justify-content:center;">
                    ${phaseTag}
                    <div style="font-size:3.2rem; font-weight:800; color:#fff;
                                letter-spacing:-0.02em; line-height:1; font-variant-numeric:tabular-nums;">
                        ${timeDisplay}
                    </div>
                    ${(state !== 'idle') ? `
                    <div style="font-size:0.78rem; color:rgba(255,255,255,0.3); margin-top:6px;">
                        ${isRunning ? '進行中' : '已暫停'}
                    </div>` : ''}
                </div>
            </div>` : ''}

            ${timeSetHtml}
            ${ctrlHtml}
        `;
    },

    // ── 控制邏輯 ────────────────────────────────────────
    _selectMode: function(mode) {
        // Focus Lock 需要 Pro
        if (mode === 'focus' && window.SQ.Sub) {
            const check = window.SQ.Sub.canUseFocusLock();
            if (!check.ok) {
                window.SQ.Sub.showUpgradePrompt(check.reason);
                return;
            }
        }
        const totals = { countdown: 15*60, pomodoro: 25*60, focus: 25*60, stopwatch: 0 };
        this._currentMode    = mode;
        this._currentTotal   = totals[mode];
        this._currentElapsed = 0;
        this._render('idle', { mode, total: totals[mode], elapsed: 0 });
    },

    _adjustTime: function(deltaMin) {
        const current = Math.floor((this._currentTotal || 15*60) / 60);
        const next    = Math.max(1, Math.min(99, current + deltaMin));
        this._currentTotal = next * 60;
        this._render('idle', { mode: this._currentMode, total: this._currentTotal, elapsed: 0 });
    },

    _start: function() {
        this._currentElapsed = 0;
        const mode = this._currentMode || 'countdown';
        this._currentPhase = 'work';

        // Focus Lock：啟動時鎖定導航
        if (mode === 'focus') {
            if (!this._origNavigate) {
                this._origNavigate = window.SQ.Actions.navigate;
                window.SQ.Actions.navigate = () => {
                    window.SQ.Actions.toast('🔒 專注鎖定中，請先完成計時');
                    window.SQ.Audio?.play('error');
                };
            }
        }

        // 👈 核心修改 1：記錄按下的那一瞬間的「真實系統時間」
        this._startTime = Date.now(); 

        this._render('running', {
            mode: mode, total: this._currentTotal,
            elapsed: this._currentElapsed, phase: this._currentPhase
        });
        
        this._runInterval();
    },

    _runInterval: function() {
        this._stop(false);
        this._interval = setInterval(() => {
            if (this._state !== 'running') return;

            // 👈 核心修改 2：不再傻傻地 +1，而是用「現在時間 - 開始時間」來算出真實經過秒數！
            // 這樣就算手機螢幕關掉 10 分鐘，一打開也能瞬間扣掉 600 秒
            const now = Date.now();
            this._currentElapsed = Math.floor((now - this._startTime) / 1000);

            const mode  = this._currentMode;

            if (mode === 'stopwatch') {
                this._render('running', {
                    mode, total: this._currentTotal,
                    elapsed: this._currentElapsed, phase: this._currentPhase
                });
            } else {
                const remaining = this._currentTotal - this._currentElapsed;

                if (remaining <= 0) {
                    this._currentElapsed = this._currentTotal; // 確保不會變成負數
                    this._onComplete();
                    return;
                }
                this._render('running', {
                    mode, total: this._currentTotal,
                    elapsed: this._currentElapsed, phase: this._currentPhase
                });
            }
        }, 1000); // 這裡維持 1000ms，但實際時間由 Date.now() 決定
        this._state = 'running';
    },

    _togglePause: function() {
        if (this._state === 'running') {
            this._state = 'paused';
            clearInterval(this._interval);
            this._render('paused', {
                mode: this._currentMode, total: this._currentTotal,
                elapsed: this._currentElapsed, phase: this._currentPhase
            });
        } else if (this._state === 'paused') {
            // 👈 核心修改 3：解除暫停時，要把「開始時間」往後推，扣掉已經經過的時間
            this._startTime = Date.now() - (this._currentElapsed * 1000);
            this._runInterval();
        }
    },

    // 👈 新增：鈴鐺切換邏輯
    _toggleAlert: function() {
        this._alertEnabled = !this._alertEnabled;
        const btn = document.getElementById('sq-timer-alert-btn');
        if (btn) btn.innerText = this._alertEnabled ? '🔔' : '🔕';
        window.SQ.Audio?.play('click');
    },

    _stop: function(showIdle = false) {
        clearInterval(this._interval);
        this._interval = null;
        // Focus Lock：恢復導航
        if (this._origNavigate) {
            window.SQ.Actions.navigate = this._origNavigate;
            this._origNavigate = null;
        }
        if (showIdle) {
            this._currentElapsed = 0;
            this._render('idle', {
                mode: this._currentMode, total: this._currentTotal,
                elapsed: 0, phase: 'work'
            });
        }
    },

    _restart: function() {
        this._currentElapsed = 0;
        this._currentPhase   = 'work';
        const mode = this._currentMode;
        if (mode === 'pomodoro') this._currentTotal = this.POMODORO_WORK;
        this._render('idle', {
            mode, total: this._currentTotal, elapsed: 0, phase: 'work'
        });
    },

    _finishEarly: function() {
        if (this._currentMode === 'stopwatch') {
            this._onComplete(); // 正計時手動按下結束，視為「專注完成」
        } else {
            this._stop(true); // 倒數或番茄鐘如果中途按結束，直接放棄回大廳
        }
    },

    _onComplete: function() {
        clearInterval(this._interval);
        this._interval = null;

        const mode    = this._currentMode;
        const elapsed = this._currentElapsed;

        // 👈 差異化音效與震動
        if (this._alertEnabled !== false) {
            if (mode === 'countdown') {
                // 倒數計時：時間到了的「連續 taskUndo 警報聲」
                window.SQ.Audio?.play('taskUndo');
                setTimeout(() => window.SQ.Audio?.play('taskUndo'), 400); // 0.4秒後響第二次
                setTimeout(() => window.SQ.Audio?.play('taskUndo'), 800); // 0.8秒後響第三次
                
                if (navigator.vibrate) navigator.vibrate([300, 100, 300, 100, 300]); // 急促震動
            } else {
                // 番茄鐘/正計時：專注完成的「成就音效」
                window.SQ.Audio?.feedback('achievement');
                if (navigator.vibrate) navigator.vibrate([200, 100, 200]); // 溫和震動
            }
        }

        // 👈 差異化後續行為
        if (mode === 'countdown') {
            this._render('done', { mode, total: this._currentTotal, elapsed });
            // 倒數計時只彈出警告，不給 EXP
            if (window.sys && window.sys.alert) window.sys.alert("⏰ 滴答滴答... 時間到囉！");
            else if (window.SQ.Actions && window.SQ.Actions.toast) window.SQ.Actions.toast("⏰ 時間到囉！");
        } 
        else if (mode === 'pomodoro' && this._currentPhase === 'work') {
            // 番茄鐘：工作結束，自動進入休息倒數
            this._currentPhase = 'break';
            this._currentTotal = this.POMODORO_BREAK;
            this._currentElapsed = 0;
            this._render('done', { mode, total: this.POMODORO_WORK, elapsed: this.POMODORO_WORK });
            setTimeout(() => {
                if (this._state === 'done') {
                    this._runInterval();
                    this._render('running', { mode, total: this.POMODORO_BREAK, elapsed: 0, phase: 'break' });
                }
            }, 3000);
        } else {
            // 正計時結束 / 番茄大循環結束：結算與給獎
            this._render('done', { mode, total: this._currentTotal, elapsed });
            this._giveReward(mode, elapsed);
        }
    },

    _giveReward: function(mode, elapsed) {
        const minutes = Math.floor(elapsed / 60);
        
        // 👈 新增：發送「計時完成」廣播，把模式與分鐘數傳送出去給成就系統
        if (minutes >= 1 && window.SQ.EventBus) {
            window.SQ.EventBus.emit('TIMER_COMPLETED', { mode: mode, minutes: minutes });
        }

        if (mode === 'focus') {
            // Focus Lock 完成：跟 countdown 相同獎勵邏輯
            // 導航鎖定在 _startTimer 處理
        }
        if (mode === 'stopwatch') return; // 正計時不給金幣/EXP，但上面依然有發送廣播以累積成就！

        const gs = window.SQ.State;
        if (!gs) return;
        if (minutes < 1) return;

        const expReward = Math.min(minutes * 5, 200); 

        gs.exp = (gs.exp || 0) + expReward;
        if (window.App) App.saveData();
        if (window.SQ.EventBus) {
            window.SQ.EventBus.emit(window.SQ.Events.Stats.UPDATED);
            window.SQ.EventBus.emit(window.SQ.Events.System.TOAST, `⏱️ 專注完成！獲得 ${expReward} EXP`);
        }
    },
};
