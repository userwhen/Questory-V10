/* js/modules/settings.js - V36.0
 * 更新內容：
 * - shopItems 擴充為 10 個主題（5 沉浸世界 + 5 基礎面板）
 * - 主題名稱對應 theme_config.js
 * - applyTheme 支援 basic- 前綴主題
 */
window.SQ = window.SQ || {};
window.SQ.Engine = window.SQ.Engine || {};
window.SQ.Engine.Settings = {

    // =========================================================
    // 商店商品定義 (shopItems)
    // =========================================================
    shopItems: [

        // ── 沉浸世界 (theme_story) ────────────────────────────
        {
            id: 'theme_harem', name: '🪭 後宮模式', type: 'theme_story',
            desc: '故宮硃砂紅、宮廷金箔、專屬劇情與NPC，重溫宮廷的明爭暗鬥與古典風雅。',
            price: 300, currency: 'paid',
            color: '#82111F', bg: '#FDF9F1', border: '#C8AFA5', badge: 'HOT', preview: 'harem'
        },
        {
            id: 'theme_tech', name: '💠 未來科技', type: 'theme_story',
            desc: '深海軍藍儀表板、科技網格、高科技介面，解鎖數位專屬模組。',
            price: 300, currency: 'paid',
            color: '#0066FF', bg: '#0A1628', border: '#1E3A5F', badge: 'NEW', preview: 'tech'
        },
        {
            id: 'theme_wood', name: '🌑 魔法學院', type: 'theme_story',
            desc: '暗木深褐、魔法陣紋路、黃銅金與魔法綠，沉浸霍格華茲學院氛圍。',
            price: 300, currency: 'paid',
            color: '#2E8B57', bg: '#1A110D', border: '#523828', badge: 'NEW', preview: 'wood'
        },
        {
            id: 'theme_white', name: '☀️ 晨曦物語', type: 'theme_story',
            desc: '奶油暖白、晨曦橘光、柔光暈染，清新日系生活感完整體驗。',
            price: 300, currency: 'paid',
            color: '#D98227', bg: '#FCF9F2', border: '#EBE3D5', badge: '', preview: 'white'
        },
        {
            id: 'theme_story', name: '🌙 賽博都市', type: 'theme_story',
            desc: '極黑底色、霓虹紫光暈、掃描線紋路，沉浸賽博龐克都市。',
            price: 300, currency: 'paid',
            color: '#B829EA', bg: '#111111', border: '#333336', badge: '', preview: 'story'
        },

        // ── 基礎面板 (theme_basic) ────────────────────────────
        {
            id: 'theme_basic_harem', name: '🪭 宮廷朱色', type: 'theme_basic',
            desc: '暖米底色搭配硃砂紅調，感受宮廷典雅而不失輕盈。',
            price: 0, currency: 'pro',
            color: '#82111F', bg: '#FDF9F1', border: '#C8AFA5', badge: 'Pro', preview: 'basic-harem'
        },
        {
            id: 'theme_basic_tech', name: '💠 科技藍調', type: 'theme_basic',
            desc: '清爽藍白配色，職場科技感簡約版本。',
            price: 0, currency: 'pro',
            color: '#0066FF', bg: '#F2F5F8', border: '#CBD5E1', badge: 'Pro', preview: 'basic-tech'
        },
        {
            id: 'theme_basic_wood', name: '🌑 沉靜學院', type: 'theme_basic',
            desc: '深褐暗木色調，低調沉穩的學院風格。',
            price: 0, currency: 'pro',
            color: '#D4AF37', bg: '#35251C', border: '#523828', badge: 'Pro', preview: 'basic-wood'
        },
        {
            id: 'theme_basic_white', name: '☀️ 明亮清晨', type: 'theme_basic',
            desc: '暖白奶油色系，輕盈清爽的日常極簡風。',
            price: 0, currency: 'pro',
            color: '#F29C38', bg: '#FFFFFF', border: '#EBE3D5', badge: 'Pro', preview: 'basic-white'
        },
        {
            id: 'theme_basic_story', name: '🌙 霓光暗夜', type: 'theme_basic',
            desc: '極黑模式搭配霓虹點綴，護眼深色簡約版。',
            price: 0, currency: 'pro',
            color: '#B829EA', bg: '#1E1E21', border: '#333336', badge: 'Pro', preview: 'basic-story'
        },

        // ── 系統擴充 (module) ─────────────────────────────────
        {
            id: 'learning', name: '📚 語言學習模組', type: 'module',
            desc: '解鎖多語言劇情與單字替換功能。',
            price: 100, currency: 'paid',
            color: '#f57f17', bg: '#fff8e1', border: '#ffb300', badge: 'HOT'
        }
    ],

    // =========================================================
    // 1. 套用主題 (applyTheme)
    // =========================================================
    applyTheme: function(themeKey) {
        const gs = window.SQ.State;
        if (!gs.settings) gs.settings = {};
        gs.settings.theme = themeKey;

        if (themeKey === 'default' || !themeKey) {
            document.body.className = '';
        } else {
            document.body.className = 'theme-' + themeKey;
        }

        // 沉浸世界主題同步更新 mode
        const storyCfg = window.SQ.ThemeConfig?.themes[themeKey];
        if (storyCfg && storyCfg.type === 'story') {
            gs.settings.mode = themeKey;
        }

        if (window.App) App.saveData();

        // 重新渲染 HUD + Navbar
        if (window.view) {
            if (view.initHUD) view.initHUD(gs);
            if (view.renderNavbar) view.renderNavbar();
            if (view.renderMain && window.SQ.Temp?.currentView === 'main') view.renderMain();
        }
    },

    // =========================================================
    // 2. 應用設定變更
    // =========================================================
    applySettings: function(newSettings) {
        const gs = window.SQ.State;
        if (!gs.settings) gs.settings = {};

        if (newSettings.mode === 'learning') {
            newSettings.learningMode = true;
            if (!newSettings.targetLang) newSettings.targetLang = 'mix';
        } else if (newSettings.mode) {
            newSettings.learningMode = false;
        }

        Object.assign(gs.settings, newSettings);
        if (window.App) App.saveData();
        window.SQ.EventBus.emit(window.SQ.Events.Settings.UPDATED);
        window.SQ.EventBus.emit(window.SQ.Events.System.TOAST, '✅ 設定已儲存');
        return gs.settings.mode === 'basic' ? 'stats' : 'main';
    },

    // =========================================================
    // 3. 儲存卡路里目標
    // =========================================================
    saveCalTarget: function(val) {
        const gs = window.SQ.State;
        if (!gs.settings) gs.settings = {};
        if (!gs.unlocks) gs.unlocks = {};
        const numVal = parseInt(val);
        gs.settings.calMode = true;
        gs.settings.calMax = numVal;
        gs.unlocks.feature_cal = true;
        if (window.App) App.saveData();
        if (window.SQ.EventBus) {
            window.SQ.EventBus.emit(window.SQ.Events.Settings.UPDATED);
            window.SQ.EventBus.emit(window.SQ.Events.System.TOAST, `✅ 目標已更新: ${numVal} Kcal (功能已啟用)`);
            window.SQ.EventBus.emit(window.SQ.Events.Stats.UPDATED);
        }
    },

    // =========================================================
    // 4. 購買主題或模組
    // =========================================================
    buyMode: function(itemId) {
        const gs = window.SQ.State;
        const item = this.shopItems.find(i => i.id === itemId);
        if (!item) return;

        if (item.type && item.type.startsWith('theme')) {
            if (!window.SQ.Sub || !window.SQ.Sub.isProOrTrial()) {
                window.SQ.Sub?.showUpgradePrompt('主題功能為 Pro 專屬，請先升級');
                return;
            }
            if (item.price > 0 && (!gs.unlocks || !gs.unlocks[itemId])) {
                const totalGem = (gs.freeGem || 0) + (gs.paidGem || 0);
                if (totalGem < item.price) {
                    return window.SQ.EventBus.emit(window.SQ.Events.System.TOAST, '❌ 鑽石不足');
                }
                let cost = item.price;
                if ((gs.freeGem || 0) >= cost) gs.freeGem -= cost;
                else { cost -= (gs.freeGem || 0); gs.freeGem = 0; gs.paidGem = (gs.paidGem || 0) - cost; }
                if (!gs.unlocks) gs.unlocks = {};
                gs.unlocks[itemId] = true;
                window.SQ.EventBus.emit(window.SQ.Events.System.TOAST, `🎉 已解鎖 ${item.name}`);
            }
            const themeKey = item.preview || item.id.replace('theme_', '').replace('basic_', 'basic-');
            if (this.applyTheme) this.applyTheme(themeKey);
            if (window.SQ.Audio) window.SQ.Audio.play('save');
            if (window.SQ.View.Settings?.renderSettingsShop) window.SQ.View.Settings.renderSettingsShop();
            if (window.SQ.View.Settings?.render) window.SQ.View.Settings.render();
            return;
        }

        const totalGem = (gs.freeGem || 0) + (gs.paidGem || 0);
        if (totalGem < item.price) return window.SQ.EventBus.emit(window.SQ.Events.System.TOAST, '❌ 鑽石不足');
        let cost = item.price;
        if ((gs.freeGem || 0) >= cost) gs.freeGem -= cost;
        else { cost -= (gs.freeGem || 0); gs.freeGem = 0; gs.paidGem = (gs.paidGem || 0) - cost; }
        if (!gs.unlocks) gs.unlocks = {};
        gs.unlocks[itemId] = true;
        if (!gs.settings) gs.settings = {};
        gs.settings[itemId + '_active'] = true;
        if (window.App && typeof window.App.saveData === 'function') App.saveData();
        window.SQ.EventBus.emit(window.SQ.Events.Settings.UPDATED);
        window.SQ.EventBus.emit(window.SQ.Events.System.TOAST, `🎉 已解鎖並開啟 ${item.name}`);
    },

    // =========================================================
    // 5. 存檔管理
    // =========================================================
    downloadSaveFile: function() {
        const gs = window.SQ.State;
        const json = JSON.stringify(gs, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Levelife_Backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        return true;
    },

    parseSaveFile: function(file, callback) {
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);
                if (data && typeof data.lv !== 'undefined') {
                    callback(data);
                } else {
                    alert('❌ 檔案格式錯誤：這不是本遊戲的存檔');
                }
            } catch (err) {
                console.error(err);
                alert('❌ 檔案損毀無法讀取');
            }
        };
        reader.readAsText(file);
    },

    performReset: function() {
        console.warn('⚠️ 執行系統重置...');
        const saveKey = (window.GameConfig?.System?.SaveKey) || 'Levelife_Save_V1';
        localStorage.removeItem(saveKey);
        localStorage.removeItem('SQ_QUICK_DRAFT');
        location.reload();
    }
};

window.SettingsEngine = window.SQ.Engine.Settings;