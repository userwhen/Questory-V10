/* js/modules/settings_view.js - V43.0 Pure Architecture Upgrade */
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
        if (unlocks.harem) modeOptions.push({val:'harem', label:'💕 后宫模式'});
        if (unlocks.learning) modeOptions.push({val:'learning', label:'📚 語言學習'});

        const hasCalDLC = unlocks.feature_cal;       
        const hasStrictDLC = unlocks.feature_strict; 

        // 內部渲染開關，完全擺脫舊橋接器
        const renderToggle = (id, label, checked, onChange, locked, icon='') => {
            if (locked) return `<div style="padding:12px; color:var(--text-ghost); border-bottom:1px solid var(--border); display:flex; justify-content:space-between; align-items:center;"><span style="display:flex; align-items:center; gap:5px;">${icon ? icon + ' ' : ''}🔒 ${label}</span><span style="font-size:0.8rem; background:var(--bg-box); padding:2px 8px; border-radius:var(--radius-sm);">未解鎖</span></div>`;
            return `<div class="u-toggle-row ${checked ? 'on' : ''}" onclick="const c=this.querySelector('input'); c.checked=!c.checked; c.dispatchEvent(new Event('change')); this.classList.toggle('on');"><div class="toggle-track"></div>${icon ? `<div style="font-size:1.2rem; margin-left:8px;">${icon}</div>` : ''}<div class="toggle-label">${label}</div><input type="checkbox" id="${id}" ${checked ? 'checked' : ''} onchange="${onChange}" style="display:none;" onclick="event.stopPropagation();"></div>`;
        };

        const calRow = renderToggle('set-cal', '🔥 卡路里消耗計算', displayState.calMode, "act.checkCalMode(this.checked)", !hasCalDLC);
        const strictRow = renderToggle('set-strict', '⚡ 嚴格模式 (失敗扣分)', displayState.strictMode, "act.updateSettingsDraft('strictMode', this.checked)", !hasStrictDLC);

        const modeSelectHtml = ui.atom.inputBase({type:'select', val: displayState.mode || 'adventurer', onChange: "act.updateSettingsDraft('mode', this.value)", options: modeOptions});

        const bodyHtml = `
            <div class="u-box">
                ${ui.composer.formField({label: '核心設定', inputHtml: modeSelectHtml})}
                
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
                    ${ui.atom.buttonBase({label:'📥 匯入', size:'sm', theme:'normal', action:'act.openImportModal()'})}
                    ${ui.atom.buttonBase({label:'📤 匯出', size:'sm', theme:'normal', action:'act.openExportModal()'})}
                </div>
                ${ui.atom.buttonBase({label:'⚠️ 重置所有資料', theme:'danger', size:'sm', style:'width:100%; margin-top:10px;', action:'act.openResetConfirm()'})}
            </div>
        `;

        const footHtml = ui.atom.buttonBase({label:'儲存變更', theme:'correct', style:'width:100%;', action:'act.saveSettings()'});
        ui.modal.render('⚙️ 系統設定', bodyHtml, footHtml, 'panel');
    },

    renderCalorieModal: function() {
        const gs = window.GlobalState;
        const draftVal = window.TempState.settingsDraft ? window.TempState.settingsDraft.calMax : null;
        const currentVal = draftVal || (gs.settings ? gs.settings.calMax : 2000);

        const extraHtml = `
            <div style="display:flex; justify-content:center; align-items:center; gap:10px;">
                <input type="text" id="inp-cal-target" value="${currentVal}" 
                    maxlength="4" inputmode="numeric"
                    oninput="this.value = this.value.replace(/[^0-9]/g, '').slice(0, 4)"
                    placeholder="2000"
                    style="font-size:1.5rem; width:120px; text-align:center; padding:5px; border:2px solid var(--color-info); border-radius:var(--radius-sm); outline:none; color:var(--text); background:var(--bg-input);">
            </div>
            <div style="font-size:0.8rem; color:var(--text-ghost); margin-top:5px;">(最多 4 位數字)</div>
        `;

        const body = ui.composer.centeredModalBody({icon:'🎯', title:'請設定每日熱量目標 (Kcal)', desc:'', extraHtml});
        const foot = ui.atom.buttonBase({ label: '確定', theme: 'correct', style: 'width:100%;', action: 'act.submitCalTarget()' });
        
        ui.modal.render('🔥 目標設定', body, foot, 'overlay');
    },

    renderSettingsShop: function() {
        const items = SettingsEngine.shopItems;
        const unlocks = window.GlobalState.unlocks || {};
        
        const listHtml = items.map(item => {
            const isOwned = unlocks[item.id];
            const badgeHtml = item.badge ? ui.atom.badgeBase({text: item.badge, style: 'color:var(--color-gold-dark); background:var(--color-gold-soft); border-color:var(--color-gold-dark);'}) : '';
            const actionHtml = isOwned ? `<span style="color:var(--text-ghost); font-size:0.9rem; font-weight:bold;">✅ 已擁有</span>` : ui.atom.buttonBase({label:'購買', size:'sm', theme:'correct', action:`act.buyMode('${item.id}')`});
            
            return `
                <div class="std-card" style="margin-bottom:10px; border-left-color:${item.border}; ${item.bg ? 'background:'+item.bg+';' : ''}">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
                        <h4 style="margin:0; color:${item.color}; font-size:1.1rem;">${item.name}</h4>
                        ${badgeHtml}
                    </div>
                    <p style="font-size:0.9rem; color:var(--text-2); margin-bottom:12px; line-height:1.5;">${item.desc}</p>
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                        <span style="font-weight:bold; color:var(--text-muted);">${item.currency==='paid'?'💠':'💎'} ${item.price}</span>
                        ${actionHtml}
                    </div>
                </div>`;
        }).join('');
        
        ui.modal.render('🛒 模式商店', `<div style="padding:10px;">${listHtml}</div>`, null, 'overlay');
    },

    renderResetConfirm: function() {
        const body = ui.composer.centeredModalBody({icon:'⚠️', title:'危險操作', desc:'確定要刪除所有進度嗎？<br>此操作<b>無法復原</b>。'});
        const foot = `${ui.atom.buttonBase({label:'取消', theme:'ghost', style:'flex:1;', action:"ui.modal.close('m-system')"})}${ui.atom.buttonBase({label:'確定重置', theme:'danger', style:'flex:2;', action:"act.confirmReset()"})}`;
        ui.modal.render('系統警告', body, foot, 'system');
    },

    renderImportModal: function() {
        const extraHtml = `<input type="file" id="inp-import-file" accept=".json" onchange="act.handleFileImport(this)" style="display:block; width:100%; padding:10px; border:1px dashed var(--border); background:var(--bg-box); border-radius:var(--radius-sm); color:var(--text);">`;
        const body = ui.composer.centeredModalBody({icon:'📥', title:'讀取存檔', desc:'請選擇 .json 存檔檔案', extraHtml});
        const foot = ui.atom.buttonBase({label:'關閉', theme:'ghost', style:'width:100%;', action:"ui.modal.close('m-overlay')"});
        ui.modal.render('📥 讀取存檔', body, foot, 'overlay');
    }
};