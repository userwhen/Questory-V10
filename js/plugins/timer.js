/* www/js/modules/timer.js - V2.1 */
/* 計時器系統：倒數 / 番茄鐘 / 正計時 */
/* 修復紀錄:
 *   V2.1 - [Fix A] Focus Lock 改為所有模式的「開關選項」(PRO限定)，而非獨立模式
 *        - [Fix B] 攔截 Android 實體返回鍵 (需要 @capacitor/app 插件)
 *        - [Fix C] Focus Lock 啟動時隱藏關閉按鈕，強制玩家完成計時
 *        - 正計時模式保留，完成後根據分鐘數給成就廣播
 */

window.SQ = window.SQ || {};
window.SQ.Timer = {

    _state:        null,
    _interval:     null,
    _el:           null,
    _startTime:    0,
    _alertEnabled: true,
    _focusLocked:  false,   // ✅ [新增] 目前是否處於 Focus Lock 狀態
    _backHandler:  null,    // ✅ [新增] 儲存返回鍵監聽器，方便移除

    POMODORO_WORK:  25 * 60,
    POMODORO_BREAK: 5  * 60,

    open: function(opts = {}) {
        if (this._el) this._el.remove();
        this._opts = opts;
        this._currentMode    = opts.defaultMode || 'countdown';
        this._currentTotal   = opts.defaultMinutes ? opts.defaultMinutes * 60 : 15 * 60;
        this._currentElapsed = 0;
        this._focusLocked    = false; // 開啟時重置鎖定狀態
        this._render('idle');
    },

    close: function() {
        // Focus Lock 開啟時禁止關閉
        if (this._focusLocked) {
            window.SQ.Actions?.toast('🔒 專注鎖定中，請先完成計時');
            window.SQ.Audio?.play('error');
            return;
        }
        this._stop();
        this._releaseFocusLock(); // 確保釋放所有鎖定
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

        if (!this._el) {
            this._el = document.createElement('div');
            this._el.id = 'sq-timer-layer';
            this._el.style.cssText = `
                position: absolute;
                top: 0; left: 0; right: 0; bottom: 0;
                z-index: 10000;
                background: rgba(10,10,18,0.96);
                display: flex; flex-direction: column;
                align-items: center; justify-content: center;
                opacity: 0; transition: opacity 0.25s, transform 0.25s;
                transform: scale(0.97);
                font-family: inherit;
            `;
            const container = document.getElementById('app') || document.querySelector('.mobile-wrapper') || document.body;
            if (container !== document.body) {
                container.style.position = 'relative';
                container.style.overflow = 'hidden';
            }
            container.appendChild(this._el);
            requestAnimationFrame(() => requestAnimationFrame(() => {
                this._el.style.opacity = '1';
                this._el.style.transform = 'scale(1)';
            }));
        }

        const mode    = data.mode    || this._currentMode    || 'countdown';
        const total   = data.total   || this._currentTotal   || (15 * 60);
        const elapsed = data.elapsed !== undefined ? data.elapsed : (this._currentElapsed || 0);
        const phase   = data.phase   || this._currentPhase   || 'work';

        this._currentMode    = mode;
        this._currentTotal   = total;
        this._currentElapsed = elapsed;
        this._currentPhase   = phase;

        const remaining = Math.max(0, total - elapsed);
        const progress  = mode === 'stopwatch'
            ? Math.min(elapsed / 3600, 1)
            : (total > 0 ? (total - remaining) / total : 0);

        const mins = String(Math.floor(remaining / 60)).padStart(2, '0');
        const secs = String(remaining % 60).padStart(2, '0');
        const timeDisplay = mode === 'stopwatch'
            ? `${String(Math.floor(elapsed/60)).padStart(2,'0')}:${String(elapsed%60).padStart(2,'0')}`
            : `${mins}:${secs}`;

        const R  = 110;
        const C  = 2 * Math.PI * R;
        const dash = C * (1 - progress);

        const isPro = !window.SQ.Sub || window.SQ.Sub.isProOrTrial();
        const focusActive = this._focusLocked;

        // 顏色主題（Focus Lock 開啟時變紅）
        const colors = {
            countdown: focusActive ? { ring:'#ef5350', glow:'rgba(239,83,80,0.3)', text:'#ff8a80' }
                                   : { ring:'#f0a500', glow:'rgba(240,165,0,0.3)',  text:'#ffd166' },
            pomodoro:  { ring: phase==='work' ? '#e55a5a' : '#4caf87',
                         glow: phase==='work' ? 'rgba(229,90,90,0.3)' : 'rgba(76,175,135,0.3)',
                         text: phase==='work' ? '#ff8080' : '#66ffcc' },
            stopwatch: focusActive ? { ring:'#ef5350', glow:'rgba(239,83,80,0.3)', text:'#ff8a80' }
                                   : { ring:'#5b8af0', glow:'rgba(91,138,240,0.3)', text:'#80a8ff' },
        };
        const col = colors[mode] || colors.countdown;

        const modeLabels = {
            countdown: '⏳ 倒數計時',
            pomodoro:  phase === 'work' ? '🍅 專注中' : '☕ 休息中',
            stopwatch: '⏱️ 正計時',
        };

        const isRunning = state === 'running';
        const isDone    = state === 'done';

        const btnStyle = (bg, fg='#fff') =>
            `padding:14px 28px; border-radius:50px; border:none; cursor:pointer;
             background:${bg}; color:${fg}; font-size:1rem; font-weight:700;
             letter-spacing:0.05em; transition:all 0.15s; user-select:none;`;

        // ✅ [Fix A] 模式選擇：移除獨立 focus 模式，改為三個模式 + Focus Lock 開關
        const modeSelector = state === 'idle' ? `
            <div style="display:flex; gap:10px; margin-bottom:16px;">
                ${['countdown','pomodoro','stopwatch'].map(m => {
                    const labels = { countdown:'⏳ 倒數', pomodoro:'🍅 番茄', stopwatch:'⏱️ 正計時' };
                    return `
                    <div onclick="window.SQ.Timer._selectMode('${m}')"
                         style="padding:8px 12px; border-radius:50px; cursor:pointer; font-size:0.82rem;
                                font-weight:600; transition:all 0.15s;
                                background:${mode===m ? col.ring : 'rgba(255,255,255,0.07)'};
                                color:${mode===m ? '#111' : 'rgba(255,255,255,0.5)'};">
                        ${labels[m]}
                    </div>`;
                }).join('')}
            </div>
            <!-- ✅ Focus Lock 開關 (PRO限定) -->
            <div onclick="window.SQ.Timer._toggleFocusLockSetting()"
                 style="display:flex; align-items:center; gap:8px; margin-bottom:20px;
                        padding:10px 16px; border-radius:50px; cursor:pointer;
                        background:${focusActive ? 'rgba(239,83,80,0.15)' : 'rgba(255,255,255,0.05)'};
                        border:1px solid ${focusActive ? 'rgba(239,83,80,0.4)' : 'rgba(255,255,255,0.1)'};">
                <span style="font-size:0.9rem;">${focusActive ? '🔒' : '🔓'}</span>
                <span style="font-size:0.82rem; font-weight:600;
                             color:${focusActive ? '#ff8a80' : 'rgba(255,255,255,0.4)'};">
                    Focus Lock ${focusActive ? '已開啟' : '關閉'}
                </span>
                ${!isPro ? '<span style="font-size:0.7rem; color:rgba(255,255,255,0.25); margin-left:auto;">PRO</span>' : ''}
            </div>` : '';

        // 時間設定（倒數模式 + idle）
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

        const pomodoroHint = (state === 'idle' && mode === 'pomodoro') ? `
            <div style="margin-bottom:16px; font-size:0.82rem; color:rgba(255,255,255,0.35);
                        text-align:center; line-height:1.6;">
                25 分鐘專注 → 5 分鐘休息
            </div>` : '';

        const doneHtml = isDone ? `
            <div style="text-align:center; margin-bottom:24px;">
                <div style="font-size:3rem; margin-bottom:8px;">${mode === 'countdown' ? '⏰' : '🎉'}</div>
                <div style="font-size:1.2rem; font-weight:700; color:#fff;">
                    ${mode === 'countdown' ? '⏰ 時間到！' : '🎉 專注完成！'}
                </div>
                <div style="font-size:0.9rem; color:rgba(255,255,255,0.5); margin-top:4px;">
                    ${mode === 'stopwatch'
                        ? `共計時 ${String(Math.floor(elapsed/60)).padStart(2,'0')}:${String(elapsed%60).padStart(2,'0')}`
                        : `${Math.floor(total/60)} 分鐘`}
                </div>
            </div>` : '';

        let ctrlHtml = '';
        if (isDone) {
            ctrlHtml = `
                <div style="display:flex; gap:12px;">
                    <button onclick="window.SQ.Timer._restart()"
                            style="${btnStyle('rgba(255,255,255,0.08)','rgba(255,255,255,0.7)')}">
                        🔁 再來一次
                    </button>
                    <button onclick="window.SQ.Timer.close()"
                            style="${btnStyle(col.ring, '#111')}">
                        完成 ✓
                    </button>
                </div>`;
        } else if (state === 'idle') {
            ctrlHtml = `
                <button onclick="window.SQ.Timer._startTimer()"
                        style="${btnStyle(col.ring, '#111')} min-width:160px;">
                    ▶ 開始
                </button>`;
        } else {
            ctrlHtml = `
                <div style="display:flex; gap:12px; align-items:center;">
                    <button onclick="window.SQ.Timer._togglePause()"
                            style="${btnStyle(col.ring, '#111')} min-width:100px;">
                        ${state === 'paused' ? '▶ 繼續' : '⏸ 暫停'}
                    </button>
                    ${!focusActive ? `
                    <button onclick="window.SQ.Timer._finishEarly()"
                            style="${btnStyle('rgba(255,255,255,0.08)','rgba(255,255,255,0.5)')} padding:10px 18px; font-size:0.85rem;">
                        ${mode === 'stopwatch' ? '⏹ 結束' : '✕ 放棄'}
                    </button>` : `
                    <!-- Focus Lock 開啟時隱藏放棄按鈕 -->
                    <div style="font-size:0.75rem; color:rgba(239,83,80,0.6); text-align:center; max-width:80px; line-height:1.4;">
                        🔒 鎖定中<br>堅持到底！
                    </div>`}
                </div>`;
        }

        // Focus Lock 狀態標示
        const focusBadge = focusActive && state === 'running' ? `
            <div style="position:absolute; top:16px; left:50%; transform:translateX(-50%);
                        background:rgba(239,83,80,0.15); border:1px solid rgba(239,83,80,0.3);
                        border-radius:50px; padding:4px 12px; font-size:0.75rem; color:#ff8a80;">
                🔒 FOCUS LOCK 啟動中
            </div>` : '';

        this._el.innerHTML = `
            <style>
                @keyframes sq-pop { from { transform:scale(0.8); opacity:0; } to { transform:scale(1); opacity:1; } }
            </style>
            ${focusBadge}
            <!-- ✅ [Fix C] Focus Lock 開啟時隱藏關閉按鈕 -->
            ${!focusActive ? `
            <button onclick="window.SQ.Timer.close()"
                    style="position:absolute; top:16px; right:16px;
                           background:rgba(255,255,255,0.07); border:none; border-radius:50%;
                           width:36px; height:36px; cursor:pointer;
                           color:rgba(255,255,255,0.4); font-size:1rem;">✕</button>` : ''}
            <div style="position:absolute; top:16px; left:16px; display:flex; gap:8px;">
                <button id="sq-timer-alert-btn" onclick="window.SQ.Timer._toggleAlert()"
                        style="background:rgba(255,255,255,0.07); border:none; border-radius:50%;
                               width:36px; height:36px; cursor:pointer; font-size:1rem;">
                    ${this._alertEnabled ? '🔔' : '🔕'}
                </button>
            </div>
            <div style="display:flex; flex-direction:column; align-items:center; gap:8px;">
                <div style="font-size:0.82rem; font-weight:600; color:${col.ring};
                            letter-spacing:0.1em; text-transform:uppercase; margin-bottom:4px;">
                    ${modeLabels[mode] || ''}
                </div>
                ${modeSelector}
                ${timeSetHtml}
                ${pomodoroHint}
                ${doneHtml}
                <!-- 圓形進度環 -->
                <div style="position:relative; margin-bottom:24px;">
                    <svg width="260" height="260" viewBox="0 0 260 260">
                        <circle cx="130" cy="130" r="${R}"
                                fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="12"/>
                        <circle cx="130" cy="130" r="${R}"
                                fill="none" stroke="${col.ring}" stroke-width="12"
                                stroke-linecap="round"
                                stroke-dasharray="${C}"
                                stroke-dashoffset="${dash}"
                                transform="rotate(-90 130 130)"
                                style="filter:drop-shadow(0 0 8px ${col.glow}); transition:stroke-dashoffset 0.8s ease;"/>
                    </svg>
                    <div style="position:absolute; inset:0; display:flex; flex-direction:column;
                                align-items:center; justify-content:center; gap:4px;">
                        <div style="font-size:3rem; font-weight:200; letter-spacing:0.05em;
                                    color:${col.text}; font-variant-numeric:tabular-nums;">
                            ${timeDisplay}
                        </div>
                        ${mode === 'stopwatch' && state === 'running' ? `
                        <div style="font-size:0.72rem; color:rgba(255,255,255,0.3);">
                            ${focusActive ? '🔒 專注中' : '計時中'}
                        </div>` : ''}
                    </div>
                </div>
                ${ctrlHtml}
            </div>
        `;
    },

    // ── Focus Lock 開關（設定階段點擊）──────────────────
    _toggleFocusLockSetting: function() {
        const isPro = !window.SQ.Sub || window.SQ.Sub.isProOrTrial();
        if (!isPro) {
            window.SQ.Sub?.showUpgradePrompt('Focus Lock 為 Pro 功能');
            return;
        }
        this._focusLocked = !this._focusLocked;
        this._render('idle', {
            mode: this._currentMode, total: this._currentTotal,
            elapsed: 0, phase: 'work'
        });
        window.SQ.Audio?.play('toggle_on');
    },

    // ✅ [Fix B] 鎖定 Android 返回鍵
    _applyFocusLock: function() {
        // 攔截 App 內導航
        if (!this._origNavigate) {
            this._origNavigate = window.SQ.Actions?.navigate;
            if (window.SQ.Actions) {
                window.SQ.Actions.navigate = () => {
                    window.SQ.Actions.toast('🔒 專注鎖定中，請先完成計時');
                    window.SQ.Audio?.play('error');
                };
            }
        }

        // 攔截 Android 實體返回鍵
        if (window.Capacitor?.Plugins?.App && !this._backHandler) {
            window.Capacitor.Plugins.App.addListener('backButton', () => {
                window.SQ.Actions?.toast('🔒 專注鎖定中，請先完成計時');
                window.SQ.Audio?.play('error');
            }).then(handle => {
                this._backHandler = handle;
            });
        }
    },

    _releaseFocusLock: function() {
        // 恢復導航
        if (this._origNavigate && window.SQ.Actions) {
            window.SQ.Actions.navigate = this._origNavigate;
            this._origNavigate = null;
        }
        // 移除返回鍵監聽
        if (this._backHandler) {
            this._backHandler.remove?.();
            this._backHandler = null;
        }
    },

    // ── 計時器控制 ───────────────────────────────────────
    _selectMode: function(m) {
        this._currentMode = m;
        if (m === 'pomodoro') this._currentTotal = this.POMODORO_WORK;
        else if (m === 'stopwatch') this._currentTotal = 0;
        this._currentElapsed = 0;
        this._currentPhase = 'work';
        this._render('idle', { mode: m, total: this._currentTotal, elapsed: 0, phase: 'work' });
    },

    _adjustTime: function(delta) {
        const newTotal = Math.max(60, this._currentTotal + delta * 60);
        this._currentTotal = newTotal;
        this._render('idle', { mode: this._currentMode, total: newTotal, elapsed: 0 });
    },

    _startTimer: function() {
        // Focus Lock 開啟時施加鎖定
        if (this._focusLocked) {
            this._applyFocusLock();
        }

        this._currentPhase = 'work';
        this._startTime = Date.now();

        this._render('running', {
            mode: this._currentMode, total: this._currentTotal,
            elapsed: this._currentElapsed, phase: this._currentPhase
        });
        this._runInterval();
    },

    _runInterval: function() {
        this._stop(false);
        this._interval = setInterval(() => {
            if (this._state !== 'running') return;

            const now = Date.now();
            this._currentElapsed = Math.floor((now - this._startTime) / 1000);

            const mode = this._currentMode;

            if (mode === 'stopwatch') {
                this._render('running', {
                    mode, total: this._currentTotal,
                    elapsed: this._currentElapsed, phase: this._currentPhase
                });
            } else {
                const remaining = this._currentTotal - this._currentElapsed;
                if (remaining <= 0) {
                    this._currentElapsed = this._currentTotal;
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
            this._startTime = Date.now() - (this._currentElapsed * 1000);
            this._runInterval();
        }
    },

    _toggleAlert: function() {
        this._alertEnabled = !this._alertEnabled;
        const btn = document.getElementById('sq-timer-alert-btn');
        if (btn) btn.innerText = this._alertEnabled ? '🔔' : '🔕';
        window.SQ.Audio?.play('click');
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
        this._focusLocked    = false; // 完成後解除鎖定狀態
        this._releaseFocusLock();
        const mode = this._currentMode;
        if (mode === 'pomodoro') this._currentTotal = this.POMODORO_WORK;
        this._render('idle', { mode, total: this._currentTotal, elapsed: 0, phase: 'work' });
    },

    _finishEarly: function() {
        if (this._currentMode === 'stopwatch') {
            this._onComplete();
        } else {
            this._stop(true);
            this._releaseFocusLock();
            this._focusLocked = false;
        }
    },

    _onComplete: function() {
        clearInterval(this._interval);
        this._interval = null;

        const mode    = this._currentMode;
        const elapsed = this._currentElapsed;

        // Focus Lock 結束時自動釋放
        if (this._focusLocked) {
            this._releaseFocusLock();
            this._focusLocked = false;
        }

        if (this._alertEnabled !== false) {
            if (mode === 'countdown') {
                window.SQ.Audio?.play('taskUndo');
                setTimeout(() => window.SQ.Audio?.play('taskUndo'), 400);
                setTimeout(() => window.SQ.Audio?.play('taskUndo'), 800);
                if (navigator.vibrate) navigator.vibrate([300, 100, 300, 100, 300]);
            } else {
                window.SQ.Audio?.feedback('achievement');
                if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
            }
        }

        if (mode === 'countdown') {
            this._render('done', { mode, total: this._currentTotal, elapsed });
            if (window.sys?.alert) window.sys.alert('⏰ 滴答滴答... 時間到囉！');
            else window.SQ.Actions?.toast('⏰ 時間到囉！');
        } else if (mode === 'pomodoro' && this._currentPhase === 'work') {
            this._currentPhase = 'break';
            this._currentTotal = this.POMODORO_BREAK;
            this._currentElapsed = 0;
            this._render('done', { mode, total: this.POMODORO_WORK, elapsed: this.POMODORO_WORK });
            setTimeout(() => {
                if (this._state === 'done') {
                    this._startTime = Date.now();
                    this._runInterval();
                    this._render('running', { mode, total: this.POMODORO_BREAK, elapsed: 0, phase: 'break' });
                }
            }, 3000);
        } else {
            this._render('done', { mode, total: this._currentTotal, elapsed });
            this._giveReward(mode, elapsed);
        }
    },

    _giveReward: function(mode, elapsed) {
        const minutes = Math.floor(elapsed / 60);

        if (minutes >= 1 && window.SQ.EventBus) {
            window.SQ.EventBus.emit('TIMER_COMPLETED', { mode, minutes });
        }

        if (mode === 'stopwatch') return;

        const gs = window.SQ.State;
        if (!gs || minutes < 1) return;

        const expReward = Math.min(minutes * 5, 200);
        gs.exp = (gs.exp || 0) + expReward;
        if (window.App) App.saveData();
        if (window.SQ.EventBus) {
            window.SQ.EventBus.emit(window.SQ.Events.Stats.UPDATED);
            window.SQ.EventBus.emit(window.SQ.Events.System.TOAST, `⏱️ 專注完成！獲得 ${expReward} EXP`);
        }
    },
};