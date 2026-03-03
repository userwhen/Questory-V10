/* js/modules/settings_view.js - V51.4 Pure CSP */
window.SQ = window.SQ || {};
window.SQ.View = window.SQ.View || {};
window.SQ.View.Settings = {
    render: function() {
        const gs = window.SQ.State;
        const s = gs.settings || {};
        const unlocks = gs.unlocks || {};
        
        if (!window.SQ.Temp.settingsDraft || Object.keys(window.SQ.Temp.settingsDraft).length === 0) {
            window.SQ.Temp.settingsDraft = { ...s };
        }
        
        const draftSettings = window.SQ.Temp.settingsDraft || {};
        const displayState = { ...s, ...draftSettings };

        let modeOptions = [
            {val:'adventurer', label:'🛡️ 冒險者模式'},
            {val:'basic', label:'📊 基礎模式'}
        ];
        if (unlocks.harem) modeOptions.push({val:'harem', label:'💕 后宫模式'});
        if (unlocks.learning) modeOptions.push({val:'learning', label:'📚 語言學習'});

        const renderToggle = (action, actionId, label, checked, locked, icon='') => {
            if (locked) return `<div style="padding:12px; color:var(--text-ghost); border-bottom:1px solid var(--border); display:flex; justify-content:space-between; align-items:center;"><span style="display:flex; align-items:center; gap:5px;">${icon ? icon + ' ' : ''}🔒 ${label}</span><span style="font-size:0.8rem; background:var(--bg-box); padding:2px 8px; border-radius:var(--radius-sm);">未解鎖</span></div>`;
            return `<div class="u-toggle-row ${checked ? 'on' : ''}" data-action="${action}" ${actionId ? `data-id="${actionId}"` : ''} data-val="${!checked}"><div class="toggle-track"></div>${icon ? `<div style="font-size:1.2rem; margin-left:8px;">${icon}</div>` : ''}<div class="toggle-label">${label}</div></div>`;
        };

        const calRow = renderToggle('checkCalMode', '', '🔥 卡路里消耗計算', displayState.calMode, !unlocks.feature_cal);
        const strictRow = renderToggle('updateSettingsDraft', 'strictMode', '⚡ 嚴格模式 (失敗扣分)', displayState.strictMode, !unlocks.feature_strict);
        const modeSelectHtml = ui.atom.inputBase({type:'select', val: displayState.mode || 'adventurer', action: 'updateSettingsDraft', actionId: 'mode', options: modeOptions});

        const bodyHtml = `
            <div class="u-box">
                ${ui.composer.formField({label: '核心設定', inputHtml: modeSelectHtml})}
                <div data-action="openSettingsShop" style="margin-top:10px; padding:12px; border:1px solid var(--color-gold); background:var(--color-gold-soft); border-radius:var(--radius-sm); cursor:pointer; display:flex; justify-content:space-between; align-items:center; box-shadow:var(--shadow-sm);">
                    <div style="display:flex; align-items:center; gap:8px;"><span>🛒</span><span style="font-weight:bold; color:var(--color-gold-dark);">前往模式商店</span></div><span style="color:var(--color-gold-dark);">&gt;</span>
                </div>
            </div>
            <div class="u-box" style="margin-top:15px;">
                <label class="section-title" data-action="triggerDevMode" style="display:block; margin-bottom:10px; cursor:pointer; user-select:none;">功能開關 (DLC)</label>
                ${calRow}${strictRow}
            </div>
            <div class="u-box" style="margin-top:15px; background:var(--color-danger-soft); border:1px solid rgba(192,57,43,0.3);">
                <label class="section-title" style="color:var(--color-danger-dark);">存檔管理</label>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px;">
                    ${ui.atom.buttonBase({label:'📥 匯入', size:'sm', theme:'normal', action:'openImportModal'})}
                    ${ui.atom.buttonBase({label:'📤 匯出', size:'sm', theme:'normal', action:'openExportModal'})}
                </div>
                ${ui.atom.buttonBase({label:'⚠️ 重置所有資料', theme:'danger', size:'sm', style:'width:100%; margin-top:10px;', action:'openResetConfirm'})}
            </div>
        `;

        ui.modal.render('⚙️ 系統設定', bodyHtml, ui.atom.buttonBase({label:'儲存變更', theme:'correct', style:'width:100%;', action:'saveSettings'}), 'panel');
    },

    renderCalorieModal: function() {
        const val = window.SQ.Temp.settingsDraft?.calMax || window.SQ.State.settings?.calMax || 2000;
        const extraHtml = `<div style="display:flex; justify-content:center; align-items:center; gap:10px;"><input type="text" id="inp-cal-target" value="${val}" maxlength="4" inputmode="numeric" data-is-num="true" placeholder="2000" style="font-size:1.5rem; width:120px; text-align:center; padding:5px; border:2px solid var(--color-info); border-radius:var(--radius-sm); outline:none; color:var(--text); background:var(--bg-input);"></div>`;
        ui.modal.render('🔥 目標設定', ui.composer.centeredModalBody({icon:'🎯', title:'請設定每日熱量目標 (Kcal)', desc:'', extraHtml}), ui.atom.buttonBase({ label: '確定', theme: 'correct', style: 'width:100%;', action: 'submitCalTarget' }), 'overlay');
    },

    renderSettingsShop: function() {
		if (window.SQ.Temp.activeModal !== 'settingsShop') return;
        const items = window.SQ.Engine.Settings.shopItems;
        const unlocks = window.SQ.State.unlocks || {};
        const listHtml = items.map(item => `<div class="std-card" style="margin-bottom:10px; border-left-color:${item.border}; ${item.bg ? 'background:'+item.bg+';' : ''}"><div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;"><h4 style="margin:0; color:${item.color}; font-size:1.1rem;">${item.name}</h4>${item.badge ? ui.atom.badgeBase({text: item.badge, style: 'color:var(--color-gold-dark); background:var(--color-gold-soft); border-color:var(--color-gold-dark);'}) : ''}</div><p style="font-size:0.9rem; color:var(--text-2); margin-bottom:12px; line-height:1.5;">${item.desc}</p><div style="display:flex; justify-content:space-between; align-items:center;"><span style="font-weight:bold; color:var(--text-muted);">${item.currency==='paid'?'💠':'💎'} ${item.price}</span>${unlocks[item.id] ? `<span style="color:var(--text-ghost); font-size:0.9rem; font-weight:bold;">✅ 已擁有</span>` : ui.atom.buttonBase({label:'購買', size:'sm', theme:'correct', action:'buyMode', actionId: item.id})}</div></div>`).join('');
        ui.modal.render('🛒 模式商店', `<div style="padding:10px;">${listHtml}</div>`, null, 'overlay');
    },

    renderResetConfirm: function() {
        ui.modal.render('系統警告', ui.composer.centeredModalBody({icon:'⚠️', title:'危險操作', desc:'確定要刪除所有進度嗎？<br>此操作<b>無法復原</b>。'}), `${ui.atom.buttonBase({label:'取消', theme:'ghost', style:'flex:1;', action:'closeModal', actionId:'m-system'})}${ui.atom.buttonBase({label:'確定重置', theme:'danger', style:'flex:2;', action:'confirmReset'})}`, 'system');
    },

    renderImportModal: function() {
        const extraHtml = `<input type="file" id="inp-import-file" accept=".json" data-change="handleFileImport" style="display:block; width:100%; padding:10px; border:1px dashed var(--border); background:var(--bg-box); border-radius:var(--radius-sm); color:var(--text);">`;
        ui.modal.render('📥 讀取存檔', ui.composer.centeredModalBody({icon:'📥', title:'讀取存檔', desc:'請選擇 .json 存檔檔案', extraHtml}), ui.atom.buttonBase({label:'關閉', theme:'ghost', style:'width:100%;', action:'closeModal', actionId:'m-overlay'}), 'overlay');
    }
};

window.view = window.view || {};
window.SQ.View.Main.renderSettings = () => { if(window.SQ.View.Settings) window.SQ.View.Settings.render(); };