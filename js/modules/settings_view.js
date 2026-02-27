/* js/modules/settings_view.js - V42.0 UI System Upgrade */
window.settingsView = {
    render: function() {
        const gs = window.GlobalState;
        const s = gs.settings || {};
        const unlocks = gs.unlocks || {};
        
        if (!window.TempState.settingsDraft || Object.keys(window.TempState.settingsDraft).length === 0) {
            window.TempState.settingsDraft = { ...s };
        }
        
        const draftSettings = window.TempState.settingsDraft || {};
        const displayState = { ...s, ...draftSettings };

        let modeOptions = [
            {val:'adventurer', label:'🛡️ 冒險者模式'},
            {val:'basic', label:'📊 基礎模式'}
        ];
        if (unlocks.harem) modeOptions.push({val:'harem', label:'💕 后宮模式'});
        if (unlocks.learning) modeOptions.push({val:'learning', label:'📚 語言學習'});

        const hasCalDLC = unlocks.feature_cal;       
        const hasStrictDLC = unlocks.feature_strict; 

        const calRow = hasCalDLC 
            ? ui.input.toggleRow({ id: 'set-cal', label: '🔥 卡路里消耗計算', checked: displayState.calMode, onChange: "act.checkCalMode(this.checked)" })
            : `<div style="padding:12px; color:var(--text-ghost); border-bottom:1px solid var(--border); display:flex; justify-content:space-between; align-items:center;">
                 <span style="display:flex; align-items:center; gap:5px;">🔒 卡路里消耗計算</span>
                 <span style="font-size:0.8rem; background:var(--bg-box); padding:2px 8px; border-radius:var(--radius-sm);">未解鎖</span>
               </div>`;

        const strictRow = hasStrictDLC
            ? ui.input.toggleRow({ id: 'set-strict', label: '⚡ 嚴格模式 (失敗扣分)', checked: displayState.strictMode, onChange: "act.updateSettingsDraft('strictMode', this.checked)" })
            : `<div style="padding:12px; color:var(--text-ghost); border-bottom:1px solid var(--border); display:flex; justify-content:space-between; align-items:center;">
                 <span style="display:flex; align-items:center; gap:5px;">🔒 嚴格模式</span>
                 <span style="font-size:0.8rem; background:var(--bg-box); padding:2px 8px; border-radius:var(--radius-sm);">未解鎖</span>
               </div>`;

        const bodyHtml = `
            <div class="u-box">
                ${ui.input.field('核心設定', ui.input.select(modeOptions, displayState.mode || 'adventurer', "act.updateSettingsDraft('mode', this.value)"))}
                
                <div onclick="act.openSettingsShop()" style="margin-top:10px; padding:12px; border:1px solid var(--color-gold); background:var(--color-gold-soft); border-radius:var(--radius-sm); cursor:pointer; display:flex; justify-content:space-between; align-items:center; box-shadow:var(--shadow-sm);">
                    <div style="display:flex; align-items:center; gap:8px;">
                        <span>🛒</span>
                        <span style="font-weight:bold; color:var(--color-gold-dark);">前往模式商店</span>
                    </div>
                    <span style="color:var(--color-gold-dark);">&gt;</span>
                </div>
            </div>

            <div class="u-box" style="margin-top:15px;">
                <label class="section-title" onclick="act.triggerDevMode()" style="display:block; margin-bottom:10px; cursor:pointer; user-select:none;">功能開關 (DLC)</label>
                ${calRow}
                ${strictRow}
            </div>

            <div class="u-box" style="margin-top:15px; background:var(--color-danger-soft); border:1px solid rgba(192,57,43,0.3);">
                <label class="section-title" style="color:var(--color-danger-dark);">存檔管理</label>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
                    ${ui.component.btn({label:'📥 匯入', size:'sm', theme:'normal', action:'act.openImportModal()'})}
                    ${ui.component.btn({label:'📤 匯出', size:'sm', theme:'normal', action:'act.openExportModal()'})}
                </div>
                ${ui.component.btn({label:'⚠️ 重置所有資料', theme:'danger', size:'sm', style:'width:100%; margin-top:10px;', action:'act.openResetConfirm()'})}
            </div>
        `;

        const footHtml = ui.component.btn({label:'儲存變更', theme:'correct', style:'width:100%;', action:'act.saveSettings()'});
        ui.modal.render('⚙️ 系統設定', bodyHtml, footHtml, 'panel');
    },

    renderCalorieModal: function() {
        const gs = window.GlobalState;
        const draftVal = window.TempState.settingsDraft ? window.TempState.settingsDraft.calMax : null;
        const currentVal = draftVal || (gs.settings ? gs.settings.calMax : 2000);

        const body = `
            <div style="padding:20px; text-align:center;">
                <div style="margin-bottom:15px; color:var(--text-muted);">請設定每日熱量目標 (Kcal)</div>
                <div style="display:flex; justify-content:center; align-items:center; gap:10px;">
                    <span style="font-size:1.5rem;">🎯</span>
                    <input type="text" id="inp-cal-target" value="${currentVal}" 
                        maxlength="4" inputmode="numeric"
                        oninput="this.value = this.value.replace(/[^0-9]/g, '').slice(0, 4)"
                        placeholder="2000"
                        style="font-size:1.5rem; width:120px; text-align:center; padding:5px; border:2px solid var(--color-info); border-radius:var(--radius-sm); outline:none; color:var(--text); background:var(--bg-input);">
                </div>
                <div style="font-size:0.8rem; color:var(--text-ghost); margin-top:5px;">(最多 4 位數字)</div>
            </div>
        `;

        const foot = ui.component.btn({ label: '確定', theme: 'correct', style: 'width:100%;', action: 'act.submitCalTarget()' });
        ui.modal.render('🔥 目標設定', body, foot, 'overlay');
    },

    renderSettingsShop: function() {
        const items = SettingsEngine.shopItems;
        const unlocks = window.GlobalState.unlocks || {};
        const listHtml = items.map(item => {
            const isOwned = unlocks[item.id];
            return `<div class="std-card" style="margin-bottom:10px; border:2px solid ${item.border}; background:${item.bg}; border-left-width: 2px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                        <h4 style="margin:0; color:${item.color}; font-size:1.1rem;">${item.name}</h4>
                        ${item.badge ? `<span style="background:${item.border}; color:#000; padding:2px 8px; border-radius:var(--radius-xs); font-size:0.75rem; font-weight:bold;">${item.badge}</span>` : ''}
                    </div>
                    <p style="font-size:0.9rem; color:var(--text-2); margin-bottom:12px; line-height:1.5;">${item.desc}</p>
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <span style="font-weight:bold; color:var(--text-muted);">${item.currency==='paid'?'💠':'💎'} ${item.price}</span>
                        ${isOwned ? `<span style="color:var(--text-ghost); font-size:0.9rem; font-weight:bold;">✅ 已擁有</span>` : ui.component.btn({label:'購買', size:'sm', theme:'correct', action:`act.buyMode('${item.id}')`})}
                    </div>
                </div>`;
        }).join('');
        ui.modal.render('🛒 模式商店', `<div style="padding:10px;">${listHtml}</div>`, null, 'overlay');
    },

    renderResetConfirm: function() {
        const body = `<div style="padding:20px; text-align:center; color:var(--color-danger);"><div style="font-size:3rem; margin-bottom:10px;">⚠️</div><h3 style="margin-bottom:10px;">危險操作</h3><p>確定要刪除所有進度嗎？<br>此操作<b>無法復原</b>。</p></div>`;
        const foot = ui.component.btn({label:'確定重置', theme:'danger', style:'width:100%;', action:'act.confirmReset()'});
        ui.modal.render('系統警告', body, foot, 'system');
    },

    renderImportModal: function() {
        const body = `<div style="padding:20px; text-align:center;"><p style="margin-bottom:15px; color:var(--text-muted);">請選擇 .json 存檔檔案</p><input type="file" id="inp-import-file" accept=".json" onchange="act.handleFileImport(this)" style="display:block; width:100%; padding:10px; border:1px dashed var(--border); background:var(--bg-box); border-radius:var(--radius-sm); color:var(--text);"></div>`;
        const foot = ui.component.btn({label:'關閉', theme:'ghost', style:'width:100%;', action:"act.closeModal('overlay')"});
        ui.modal.render('📥 讀取存檔', body, foot, 'overlay');
    }
};