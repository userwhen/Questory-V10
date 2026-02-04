/* js/modules/ach_view.js - V41.0 Adapted for AchEngine (Tier System) */
window.achView = {
    // =========================================
    // 1. 成就列表渲染 (List Render)
    // =========================================
    renderList: function() {
        const achs = AchEngine.getSortedAchievements();
        const currentAchCat = window.TempState.achFilter || '全部';
        // ... (過濾器邏輯保持不變) ...
        const achCats = ['全部', '每日', '里程碑', '官方'];
        const displayAchs = achs.filter(a => {
            if (a.claimed && a.type !== 'check_in') return false; 
            if (currentAchCat === '每日') return a.type === 'check_in';
            if (currentAchCat === '里程碑') return a.type !== 'check_in' && !a.isSystem;
            if (currentAchCat === '官方') return a.isSystem;
            return true;
        });

        // 頂部過濾器 (保持不變)
        const achFilterArea = `
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:10px;">
                <div style="flex:1; overflow:hidden;">
                    ${ui.container.bar(ui.tabs.scrollX(achCats, currentAchCat, "act.setAchFilter"), 'width:100%;')}
                </div>
                <div style="flex-shrink:0;">
                    ${ui.component.btn({ label:'🏆 殿堂', theme:'normal', size:'sm', action:"act.navigate('milestone')" })}
                </div>
            </div>`;

        // [重構] 列表項目渲染
        const achListItems = displayAchs.length === 0 
            ? `<div style="text-align:center;color:#888;padding:40px;">暫無成就</div>` 
            : displayAchs.map(a => {
                const isCheckIn = a.type === 'check_in';
                const isReady = isCheckIn ? !a.done : (a.curr >= a.target); 
                
                // 1. 右側按鈕邏輯
                let btnHtml = '';
                if (isCheckIn) {
                    // 簽到類型保持原樣
                    btnHtml = a.done 
                        ? `<button class="u-btn u-btn-sm" style="background:#eee; color:#aaa; cursor:default;">已簽到</button>`
                        : `<button class="u-btn u-btn-sm u-btn-correct" onclick="event.stopPropagation(); act.checkInAch('${a.id}')">簽到</button>`;
                } else {
                    // 一般成就類型
                    if (isReady) {
                        // 已完成 -> 顯示「領取」 (按下後會領獎並自動移到殿堂)
                        btnHtml = `<button class="u-btn u-btn-sm" 
                            style="background:gold; color:#333; font-weight:bold; box-shadow:0 2px 5px rgba(255,215,0,0.4); min-width:60px;" 
                            onclick="event.stopPropagation(); act.claimReward('${a.id}')">
                            🎁 領取
                        </button>`;
                    } else {
                        // 未完成 -> 顯示「未完成」 (灰色不可點)
                        btnHtml = `<button class="u-btn u-btn-sm" 
                            style="background:#f5f5f5; color:#bbb; border:none; cursor:default; min-width:60px;">
                            未完成
                        </button>`;
                    }
                }
                
                // 2. 圖示與層級
                let icon = isCheckIn ? '📅' : '🏅';
                if (a.tier === 'S') icon = '👑';
                else if (a.tier === 'A') icon = '💎';

                // 3. 中間下方進度條
                // 計算百分比
                const percent = Math.min(100, Math.floor((a.curr / a.target) * 100));
                const progressBar = `
                    <div style="display:flex; align-items:center; gap:5px; margin-top:6px;">
                        <div style="flex:1; height:6px; background:#eee; border-radius:3px; overflow:hidden;">
                            <div style="width:${percent}%; height:100%; background:${isReady?'#4caf50':'#2196f3'}; border-radius:3px; transition:width 0.3s;"></div>
                        </div>
                        <div style="font-size:0.7rem; color:#999; width:40px; text-align:right;">${a.curr}/${a.target}</div>
                    </div>`;

                // 4. 組合 HTML (上文下條，右按鈕)
                return `
                <div class="u-box" style="margin-bottom:10px; padding:12px; display:flex; align-items:center; gap:12px; background:#fff; box-shadow:0 2px 4px rgba(0,0,0,0.05); cursor:pointer;" onclick="act.editAch('${a.id}')">
                    
                    <div style="font-size:2rem; width:40px; text-align:center;">${icon}</div>
                    
                    <div style="flex:1; min-width:0; display:flex; flex-direction:column; justify-content:center;">
                        
                        <div style="display:flex; align-items:baseline; gap:6px; width:100%;">
                            <span style="font-weight:bold; color:#333; font-size:1rem; white-space:nowrap;">${a.title}</span>
                            
                            ${a.tier ? `<span style="font-size:0.7rem; background:#eee; padding:1px 6px; border-radius:10px; color:#666; white-space:nowrap; flex-shrink:0;">${a.tier}</span>` : ''}
                            
                            <span style="font-size:0.85rem; color:#aaa; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; flex:1;">
                                - ${a.desc || ''}
                            </span>
                        </div>

                        ${progressBar}
                    </div>

                    <div onclick="event.stopPropagation();">
                        ${btnHtml}
                    </div>
                </div>`;
            }).join('');

        return achFilterArea + `<div style="padding-bottom:100px;">${achListItems}</div>`;
    },

    // =========================================
    // 2. 編輯表單 (完全適配 Engine Tier System)
    // =========================================
    renderCreateAchForm: function(achId = null) {
        const gs = window.GlobalState;
        const achs = gs ? (gs.milestones || []) : []; // 主要編輯 Milestones
        const ach = achId ? achs.find(a => a.id === achId) : null;
        const isEdit = !!achId;

        // 初始化暫存數據 (預設值對應 Controller)
        window.TempState = window.TempState || {};
        if (!window.TempState.editingAch || window.TempState.editingAch.id !== achId) {
            window.TempState.editingAch = ach ? JSON.parse(JSON.stringify(ach)) : {
                id: null, 
                title: '', 
                targetType: 'tag',  // tag, attr, challenge
                targetValue: '每日', // 預設值
                tier: 'C',          // S, A, B, C
            };
        }
        const data = window.TempState.editingAch;

        // 1. 基本資訊
        let bodyHtml = `
            <div class="input-group"><label class="section-title">目標標題</label>${ui.input.text(data.title, "例如: 健身達人", "achView.updateField('title', this.value)")}</div>
        `;

        // 2. 監聽類型 (Target Type)
        const typeOpts = [
            {value:'tag', label:'🏷️ 任務分類'}, 
            {value:'attr', label:'💪 屬性鍛鍊'}, 
            {value:'challenge', label:'🔥 極限挑戰'}
        ];
        
        bodyHtml += `
            <div class="u-box" style="margin-top:10px; padding:10px;">
                <label class="section-title">監聽目標</label>
                ${ui.input.select(typeOpts, data.targetType, "achView.updateField('targetType', this.value)")}
                
                <div style="margin-top:10px;">
                    ${this._renderTargetValueInput(data)}
                </div>
            </div>`;

        // 3. 難度層級 (Tier System) - 取代原本的數值輸入
        // 這些數值與 AchEngine.createMilestone 裡的 tierConfig 對應
        const tierInfo = {
            'S': { label: 'S - 傳奇', target: 1000, reward: '💰500 ✨1000' },
            'A': { label: 'A - 史詩', target: 500, reward: '💰200 ✨400' },
            'B': { label: 'B - 稀有', target: 200, reward: '💰80 ✨150' },
            'C': { label: 'C - 普通', target: 50, reward: '💰20 ✨50' }
        };
        const currentTier = tierInfo[data.tier] || tierInfo['C'];

        bodyHtml += `
            <div class="u-box" style="margin-top:10px; padding:10px; border:1px solid #ffd700; background:#fffbf0;">
                <label class="section-title">難度層級</label>
                <div style="display:flex; gap:5px; margin-bottom:10px;">
                    ${Object.keys(tierInfo).map(t => {
                        const active = data.tier === t ? 'background:#ffd700; color:#000; font-weight:bold;' : 'background:#eee; color:#666;';
                        return `<button type="button" onclick="achView.updateField('tier', '${t}')" style="flex:1; border:none; padding:8px; border-radius:6px; cursor:pointer; ${active}">${t}</button>`;
                    }).join('')}
                </div>
                
                <div style="font-size:0.9rem; color:#5d4037; background:rgba(255,215,0,0.1); padding:8px; border-radius:4px;">
                    <div>🎯 目標：累積 <b>${currentTier.target}</b> 點 Impact</div>
                    <div>🎁 獎勵：${currentTier.reward}</div>
                </div>
            </div>`;

        // 4. 按鈕區
        const footHtml = isEdit 
            ? `${ui.component.btn({label:'刪除', theme:'danger', action:`act.deleteAchievement('${achId}')`})} ${ui.component.btn({label:'儲存', theme:'correct', style:'flex:1;', action:'act.submitMilestone()'})}`
            : ui.component.btn({label:'建立目標', theme:'correct', style:'width:100%;', action:'act.submitMilestone()'});

        ui.modal.render(isEdit ? '編輯目標' : '建立新目標', bodyHtml, footHtml, 'overlay');
    },

    // [內部 Helper] 根據類型渲染不同的輸入框
    _renderTargetValueInput: function(data) {
        const gs = window.GlobalState;
        
        if (data.targetType === 'challenge') {
            return `<div style="color:#666; font-size:0.9rem;"><i>監聽重要性與緊急性皆 >= 3 的任務</i></div>`;
        }
        
        if (data.targetType === 'attr') {
            const attrs = gs.attrs ? Object.keys(gs.attrs) : ['STR','INT'];
            const opts = attrs.map(k => ({ value: k, label: `${gs.attrs[k].icon} ${gs.attrs[k].name}` }));
            // 如果當前值不在選項中，預設選第一個
            if (!attrs.includes(data.targetValue)) data.targetValue = attrs[0];
            
            return `<label>選擇屬性</label>${ui.input.select(opts, data.targetValue, "achView.updateField('targetValue', this.value)")}`;
        }
        
        // Default: Tag (Task Categories)
        const cats = gs.taskCats || ['每日', '運動', '工作'];
        const opts = cats.map(c => ({ value: c, label: c }));
        if (!cats.includes(data.targetValue)) data.targetValue = cats[0];

        return `<label>選擇分類</label>${ui.input.select(opts, data.targetValue, "achView.updateField('targetValue', this.value)")}`;
    },

    // =========================================
    // 3. 殿堂頁面 (Milestone Page)
    // =========================================
    renderMilestonePage: function() {
        const container = document.getElementById('page-milestone');
        if(!container) return;

        // 獲取已完成且已領取的成就
        // 注意：AchEngine.getSortedAchievements() 已經處理了新舊資料合併
        const achs = AchEngine.getSortedAchievements().filter(a => a.claimed);
        
        const headerHtml = ui.container.bar(`
            <div style="display:flex; justify-content:space-between; align-items:center; width:100%;">
                <h2 style="margin:0; font-size:1.2rem; color:#d4af37;">🏆 榮譽殿堂</h2>
                ${ui.component.btn({label:'↩ 返回', theme:'normal', size:'sm', action:"act.navigate('task')"})}
            </div>
        `, 'padding:15px; background:#222; color:#fff; border-bottom:1px solid gold; width:100%; box-sizing:border-box;');

        const listHtml = achs.length === 0 
            ? `<div style="text-align:center;color:#666;padding:50px;">尚無榮譽紀錄</div>` 
            : `<div style="padding: 10px;">` + achs.map(a => {
                const d = new Date(a.finishDate || Date.now());
                const dateStr = `${d.getFullYear()}/${d.getMonth()+1}/${d.getDate()}`;
                
                return `
                <div class="u-box" style="margin-bottom:8px; display:flex; align-items:center; gap:10px; background:#fafafa; border-left:4px solid #ffd700; padding:12px;">
                    <div style="font-size:1.5rem;">🏅</div>
                    <div style="flex:1;">
                        <div style="font-weight:bold;">${a.title}</div>
                        <div style="font-size:0.85rem; color:#666;">${a.desc}</div>
                    </div>
                    <div style="font-size:0.8rem; color:#999;">${dateStr}</div>
                </div>`;
            }).join('') + `</div>`;

        container.innerHTML = ui.layout.scroller(headerHtml, listHtml + '<div style="height:50px;"></div>', 'milestone-scroll');
    },

    // Helper functions
    updateField: function(field, val) { 
        if(window.TempState?.editingAch) {
            window.TempState.editingAch[field] = val;
            // 如果改變了類型，需要重繪表單以顯示正確的下拉選單 (Tag vs Attr)
            if (field === 'targetType' || field === 'tier') {
                this.renderCreateAchForm(window.TempState.editingAch.id);
            }
        } 
    }
};

// 兼容舊版呼叫
window.view = window.view || {};
window.view.renderMilestonePage = () => achView.renderMilestonePage();