/* www/js/modules/timer.js - V1.0 */
/* 計時器系統：倒數 / 番茄鐘 / 正計時 */
/* 從背包使用「時間」類道具觸發，或直接呼叫 SQ.Timer.open() */

window.SQ = window.SQ || {};
window.SQ.Timer = {

    // ── 狀態 ────────────────────────────────────────────
    _state: null,   // null | 'idle' | 'running' | 'paused' | 'break' | 'done'
    _interval: null,
    _el: null,      // 浮層 DOM

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
                position:fixed; inset:0; z-index:10000;
                background:rgba(10,10,18,0.96);
                display:flex; flex-direction:column;
                align-items:center; justify-content:center;
                opacity:0; transition:opacity 0.25s, transform 0.25s;
                transform:scale(0.97);
                font-family: inherit;
            `;
            document.body.appendChild(this._el);
            requestAnimationFrame(() => requestAnimationFrame(() => {
                this._el.style.opacity = '1';
                this._el.style.transform = 'scale(1)';
            }));
        }

        const mode    = data.mode    || this._currentMode    || 'countdown';
        const total   = data.total   || this._currentTotal   || (25 * 60);
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
        };
        const col = colors[mode] || colors.countdown;

        // 模式標籤
        const modeLabels = {
            countdown: '⏳ 倒數計時',
            pomodoro:  phase === 'work' ? '🍅 專注中' : '☕ 休息中',
            stopwatch: '⏱️ 正計時',
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
                ${['countdown','pomodoro','stopwatch'].map(m => `
                    <div onclick="window.SQ.Timer._selectMode('${m}')"
                         style="padding:8px 16px; border-radius:50px; cursor:pointer; font-size:0.85rem;
                                font-weight:600; transition:all 0.15s;
                                background:${mode===m ? col.ring : 'rgba(255,255,255,0.07)'};
                                color:${mode===m ? '#111' : 'rgba(255,255,255,0.5)'};">
                        ${ m==='countdown'?'⏳ 倒數' : m==='pomodoro'?'🍅 番茄' : '⏱️ 正計時'}
                    </div>`).join('')}
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
        const doneHtml = isDone ? `
            <div style="text-align:center; margin-bottom:24px; animation: sq-pop 0.4s ease;">
                <div style="font-size:3rem; margin-bottom:8px;">🎉</div>
                <div style="font-size:1.2rem; font-weight:700; color:#fff;">完成！</div>
                <div style="font-size:0.9rem; color:rgba(255,255,255,0.5); margin-top:4px;">
                    ${ mode==='stopwatch'
                        ? `共計時 ${String(Math.floor(elapsed/60)).padStart(2,'0')}:${String(elapsed%60).padStart(2,'0')}`
                        : `專注了 ${Math.floor(total/60)} 分鐘` }
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
                    <button onclick="window.SQ.Timer._stop(true)"
                            style="${btnStyle('rgba(220,60,60,0.25)', '#ff8080')} padding:14px 20px;">
                        ■ 停止
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
                           align-items:center; justify-content:center;">✕</button>

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
        const totals = { countdown: 25*60, pomodoro: 25*60, stopwatch: 0 };
        this._currentMode    = mode;
        this._currentTotal   = totals[mode];
        this._currentElapsed = 0;
        this._render('idle', { mode, total: totals[mode], elapsed: 0 });
    },

    _adjustTime: function(deltaMin) {
        const current = Math.floor((this._currentTotal || 25*60) / 60);
        const next    = Math.max(1, Math.min(99, current + deltaMin));
        this._currentTotal = next * 60;
        this._render('idle', { mode: this._currentMode, total: this._currentTotal, elapsed: 0 });
    },

    _start: function() {
        this._currentElapsed = 0;
        const mode = this._currentMode || 'countdown';
        this._currentPhase = 'work';
        
        // 👈 修正：將錯誤的 _tick 替換成 _render，讓按下「開始」的瞬間畫面立刻切換到計時狀態
        this._render('running', {
            mode: mode,
            total: this._currentTotal,
            elapsed: this._currentElapsed,
            phase: this._currentPhase
        });
        
        this._runInterval();
    },

    _runInterval: function() {
        this._stop(false);
        this._interval = setInterval(() => {
            const mode  = this._currentMode;
            const state = this._state;
            if (state !== 'running') return;

            if (mode === 'stopwatch') {
                this._currentElapsed++;
                this._render('running', {
                    mode, total: this._currentTotal,
                    elapsed: this._currentElapsed, phase: this._currentPhase
                });
            } else {
                this._currentElapsed++;
                const remaining = this._currentTotal - this._currentElapsed;

                if (remaining <= 0) {
                    this._onComplete();
                    return;
                }
                this._render('running', {
                    mode, total: this._currentTotal,
                    elapsed: this._currentElapsed, phase: this._currentPhase
                });
            }
        }, 1000);
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
            this._runInterval();
        }
    },

    _stop: function(showIdle = false) {
        clearInterval(this._interval);
        this._interval = null;
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

    _onComplete: function() {
        clearInterval(this._interval);
        this._interval = null;

        const mode    = this._currentMode;
        const elapsed = this._currentElapsed;

        // 音效 + 震動
        window.SQ.Audio?.feedback('achievement');
        if (navigator.vibrate) navigator.vibrate([200, 100, 200]);

        // 番茄鐘：切換工作/休息
        if (mode === 'pomodoro' && this._currentPhase === 'work') {
            this._currentPhase = 'break';
            this._currentTotal = this.POMODORO_BREAK;
            this._currentElapsed = 0;
            // 短暫顯示「休息開始」提示再自動進入下一輪
            this._render('done', { mode, total: this.POMODORO_WORK, elapsed: this.POMODORO_WORK });
            // 3秒後自動進休息倒數
            setTimeout(() => {
                if (this._state === 'done') {
                    this._runInterval();
                    this._render('running', {
                        mode, total: this.POMODORO_BREAK,
                        elapsed: 0, phase: 'break'
                    });
                }
            }, 3000);
        } else {
            this._render('done', { mode, total: this._currentTotal, elapsed });
            // 給予獎勵（每完成一次倒數 / 番茄鐘給少量 EXP）
            this._giveReward(mode, elapsed);
        }
    },

    _giveReward: function(mode, elapsed) {
        if (mode === 'stopwatch') return; // 正計時不給獎勵（避免掛機刷點）
        const gs = window.SQ.State;
        if (!gs) return;

        const minutes = Math.floor(elapsed / 60);
        if (minutes < 1) return;

        const expReward = Math.min(minutes * 5, 200); // 每分鐘5 EXP，上限200

        gs.exp = (gs.exp || 0) + expReward;
        if (window.App) App.saveData();
        if (window.SQ.EventBus) {
            window.SQ.EventBus.emit(window.SQ.Events.Stats.UPDATED);
            window.SQ.EventBus.emit(window.SQ.Events.System.TOAST,
                `⏱️ 專注完成！獲得 ${expReward} EXP`);
        }
    },
};
