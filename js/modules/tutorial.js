/* js/modules/tutorial30.js - V6.0 Smart Tutorial (Spotlight + NPC Dialog) */
window.SQ = window.SQ || {};
window.SQ.Actions = window.SQ.Actions || {};

const Tutorial = {

    // =========================================================
    // 1. 步驟定義表
    // =========================================================
    STEPS: [
        {
            id: 'welcome',
            npc: '嗨！歡迎來到 Questory！🎉\n我是你的引導精靈。\n讓我帶你認識這個世界吧！',
            spotlight: null,
            waitFor: null
        },
        {
            id: 'hud',
            npc: '這裡是你的狀態列。\n左邊是你的角色，右邊是金幣和鑽石。\n等級越高，冒險能力越強！',
            spotlight: '#hud',
            waitFor: null,
            position: 'bottom'
        },
        {
            id: 'nav_task',
            npc: '點擊下方的「任務」按鈕，\n去看看你的任務清單！',
            spotlight: '#nav-task',
            waitFor: 'sys:navigate',
            waitFilter: (data) => data === 'task',
            position: 'top'
        },
        {
            id: 'task_intro',
            npc: '這裡是任務清單。\n完成任務可以獲得💰金幣和✨經驗值！\n點擊右下角的 ➕ 新增你的第一個任務。',
            spotlight: null,
            waitFor: 'task:created',
            action: () => window.SQ.Actions.navigate('task'),
            position: 'top'
        },
        {
            id: 'task_complete',
            npc: '太棒了！任務建立成功！🎊\n現在點擊任務左側的圓圈，\n試著完成它！',
            spotlight: '#page-task',
            waitFor: 'task:completed',
            position: 'top'
        },
        {
            id: 'stats_intro',
            npc: '完成任務獲得了獎勵！✨\n點擊左上角的角色立繪，\n查看你的屬性面板。',
            spotlight: '#hud-avatar',
            waitFor: 'sys:navigate',
            waitFilter: (data) => data === 'stats',
            action: () => window.SQ.Actions.navigate('main'),
            position: 'bottom'
        },
        {
            id: 'add_skill',
            npc: '這是你的屬性面板。\n每個屬性代表你現實中的成長方向。\n點擊「+ 新增」建立你的第一個技能！',
            spotlight: '#page-stats',
            waitFor: 'stats:updated',
            waitFilter: () => (window.SQ.State?.skills?.length || 0) > 0,
            action: () => window.SQ.Actions.navigate('stats'),
            position: 'top'
        },
        {
            id: 'shop_intro',
            npc: '技能建立成功！💡\n完成任務賺到的金幣可以在商店使用。\n點擊下方「商店」看看吧！',
            spotlight: '#nav-shop',
            waitFor: 'sys:navigate',
            waitFilter: (data) => data === 'shop',
            position: 'top'
        },
        {
            id: 'shop_browse',
            npc: '這裡有各種道具！🛒\n熱量類道具可以追蹤飲食，\n精力藥水可以恢復冒險精力。\n先逛逛，不一定要買。',
            spotlight: '#page-shop',
            waitFor: null,
            action: () => window.SQ.Actions.navigate('shop'),
            position: 'top'
        },
        {
            id: 'ach_intro',
            npc: '接下來認識「成就系統」！🏅\n在任務頁上方切換到成就分頁，\n設定你的長期目標。',
            spotlight: null,
            waitFor: null,
            action: () => {
                window.SQ.Actions.navigate('task');
                setTimeout(() => window.SQ.Actions.switchTaskTab('ach'), 450);
            },
            position: 'top'
        },
        {
            id: 'add_ach',
            npc: '成就是你的長期里程碑。\n累積完成特定任務後可以領取豐厚獎勵！\n點擊 ➕ 試著新增一個目標。',
            spotlight: '#page-task',
            waitFor: 'ach:updated',
            waitFilter: () => (window.SQ.State?.milestones?.length || 0) > 0,
            position: 'top'
        },
        {
            id: 'main_story',
            npc: '回到大廳！🏠\n中央的「⚔️ 開始探索」按鈕可以進入劇情模式。\n完成任務會累積探索精力，快去冒險吧！',
            spotlight: null,
            action: () => window.SQ.Actions.navigate('main'),
            waitFor: null,
            position: 'bottom'
        },
        {
            id: 'avatar_intro',
            npc: '右上角的 👗 按鈕可以進入換裝室！\n解鎖不同造型，打造你專屬的角色。',
            spotlight: null,
            waitFor: null,
            position: 'bottom'
        },
        {
            id: 'settings_intro',
            npc: '右上角的 ≡ 按鈕是設定選單。\n可以切換模式、開啟卡路里追蹤，\n或備份你的存檔。',
            spotlight: null,
            waitFor: null,
            position: 'bottom'
        },
        {
            id: 'finish',
            npc: '恭喜完成教學！🎉\n\n記得每天完成任務，讓角色跟著你一起成長！\n\n送你 200 金幣作為出發的禮物！💰',
            spotlight: null,
            waitFor: null,
            position: 'bottom'
        }
    ],

    // =========================================================
    // 2. 內部狀態
    // =========================================================
    _currentStep: 0,
    _overlayEl: null,
    _dialogEl: null,
    _ringEl: null,
    _waitHandler: null,
    _active: false,

    // =========================================================
    // 3. 啟動 / 結束 / 跳過
    // =========================================================
    checkTutorial: function() {
        const gs = window.SQ.State;
        if (!gs) return;
        if (!gs.settings) gs.settings = {};
        if (typeof gs.settings.tutorialDone === 'undefined') gs.settings.tutorialDone = false;

        // 老手保護
        if (gs.lv > 1 && !gs.settings.tutorialDone) {
            gs.settings.tutorialDone = true;
            window.SQ.Actions.save();
            return;
        }
        if (gs.settings.tutorialDone) return;

        setTimeout(() => {
            const active = document.querySelector('.page.active');
            if (active && active.id !== 'page-main') return;
            this.start();
        }, 600);
    },

    start: function() {
        this._currentStep = 0;
        this._active = true;
        this._createUI();
        this._runStep(0);
    },

    finish: function() {
        this._active = false;
        this._removeWaitHandler();
        this._destroyUI();

        const gs = window.SQ.State;
        gs.settings.tutorialDone = true;

        if (!gs.settings.tutorialRewarded) {
            gs.gold = (gs.gold || 0) + 200;
            gs.settings.tutorialRewarded = true;
            window.SQ.Actions.toast('🎉 教學完成！獲得 💰200 金幣！');
        } else {
            window.SQ.Actions.toast('✅ 教學重看完成！');
        }

        window.SQ.Actions.save();
        if (window.SQ.View.Main && view.updateHUD) view.updateHUD(gs);
    },

    skip: function() {
        this._active = false;
        this._removeWaitHandler();
        this._destroyUI();
        const gs = window.SQ.State;
        gs.settings.tutorialDone = true;
        if (!gs.settings.tutorialRewarded) {
            gs.gold = (gs.gold || 0) + 200;
            gs.settings.tutorialRewarded = true;
        }
        window.SQ.Actions.save();
        window.SQ.Actions.toast('已跳過教學');
    },

    // =========================================================
    // 4. 步驟執行器
    // =========================================================
    _runStep: function(index) {
        if (!this._active) return;
        if (index >= this.STEPS.length) { this.finish(); return; }

        this._currentStep = index;
        const step = this.STEPS[index];

        if (step.action) {
            try { step.action(); } catch(e) { console.warn('[Tutorial] action error:', e); }
        }

        const delay = step.action ? 450 : 50;
        setTimeout(() => {
            this._updateSpotlight(step.spotlight);
            this._updateDialog(step.npc, step.position || 'bottom', !!step.waitFor);
        }, delay);

        this._removeWaitHandler();
        if (step.waitFor) {
            this._attachWaitHandler(step.waitFor, step.waitFilter);
        }
    },

    _next: function() {
        if (!this._active) return;
        this._removeWaitHandler();
        this._runStep(this._currentStep + 1);
    },

    // =========================================================
    // 5. 事件等待機制
    // =========================================================
    _attachWaitHandler: function(eventName, filterFn) {
        const handler = (data) => {
            if (filterFn && !filterFn(data)) return;
            this._removeWaitHandler();
            setTimeout(() => this._next(), 350);
        };
        window.SQ.EventBus.on(eventName, handler);
        this._waitHandler = { event: eventName, fn: handler };
    },

    _removeWaitHandler: function() {
        if (this._waitHandler) {
            window.SQ.EventBus.off(this._waitHandler.event, this._waitHandler.fn);
            this._waitHandler = null;
        }
    },

    // =========================================================
    // 6. UI 建立、更新、銷毀
    // =========================================================
    _createUI: function() {
        this._overlayEl = document.getElementById('tuto-spotlight');
		if (this._overlayEl) {
        this._overlayEl.style.cssText = 
            // ❌ 原本是 auto，改成 none 讓點擊可以穿透到下方的按鈕
            'pointer-events:none; z-index:7999; position:fixed; inset:0; background:rgba(0,0,0,0); transition:background 0.3s;';
    }

        if (!document.getElementById('tuto-style')) {
            const style = document.createElement('style');
            style.id = 'tuto-style';
            style.textContent = `
                @keyframes tuto-fadein {
                    from { opacity:0; transform:translateX(-50%) translateY(10px); }
                    to   { opacity:1; transform:translateX(-50%) translateY(0); }
                }
                #tuto-dialog { animation: tuto-fadein 0.25s ease; }
                .tuto-ring {
                    position:fixed; border-radius:12px;
                    border:3px solid var(--color-gold,#f5a623);
                    box-shadow:0 0 0 4px rgba(245,166,35,0.3), 0 0 20px rgba(245,166,35,0.4);
                    pointer-events:none; z-index:8050;
                    transition:all 0.3s ease;
                    animation:tuto-pulse 1.5s ease-in-out infinite;
                }
                @keyframes tuto-pulse {
                    0%,100% { box-shadow:0 0 0 4px rgba(245,166,35,0.3),0 0 20px rgba(245,166,35,0.4); }
                    50%     { box-shadow:0 0 0 8px rgba(245,166,35,0.1),0 0 30px rgba(245,166,35,0.6); }
                }
            `;
            document.head.appendChild(style);
        }

        this._ringEl = document.createElement('div');
        this._ringEl.className = 'tuto-ring';
        this._ringEl.style.display = 'none';
        document.getElementById('app-frame').appendChild(this._ringEl);

        this._dialogEl = document.createElement('div');
        this._dialogEl.id = 'tuto-dialog';
        this._dialogEl.style.cssText = `
        position:fixed; left:50%; transform:translateX(-50%);
        // ✅ 確保對話框本身依然可以點擊按鈕
        pointer-events: auto; 
        width:min(90vw,380px);
        background:var(--bg-card,#fff);
        z-index:8100;
        border:2px solid var(--color-gold,#f5a623);
    `;
        document.getElementById('app-frame').appendChild(this._dialogEl);
    },

    _destroyUI: function() {
        if (this._dialogEl) { this._dialogEl.remove(); this._dialogEl = null; }
        if (this._ringEl) { this._ringEl.remove(); this._ringEl = null; }
        if (this._overlayEl) {
            this._overlayEl.style.background = 'rgba(0,0,0,0)';
            this._overlayEl.style.pointerEvents = 'none';
        }
    },

    _updateSpotlight: function(selector) {
        if (!this._overlayEl || !this._ringEl) return;

        if (!selector) {
            this._overlayEl.style.background = 'rgba(0,0,0,0.2)';
            this._ringEl.style.display = 'none';
            return;
        }

        const target = document.querySelector(selector);
        if (!target) {
            this._overlayEl.style.background = 'rgba(0,0,0,0.2)';
            this._ringEl.style.display = 'none';
            return;
        }

        const rect = target.getBoundingClientRect();
        const pad = 6;
        this._overlayEl.style.background = 'rgba(0,0,0,0.5)';
        Object.assign(this._ringEl.style, {
            display: 'block',
            top:    (rect.top    - pad) + 'px',
            left:   (rect.left   - pad) + 'px',
            width:  (rect.width  + pad * 2) + 'px',
            height: (rect.height + pad * 2) + 'px'
        });
    },

    _updateDialog: function(text, position, isWaiting) {
        if (!this._dialogEl) return;

        const isLast = this._currentStep === this.STEPS.length - 1;
        const progress = `${this._currentStep + 1} / ${this.STEPS.length}`;

        let btnHtml;
        if (isWaiting) {
            btnHtml = `<button disabled style="flex:1;padding:10px;border-radius:10px;background:var(--bg-box,#f5f5f5);color:var(--text-muted,#aaa);border:none;font-size:0.9rem;">⏳ 請依引導操作...</button>`;
        } else if (isLast) {
            btnHtml = `<button id="tuto-btn-finish" style="flex:1;padding:10px;border-radius:10px;background:var(--color-gold,#f5a623);color:#fff;border:none;font-weight:bold;font-size:0.95rem;cursor:pointer;">🎉 開始冒險！</button>`;
        } else {
            btnHtml = `<button id="tuto-btn-next" style="flex:1;padding:10px;border-radius:10px;background:var(--color-gold,#f5a623);color:#fff;border:none;font-weight:bold;font-size:0.95rem;cursor:pointer;">繼續 →</button>`;
        }

        const skipHtml = !isLast
            ? `<button id="tuto-btn-skip" style="padding:10px 14px;border-radius:10px;background:none;color:var(--text-muted,#aaa);border:1px solid var(--border,#ddd);font-size:0.85rem;cursor:pointer;">跳過</button>`
            : '';

        this._dialogEl.innerHTML = `
            <div style="display:flex;align-items:flex-start;gap:10px;margin-bottom:12px;">
                <div style="font-size:1.8rem;flex-shrink:0;line-height:1;">🧚</div>
                <div style="font-size:0.95rem;color:var(--text,#333);line-height:1.65;white-space:pre-line;">${text}</div>
            </div>
            <div style="display:flex;align-items:center;gap:8px;">
                ${skipHtml}${btnHtml}
            </div>
            <div style="text-align:right;font-size:0.72rem;color:var(--text-ghost,#ccc);margin-top:6px;">${progress}</div>
        `;

        // 定位
        if (position === 'top') {
            this._dialogEl.style.top = '80px';
            this._dialogEl.style.bottom = 'auto';
        } else {
            this._dialogEl.style.bottom = '90px';
            this._dialogEl.style.top = 'auto';
        }

        // 綁定按鈕（教學對話框用原生 addEventListener，不走全域 dispatcher）
        document.getElementById('tuto-btn-next')?.addEventListener('click', () => this._next());
        document.getElementById('tuto-btn-finish')?.addEventListener('click', () => this.finish());
        document.getElementById('tuto-btn-skip')?.addEventListener('click', () => this.skip());
    }
};

// =========================================================
// 7. 全域接口掛載
// =========================================================
window.SQ.Actions.checkTutorial = () => Tutorial.checkTutorial();
window.SQ.Actions.restartTutorial = () => {
    window.SQ.State.settings.tutorialDone = false;
    window.SQ.Actions.navigate('main');
    setTimeout(() => Tutorial.start(), 400);
};

window.Tutorial = Tutorial;
console.log('✅ Tutorial V6.0 Loaded');