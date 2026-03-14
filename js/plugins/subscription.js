/* www/js/plugins/modules/subscription.js - V2.0 */
/*
 * 訂閱制管理模組
 * 切換模式：SUB_MODE = 'mock' → 測試用，直接解鎖
 *           SUB_MODE = 'live' → 接 Google Play Billing 訂閱
 *
 * 功能鎖清單：
 *   - 無限任務分類（免費限 3 個）
 *   - 自訂主題 / 外觀顏色
 *   - 移除測試模式 banner
 *   - 計時器 Focus Lock 模式
 *   - 任務上限 20 個（Pro 無限）
 */

window.SQ = window.SQ || {};
window.SQ.Sub = {

    SUB_MODE: 'mock', // 'mock' | 'live'

    // Google Play 訂閱 SKU（上線前填入真實值）
    SKU_MONTHLY: 'sub_pro_monthly',   // NT$49/月
    SKU_YEARLY:  'sub_pro_yearly',    // NT$399/年

    FREE_TASK_LIMIT: 20,
    FREE_CAT_LIMIT:  3,

    TRIAL_DAYS: 7,

    // ── 判斷是否為 Pro ────────────────────────────────────
    isPro: function() {
        const sub = window.SQ.State?.subscription;
        if (!sub) return false;
        if (sub.mock) return true; // 測試模式直接 true
        if (!sub.active) return false;
        if (!sub.expiresAt) return false;
        return Date.now() < sub.expiresAt;
    },

    isInTrial: function() {
        const sub = window.SQ.State?.subscription;
        if (!sub || !sub.trialStart) return false;
        const elapsed = Date.now() - sub.trialStart;
        return elapsed < this.TRIAL_DAYS * 24 * 60 * 60 * 1000;
    },

    isProOrTrial: function() {
        return this.isPro() || this.isInTrial();
    },

    // ── 功能鎖判斷 API ───────────────────────────────────
    canAddTask: function() {
        if (this.isProOrTrial()) return { ok: true };
        const count = (window.SQ.State?.tasks || []).filter(t => !t.done).length;
        if (count < this.FREE_TASK_LIMIT) return { ok: true };
        return { ok: false, reason: `免費版上限 ${this.FREE_TASK_LIMIT} 個任務`, cta: true };
    },

    canAddCategory: function() {
        if (this.isProOrTrial()) return { ok: true };
        const cats = (window.SQ.State?.taskCats || []).length;
        if (cats < this.FREE_CAT_LIMIT) return { ok: true };
        return { ok: false, reason: `免費版上限 ${this.FREE_CAT_LIMIT} 個分類`, cta: true };
    },

    canUseFocusLock: function() {
        if (this.isProOrTrial()) return { ok: true };
        return { ok: false, reason: 'Focus Lock 為 Pro 功能', cta: true };
    },

    canUseCalendar: function() {
        if (this.isProOrTrial()) return { ok: true };
        return { ok: false, reason: '行事曆同步為 Pro 功能', cta: true };
    },

    canUseScanner: function() {
        if (this.isProOrTrial()) return { ok: true };
        return { ok: false, reason: '條碼掃描為 Pro 功能', cta: true };
    },

    canUseTheme: function() {
        if (this.isProOrTrial()) return { ok: true };
        return { ok: false, reason: '自訂主題為 Pro 功能', cta: true };
    },

    showMockBanner: function() {
        return !this.isProOrTrial();
    },

    // ── 訂閱流程 ─────────────────────────────────────────
    startTrial: function() {
        const state = window.SQ.State;
        if (!state.subscription) state.subscription = {};
        if (state.subscription.trialUsed) {
            window.SQ.Actions?.toast('⚠️ 試用期已使用過');
            return false;
        }
        state.subscription.trialStart = Date.now();
        state.subscription.trialUsed  = true;
        state.subscription.active     = true;
        if (window.App) App.saveData();
        window.SQ.Actions?.toast(`🎉 ${this.TRIAL_DAYS} 天免費試用已開始！`);
        window.SQ.Audio?.feedback('achievement');
        return true;
    },

    subscribe: async function(sku) {
        if (this.SUB_MODE === 'mock') {
            return this._mockSubscribe(sku);
        }
        return this._liveSubscribe(sku);
    },

    cancelSubscription: function() {
        // Google Play 訂閱取消在 Play Store 裡操作，App 只能引導
        const url = 'https://play.google.com/store/account/subscriptions';
        if (window.Capacitor) {
            // 可用 Browser 插件開啟
            console.log('[Sub] 導向 Play Store 取消頁面');
        }
        window.SQ.Actions?.toast('請在 Google Play 管理訂閱頁面取消');
    },

    // ── Mock 訂閱（測試用）───────────────────────────────
    _mockSubscribe: function(sku) {
        const state = window.SQ.State;
        if (!state.subscription) state.subscription = {};

        const isYearly  = sku === this.SKU_YEARLY;
        const daysToAdd = isYearly ? 365 : 30;
        const msToAdd   = daysToAdd * 24 * 60 * 60 * 1000;

        state.subscription.mock      = true;
        state.subscription.active    = true;
        state.subscription.sku       = sku;
        state.subscription.expiresAt = Date.now() + msToAdd;
        state.subscription.startedAt = Date.now();

        if (window.App) App.saveData();

        const label = isYearly ? 'Pro 年訂閱' : 'Pro 月訂閱';
        window.SQ.Actions?.toast(`✅ ${label} 已啟用！（測試模式）`);
        window.SQ.Audio?.feedback('achievement');

        // 重新渲染設定頁
        if (window.SQ.View.Settings) window.SQ.View.Settings.render();

        return { success: true, mock: true };
    },

    // ── 真實訂閱（上線後取消 comment）────────────────────
    _liveSubscribe: async function(sku) {
        /*
        if (!window.Capacitor || !Capacitor.Plugins?.GooglePlayBilling) {
            window.SQ.Actions?.toast('❌ 付款服務未就緒');
            return { success: false };
        }
        try {
            const { GooglePlayBilling } = Capacitor.Plugins;
            const result = await GooglePlayBilling.subscribe({ productId: sku });
            if (result.responseCode !== 0) {
                if (result.responseCode === 1) return { success: false, cancelled: true };
                window.SQ.Actions?.toast('❌ 訂閱失敗，請稍後再試');
                return { success: false };
            }
            // 更新本地狀態（真實有效期從 Google 回傳）
            const state = window.SQ.State;
            if (!state.subscription) state.subscription = {};
            state.subscription.active     = true;
            state.subscription.sku        = sku;
            state.subscription.purchaseToken = result.purchaseToken;
            state.subscription.expiresAt  = result.expiryTimeMillis || (Date.now() + 30*24*60*60*1000);
            state.subscription.startedAt  = Date.now();
            if (window.App) App.saveData();
            window.SQ.Actions?.toast('✅ 訂閱成功！歡迎加入 Pro！');
            window.SQ.Audio?.feedback('achievement');
            if (window.SQ.View.Settings) window.SQ.View.Settings.render();
            return { success: true };
        } catch(e) {
            console.error('[Sub] 訂閱失敗:', e);
            window.SQ.Actions?.toast('❌ 訂閱時發生錯誤');
            return { success: false, error: e };
        }
        */
        console.warn('[Sub] live 模式但插件未安裝，降級為模擬');
        return this._mockSubscribe(sku);
    },

    // ── 恢復訂閱（重裝 App 後）───────────────────────────
    restoreSubscription: async function() {
        if (this.SUB_MODE === 'mock') {
            window.SQ.Actions?.toast('ℹ️ 測試模式不支援恢復訂閱');
            return;
        }
        /*
        try {
            const { GooglePlayBilling } = Capacitor.Plugins;
            const result = await GooglePlayBilling.queryPurchases({ productType: 'subs' });
            const activeSub = result.purchases?.find(p =>
                p.productId === this.SKU_MONTHLY || p.productId === this.SKU_YEARLY
            );
            if (activeSub && activeSub.expiryTimeMillis > Date.now()) {
                const state = window.SQ.State;
                if (!state.subscription) state.subscription = {};
                state.subscription.active    = true;
                state.subscription.sku       = activeSub.productId;
                state.subscription.expiresAt = activeSub.expiryTimeMillis;
                if (window.App) App.saveData();
                window.SQ.Actions?.toast('✅ 訂閱已恢復！');
                if (window.SQ.View.Settings) window.SQ.View.Settings.render();
            } else {
                window.SQ.Actions?.toast('ℹ️ 找不到有效訂閱');
            }
        } catch(e) {
            console.error('[Sub] 恢復失敗:', e);
        }
        */
    },

    // ── 工具：顯示升級提示 ────────────────────────────────
    showUpgradePrompt: function(reason) {
        const msg = reason ? `🔒 ${reason}\n\n升級 Pro 即可解鎖！` : '升級 Pro 解鎖全部功能！';
        // 👇 [修復] 加上 window. 前綴
        if (window.sys && window.sys.confirm) {
            window.sys.confirm(msg + '\n\n前往訂閱頁面？', () => {
                window.SQ.Actions?.openSubscribePage?.();
            });
        } else {
            window.SQ.Actions?.toast(`🔒 ${reason || 'Pro 功能'} — 請升級 Pro`);
        }
    },

    // ── 格式化到期時間 ────────────────────────────────────
    expiryLabel: function() {
        const sub = window.SQ.State?.subscription;
        if (!sub?.expiresAt) return '';
        const d = new Date(sub.expiresAt);
        return `${d.getFullYear()}/${d.getMonth()+1}/${d.getDate()}`;
    },
};
