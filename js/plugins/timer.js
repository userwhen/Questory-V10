/* www/js/modules/timer.js - V4.0 (Pure CSP + Auto Permission + UI Fix) */
window.SQ = window.SQ || {};
window.SQ.Timer = {

    _state:        null,
    _interval:     null,
    _el:           null,
    _startTime:    0,
    _alertEnabled: true,
    _focusLocked:  false,   
    _backHandler:  null,    
    _visHandler:   null,    

    POMODORO_WORK:  25 * 60,
    POMODORO_BREAK: 5  * 60,

    open: function(opts = {}) {
        if (this._el) this._el.remove();
        this._opts = opts;
        this._currentMode    = opts.defaultMode || 'countdown';
        this._currentTotal   = opts.defaultMinutes ? opts.defaultMinutes * 60 : 15 * 60;
        this._currentElapsed = 0;
        this._focusLocked    = false; 
        this._render('idle');
    },

    close: function() {
        if (this._focusLocked) {
            window.SQ.Actions?.toast('🔒 專注鎖定中，請先完成計時');
            window.SQ.Audio?.play('error');
            return;
        }
        this._stop();
        this._releaseFocusLock(); 
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
                position: absolute; top: 0; left: 0; right: 0; bottom: 0;
                z-index: 10000; background: rgba(10,10,18,0.96);
                display: flex; flex-direction: column; align-items: center; justify-content: center;
                opacity: 0; transition: opacity 0.25s, transform 0.25s;
                transform: scale(0.97); font-family: inherit;
            `;

            // ✅ 徹底移除 onclick，改用獨立的事件代理 (Event Delegation) 符合 CSP 規範
            this._el.addEventListener('click', (e) => {
                const btn = e.target.closest('[data-t-action]');
                if (!btn) return;
                const act = btn.dataset.tAction;
                const val = btn.dataset.tVal;

                if (act === 'close') this.close();
                else if (act === 'toggleAlert') this._toggleAlert();
                else if (act === 'selectMode') this._selectMode(val);
                else if (act === 'toggleFocusLock') this._toggleFocusLockSetting();
                else if (act === 'adjustTime') this._adjustTime(Number(val));
                else if (act === 'startTimer') this._startTimer();
                else if (act === 'togglePause') this._togglePause();
                else if (act === 'finishEarly') this._finishEarly();
                else if (act === 'restart') this._restart();
            });

            const container = document.getElementById('app-frame') || document.body;
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
        const progress  = mode === 'stopwatch' ? Math.min(elapsed / 3600, 1) : (total > 0 ? (total - remaining) / total : 0);

        const mins = String(Math.floor(remaining / 60)).padStart(2, '0');
        const secs = String(remaining % 60).padStart(2, '0');
        const timeDisplay = mode === 'stopwatch' ? `${String(Math.floor(elapsed/60)).padStart(2,'0')}:${String(elapsed%60).padStart(2,'0')}` : `${mins}:${secs}`;

        const R  = 110;
        const C  = 2 * Math.PI * R;
        const dash = C * (1 - progress);
        const isPro = !window.SQ.Sub || window.SQ.Sub.isProOrTrial();
        const focusActive = this._focusLocked;

        const colors = {
            countdown: focusActive ? { ring:'#ef5350', glow:'rgba(239,83,80,0.3)', text:'#ff8a80' } : { ring:'#f0a500', glow:'rgba(240,165,0,0.3)',  text:'#ffd166' },
            pomodoro:  { ring: phase==='work' ? '#e55a5a' : '#4caf87', glow: phase==='work' ? 'rgba(229,90,90,0.3)' : 'rgba(76,175,135,0.3)', text: phase==='work' ? '#ff8080' : '#66ffcc' },
            stopwatch: focusActive ? { ring:'#ef5350', glow:'rgba(239,83,80,0.3)', text:'#ff8a80' } : { ring:'#5b8af0', glow:'rgba(91,138,240,0.3)', text:'#80a8ff' }
        };
        const col = colors[mode] || colors.countdown;

        const modeLabels = { countdown: '⏳ 倒數計時', pomodoro: phase === 'work' ? '🍅 專注中' : '☕ 休息中', stopwatch: '⏱️ 正計時' };
        const isDone = state === 'done';
        const btnStyle = (bg, fg='#fff') => `padding:14px 28px; border-radius:50px; border:none; cursor:pointer; background:${bg}; color:${fg}; font-size:1rem; font-weight:700; letter-spacing:0.05em; transition:all 0.15s; user-select:none;`;

        const modeSelector = state === 'idle' ? `
            <div style="display:flex; gap:10px; margin-bottom:16px;">
                ${['countdown','pomodoro','stopwatch'].map(m => `
                    <div data-t-action="selectMode" data-t-val="${m}"
                         style="padding:8px 12px; border-radius:50px; cursor:pointer; font-size:0.82rem; font-weight:600; transition:all 0.15s;
                                background:${mode===m ? col.ring : 'rgba(255,255,255,0.07)'};
                                color:${mode===m ? '#111' : 'rgba(255,255,255,0.5)'};">
                        ${{countdown:'⏳ 倒數', pomodoro:'🍅 番茄', stopwatch:'⏱️ 正計時'}[m]}
                    </div>`).join('')}
            </div>
            <div data-t-action="toggleFocusLock"
                 style="display:flex; align-items:center; gap:8px; margin-bottom:20px; padding:10px 16px; border-radius:50px; cursor:pointer;
                        background:${focusActive ? 'rgba(239,83,80,0.15)' : 'rgba(255,255,255,0.05)'};
                        border:1px solid ${focusActive ? 'rgba(239,83,80,0.4)' : 'rgba(255,255,255,0.1)'};">
                <span style="font-size:0.9rem;">${focusActive ? '🔒' : '🔓'}</span>
                <span style="font-size:0.82rem; font-weight:600; color:${focusActive ? '#ff8a80' : 'rgba(255,255,255,0.4)'};">Focus Lock ${focusActive ? '已開啟' : '關閉'}</span>
                ${!isPro ? '<span style="font-size:0.7rem; color:rgba(255,255,255,0.25); margin-left:auto;">PRO</span>' : ''}
            </div>` : '';

        const timeSetHtml = (state === 'idle' && mode === 'countdown') ? `
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:20px;">
                <button data-t-action="adjustTime" data-t-val="-5" style="${btnStyle('rgba(255,255,255,0.08)','rgba(255,255,255,0.7)')} padding:8px 14px; font-size:1.1rem;">−5</button>
                <button data-t-action="adjustTime" data-t-val="-1" style="${btnStyle('rgba(255,255,255,0.08)','rgba(255,255,255,0.7)')} padding:8px 14px;">−1</button>
                <span style="font-size:1.1rem; color:rgba(255,255,255,0.5); min-width:60px; text-align:center;">${Math.floor(total/60)} 分鐘</span>
                <button data-t-action="adjustTime" data-t-val="1" style="${btnStyle('rgba(255,255,255,0.08)','rgba(255,255,255,0.7)')} padding:8px 14px;">+1</button>
                <button data-t-action="adjustTime" data-t-val="5" style="${btnStyle('rgba(255,255,255,0.08)','rgba(255,255,255,0.7)')} padding:8px 14px; font-size:1.1rem;">+5</button>
            </div>` : '';

        const doneHtml = isDone ? `
            <div style="text-align:center; margin-bottom:24px;">
                <div style="font-size:3rem; margin-bottom:8px;">${mode === 'countdown' ? '⏰' : '🎉'}</div>
                <div style="font-size:1.2rem; font-weight:700; color:#fff;">${mode === 'countdown' ? '⏰ 時間到！' : '🎉 專注完成！'}</div>
                <div style="font-size:0.9rem; color:rgba(255,255,255,0.5); margin-top:4px;">${mode === 'stopwatch' ? `共計時 ${String(Math.floor(elapsed/60)).padStart(2,'0')}:${String(elapsed%60).padStart(2,'0')}` : `${Math.floor(total/60)} 分鐘`}</div>
            </div>` : '';

        let ctrlHtml = '';
        if (isDone) {
            ctrlHtml = `<div style="display:flex; gap:12px;"><button data-t-action="restart" style="${btnStyle('rgba(255,255,255,0.08)','rgba(255,255,255,0.7)')}">🔁 再來一次</button><button data-t-action="close" style="${btnStyle(col.ring, '#111')}">完成 ✓</button></div>`;
        } else if (state === 'idle') {
            ctrlHtml = `<button data-t-action="startTimer" style="${btnStyle(col.ring, '#111')} min-width:160px;">▶ 開始</button>`;
        } else {
            ctrlHtml = `
                <div style="display:flex; gap:12px; align-items:center;">
                    <button data-t-action="togglePause" style="${btnStyle(col.ring, '#111')} min-width:100px;">${state === 'paused' ? '▶ 繼續' : '⏸ 暫停'}</button>
                    ${(!focusActive || mode === 'stopwatch') ? `
                    <button data-t-action="finishEarly" style="${btnStyle('rgba(255,255,255,0.08)','rgba(255,255,255,0.5)')} padding:10px 18px; font-size:0.85rem;">${mode === 'stopwatch' ? '⏹ 結束' : '✕ 放棄'}</button>` : `
                    <div style="font-size:0.75rem; color:rgba(239,83,80,0.6); text-align:center; max-width:80px; line-height:1.4;">🔒 鎖定中<br>堅持到底！</div>`}
                </div>`;
        }

        const focusBadge = focusActive && state === 'running' ? `<div style="position:absolute; top:16px; left:50%; transform:translateX(-50%); background:rgba(239,83,80,0.15); border:1px solid rgba(239,83,80,0.3); border-radius:50px; padding:4px 12px; font-size:0.75rem; color:#ff8a80; z-index:100;">🔒 FOCUS LOCK 啟動中</div>` : '';

        this._el.innerHTML = `
            ${focusBadge}
            ${!focusActive ? `<button data-t-action="close" style="position:absolute; top:16px; right:16px; background:rgba(255,255,255,0.07); border:none; border-radius:50%; width:36px; height:36px; cursor:pointer; color:rgba(255,255,255,0.4); font-size:1rem; z-index:100;">✕</button>` : ''}
            
            <div style="display:flex; flex-direction:column; align-items:center; gap:8px;">
                <div style="font-size:0.82rem; font-weight:600; color:${col.ring}; letter-spacing:0.1em; text-transform:uppercase; margin-bottom:4px;">${modeLabels[mode] || ''}</div>
                ${modeSelector}
                ${timeSetHtml}
                ${(state === 'idle' && mode === 'pomodoro') ? `<div style="margin-bottom:16px; font-size:0.82rem; color:rgba(255,255,255,0.35);">25 分鐘專注 → 5 分鐘休息</div>` : ''}
                ${doneHtml}
                
                <div style="position:relative; margin-bottom:24px; width:260px; height:260px;">
                    <button data-t-action="toggleAlert" id="sq-timer-alert-btn"
                            style="position:absolute; top:4px; right:4px; z-index:100;
                                   background:rgba(255,255,255,0.07); border:1px solid rgba(255,255,255,0.1); 
                                   border-radius:50%; width:36px; height:36px; 
                                   cursor:pointer; font-size:1.1rem; color:#fff;">
                        ${this._alertEnabled ? '🔔' : '🔕'}
                    </button>

                    <svg width="260" height="260" viewBox="0 0 260 260">
                        <circle cx="130" cy="130" r="${R}" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="12"/>
                        <circle cx="130" cy="130" r="${R}" fill="none" stroke="${col.ring}" stroke-width="12" stroke-linecap="round" stroke-dasharray="${C}" stroke-dashoffset="${dash}" transform="rotate(-90 130 130)" style="filter:drop-shadow(0 0 8px ${col.glow}); transition:stroke-dashoffset 0.8s ease;"/>
                    </svg>
                    <div style="position:absolute; inset:0; display:flex; flex-direction:column; align-items:center; justify-content:center; gap:4px; pointer-events:none;">
                        <div style="font-size:3rem; font-weight:200; letter-spacing:0.05em; color:${col.text}; font-variant-numeric:tabular-nums;">${timeDisplay}</div>
                        ${mode === 'stopwatch' && state === 'running' ? `<div style="font-size:0.72rem; color:rgba(255,255,255,0.3);">${focusActive ? '🔒 專注中' : '計時中'}</div>` : ''}
                    </div>
                </div>

                ${ctrlHtml}
            </div>
        `;
    },

    _toggleFocusLockSetting: function() {
        const isPro = !window.SQ.Sub || window.SQ.Sub.isProOrTrial();
        if (!isPro) { window.SQ.Sub?.showUpgradePrompt('Focus Lock 為 Pro 功能'); return; }
        this._focusLocked = !this._focusLocked;
        this._render('idle', { mode: this._currentMode, total: this._currentTotal, elapsed: 0, phase: 'work' });
        window.SQ.Audio?.play('toggle_on');
    },

    _applyFocusLock: function() {
        if (!this._origNavigate) {
            this._origNavigate = window.SQ.Actions?.navigate;
            if (window.SQ.Actions) window.SQ.Actions.navigate = () => { window.SQ.Actions.toast('🔒 專注鎖定中，請先完成計時'); window.SQ.Audio?.play('error'); };
        }
        if (window.Capacitor?.Plugins?.App && !this._backHandler) {
            window.Capacitor.Plugins.App.addListener('backButton', () => { window.SQ.Actions?.toast('🔒 專注鎖定中'); window.SQ.Audio?.play('error'); }).then(h => this._backHandler = h);
        }
        this._visHandler = () => {
            if (document.hidden && this._state === 'running' && this._focusLocked && this._currentMode !== 'stopwatch') {
                this._focusLocked = false; 
                this._finishEarly();
                if (window.sys?.alert) window.sys.alert('🚨 專注失敗！<br>你離開了畫面，專注已被中斷。');
            }
        };
        document.addEventListener('visibilitychange', this._visHandler);
    },

    _releaseFocusLock: function() {
        if (this._origNavigate && window.SQ.Actions) { window.SQ.Actions.navigate = this._origNavigate; this._origNavigate = null; }
        if (this._backHandler) { this._backHandler.remove?.(); this._backHandler = null; }
        if (this._visHandler) { document.removeEventListener('visibilitychange', this._visHandler); this._visHandler = null; }
    },

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
        if (this._focusLocked) this._applyFocusLock();
        this._currentPhase = 'work';
        this._startTime = Date.now();
        
        this._scheduleBgAlarm();

        this._render('running', { mode: this._currentMode, total: this._currentTotal, elapsed: this._currentElapsed, phase: this._currentPhase });
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
                this._render('running', { mode, total: this._currentTotal, elapsed: this._currentElapsed, phase: this._currentPhase });
            } else {
                const remaining = this._currentTotal - this._currentElapsed;
                if (remaining <= 0) {
                    this._currentElapsed = this._currentTotal;
                    this._onComplete();
                    return;
                }
                this._render('running', { mode, total: this._currentTotal, elapsed: this._currentElapsed, phase: this._currentPhase });
            }
        }, 1000);
        this._state = 'running';
    },

    _togglePause: function() {
        if (this._state === 'running') {
            this._state = 'paused';
            clearInterval(this._interval);
            this._cancelBgAlarm(); 
            this._render('paused', { mode: this._currentMode, total: this._currentTotal, elapsed: this._currentElapsed, phase: this._currentPhase });
        } else if (this._state === 'paused') {
            this._startTime = Date.now() - (this._currentElapsed * 1000);
            this._scheduleBgAlarm(); 
            this._runInterval();
        }
    },

    _toggleAlert: function() {
        this._alertEnabled = !this._alertEnabled;
        const btn = document.getElementById('sq-timer-alert-btn');
        if (btn) btn.innerText = this._alertEnabled ? '🔔' : '🔕';
        
        if (!this._alertEnabled) this._cancelBgAlarm();
        else if (this._state === 'running') this._scheduleBgAlarm();
        
        window.SQ.Audio?.play('click');
    },

    _stop: function(showIdle = false) {
        clearInterval(this._interval);
        this._interval = null;
        this._cancelBgAlarm();
        if (showIdle) {
            this._currentElapsed = 0;
            this._render('idle', { mode: this._currentMode, total: this._currentTotal, elapsed: 0, phase: 'work' });
        }
    },

    _restart: function() {
        this._currentElapsed = 0;
        this._currentPhase   = 'work';
        this._focusLocked    = false; 
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
        this._cancelBgAlarm();

        const mode    = this._currentMode;
        const elapsed = this._currentElapsed;

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
                    this._scheduleBgAlarm();
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
        if (minutes >= 1 && window.SQ.EventBus) window.SQ.EventBus.emit('TIMER_COMPLETED', { mode, minutes });

        const gs = window.SQ.State;
        if (!gs || minutes < 1) return;

        const expReward = Math.min(minutes * 5, 300); 
        gs.exp = (gs.exp || 0) + expReward;
        
        if (window.App) App.saveData();
        if (window.SQ.EventBus) {
            window.SQ.EventBus.emit(window.SQ.Events.Stats.UPDATED);
            window.SQ.EventBus.emit(window.SQ.Events.System.TOAST, `⏱️ 專注完成！獲得 ${expReward} EXP`);
        }
    },

    // ── 背景鬧鐘工具 (✅ 加入 Android 13 權限防呆) ─────────
    _scheduleBgAlarm: async function() {
        if (!this._alertEnabled || this._currentMode === 'stopwatch') return;
        if (window.Capacitor?.Plugins?.LocalNotifications) {
            try {
                const LN = Capacitor.Plugins.LocalNotifications;
                
                // ✅ 動態檢查並索取推播權限
                let perm = await LN.checkPermissions();
                if (perm.display !== 'granted') {
                    perm = await LN.requestPermissions();
                    if (perm.display !== 'granted') {
                        window.SQ.Actions?.toast('⚠️ 請開啟通知權限，否則無法在背景響鈴');
                        return; // 沒權限就放棄排程
                    }
                }

                const endMs = Date.now() + ((this._currentTotal - this._currentElapsed) * 1000);
                await LN.schedule({
                    notifications: [{
                        id: 8888, 
                        title: '⏰ 時間到囉！', 
                        body: '你的計時已完成，快回來看！',
                        // 👇 加上 allowWhileIdle: true，強制休眠時也要響鈴！
                        schedule: { at: new Date(endMs), allowWhileIdle: true }, 
                        sound: 'default', 
                        channelId: 'quest-reminder' 
                    }]
                });
            } catch (e) {
                console.warn('[Timer] 背景通知排程失敗', e);
            }
        }
    },

    _cancelBgAlarm: function() {
        if (window.Capacitor?.Plugins?.LocalNotifications) {
            Capacitor.Plugins.LocalNotifications.cancel({ notifications: [{ id: 8888 }] })
                .catch(e => console.warn('[Timer] 取消背景通知失敗', e));
        }
    }
};