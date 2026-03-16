/* www/js/modules/scanner.js - V3.0 (LINE Style UI, Pure Barcode) */
window.SQ = window.SQ || {};
window.SQ.Scanner = {

    // ── 主流程：掃描 → 查詢 → 回傳結果 ──────────────────
    scan: async function() {
        if (window.SQ.Sub) {
            const check = window.SQ.Sub.canUseScanner();
            if (!check.ok) {
                window.SQ.Sub.showUpgradePrompt(check.reason);
                return null;
            }
        }

        const BSC = (window.Capacitor && window.Capacitor.Plugins) ? window.Capacitor.Plugins.BarcodeScanner : null;
        if (!window.Capacitor || !BSC) {
            return this._manualFallback();
        }

        try {
            // 權限檢查
            let isGranted = false;
            if (BSC.checkPermissions) {
                const status = await BSC.checkPermissions();
                isGranted = status.camera === 'granted';
                if (!isGranted && BSC.requestPermissions) {
                    const req = await BSC.requestPermissions();
                    isGranted = req.camera === 'granted';
                }
            } else if (BSC.checkPermission) {
                const status = await BSC.checkPermission({ force: true });
                isGranted = status.granted;
            }

            if (!isGranted) {
                window.SQ.Actions?.toast('❌ 需要相機權限才能掃描');
                return null;
            }

            // --- 準備掃描 UI (LINE 風格透明框) ---
            document.body.classList.add('sq-scanner-active');
            
            const overlay = document.createElement('div');
            overlay.id = 'sq-scanner-ui-container';
            overlay.className = 'sq-scanner-overlay';
            overlay.innerHTML = `
                <div class="sq-scanner-hole">
                    <div class="corner-bl"></div><div class="corner-br"></div>
                </div>
                <div class="sq-scanner-ui">
                    <div style="color:#fff; font-weight:bold; text-shadow:0 1px 3px rgba(0,0,0,0.8);">將條碼對準框內</div>
                    <button id="sq-scanner-cancel-btn" style="padding:10px 24px; border-radius:50px; border:none; background:rgba(255,255,255,0.2); color:#fff; font-weight:bold; backdrop-filter:blur(5px); cursor:pointer;">取消掃描</button>
                </div>
            `;
            document.body.appendChild(overlay);

            let isCancelled = false;
            document.getElementById('sq-scanner-cancel-btn').onclick = async () => {
                isCancelled = true;
                this.stop(); 
                if (document.getElementById('sq-scanner-ui-container')) {
                    document.getElementById('sq-scanner-ui-container').remove();
                }
            };

            if (BSC.hideBackground) await BSC.hideBackground();

            // 執行掃描
            const result = BSC.scan ? await BSC.scan() : await BSC.startScan();

            // --- 掃描結束：還原背景與移除 UI ---
            document.body.classList.remove('sq-scanner-active');
            if (document.getElementById('sq-scanner-ui-container')) {
                document.getElementById('sq-scanner-ui-container').remove();
            }
            if (BSC.showBackground) await BSC.showBackground();

            if (isCancelled) return null;

            let barcode = null;
            if (result.barcodes && result.barcodes.length > 0) {
                barcode = result.barcodes[0].rawValue || result.barcodes[0].displayValue;
            } else if (result.hasContent && result.content) {
                barcode = result.content;
            }

            if (!barcode) {
                window.SQ.Actions?.toast('⚠️ 未能讀取條碼');
                return null;
            }

            window.SQ.Actions?.toast('🔍 查詢中...');
            return await this._lookupBarcode(barcode);

        } catch (e) {
            document.body.classList.remove('sq-scanner-active');
            if (document.getElementById('sq-scanner-ui-container')) {
                document.getElementById('sq-scanner-ui-container').remove();
            }
            try { Capacitor.Plugins?.BarcodeScanner?.showBackground(); } catch(_) {}
            console.error('[Scanner]', e);
            window.SQ.Actions?.toast('❌ 掃描失敗，請手動輸入');
            return null;
        }
    },

    // ── Open Food Facts API 查詢 ─────────────────────────
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
                    headers: { 'User-Agent': 'Questory/1.0 (Android; questory@example.com)' }
                });
                const data = await res.json();

                if (data.status !== 1 || !data.product) continue; 

                const p = data.product;
                const nutriments = p.nutriments || {};

                const kcalPer100 =
                    nutriments['energy-kcal_100g']          ||  
                    nutriments['energy-kcal']               ||  
                    (nutriments['energy_100g'] ? Math.round(nutriments['energy_100g'] / 4.184) : null) ||  
                    (nutriments['energy-kj_100g'] ? Math.round(nutriments['energy-kj_100g'] / 4.184) : null) ||  
                    null;

                const brand   = p.brands ? p.brands.split(',')[0].trim() : '';
                const rawName = p.product_name_zh || p.product_name_tw || p.product_name_zh_TW || p.product_name || '';
                const name = (brand && rawName) ? `${brand} ${rawName}` : (rawName || brand || '未知商品');

                return {
                    found:   true,
                    barcode: barcode,
                    name:    name.trim().slice(0, 30),
                    kcal:    kcalPer100 ? Math.round(kcalPer100) : null,
                    brand:   brand,
                    serving: p.serving_size || null,
                };

            } catch (e) { console.warn('[Scanner] lookup failed for', url, e); }
        }
        return { found: false, barcode: barcode, error: '找不到商品或網路錯誤' };
    },

    // ── 非 App 環境的備用介面（手動輸入條碼號碼）────────
    _manualFallback: function() {
        return new Promise((resolve) => {
            const overlay = document.createElement('div');
            overlay.style.cssText = `position:fixed; inset:0; z-index:11000; background:rgba(10,10,18,0.95); display:flex; flex-direction:column; align-items:center; justify-content:center; padding:24px; gap:16px;`;
            overlay.innerHTML = `
                <div style="font-size:2rem;">📷</div>
                <div style="color:#fff; font-weight:700; font-size:1rem;">輸入條碼號碼</div>
                <div style="color:rgba(255,255,255,0.45); font-size:0.82rem; text-align:center;">掃描功能需要 App 版本<br>可手動輸入條碼測試查詢</div>
                <input id="sq-manual-barcode" type="text" inputmode="numeric" placeholder="例如：4710088002340" style="width:100%; max-width:280px; padding:12px 16px; border-radius:12px; border:1px solid rgba(255,255,255,0.2); background:rgba(255,255,255,0.08); color:#fff; font-size:1rem; text-align:center; outline:none;">
                <div style="display:flex; gap:10px; width:100%; max-width:280px;">
                    <button id="sq-scan-cancel" style="flex:1; padding:12px; border-radius:50px; border:none; background:rgba(255,255,255,0.08); color:rgba(255,255,255,0.6); cursor:pointer; font-size:0.9rem;">取消</button>
                    <button id="sq-scan-confirm" style="flex:2; padding:12px; border-radius:50px; border:none; background:#f0a500; color:#111; cursor:pointer; font-size:0.9rem; font-weight:700;">查詢</button>
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
                resolve(await this._lookupBarcode(barcode));
            };

            confirm.addEventListener('click', () => done(true));
            cancel.addEventListener('click',  () => done(false));
            input.addEventListener('keydown', (e) => { if (e.key === 'Enter') done(true); });
        });
    },

    stop: function() {
        if (window.Capacitor?.Plugins?.BarcodeScanner) {
            Capacitor.Plugins.BarcodeScanner.stopScan();
            Capacitor.Plugins.BarcodeScanner.showBackground();
        }
        document.body.classList.remove('sq-scanner-active');
    },
	
    scanAndAddToShop: async function() {
        let result = await this.scan();
        this._showShopImportModal(result);
    },

    _showShopImportModal: function(scanData) {
        const isFound = scanData && scanData.found;
        const defaultName = isFound ? scanData.name : '';
        const defaultKcal = isFound && scanData.kcal ? scanData.kcal : '';
        const defaultPrice = isFound && scanData.kcal ? Math.floor(scanData.kcal * 0.5) : 100; 

        const overlay = document.createElement('div');
        overlay.style.cssText = `position:fixed; inset:0; z-index:11000; background:rgba(10,10,18,0.95); display:flex; flex-direction:column; align-items:center; justify-content:center; padding:24px;`;
        overlay.innerHTML = `
            <div style="background:#1e1e24; padding:24px; border-radius:16px; width:100%; max-width:320px; box-shadow:0 10px 30px rgba(0,0,0,0.5);">
                <div style="font-size:1.2rem; font-weight:800; color:#fff; margin-bottom:16px; text-align:center;">
                    ${isFound ? '✅ 掃描成功！' : '✍️ 手動建立商品'}
                </div>
                <label style="display:block; color:rgba(255,255,255,0.6); font-size:0.85rem; margin-bottom:4px;">商品名稱</label>
                <input id="sq-import-name" type="text" value="${defaultName}" placeholder="例如：無糖豆漿" style="width:100%; padding:10px; border-radius:8px; border:1px solid rgba(255,255,255,0.1); background:rgba(255,255,255,0.05); color:#fff; margin-bottom:12px; box-sizing:border-box;">
                <div style="display:flex; gap:12px; margin-bottom:20px;">
                    <div style="flex:1;">
                        <label style="display:block; color:rgba(255,255,255,0.6); font-size:0.85rem; margin-bottom:4px;">熱量 (Kcal)</label>
                        <input id="sq-import-kcal" type="number" value="${defaultKcal}" placeholder="0" style="width:100%; padding:10px; border-radius:8px; border:1px solid rgba(255,255,255,0.1); background:rgba(255,255,255,0.05); color:#fff; box-sizing:border-box;">
                    </div>
                    <div style="flex:1;">
                        <label style="display:block; color:rgba(255,255,255,0.6); font-size:0.85rem; margin-bottom:4px;">售價 (金幣)</label>
                        <input id="sq-import-price" type="number" value="${defaultPrice}" style="width:100%; padding:10px; border-radius:8px; border:1px solid #f0a500; background:rgba(240,165,0,0.1); color:#ffd166; font-weight:bold; box-sizing:border-box;">
                    </div>
                </div>
                <div style="display:flex; gap:10px;">
                    <button id="sq-import-cancel" style="flex:1; padding:12px; border-radius:50px; border:none; background:rgba(255,255,255,0.1); color:#fff; cursor:pointer;">取消</button>
                    <button id="sq-import-confirm" style="flex:2; padding:12px; border-radius:50px; border:none; background:#4caf87; color:#fff; font-weight:bold; cursor:pointer;">📥 上架到商店</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        document.getElementById('sq-import-cancel').onclick = () => overlay.remove();
        document.getElementById('sq-import-confirm').onclick = () => {
            const name = document.getElementById('sq-import-name').value.trim() || '未命名商品';
            const kcal = parseInt(document.getElementById('sq-import-kcal').value) || 0;
            const price = parseInt(document.getElementById('sq-import-price').value) || 0;

            if (window.SQ.Engine?.Shop?.uploadItem) {
                window.SQ.Engine.Shop.uploadItem({
                    name: name, price: price, category: '熱量', val: kcal, desc: `回復 ${kcal} kcal 熱量`, type: 'daily', maxQty: 99
                });
                window.SQ.Actions?.toast(`✅ ${name} 已上架到商店！`);
                window.SQ.Audio?.play('save'); 
            }
            if (window.SQ.View?.Shop?.render) window.SQ.View.Shop.render();
            overlay.remove();
        };
    }
};