/* js/modules/ach_view.js - V38.5 Separated (Strict Logic) */
window.achView = {
    // =========================================
    // 1. [移植] 成就列表渲染 (原 TaskView 邏輯)
    // =========================================
    renderList: function() {
        // [Engine 依賴] 獲取排序後的成就列表
        const achs = AchEngine.getSortedAchievements();
        
        // [State 依賴] 獲取篩選狀態
        const currentAchCat = window.TempState.achFilter || '全部';
        const achCats = ['全部', '每日', '里程碑', '官方'];

        // 1. 篩選邏輯 (完全保留原版 TaskView 邏輯)
        const displayAchs = achs.filter(a => {
            if (a.claimed && a.type !== 'check_in') return false; // 已領取且非簽到 -> 不顯示 (去里程碑)
            if (currentAchCat === '每日') return a.type === 'check_in';
            if (currentAchCat === '里程碑') return a.type !== 'check_in' && !a.isSystem;
            if (currentAchCat === '官方') return a.isSystem;
            return true;
        });

        // 2. 頂部過濾器 UI
        const achFilterArea = `
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:10px;">
                <div style="flex:1; overflow:hidden;">
                    ${ui.container.bar(ui.tabs.scrollX(achCats, currentAchCat, "act.setAchFilter"), 'width:100%;')}
                </div>
                <div style="flex-shrink:0;">
                    ${ui.component.btn({ label:'🏆 殿堂', theme:'normal', size:'sm', action:"act.navigate('milestone')" })}
                </div>
            </div>`;

        // 3. 列表項目渲染 (嚴格比對原版 HTML 生成邏輯)
        const achListItems = displayAchs.length === 0 
            ? `<div style="text-align:center;color:#888;padding:40px;">暫無成就</div>` 
            : displayAchs.map(a => {
                // [邏輯移植] 按鈕狀態判斷
                const isCheckIn = a.type === 'check_in';
                const isReady = isCheckIn ? !a.done : (a.curr >= a.targetVal); // 注意: Engine 裡是用 targetVal
                
                let btnHtml = '';
                if (isCheckIn) {
                    // 簽到類
                    if (a.done) btnHtml = `<button class="u-btn u-btn-sm" style="background:#eee; color:#aaa; cursor:default;">已簽到</button>`;
                    else btnHtml = `<button class="u-btn u-btn-sm u-btn-correct animate__animated animate__pulse" onclick="act.checkInAch('${a.id}')">📅 簽到</button>`;
                } else {
                    // 里程碑/一般類
                    if (a.claimed) btnHtml = `<span style="color:#aaa; font-size:0.8rem;">已完成</span>`;
                    else if (isReady) btnHtml = `<button class="u-btn u-btn-sm" style="background:gold; color:#333; font-weight:bold; box-shadow:0 2px 5px rgba(255,215,0,0.4);" onclick="act.preClaimAch('${a.id}', this)">🎁 領取</button>`;
                    else {
                        // 進度條
                        const percent = Math.min(100, Math.floor((a.curr / a.targetVal) * 100));
                        btnHtml = `<div style="font-size:0.75rem; color:#999; text-align:right;">${a.curr}/${a.targetVal}<br><div style="width:60px; height:4px; background:#eee; margin-top:2px; border-radius:2px;"><div style="width:${percent}%; height:100%; background:#ccc; border-radius:2px;"></div></div></div>`;
                    }
                }
                
                // 點擊卡片編輯 (act.editAch)
                return `
                <div class="u-box" style="margin-bottom:10px; padding:12px; display:flex; align-items:center; gap:12px; background:#fff; box-shadow:0 2px 4px rgba(0,0,0,0.05);" onclick="act.editAch('${a.id}')">
                    <div style="font-size:1.8rem;">${isCheckIn ? '📅' : '🏅'}</div>
                    <div style="flex:1;">
                        <div style="font-weight:bold; color:#333;">${a.title}</div>
                        <div style="font-size:0.85rem; color:#666; margin-top:2px;">${a.desc || '無描述'}</div>
                    </div>
                    <div onclick="event.stopPropagation();">${btnHtml}</div>
                </div>`;
            }).join('');

        // 4. 回傳完整 HTML
        return achFilterArea + `<div style="padding-bottom:100px;">${achListItems}</div>`;
    },

    // =========================================
    // 2. 編輯表單 (保持原 ach_view.js)
    // =========================================
    renderCreateAchForm: function(achId = null) {
        const gs = window.GlobalState;
        const achs = gs ? (gs.achievements || []) : [];
        const ach = achId ? achs.find(a => a.id === achId) : null;
        const isEdit = !!achId;

        window.TempState = window.TempState || {};
        if (!window.TempState.editingAch || window.TempState.editingAch.id !== achId) {
            window.TempState.editingAch = ach ? JSON.parse(JSON.stringify(ach)) : {
                id: null, title: '', desc: '', type: 'manual', targetVal: 1, targetKey: '', 
                isSystem: false, reward: { gold: 0, exp: 0 }
            };
        }
        const data = window.TempState.editingAch;

        let bodyHtml = `
            <div class="input-group"><label class="section-title">成就名稱</label>${ui.input.text(data.title, "名稱", "achView.updateField('title', this.value)")}</div>
            <div class="input-group"><label class="section-title">描述</label>${ui.input.textarea(data.desc, "描述...", "achView.updateField('desc', this.value)")}</div>
            <div class="u-box" style="margin-top:10px;">
                <label class="section-title">類型</label>
                ${ui.input.select([
                    {value:'manual',label:'手動'}, {value:'check_in',label:'簽到'}, 
                    {value:'custom',label:'自定義'}, {value:'task_count',label:'任務次數'}, {value:'attr_lv',label:'屬性等級'}
                ], data.type, "achView.updateField('type', this.value)")}
                
                ${(data.type !== 'manual' && data.type !== 'check_in') ? `
                    <div style="margin-top:10px;">
                        <label>目標值</label> ${ui.input.number(data.targetVal, "achView.updateField('targetVal', this.value)")}
                        <label>關鍵字</label> ${ui.input.text(data.targetKey, "Key", "achView.updateField('targetKey', this.value)")}
                    </div>` : ''}
            </div>
            <div class="u-box" style="margin-top:10px; border-left:4px solid gold;">
                <div style="display:flex; gap:10px;">
                    <div style="flex:1;"><label>💰 金幣</label>${ui.input.number(data.reward?.gold||0, "achView.updateReward('gold', this.value)")}</div>
                    <div style="flex:1;"><label>✨ 經驗</label>${ui.input.number(data.reward?.exp||0, "achView.updateReward('exp', this.value)")}</div>
                </div>
            </div>`;

        const footHtml = isEdit 
            ? `${ui.component.btn({label:'刪除', theme:'danger', action:`act.deleteAchievement('${achId}')`})} ${ui.component.btn({label:'儲存', theme:'correct', style:'flex:1;', action:'act.submitAchievement()'})}`
            : ui.component.btn({label:'儲存', theme:'correct', style:'width:100%;', action:'act.submitAchievement()'});

        ui.modal.render(isEdit?'編輯':'新增', bodyHtml, footHtml, 'overlay');
    },

    // =========================================
    // 3. 里程碑/榮譽殿堂頁面 (保持原 ach_view.js)
    // =========================================
    renderMilestonePage: function() {
        const container = document.getElementById('page-milestone');
        if(!container) return;

        // 使用 Engine 獲取數據
        const achs = window.GlobalState.achievements || [];
        // [嚴格比對] 篩選條件：已領取(done/claimed) 且 非簽到
        const doneAch = achs.filter(a => a.done && a.type !== 'check_in'); 

        const headerHtml = ui.container.bar(`
            <div style="display:flex; justify-content:space-between; align-items:center; width:100%;">
                <h2 style="margin:0; font-size:1.2rem; color:#5d4037;">🏆 榮譽殿堂</h2>
                ${ui.component.btn({label:'↩ 返回', theme:'normal', size:'sm', action:"act.navigate('task')"})}
            </div>
        `, 'padding:15px; background:#f5f5f5; border-bottom:1px solid #e0e0e0;');

        const listHtml = doneAch.length === 0 
            ? `<div style="text-align:center;color:#888;padding:20px;">尚無榮譽紀錄</div>` 
            : `<div style="padding:10px;">` + doneAch.map(a => {
                const d = new Date(a.date || Date.now());
                return `
                <div class="u-box" style="margin-bottom:8px; display:flex; align-items:center; gap:10px; background:#fafafa; border-left:4px solid #ffd700;">
                    <div style="font-size:1.5rem;">🏅</div>
                    <div style="flex:1;">
                        <div style="font-weight:bold;">${a.title}</div>
                        <div style="font-size:0.85rem; color:#666;">${a.desc}</div>
                    </div>
                    <div style="font-size:0.8rem; color:#999;">${d.getFullYear()}/${d.getMonth()+1}/${d.getDate()}</div>
                </div>`;
            }).join('') + `</div>`;

        container.innerHTML = ui.layout.scroller(headerHtml, listHtml + '<div style="height:50px;"></div>', 'milestone-scroll');
    },

    // Helper functions
    updateField: (f, v) => { if(window.TempState?.editingAch) window.TempState.editingAch[f] = v; },
    updateReward: (t, v) => { if(window.TempState?.editingAch) { if(!window.TempState.editingAch.reward) window.TempState.editingAch.reward={}; window.TempState.editingAch.reward[t]=parseInt(v)||0; } }
};

// 兼容舊版呼叫
window.view = window.view || {};
window.view.renderMilestonePage = () => achView.renderMilestonePage();