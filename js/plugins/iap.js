/* www/js/modules/iap.js - V2.0 */
/* Google Play In-App Purchase 整合層 */
/* 
 * 切換模式說明：
 *   開發/測試：IAP_MODE = 'mock'  → 直接給鑽石，不呼叫 Play Store
 *   上線真實：IAP_MODE = 'live'   → 呼叫 @capacitor-community/google-play-billing
 *
 * 上線前只需要：
 *   1. npm install @capacitor-community/google-play-billing
 *   2. npx cap sync android
 *   3. 將下方 IAP_MODE 改為 'live'
 *   4. 填入 Google Play Console 設定的 SKU 字串
 */

window.SQ = window.SQ || {};
window.SQ.IAP = {

    // ── 設定區（上線前修改這裡）───────────────────────────
    IAP_MODE: 'mock', // 'mock' | 'live'

    // Google Play Console 商品 ID（上線前填入真實 SKU）
    PRODUCTS: [
        { sku: 'gem_30',   gems: 30,   price: 'NT$30',  label: '小袋鑽石',  icon: '💎', badge: null,       savePct: null, color: '#4fc3f7' },
        { sku: 'gem_100',  gems: 100,  price: 'NT$90',  label: '鑽石袋',    icon: '💎', badge: '🔥 最熱門', savePct: null, color: '#ff7043' },
        { sku: 'gem_300',  gems: 300,  price: 'NT$250', label: '鑽石箱',    icon: '💎', badge: '⚡ 超值',   savePct: 17,   color: '#ab47bc' },
        { sku: 'gem_1000', gems: 1000, price: 'NT$790', label: '鑽石寶庫',  icon: '💎', badge: '👑 最划算', savePct: 34,   color: '#ffc107' },
    ],

    // 贊助商品（請開發者喝咖啡）
    DONATE_PRODUCTS: [
        { sku: 'coffee_1', price: 'NT$30', label: '請開發者喝咖啡', icon: '☕', desc: '小小支持，大大鼓勵！' },
    ],

    _initialized: false,

    // ── 初始化（在 main.js 呼叫）────────────────────────────
    init: async function() {
        if (this._initialized) return;
        this._initialized = true;

        if (this.IAP_MODE === 'live') {
            await this._initLive();
        } else {
            console.log('[IAP] 模擬模式啟動，不連接 Play Store');
        }
    },

    // ── 取得商品列表（供 UI 顯示）───────────────────────────
    getProducts: function() {
        return this.PRODUCTS;
    },

    getDonateProducts: function() {
        return this.DONATE_PRODUCTS;
    },

    // ── 購買主入口 ────────────────────────────────────────────
    purchase: async function(sku) {
        const product = this.PRODUCTS.find(p => p.sku === sku)
                     || this.DONATE_PRODUCTS.find(p => p.sku === sku);
        if (!product) {
            window.SQ.Actions?.toast('❌ 找不到商品');
            return { success: false };
        }

        if (this.IAP_MODE === 'mock') {
            return this._mockPurchase(product);
        } else {
            return this._livePurchase(product);
        }
    },

    // ── 模擬購買（開發測試用）────────────────────────────────
    _mockPurchase: function(product) {
        // 贊助商品：不給鑽石，只顯示感謝
        if (product.sku.startsWith('coffee_')) {
            window.SQ.Actions?.toast('☕ 感謝你的支持！（測試模式）');
            window.SQ.Audio?.feedback('achievement');
            return { success: true, mock: true, donate: true };
        }

        // 一般鑽石商品
        window.SQ.Engine.Shop.addGem(product.gems);
        if (window.App) App.saveData();

        window.SQ.Actions?.toast(`💎 獲得 ${product.gems} 鑽石！（測試模式）`);
        window.SQ.Audio?.feedback('purchase');

        if (window.SQ.View.Main && view.updateHUD) {
            view.updateHUD(window.SQ.State);
        }

        return { success: true, mock: true, gems: product.gems };
    },

    // ── 真實 IAP（上線後啟用）────────────────────────────────
    _livePurchase: async function(product) {
        /* 
         * 上線時取消下方的 block comment，並安裝插件：
         * npm install @capacitor-community/google-play-billing
         * npx cap sync android
         */

        /*
        if (!window.Capacitor || !Capacitor.Plugins?.GooglePlayBilling) {
            window.SQ.Actions?.toast('❌ 付款服務未就緒');
            return { success: false };
        }

        try {
            const { GooglePlayBilling } = Capacitor.Plugins;

            // 1. 發起購買
            const purchaseResult = await GooglePlayBilling.purchase({ productId: product.sku });

            if (purchaseResult.responseCode !== 0) {
                // 使用者取消或失敗
                if (purchaseResult.responseCode === 1) {
                    // 使用者主動取消，不顯示錯誤
                    return { success: false, cancelled: true };
                }
                window.SQ.Actions?.toast('❌ 購買失敗，請稍後再試');
                return { success: false };
            }

            // 2. 伺服器驗證（建議：送到你的後端驗證 purchaseToken）
            // const verified = await this._verifyReceipt(purchaseResult.purchaseToken, product.sku);
            // if (!verified) { ... }

            // 3. 確認消費（消耗型商品必須呼叫，否則 3 天後自動退款）
            await GooglePlayBilling.consumePurchase({ purchaseToken: purchaseResult.purchaseToken });

            // 4. 給予鑽石
            window.SQ.Engine.Shop.addGem(product.gems);
            if (window.App) App.saveData();

            window.SQ.Actions?.toast(`💎 獲得 ${product.gems} 鑽石！感謝支持！`);
            window.SQ.Audio?.feedback('purchase');

            if (window.SQ.View.Main && view.updateHUD) {
                view.updateHUD(window.SQ.State);
            }

            return { success: true, gems: product.gems };

        } catch (e) {
            console.error('[IAP] 購買失敗:', e);
            window.SQ.Actions?.toast('❌ 購買時發生錯誤');
            return { success: false, error: e };
        }
        */

        // 上線前的暫時備用（不應該進到這裡）
        console.warn('[IAP] live 模式但插件未安裝，降級為模擬');
        return this._mockPurchase(product);
    },

    // ── 收據驗證（選用，建議上線後接後端）──────────────────
    _verifyReceipt: async function(purchaseToken, sku) {
        /*
         * 建議：架設一個簡單的後端 API 驗證購買
         * Google Play Developer API:
         * GET https://androidpublisher.googleapis.com/androidpublisher/v3/
         *     applications/{packageName}/purchases/products/{productId}/tokens/{token}
         *
         * 簡單驗證範例（需要自己的後端）：
         *
         * const res = await fetch('https://your-backend.com/verify', {
         *     method: 'POST',
         *     body: JSON.stringify({ token: purchaseToken, sku })
         * });
         * return res.ok;
         */
        return true; // 暫時跳過驗證
    },

    // ── 恢復購買（使用者重裝 App 後呼叫）────────────────────
    restorePurchases: async function() {
        if (this.IAP_MODE === 'mock') {
            window.SQ.Actions?.toast('ℹ️ 測試模式不支援恢復購買');
            return;
        }

        /*
        try {
            const { GooglePlayBilling } = Capacitor.Plugins;
            const result = await GooglePlayBilling.queryPurchases({ productType: 'inapp' });
            
            if (result.purchases?.length > 0) {
                window.SQ.Actions?.toast(`✅ 找到 ${result.purchases.length} 筆未消費紀錄`);
                // 處理每筆未消費的購買...
            } else {
                window.SQ.Actions?.toast('ℹ️ 沒有可恢復的購買紀錄');
            }
        } catch (e) {
            console.error('[IAP] 恢復購買失敗:', e);
        }
        */
    },
};
