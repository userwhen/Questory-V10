/* www/js/modules/scanner.js - V1.0 */
/* 條碼掃描 + Open Food Facts 查詢 */
/* 需要: @capacitor-community/barcode-scanner */
window.SQ = window.SQ || {};
window.SQ.Scanner = {

    // ── 主流程：掃描 → 查詢 → 回傳結果 ──────────────────
    scan: async function() {
        // 非 Capacitor 環境：顯示手動輸入條碼的備用介面
        if (!window.Capacitor || !Capacitor.Plugins?.BarcodeScanner) {
            return this._manualFallback();
        }

        try {
            const { BarcodeScanner } = Capacitor.Plugins;

            // 確認相機權限
            const status = await BarcodeScanner.checkPermission({ force: true });
            if (!status.granted) {
                window.SQ.Actions?.toast('❌ 需要相機權限才能掃描');
                return null;
            }

            // 準備掃描：隱藏 app 背景讓相機可見
            document.body.classList.add('sq-scanner-active');
            BarcodeScanner.hideBackground();

            const result = await BarcodeScanner.startScan();

            // 還原 app 背景
            document.body.classList.remove('sq-scanner-active');
            BarcodeScanner.showBackground();

            if (!result.hasContent) {
                window.SQ.Actions?.toast('⚠️ 未能讀取條碼');
                return null;
            }

            const barcode = result.content;
            window.SQ.Actions?.toast('🔍 查詢中...');
            return await this._lookupBarcode(barcode);

        } catch (e) {
            document.body.classList.remove('sq-scanner-active');
            console.error('[Scanner]', e);
            window.SQ.Actions?.toast('❌ 掃描失敗，請手動輸入');
            return null;
        }
    },

    // ── Open Food Facts API 查詢 ─────────────────────────
    _lookupBarcode: async function(barcode) {
        const url = `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`;
        try {
            const res  = await fetch(url, { signal: AbortSignal.timeout(8000) });
            const data = await res.json();

            if (data.status !== 1 || !data.product) {
                return { found: false, barcode };
            }

            const p      = data.product;
            const nutriments = p.nutriments || {};

            // 優先用每 100g 數值（台灣標示慣例），其次用 per_serving
            const kcalPer100 = nutriments['energy-kcal_100g']
                            || nutriments['energy-kcal']
                            || Math.round((nutriments['energy_100g'] || 0) / 4.184);

            // 品牌 + 名稱組合
            const brand   = p.brands || '';
            const rawName = p.product_name_zh
                         || p.product_name_tw
                         || p.product_name
                         || '';
            const name = brand && rawName ? `${brand} ${rawName}` : (rawName || brand || '未知商品');

            return {
                found:   true,
                barcode,
                name:    name.trim().slice(0, 30), // 最多30字
                kcal:    kcalPer100 ? Math.round(kcalPer100) : null,
                brand,
                serving: p.serving_size || null,
            };

        } catch (e) {
            console.error('[Scanner] lookup failed', e);
            return { found: false, barcode, error: '網路錯誤' };
        }
    },

    // ── 非 App 環境的備用介面（手動輸入條碼號碼）────────
    _manualFallback: function() {
        return new Promise((resolve) => {
            const overlay = document.createElement('div');
            overlay.style.cssText = `
                position:fixed; inset:0; z-index:11000;
                background:rgba(10,10,18,0.95);
                display:flex; flex-direction:column;
                align-items:center; justify-content:center;
                padding:24px; gap:16px;
            `;
            overlay.innerHTML = `
                <div style="font-size:2rem;">📷</div>
                <div style="color:#fff; font-weight:700; font-size:1rem;">輸入條碼號碼</div>
                <div style="color:rgba(255,255,255,0.45); font-size:0.82rem; text-align:center;">
                    掃描功能需要 App 版本<br>可手動輸入條碼測試查詢
                </div>
                <input id="sq-manual-barcode" type="text" inputmode="numeric"
                       placeholder="例如：4710088002340"
                       style="width:100%; max-width:280px; padding:12px 16px;
                              border-radius:12px; border:1px solid rgba(255,255,255,0.2);
                              background:rgba(255,255,255,0.08); color:#fff;
                              font-size:1rem; text-align:center; outline:none;">
                <div style="display:flex; gap:10px; width:100%; max-width:280px;">
                    <button id="sq-scan-cancel"
                            style="flex:1; padding:12px; border-radius:50px; border:none;
                                   background:rgba(255,255,255,0.08); color:rgba(255,255,255,0.6);
                                   cursor:pointer; font-size:0.9rem;">取消</button>
                    <button id="sq-scan-confirm"
                            style="flex:2; padding:12px; border-radius:50px; border:none;
                                   background:#f0a500; color:#111;
                                   cursor:pointer; font-size:0.9rem; font-weight:700;">查詢</button>
                </div>
            `;
            document.body.appendChild(overlay);

            const input   = overlay.querySelector('#sq-manual-barcode');
            const confirm = overlay.querySelector('#sq-scan-confirm');
            const cancel  = overlay.querySelector('#sq-scan-cancel');

            input.focus();

            const done = async (submit) => {
                const barcode = input.value.trim();
                overlay.remove();
                if (!submit || !barcode) { resolve(null); return; }
                window.SQ.Actions?.toast('🔍 查詢中...');
                const result = await this._lookupBarcode(barcode);
                resolve(result);
            };

            confirm.addEventListener('click', () => done(true));
            cancel.addEventListener('click',  () => done(false));
            input.addEventListener('keydown', (e) => { if (e.key === 'Enter') done(true); });
        });
    },

    // ── 停止掃描（背景切換時呼叫）───────────────────────
    stop: function() {
        if (window.Capacitor?.Plugins?.BarcodeScanner) {
            Capacitor.Plugins.BarcodeScanner.stopScan();
            Capacitor.Plugins.BarcodeScanner.showBackground();
        }
        document.body.classList.remove('sq-scanner-active');
    }
};
