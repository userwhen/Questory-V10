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

            // ✅ 確保這段解析邏輯能處理各種不同版本的掃描器回傳格式
			let barcode = null;
			if (result.barcodes && result.barcodes.length > 0) {
				barcode = result.barcodes[0].rawValue || result.barcodes[0].displayValue;
			} else if (result.hasContent && result.content) {
				barcode = result.content;
			} else if (typeof result === 'string') {
				barcode = result;
			}

            if (!barcode) { window.SQ.Actions?.toast('⚠️ 未能讀取條碼'); return null; }

            // 🚨 [新增這段防呆過濾器] 阻擋 QR Code 網址與非標準條碼
            if (barcode.includes('http') || !/^\d+$/.test(barcode) || barcode.length < 5) {
                window.SQ.Actions?.toast('⚠️ 無效條碼：請掃描商品上的純數字條碼');
                return null; // 擋下 QR Code，直接中斷
            }

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
                    const item = data[0];
                    // 👇 [請修改這行] 在最後面補上 , size: item.size
                    return { found: true, barcode: barcode, name: item.name, kcal: item.kcal, size: item.size, brand: '玩家共創庫' };
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

                // 👇 [新增] 抓取容量/重量字串 (例如："500 ml" 或 "250g")
                const rawSize = p.quantity || p.product_quantity || '';

                // 👇 [修改] 把 size 也一起回傳出去
                return { found: true, barcode: barcode, name: name.trim().slice(0, 30), kcal: kcalPer100 ? Math.round(kcalPer100) : null, size: rawSize };
            } catch (e) { console.warn('[Scanner] OFF 查詢失敗', url); }
        }
        return { found: false, barcode: barcode, error: '找不到商品' };
    },

    // ── 玩家建檔上傳至雲端 ─────────────────────────
    _contributeToDatabase: async function(barcode, name, kcal, size = '') {
        if (!barcode || barcode.length < 5 || this.SUPABASE_URL === 'YOUR_SUPABASE_URL') return; 
        
        const gs = window.SQ.State || {};
        if (!gs.userId) {
            gs.userId = 'usr_' + Math.random().toString(36).substring(2, 10);
            if (window.App) App.saveData();
        }

        // 🌟 嚴格過濾 size，只要是空字串、undefined，一律強制轉 null
        const finalSize = (size === '' || size === null || size === undefined) ? null : String(size);

        const payload = { 
            barcode: String(barcode), 
            name: String(name), 
            kcal: Number(kcal) || 0, 
            size: finalSize,
            contributor_id: String(gs.userId) 
        };

        // 👇 [新增] 把我們要送出去的資料印在 Console，讓我們看清楚
        console.log('🚀 [準備送給 Supabase 的資料]:', payload);

        try {
            const response = await fetch(`${this.SUPABASE_URL}/rest/v1/tw_foods`, {
                method: 'POST',
                headers: {
                    'apikey': this.SUPABASE_KEY, 
                    'Authorization': `Bearer ${this.SUPABASE_KEY}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'resolution=merge-duplicates, return=minimal' 
                },
                body: JSON.stringify(payload)
            });

            // 👇 [新增] 如果失敗，把 Supabase 真正的報錯原因印出來！
            if (!response.ok) {
                const errorData = await response.json();
                console.error('❌ [Supabase 拒絕寫入，原因]:', errorData);
            } else {
                console.log('✅ [Supabase 寫入成功！]');
            }

        } catch (e) { 
            console.error('[Scanner] 雲端寫入連線失敗', e); 
        }
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
        try {
            let result = await this.scan(); 
            if (!result) return; 

            // 🌟 將掃描結果存入系統暫存，讓外面的 Action 可以讀取
            window.SQ.Temp = window.SQ.Temp || {};
            window.SQ.Temp.scanData = result;

            if (result.found) {
                // 自動填入「亮面舊版上架面板」
                const nameInput = document.getElementById('up-name');
                if (nameInput) {
                    nameInput.value = result.name;
                    nameInput.dispatchEvent(new Event('input', { bubbles: true }));
                }

                const catSelect = document.getElementById('up-cat');
                if (catSelect) {
                    catSelect.value = '熱量';
                    if (window.SQ.Actions?.shopUploadChange) window.SQ.Actions.shopUploadChange();

                    // 延遲等待動態欄位生成後，填入熱量並加入按鈕
                    setTimeout(() => {
                        const kcalInput = document.getElementById('up-val-cal');
                        const sizeInput = document.getElementById('up-val-size'); 
                        
                        // 1. 自動填入熱量 (👇 這裡加上 Math.round 進行四捨五入)
                        if (kcalInput && result.kcal) {
                            const roundedKcal = Math.round(parseFloat(result.kcal));
                            kcalInput.value = roundedKcal;
                            kcalInput.setAttribute('data-base-kcal', roundedKcal);
                        }

                        // 2. 自動填入容量 (👇 過濾文字後，加上 Math.round 進行四捨五入)
                        if (sizeInput && result.size) {
                            const rawSizeStr = result.size.toString().replace(/[^\d.]/g, ''); 
                            if (rawSizeStr) {
                                const roundedSize = Math.round(parseFloat(rawSizeStr));
                                sizeInput.value = roundedSize;
                                sizeInput.setAttribute('data-base-size', roundedSize); 
                            }
                        }

                        if (window.SQ.Actions?.autoCalculatePrice) window.SQ.Actions.autoCalculatePrice();

                        // 3. 尋找商品名稱 Label，加入 data-action 綁定的按鈕
                        const labels = Array.from(document.querySelectorAll('label'));
                        const nameLabel = labels.find(l => l.textContent.includes('商品名稱'));
                        
                        if (nameLabel && !document.getElementById('btn-correct-db')) {
                            const correctBtn = document.createElement('span');
                            correctBtn.id = 'btn-correct-db';
                            // 🌟 這裡不再寫 onclick，而是直接用 data-action="correctDbInfo"
                            correctBtn.innerHTML = ` <span data-action="correctDbInfo" style="font-style:italic; text-decoration:underline; color:#f0a500; cursor:pointer; font-size:0.7rem; margin-left:8px; vertical-align:baseline;">✍️ 修正資料拿💎</span>`;
                            nameLabel.appendChild(correctBtn);
                        }
                    }, 100);
                }
                window.SQ.Actions?.toast(`✅ 已載入：${result.name}`);
            } else {
                this._showShopImportModal(result);
            }
        } catch (e) {
            console.error('[Scanner Error]', e);
            window.SQ.Actions?.toast('系統錯誤: ' + e.message);
        }
    },

    _showShopImportModal: function(scanData) {
        const isFound = scanData && scanData.found;
        const barcode = scanData ? scanData.barcode : null; 
        const defaultName = isFound ? scanData.name : '';
        const defaultKcal = isFound && scanData.kcal ? scanData.kcal : '';
        const defaultSize = '';
        const isExternalData = isFound && scanData.brand !== '玩家共創庫';

        // 🌟 改變作法：把目前的掃描狀態存入系統的全域變數，讓 Action 可以讀取
        window.SQ.Temp = window.SQ.Temp || {};
        window.SQ.Temp.scanData = { barcode, isFound, isExternalData, defaultName, defaultKcal };

        const overlay = document.createElement('div');
        overlay.id = 'sq-import-overlay'; // 🌟 加上 ID 方便後續移除
        overlay.style.cssText = `position:fixed; inset:0; z-index:11000; background:rgba(10,10,18,0.95); display:flex; flex-direction:column; align-items:center; justify-content:center; padding:24px;`;

        overlay.innerHTML = `
            <div style="background:#1e1e24; padding:24px; border-radius:16px; width:100%; max-width:320px; box-shadow:0 10px 30px rgba(0,0,0,0.5); border:1px solid ${isExternalData ? '#f0a500' : 'transparent'};">
                <div style="font-size:1.2rem; font-weight:800; color:#fff; margin-bottom:8px; text-align:center;">
                    ${isFound ? '✅ 掃描成功' : '✍️ 發現新物品'}
                </div>
                
                ${isExternalData ? 
                    `<div style="font-size:0.75rem; color:#f0a500; text-align:center; margin-bottom:16px; background:rgba(240,165,0,0.1); padding:8px; border-radius:8px;">
                        💡 發現資料有誤？您可以直接在此修正。<br>提交正確資料同樣可獲得 💎 獎勵！
                     </div>` : 
                    `<div style="font-size:0.8rem; color:rgba(255,255,255,0.4); text-align:center; margin-bottom:16px;">
                        (建立新商品可獲得 1 顆免費鑽石 💎)
                     </div>`
                }
                
                <label style="display:block; color:rgba(255,255,255,0.6); font-size:0.85rem; margin-bottom:4px;">商品名稱</label>
                <input id="sq-import-name" type="text" value="${defaultName}" placeholder="例如："蘋果汁" style="width:100%; padding:10px; border-radius:8px; border:1px solid rgba(255,255,255,0.1); background:rgba(255,255,255,0.05); color:#fff; margin-bottom:12px; box-sizing:border-box;">

                <div style="display:flex; gap:12px; margin-bottom:20px;">
                    <div style="flex:1;">
                        <label style="display:block; color:rgba(255,255,255,0.6); font-size:0.85rem; margin-bottom:4px;">熱量 (Kcal)</label>
                        <input id="sq-import-kcal" type="text" inputmode="decimal" value="${defaultKcal}" placeholder="0" style="width:100%; padding:10px; border-radius:8px; border:1px solid rgba(255,255,255,0.1); background:rgba(255,255,255,0.05); color:#fff; box-sizing:border-box;">
                    </div>
                    <div style="flex:1;">
                        <label style="display:block; color:rgba(255,255,255,0.6); font-size:0.85rem; margin-bottom:4px;">容量 (ml/g)</label>
                        <input id="sq-import-size" type="text" value="${defaultSize}" placeholder="例如: 500ml" style="width:100%; padding:10px; border-radius:8px; border:1px solid #5b8af0; background:rgba(91,138,240,0.1); color:#80a8ff; font-weight:bold; box-sizing:border-box;">
                    </div>
                </div>

                <div style="display:flex; gap:10px;">
                    <button data-action="closeImport" style="flex:1; padding:12px; border-radius:50px; border:none; background:rgba(255,255,255,0.1); color:#fff; cursor:pointer;">取消</button>
                    <button data-action="confirmImport" style="flex:2; padding:12px; border-radius:50px; border:none; background:#4caf87; color:#fff; font-weight:bold; cursor:pointer;">
                        ${isExternalData ? '🚀 修正並上架' : '📥 建立並上架'}
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
    },
	// ==========================================
    // 🌟 全新獨立的「雲端資料庫勘誤」專屬視窗
    // ==========================================
    _showCorrectionModal: function() {
        const temp = window.SQ.Temp.scanData;
        if (!temp || !temp.barcode) return;

        const overlay = document.createElement('div');
        overlay.id = 'sq-correct-overlay';
        overlay.style.cssText = `position:fixed; inset:0; z-index:12000; background:rgba(10,10,18,0.95); display:flex; flex-direction:column; align-items:center; justify-content:center; padding:24px;`;

        overlay.innerHTML = `
            <div style="background:#1e1e24; padding:24px; border-radius:16px; width:100%; max-width:320px; box-shadow:0 10px 30px rgba(0,0,0,0.5); border:1px solid #f0a500;">
                <div style="font-size:1.2rem; font-weight:800; color:#fff; margin-bottom:8px; text-align:center;">
                    🛠️ 修正雲端資料庫
                </div>
                <div style="font-size:0.75rem; color:#f0a500; text-align:center; margin-bottom:16px; background:rgba(240,165,0,0.1); padding:8px; border-radius:8px;">
                    請輸入包裝上的「總熱量」與「總容量」。<br>亂填將被封鎖，正確提供可獲 💎 獎勵！
                </div>
                
                <label style="display:block; color:rgba(255,255,255,0.6); font-size:0.85rem; margin-bottom:4px;">包裝正確名稱</label>
                <input id="sq-correct-name" type="text" value="${temp.name || ''}" style="width:100%; padding:10px; border-radius:8px; border:1px solid rgba(255,255,255,0.1); background:rgba(255,255,255,0.05); color:#fff; margin-bottom:12px; box-sizing:border-box;">

                <div style="display:flex; gap:12px; margin-bottom:20px;">
                    <div style="flex:1;">
                        <label style="display:block; color:rgba(255,255,255,0.6); font-size:0.85rem; margin-bottom:4px;">總熱量 (Kcal)</label>
                        <input id="sq-correct-kcal" type="text" inputmode="decimal" value="${temp.kcal || ''}" style="width:100%; padding:10px; border-radius:8px; border:1px solid rgba(255,255,255,0.1); background:rgba(255,255,255,0.05); color:#fff; box-sizing:border-box;">
                    </div>
                    <div style="flex:1;">
                        <label style="display:block; color:rgba(255,255,255,0.6); font-size:0.85rem; margin-bottom:4px;">總容量 (ml/g)</label>
                        <input id="sq-correct-size" type="text" inputmode="decimal" value="${temp.size ? temp.size.toString().replace(/[^\\d.]/g, '') : ''}" style="width:100%; padding:10px; border-radius:8px; border:1px solid rgba(255,255,255,0.1); background:rgba(255,255,255,0.05); color:#fff; box-sizing:border-box;">
                    </div>
                </div>

                <div style="display:flex; gap:10px;">
                    <button data-action="closeCorrection" style="flex:1; padding:12px; border-radius:50px; border:none; background:rgba(255,255,255,0.1); color:#fff; cursor:pointer;">取消</button>
                    <button data-action="submitCorrection" style="flex:2; padding:12px; border-radius:50px; border:none; background:#f0a500; color:#111; font-weight:bold; cursor:pointer;">🚀 覆蓋資料</button>
                </div>
            </div>
        `;
        document.body.appendChild(overlay);
    },
	// 2. 獨立出來的後端處理邏輯
    _processImport: function() {
        const temp = window.SQ.Temp.scanData;
        if (!temp) return;

        const rawName = document.getElementById('sq-import-name').value.trim() || '未命名商品';
        // 👇 允許保留小數點
        const sizeStr = document.getElementById('sq-import-size').value.replace(/[^\d.]/g, ''); 
        const size = sizeStr ? parseFloat(sizeStr) : '';
        const kcal = parseFloat(document.getElementById('sq-import-kcal').value) || 0;

        // 🌟 寫入資料庫與防濫用機制 (問題 5)
        if (temp.barcode) { 
            this._contributeToDatabase(temp.barcode, rawName, kcal, size); 
            
            const gs = window.SQ.State;
            if (gs) {
                const today = new Date().toDateString();
                if (gs.lastContributeDate !== today) { gs.lastContributeDate = today; gs.dailyContributes = 0; }
                gs.correctedBarcodes = gs.correctedBarcodes || [];

                // 檢查是否領過該條碼獎勵
                if (gs.correctedBarcodes.includes(temp.barcode)) {
                    window.SQ.Actions?.toast(`✅ 已存入資料庫！(此商品已領過獎勵)`);
                } else {
                    gs.correctedBarcodes.push(temp.barcode);
                    if ((gs.dailyContributes || 0) < 10) { // 每日最多領 10 次
                        gs.dailyContributes = (gs.dailyContributes || 0) + 1;
                        gs.freeGem = (gs.freeGem || 0) + 1; 
                        window.SQ.Actions?.toast(`🎉 感謝建檔！獲得 1 顆免費鑽石 💎`);
                    } else {
                        window.SQ.Actions?.toast(`✅ 已存入！(今日鑽石獎勵達上限)`);
                    }
                    if (window.App) App.saveData();
                }
                if (window.SQ.EventBus) window.SQ.EventBus.emit(window.SQ.Events.Stats.UPDATED);
            }
        }
        
        // 🌟 核心動線變更 (問題 2)：不直接上架，而是填入背後的「亮面視窗」
        const nameInput = document.getElementById('up-name');
        if (nameInput) {
            nameInput.value = rawName;
            nameInput.dispatchEvent(new Event('input', { bubbles: true }));
        }

        const catSelect = document.getElementById('up-cat');
        if (catSelect) {
            catSelect.value = '熱量';
            if (window.SQ.Actions?.shopUploadChange) window.SQ.Actions.shopUploadChange();
            
            setTimeout(() => {
                const kcalInput = document.getElementById('up-val-cal');
                const sizeInput = document.getElementById('up-val-size');
                if (kcalInput) {
                    kcalInput.value = kcal;
                    kcalInput.setAttribute('data-base-kcal', kcal); // 記住總熱量
                }
                if (sizeInput && size) {
                    sizeInput.value = size;
                    sizeInput.setAttribute('data-base-size', size); 
                }
                if (window.SQ.Actions?.autoCalculatePrice) window.SQ.Actions.autoCalculatePrice();
            }, 100);
        }
        
        // 只關閉深色視窗，留下亮面視窗讓玩家繼續編輯數量與分裝
        if (window.SQ.Actions?.closeImport) window.SQ.Actions.closeImport(); 
    },
};
// ============================================================================
// 3. 把 Action 註冊到你的全域系統中 (接在大括號外面)
// ============================================================================
window.SQ.Actions = window.SQ.Actions || {};
Object.assign(window.SQ.Actions, {
    // 對應 取消按鈕 的 data-action="closeImport"
    closeImport: () => {
        const overlay = document.getElementById('sq-import-overlay');
        if (overlay) overlay.remove();
    },
    // 對應 建立並上架按鈕 的 data-action="confirmImport"
    confirmImport: () => {
        if (window.SQ.Scanner && window.SQ.Scanner._processImport) {
            window.SQ.Scanner._processImport();
        }
    },
	// 👇 [新增] 對應剛剛加的 ✍️ 修正資料拿💎
    correctDbInfo: () => {
        // 1. 點擊「修正資料」時，不再直接上傳，而是開啟嚴格的專屬視窗！
        if (window.SQ.Scanner && window.SQ.Scanner._showCorrectionModal) {
            window.SQ.Scanner._showCorrectionModal();
        }
    },
    
    closeCorrection: () => {
        // 2. 關閉修正視窗
        const overlay = document.getElementById('sq-correct-overlay');
        if (overlay) overlay.remove();
    },
    
    submitCorrection: () => {
        // 3. 玩家在嚴格視窗按下「覆蓋資料」後的真實邏輯
        const temp = window.SQ.Temp.scanData;
        if (!temp || !temp.barcode) return;

        const newName = document.getElementById('sq-correct-name').value.trim();
        
        // 👇 [核心修正] 把 parseInt 改成 parseFloat，並允許保留小數點
        const newKcal = parseFloat(document.getElementById('sq-correct-kcal').value) || 0;
        const newSizeStr = document.getElementById('sq-correct-size').value.replace(/[^\d.]/g, '');
        const newSize = newSizeStr ? parseFloat(newSizeStr) : 0;

        // 🚨 自動檢測 (防呆與防惡意輸入)
        if (newName.length < 2 || newName.length > 30) {
            window.SQ.Actions?.toast('⚠️ 名稱長度異常 (需介於 2~30 字)'); return;
        }
        if (newKcal <= 0 || newKcal > 3000) {
            window.SQ.Actions?.toast('⚠️ 熱量數值異常 (飲料食品通常不會超過 3000 大卡)'); return;
        }
        if (newSize > 0 && newSize > 5000) {
            window.SQ.Actions?.toast('⚠️ 容量數值異常 (請填寫單一包裝真實容量)'); return;
        }

        // 真實寫入 Supabase
        if (window.SQ.Scanner && window.SQ.Scanner._contributeToDatabase) {
            window.SQ.Scanner._contributeToDatabase(temp.barcode, newName, newKcal, newSize);
        }

        // 防濫用與發放獎勵
        const gs = window.SQ.State;
        if (gs) {
            const today = new Date().toDateString();
            if (gs.lastContributeDate !== today) { gs.lastContributeDate = today; gs.dailyContributes = 0; }
            gs.correctedBarcodes = gs.correctedBarcodes || [];
            
            if (gs.correctedBarcodes.includes(temp.barcode)) {
                window.SQ.Actions?.toast(`✅ 資料庫已更新！(此商品已領過獎勵)`);
            } else {
                gs.correctedBarcodes.push(temp.barcode); 
                if ((gs.dailyContributes || 0) < 10) { 
                    gs.dailyContributes = (gs.dailyContributes || 0) + 1;
                    gs.freeGem = (gs.freeGem || 0) + 1; 
                    window.SQ.Actions?.toast(`✨ 感謝修正！獲得 1 顆免費鑽石 💎`);
                } else {
                    window.SQ.Actions?.toast(`✅ 資料庫已更新！(今日鑽石獎勵達上限)`);
                }
                if (window.App) App.saveData();
            }
            if (window.SQ.EventBus) window.SQ.EventBus.emit(window.SQ.Events.Stats.UPDATED);
        }

        // 🌟 最貼心的一步：把玩家剛填好的正確資料，同步塞回底下的「亮面上架面板」
        const upName = document.getElementById('up-name');
        if (upName) { upName.value = newName; upName.dispatchEvent(new Event('input', { bubbles: true })); }
        
        const upKcal = document.getElementById('up-val-cal');
        if (upKcal) { upKcal.value = newKcal; upKcal.setAttribute('data-base-kcal', newKcal); }
        
        const upSize = document.getElementById('up-val-size');
        if (upSize) { upSize.value = newSize; upSize.setAttribute('data-base-size', newSize); }
        
        if (window.SQ.Actions?.autoCalculatePrice) window.SQ.Actions.autoCalculatePrice();

        // 最後關閉這個嚴格視窗
        window.SQ.Actions.closeCorrection();
    }
});