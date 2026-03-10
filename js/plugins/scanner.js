/* www/js/modules/scanner.js - V2.0 */
/* 條碼掃描 + Open Food Facts 查詢 */
/* 使用: @capacitor-community/barcode-scanner (最新版 API) */
window.SQ = window.SQ || {};
window.SQ.Scanner = {

    // ── 主流程：掃描 → 查詢 → 回傳結果 ──────────────────
    scan: async function() {
        // Pro 功能鎖
        if (window.SQ.Sub) {
            const check = window.SQ.Sub.canUseScanner();
            if (!check.ok) {
                window.SQ.Sub.showUpgradePrompt(check.reason);
                return null;
            }
        }

        // 非 Capacitor 環境：顯示手動輸入條碼的備用介面
        if (!window.Capacitor) {
            return this._manualFallback();
        }

        // ✅ [修正] 最新版 API 改為從 Capacitor.Plugins 取得，且方法名稱已更新
        const BSC = Capacitor.Plugins?.BarcodeScanner;
        if (!BSC) {
            return this._manualFallback();
        }

        try {
            // ✅ [修正] 最新版權限 API: checkPermission (singular) + force 參數
            // @capacitor-community/barcode-scanner 仍使用 checkPermission({ force })
            const status = await BSC.checkPermission({ force: true });

            if (!status.granted) {
                window.SQ.Actions?.toast('❌ 需要相機權限才能掃描');
                return null;
            }

            // 準備掃描：隱藏 app 背景讓相機可見
            document.body.classList.add('sq-scanner-active');
            BSC.hideBackground();

            const result = await BSC.startScan();

            // 還原 app 背景
            document.body.classList.remove('sq-scanner-active');
            BSC.showBackground();

            if (!result.hasContent) {
                window.SQ.Actions?.toast('⚠️ 未能讀取條碼');
                return null;
            }

            const barcode = result.content;
            window.SQ.Actions?.toast('🔍 查詢中...');
            return await this._lookupBarcode(barcode);

        } catch (e) {
            document.body.classList.remove('sq-scanner-active');
            // 嘗試還原背景
            try { Capacitor.Plugins?.BarcodeScanner?.showBackground(); } catch(_) {}
            console.error('[Scanner]', e);
            window.SQ.Actions?.toast('❌ 掃描失敗，請手動輸入');
            return null;
        }
    },

    // ── Open Food Facts API 查詢 ─────────────────────────
    // ✅ [修正] 查詢策略：
    //   1. 先查 world (全球庫)
    //   2. 若無結果，改查 tw (台灣庫) 補漏
    //   3. 兩個 energy 欄位都嘗試，避免漏掉
    _lookupBarcode: async function(barcode) {
        // 策略：先查全球庫，再查台灣庫
        const endpoints = [
            `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`,
            `https://tw.openfoodfacts.org/api/v0/product/${barcode}.json`
        ];

        for (const url of endpoints) {
            try {
                const res = await fetch(url, {
                    signal: AbortSignal.timeout(8000),
                    headers: {
                        // ✅ 告知 OFF 我們是哪個 App（建議做法，避免被限流）
                        'User-Agent': 'Questory/1.0 (Android; questory@example.com)'
                    }
                });
                const data = await res.json();

                if (data.status !== 1 || !data.product) continue; // 這個 endpoint 找不到，試下一個

                const p = data.product;
                const nutriments = p.nutriments || {};

                // ✅ [修正] 完整的卡路里欄位優先序（OFF 資料不統一，要多試）
                const kcalPer100 =
                    nutriments['energy-kcal_100g']          ||  // 標準欄位
                    nutriments['energy-kcal']               ||  // 備用
                    (nutriments['energy_100g']
                        ? Math.round(nutriments['energy_100g'] / 4.184)
                        : null)                             ||  // 從 kJ 換算
                    (nutriments['energy-kj_100g']
                        ? Math.round(nutriments['energy-kj_100g'] / 4.184)
                        : null)                             ||  // kJ 另一個欄位
                    null;

                const brand   = p.brands ? p.brands.split(',')[0].trim() : '';
                const rawName =
                    p.product_name_zh ||
                    p.product_name_tw ||
                    p.product_name_zh_TW ||
                    p.product_name ||
                    '';
                const name = (brand && rawName)
                    ? `${brand} ${rawName}`
                    : (rawName || brand || '未知商品');

                return {
                    found:   true,
                    barcode,
                    name:    name.trim().slice(0, 30),
                    kcal:    kcalPer100 ? Math.round(kcalPer100) : null,
                    brand,
                    serving: p.serving_size || null,
                };

            } catch (e) {
                console.warn('[Scanner] lookup failed for', url, e);
                // 繼續嘗試下一個 endpoint
            }
        }

        // 兩個 endpoint 都失敗
        return { found: false, barcode, error: '找不到商品或網路錯誤' };
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