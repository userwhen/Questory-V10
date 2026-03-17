/* www/js/modules/scanner.js - V3.0 (Supabase 雲端共創 + 獎勵機制) */
window.SQ = window.SQ || {};
window.SQ.Scanner = {

    // 🔴 這裡請貼上你在 Supabase 後台拿到的 URL 與 Key
    // 如果還沒設定，程式會自動跳過，不影響遊戲運行
    SUPABASE_URL: 'https://ggsjbaoszjllprdmpcrl.supabase.co', 
    SUPABASE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdnc2piYW9zempsbHByZG1wY3JsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3Mzc2MDY2NCwiZXhwIjoyMDg5MzM2NjY0fQ.BRowCnlDniEnpbHB3ikrcTSsdg1bCjMT93z0Rv6c0tQ',

    // ── 主流程：掃描 → 查詢 → 回傳結果 ──────────────────
    scan: async function() {
        if (window.SQ.Sub) {
            const check = window.SQ.Sub.canUseScanner();
            if (!check.ok) { window.SQ.Sub.showUpgradePrompt(check.reason); return null; }
        }

        const BSC = (window.Capacitor && window.Capacitor.Plugins) ? window.Capacitor.Plugins.BarcodeScanner : null;
        if (!window.Capacitor || !BSC) return this._manualFallback();

        try {
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

            if (!isGranted) { window.SQ.Actions?.toast('❌ 需要相機權限才能掃描'); return null; }

            document.body.classList.add('sq-scanner-active');
            if (BSC.hideBackground) await BSC.hideBackground();

            const result = BSC.scan ? await BSC.scan() : await BSC.startScan();

            document.body.classList.remove('sq-scanner-active');
            if (BSC.showBackground) await BSC.showBackground();

            let barcode = null;
            if (result.barcodes && result.barcodes.length > 0) barcode = result.barcodes[0].rawValue || result.barcodes[0].displayValue;
            else if (result.hasContent && result.content) barcode = result.content;

            if (!barcode) { window.SQ.Actions?.toast('⚠️ 未能讀取條碼'); return null; }

            if (navigator.vibrate) navigator.vibrate(50);
            window.SQ.Actions?.toast('🔍 條碼解析中...');
            return await this._lookupBarcode(barcode);

        } catch (e) {
            document.body.classList.remove('sq-scanner-active');
            try { Capacitor.Plugins?.BarcodeScanner?.showBackground(); } catch(_) {}
            window.SQ.Actions?.toast('❌ 掃描失敗，請手動輸入');
            return null;
        }
    },

    // ── API 雙重查詢 (先查自家 Supabase，再查 Open Food Facts) ──
    _lookupBarcode: async function(barcode) {
        // 1. 優先查我們自建的 Supabase 雲端庫
        if (this.SUPABASE_URL && this.SUPABASE_URL !== 'YOUR_SUPABASE_URL') {
            try {
                const res = await fetch(`${this.SUPABASE_URL}/rest/v1/tw_foods?barcode=eq.${barcode}`, {
                    headers: { 'apikey': this.SUPABASE_KEY, 'Authorization': `Bearer ${this.SUPABASE_KEY}` }
                });
                const data = await res.json();
                if (data && data.length > 0) {
                    return { found: true, barcode: barcode, name: data[0].name, kcal: data[0].kcal, brand: '玩家共創庫' };
                }
            } catch (e) { console.warn('[Scanner] 自建庫查詢失敗', e); }
        }

        // 2. 如果自建庫沒有，才去查 Open Food Facts
        const endpoints = [
            `https://world.openfoodfacts.org/api/v0/product/${barcode}.json`,
            `https://tw.openfoodfacts.org/api/v0/product/${barcode}.json`
        ];

        for (const url of endpoints) {
            try {
                // 將超時縮短為 3 秒，避免玩家等太久
                const res = await fetch(url, { signal: AbortSignal.timeout(3000), headers: { 'User-Agent': 'Questory/1.0' } });
                const data = await res.json();
                if (data.status !== 1 || !data.product) continue; 

                const p = data.product;
                const nutriments = p.nutriments || {};
                const kcalPer100 = nutriments['energy-kcal_100g'] || nutriments['energy-kcal'] || (nutriments['energy_100g'] ? Math.round(nutriments['energy_100g'] / 4.184) : null) || null;
                const brand = p.brands ? p.brands.split(',')[0].trim() : '';
                const rawName = p.product_name_zh || p.product_name_tw || p.product_name || '';
                const name = (brand && rawName) ? `${brand} ${rawName}` : (rawName || brand || '未知商品');

                return { found: true, barcode: barcode, name: name.trim().slice(0, 30), kcal: kcalPer100 ? Math.round(kcalPer100) : null };
            } catch (e) { console.warn('[Scanner] OFF 查詢失敗', url); }
        }
        return { found: false, barcode: barcode, error: '找不到商品' };
    },

    // ── 玩家建檔上傳至雲端 ─────────────────────────
    _contributeToDatabase: async function(barcode, name, kcal) {
        if (!barcode || barcode.length < 5 || this.SUPABASE_URL === 'YOUR_SUPABASE_URL') return; 
        try {
            await fetch(`${this.SUPABASE_URL}/rest/v1/tw_foods`, {
                method: 'POST',
                headers: {
                    'apikey': this.SUPABASE_KEY, 
                    'Authorization': `Bearer ${this.SUPABASE_KEY}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=minimal' // 不需回傳資料，節省流量
                },
                body: JSON.stringify({ barcode: barcode, name: name, kcal: kcal })
            });
            console.log('[Scanner] 感謝貢獻！新商品已寫入雲端');
        } catch (e) { console.warn('[Scanner] 雲端寫入失敗', e); }
    },

    // ── 備用介面與控制項 ───────────────────────────
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

            const done = async (submit) => {
                const barcode = overlay.querySelector('#sq-manual-barcode').value.trim();
                overlay.remove();
                if (!submit || !barcode) { resolve(null); return; }
                window.SQ.Actions?.toast('🔍 查詢中...');
                resolve(await this._lookupBarcode(barcode));
            };

            overlay.querySelector('#sq-scan-confirm').addEventListener('click', () => done(true));
            overlay.querySelector('#sq-scan-cancel').addEventListener('click',  () => done(false));
            overlay.querySelector('#sq-manual-barcode').addEventListener('keydown', (e) => { if (e.key === 'Enter') done(true); });
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
        const barcode = scanData ? scanData.barcode : null; 
        const defaultName = isFound ? scanData.name : '';
        const defaultKcal = isFound && scanData.kcal ? scanData.kcal : '';
        // 🌟 新增預設容量變數
        const defaultSize = '';

        const overlay = document.createElement('div');
        overlay.style.cssText = `position:fixed; inset:0; z-index:11000; background:rgba(10,10,18,0.95); display:flex; flex-direction:column; align-items:center; justify-content:center; padding:24px;`;

        overlay.innerHTML = `
            <div style="background:#1e1e24; padding:24px; border-radius:16px; width:100%; max-width:320px; box-shadow:0 10px 30px rgba(0,0,0,0.5);">
                <div style="font-size:1.2rem; font-weight:800; color:#fff; margin-bottom:16px; text-align:center;">
                    ${isFound ? '✅ 掃描成功！' : '✍️ 發現新物品！請建立'}
                </div>
                ${!isFound ? '<div style="font-size:0.8rem; color:#f0a500; text-align:center; margin-bottom:12px;">(輸入資料可獲得 1顆免費鑽石 獎勵)</div>' : ''}
                
                <label style="display:block; color:rgba(255,255,255,0.6); font-size:0.85rem; margin-bottom:4px;">商品名稱</label>
                <input id="sq-import-name" type="text" value="${defaultName}" placeholder="例如：百事可樂" style="width:100%; padding:10px; border-radius:8px; border:1px solid rgba(255,255,255,0.1); background:rgba(255,255,255,0.05); color:#fff; margin-bottom:12px; box-sizing:border-box;">

                <div style="display:flex; gap:12px; margin-bottom:20px;">
                    <div style="flex:1;">
                        <label style="display:block; color:rgba(255,255,255,0.6); font-size:0.85rem; margin-bottom:4px;">熱量 (Kcal)</label>
                        <input id="sq-import-kcal" type="number" value="${defaultKcal}" placeholder="0" style="width:100%; padding:10px; border-radius:8px; border:1px solid rgba(255,255,255,0.1); background:rgba(255,255,255,0.05); color:#fff; box-sizing:border-box;">
                    </div>
                    <div style="flex:1;">
                        <label style="display:block; color:rgba(255,255,255,0.6); font-size:0.85rem; margin-bottom:4px;">容量 (ml/g)</label>
                        <input id="sq-import-size" type="text" value="${defaultSize}" placeholder="例如: 500ml" style="width:100%; padding:10px; border-radius:8px; border:1px solid #5b8af0; background:rgba(91,138,240,0.1); color:#80a8ff; font-weight:bold; box-sizing:border-box;">
                    </div>
                </div>

                <div style="display:flex; gap:10px;">
                    <button id="sq-import-cancel" style="flex:1; padding:12px; border-radius:50px; border:none; background:rgba(255,255,255,0.1); color:#fff; cursor:pointer;">取消</button>
                    <button id="sq-import-confirm" style="flex:2; padding:12px; border-radius:50px; border:none; background:#4caf87; color:#fff; font-weight:bold; cursor:pointer;">📥 建立並上架</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);

        document.getElementById('sq-import-cancel').onclick = () => overlay.remove();
        document.getElementById('sq-import-confirm').onclick = () => {
            const rawName = document.getElementById('sq-import-name').value.trim() || '未命名商品';
            const size = document.getElementById('sq-import-size').value.trim();
            const kcal = parseInt(document.getElementById('sq-import-kcal').value) || 0;
            
            // 🌟 自動組合名稱：如果有輸入容量，就自動加上括號
            const finalName = size ? `${rawName} (${size})` : rawName;
            
            // 🌟 自動計算售價：熱量的一半，最低 10 金幣
            const autoPrice = kcal > 0 ? Math.max(10, Math.floor(kcal * 0.5)) : 50;

            if (window.SQ.Engine?.Shop?.uploadItem) {
                // 上架到商店
                window.SQ.Engine.Shop.uploadItem({ name: finalName, price: autoPrice, category: '熱量', val: kcal, desc: `回復 ${kcal} kcal 熱量`, type: 'daily', maxQty: 99 });
            }
            
            // 🌟 玩家貢獻回饋機制！
            if (!isFound && barcode) { 
                // 寫入 Supabase (連同組合好的名稱一起存進雲端)
                this._contributeToDatabase(barcode, finalName, kcal); 
                
                // 發放獎勵
                const gs = window.SQ.State;
                if (gs) {
                    gs.freeGem = (gs.freeGem || 0) + 1; 
                    if (window.App) App.saveData();
                    window.SQ.Actions?.toast(`🎉 感謝建檔！獲得 1 顆免費鑽石 💎`);
                    if (window.SQ.EventBus) window.SQ.EventBus.emit(window.SQ.Events.Stats.UPDATED);
                }
            } else {
                window.SQ.Actions?.toast(`✅ ${finalName} 已上架到商店！`);
            }
            
            if (window.SQ.View?.Shop?.render) window.SQ.View.Shop.render();
            overlay.remove();
        };
    }
};