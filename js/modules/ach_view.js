/* js/modules/ach_view.js - V33.0 (View Engine) */
window.achView = {
    // 1. 編輯表單 (從舊版移植並標準化)
    renderCreateAchForm: function(achId = null) {
        const achs = window.GlobalState.achievements || [];
        const ach = achId ? achs.find(a => a.id === achId) : null;
        const isEdit = !!achId;

        // 初始化暫存
        if (!window.TempState.editingAch || window.TempState.editingAch.id !== achId) {
            window.TempState.editingAch = ach ? JSON.parse(JSON.stringify(ach)) : {
                id: null, title: '', desc: '', type: 'manual', targetVal: 1, targetKey: '', 
                isSystem: false, reward: { gold: 0, exp: 0, freeGem: 0 }
            };
        }
        const data = window.TempState.editingAch;

        // (A) 標題與描述
        let bodyHtml = `
            <div class="input-group">
                <label class="section-title">成就名稱</label>
                ${ui.input.text(data.title, "例如: 存第一桶金", "achView.updateField('title', this.value)")}
            </div>
            <div class="input-group">
                <label class="section-title">描述</label>
                ${ui.input.textarea(data.desc, "描述達成條件...", "achView.updateField('desc', this.value)")}
            </div>`;

        // (B) 條件類型
        const typeOptions = [
            { value: 'manual', label: '手動勾選 (一次性)' },
            { value: 'check_in', label: '每日簽到 (重複性)' },
            { value: 'custom', label: '自定義計數' },
            { value: 'task_count', label: '任務次數監聽' },
            { value: 'attr_lv', label: '屬性等級監聽' }
        ];

        bodyHtml += `
            <div class="u-box" style="margin-top:10px;">
                <label class="section-title">達成條件類型</label>
                ${ui.input.select(typeOptions, data.type, "achView.updateField('type', this.value)")}

                ${(data.type === 'custom' || data.type === 'task_count' || data.type === 'attr_lv') ? `
                    <div style="margin-top:10px; display:flex; gap:10px; align-items:center;">
                        <div style="flex:1;">
                            <label class="section-title">目標值</label>
                            ${ui.input.number(data.targetVal, "achView.updateField('targetVal', parseInt(this.value)||1)", 2)}
                        </div>
                        ${data.type !== 'custom' ? `
                        <div style="flex:1;">
                            <label class="section-title">${data.type==='attr_lv'?'屬性名稱':'任務標籤'}</label>
                            ${ui.input.text(data.targetKey, "關鍵字", "achView.updateField('targetKey', this.value)")}
                        </div>` : ''}
                    </div>
                ` : ''}
            </div>`;

        // (C) 獎勵設定
        bodyHtml += `
            <div class="u-box" style="margin-top:10px; border-left:4px solid gold;">
                <div class="section-title">🏆 完成獎勵</div>
                <div style="display:flex; gap:10px;">
                    <div style="flex:1;">
                        <label class="section-title">💰 金幣</label>
                        ${ui.input.number(data.reward?.gold || 0, "achView.updateReward('gold', this.value)", 4)}
                    </div>
                    <div style="flex:1;">
                        <label class="section-title">✨ 經驗</label>
                        ${ui.input.number(data.reward?.exp || 0, "achView.updateReward('exp', this.value)", 4)}
                    </div>
                </div>
            </div>`;

        // Footer
        const footHtml = `
            ${isEdit ? ui.component.btn({label:'刪除', theme:'danger', action:`act.deleteAchievement('${achId}')`}) : ''}
            ${ui.component.btn({label:'儲存', theme:'correct', style:'flex:1;', action:'act.submitAchievement()'})}
        `;

        ui.modal.render(isEdit ? '編輯成就' : '新增成就', bodyHtml, footHtml, 'overlay');
    },

    // 2. 榮譽殿堂渲染 (從 Task View 移植過來)
    renderMilestonePage: function() {
        const listContainer = document.getElementById('page-milestone'); // 注意 ID 通常是 page-milestone
    if(!listContainer) return;

    // A. 標題列
    const headerHtml = ui.container.bar(`
        <div style="display:flex; justify-content:space-between; align-items:center; width:100%;">
            <h2 style="margin:0; font-size:1.2rem; color:#5d4037;">🏆 榮譽殿堂</h2>
            ${ui.component.btn({label:'↩ 返回', theme:'normal', size:'sm', action:"act.navigate('task')"})}
        </div>
    `, 'padding:15px; background:#f5f5f5; border-bottom:1px solid #e0e0e0;');

    // B. 資料準備 (只顯示已完成且非簽到的成就)
    const achs = window.GlobalState.achievements || [];
    const doneAch = achs.filter(a => a.done && a.type !== 'check_in'); 

    // C. 大師勳章區 (顯示 Lv10 技能)
    const archivedSkills = window.GlobalState.archivedSkills || [];
    const masterBoardHtml = `
        <div class="u-box" style="background:#fff3e0; border:2px solid #ffb74d; margin:10px;">
            <div style="text-align:center; font-weight:bold; color:#f57c00; margin-bottom:10px;">✨ 大師勳章 ✨</div>
            <div style="display:flex; flex-wrap:wrap; justify-content:center; gap:5px;">
                ${archivedSkills.length===0 
                    ? '<div style="color:rgba(0,0,0,0.3);font-size:0.8rem;">尚未有技能達到 Lv.10</div>' 
                    : archivedSkills.map(s=>`<div class="u-pill" style="background:#ff9800; color:white;">${window.GlobalState.attrs?.[s.parent]?.icon||'❓'}</div>`).join('')}
            </div>
        </div>`;

    // D. 列表內容
    let listHtml = '';
    if (doneAch.length === 0) {
        listHtml = `<div style="text-align:center;color:#888;padding:20px;">尚無已完成成就</div>`;
    } else {
        listHtml = `<div style="padding:10px;">` + doneAch.map(a => {
            const d = new Date(a.date || Date.now());
            const dateStr = `${d.getFullYear()}/${d.getMonth()+1}/${d.getDate()}`;
            // 使用 achievement card (這裡可以簡化顯示)
            return `
            <div class="u-box" style="margin-bottom:8px; display:flex; align-items:center; gap:10px; background:#fafafa; border-left:4px solid #ffd700;">
                <div style="font-size:1.5rem;">🏅</div>
                <div style="flex:1;">
                    <div style="font-weight:bold;">${a.title}</div>
                    <div style="font-size:0.85rem; color:#666;">${a.desc}</div>
                </div>
                <div style="font-size:0.8rem; color:#999;">${dateStr}</div>
            </div>`;
        }).join('') + `</div>`;
    }

    // E. 寫入 DOM
    listContainer.innerHTML = ui.layout.scroller(headerHtml, masterBoardHtml + listHtml + '<div style="height:50px;"></div>');
    
    // 隱藏 FAB
    if(window.view && view.hideFab) view.hideFab();
    },

    // 輔助函式
    updateField: function(field, val) {
        if (window.TempState && window.TempState.editingAch) {
            window.TempState.editingAch[field] = val;
            if (field === 'type') {
                setTimeout(() => this.renderCreateAchForm(window.TempState.editingAch.id), 0);
            }
        }
    },
    updateReward: function(type, val) {
        if (window.TempState && window.TempState.editingAch) {
            if (!window.TempState.editingAch.reward) window.TempState.editingAch.reward = {};
            window.TempState.editingAch.reward[type] = parseInt(val) || 0;
        }
    }
};

// 橋接 (相容舊呼叫)
window.view = window.view || {};
window.view.renderCreateAchForm = (id) => achView.renderCreateAchForm(id);
window.view.renderMilestonePage = () => achView.renderMilestonePage();