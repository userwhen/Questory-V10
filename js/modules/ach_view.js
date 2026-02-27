/* js/modules/ach_view.js - V42.0 UI System Upgrade */
window.achView = {
    // =========================================
    // 1. 成就列表渲染 (List Render)
    // =========================================
    renderList: function() {
        const achs = AchEngine.getSortedAchievements();
        const currentAchCat = window.TempState.achFilter || '全部';
        const achCats = ['全部', '每日', '里程碑', '官方'];
        
        const displayAchs = achs.filter(a => {
            if (a.claimed && a.type !== 'check_in') return false; 
            if (currentAchCat === '每日') return a.type === 'check_in';
            if (currentAchCat === '里程碑') return a.type !== 'check_in' && !a.isSystem;
            if (currentAchCat === '官方') return a.isSystem;
            return true;
        });

        // [優化] 使用共用 Filter 列
        const achFilterArea = ui.layout.filterBar(
            achCats, currentAchCat, "act.setAchFilter",
            ui.component.btn({ label:'🏆 殿堂', theme:'normal', size:'sm', action:"act.navigate('milestone')" })
        );

        // [優化] 列表項目渲染，使用新版 empty 和 std-card 結構
        const achListItems = displayAchs.length === 0 
            ? ui.layout.empty('暫無成就', '🏅')
            : displayAchs.map(a => {
                const isCheckIn = a.type === 'check_in';
                const isReady = isCheckIn ? !a.done : (a.curr >= a.target); 
                
                // 1. 右側按鈕邏輯
                let btnHtml = '';
                if (isCheckIn) {
                    btnHtml = a.done 
                        ? ui.component.btn({ label:'已簽到', disabled:true, size:'sm' })
                        : ui.component.btn({ label:'簽到', theme:'correct', size:'sm', action:`event.stopPropagation(); act.checkInAch('${a.id}')` });
                } else {
                    btnHtml = isReady 
                        ? ui.component.btn({ label:'🎁 領取', theme:'gold', size:'sm', action:`event.stopPropagation(); act.claimReward('${a.id}')` })
                        : ui.component.btn({ label:'未完成', disabled:true, size:'sm' });
                }
                
                // 2. 圖示與層級
                let icon = isCheckIn ? '📅' : '🏅';
                let tierBadge = '';
                if (a.tier) {
                    if (a.tier === 'S') { icon = '👑'; tierBadge = ui.component.badge('S', '--color-gold-dark', '--color-gold-soft'); }
                    else if (a.tier === 'A') { icon = '💎'; tierBadge = ui.component.badge('A', '--color-info', '--color-info-soft'); }
                    else { tierBadge = ui.component.badge(a.tier); }
                }

                // 3. 組合 HTML (使用通用的 std-card 結構)
                return `
                <div class="std-card" style="border-left-color:${isReady?'var(--color-correct)':'var(--border)'};" onclick="act.editAch('${a.id}')">
                    <div style="display:flex; align-items:center;">
                        <div style="width:40px; height:40px; background:var(--bg-box); border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:1.5rem; flex-shrink:0; margin-right:12px;">${icon}</div>
                        <div style="flex:1; min-width:0; margin-right: 10px;">
                            <div style="display:flex; align-items:baseline; gap:6px; width:100%; margin-bottom:4px;">
                                <span style="font-weight:bold; color:var(--text); font-size:1rem; white-space:nowrap;">${a.title}</span>
                                ${tierBadge}
                                <span style="font-size:0.85rem; color:var(--text-ghost); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; flex:1;">- ${a.desc || ''}</span>
                            </div>
                            <div style="margin-top:6px;">
                                ${ui.progress.bar(a.curr, a.target)}
                            </div>
                        </div>
                        <div onclick="event.stopPropagation();">${btnHtml}</div>
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
        const achs = gs ? (gs.milestones || []) : []; 
        const ach = achId ? achs.find(a => a.id === achId) : null;
        const isEdit = !!achId;

        window.TempState = window.TempState || {};
        if (!window.TempState.editingAch || window.TempState.editingAch.id !== achId) {
            window.TempState.editingAch = ach ? JSON.parse(JSON.stringify(ach)) : { id: null, title: '', targetType: 'tag', targetValue: '每日', tier: 'C' };
        }
        const data = window.TempState.editingAch;

        // [優化] 使用共用 field 包裝
        let bodyHtml = ui.input.field('目標標題', ui.input.text(data.title, "例如: 健身達人", "achView.updateField('title', this.value)"));

        const typeOpts = [ {value:'tag', label:'🏷️ 任務分類'}, {value:'attr', label:'💪 屬性鍛鍊'}, {value:'challenge', label:'🔥 極限挑戰'} ];
        
        bodyHtml += `
            <div class="u-box" style="margin-top:10px;">
                ${ui.input.field('監聽目標', ui.input.select(typeOpts, data.targetType, "achView.updateField('targetType', this.value)"))}
                <div style="margin-top:10px;">
                    ${this._renderTargetValueInput(data)}
                </div>
            </div>`;

        const tierInfo = {
            'S': { label: 'S - 傳奇', target: 1000, reward: '💰500 ✨1000' },
            'A': { label: 'A - 史詩', target: 500, reward: '💰200 ✨400' },
            'B': { label: 'B - 稀有', target: 200, reward: '💰80 ✨150' },
            'C': { label: 'C - 普通', target: 50, reward: '💰20 ✨50' }
        };
        const currentTier = tierInfo[data.tier] || tierInfo['C'];

        bodyHtml += `
            <div class="u-box" style="margin-top:10px; border-color:var(--color-gold); background:var(--color-gold-soft);">
                <label class="section-title">難度層級</label>
                <div style="display:flex; gap:5px; margin-bottom:10px;">
                    ${Object.keys(tierInfo).map(t => {
                        const active = data.tier === t ? 'background:var(--color-gold); color:var(--text-on-dark); font-weight:bold; box-shadow:var(--shadow-sm);' : 'background:var(--bg-card); color:var(--text-muted); border:1px solid var(--border);';
                        return `<button type="button" onclick="achView.updateField('tier', '${t}')" style="flex:1; border:none; padding:8px; border-radius:var(--radius-sm); cursor:pointer; transition:all var(--t-fast); ${active}">${t}</button>`;
                    }).join('')}
                </div>
                <div style="font-size:0.9rem; color:var(--text-2); background:rgba(255,255,255,0.5); padding:8px; border-radius:var(--radius-sm);">
                    <div>🎯 目標：累積 <b>${currentTier.target}</b> 點 Impact</div>
                    <div>🎁 獎勵：${currentTier.reward}</div>
                </div>
            </div>`;

        // [優化] 使用共用 footRow
        const footHtml = isEdit 
            ? `${ui.component.btn({label:'刪除', theme:'danger', action:`act.deleteAchievement('${achId}')`})} ${ui.component.btn({label:'儲存', theme:'correct', style:'flex:1;', action:'act.submitMilestone()'})}`
            : ui.component.btn({label:'建立目標', theme:'correct', style:'width:100%;', action:'act.submitMilestone()'});

        ui.modal.render(isEdit ? '編輯目標' : '建立新目標', bodyHtml, footHtml, 'overlay');
    },

    _renderTargetValueInput: function(data) {
        const gs = window.GlobalState;
        
        if (data.targetType === 'challenge') {
            return `<div style="color:var(--text-muted); font-size:0.9rem;"><i>監聽重要性與緊急性皆 >= 3 的任務</i></div>`;
        }
        
        if (data.targetType === 'attr') {
            const attrs = gs.attrs ? Object.keys(gs.attrs) : ['STR','INT'];
            const opts = attrs.map(k => ({ value: k, label: `${gs.attrs[k].icon} ${gs.attrs[k].name}` }));
            if (!attrs.includes(data.targetValue)) data.targetValue = attrs[0];
            return ui.input.field('選擇屬性', ui.input.select(opts, data.targetValue, "achView.updateField('targetValue', this.value)"));
        }
        
        const cats = gs.taskCats || ['每日', '運動', '工作'];
        const opts = cats.map(c => ({ value: c, label: c }));
        if (!cats.includes(data.targetValue)) data.targetValue = cats[0];
        return ui.input.field('選擇分類', ui.input.select(opts, data.targetValue, "achView.updateField('targetValue', this.value)"));
    },

    // =========================================
    // 3. 殿堂頁面 (Milestone Page)
    // =========================================
    renderMilestonePage: function() {
        const container = document.getElementById('page-milestone');
        if(!container) return;

        const achs = AchEngine.getSortedAchievements().filter(a => a.claimed);
        
        // [優化] 使用共用 pageHeader
        const headerHtml = ui.layout.pageHeader(
            '🏆 榮譽殿堂', 
            ui.component.btn({label:'↩ 返回', theme:'normal', size:'sm', action:"act.navigate('task')"})
        );

        const listHtml = achs.length === 0 
            ? ui.layout.empty('尚無榮譽紀錄', '🏅')
            : `<div style="padding: 14px;">` + achs.map(a => {
                const d = new Date(a.finishDate || Date.now());
                const dateStr = `${d.getFullYear()}/${d.getMonth()+1}/${d.getDate()}`;
                
                // [優化] 使用通用的 ui.card.row
                return ui.card.row({
                    iconHtml: '🏅',
                    title: a.title,
                    subTitle: a.desc,
                    rightHtml: `<div style="font-size:0.8rem; color:var(--text-ghost);">${dateStr}</div>`,
                    themeColor: 'var(--color-gold)'
                });
            }).join('') + `</div>`;

        // 將 Header 與 Body 放入全螢幕容器中 (取代舊的 scroller)
        container.innerHTML = `
            <div style="display:flex; flex-direction:column; height:100%; background:var(--bg-panel);">
                ${headerHtml}
                <div style="flex:1; overflow-y:auto;">${listHtml}</div>
            </div>`;
    },

    updateField: function(field, val) { 
        if(window.TempState?.editingAch) {
            window.TempState.editingAch[field] = val;
            if (field === 'targetType' || field === 'tier') {
                this.renderCreateAchForm(window.TempState.editingAch.id);
            }
        } 
    }
};

window.view = window.view || {};
window.view.renderMilestonePage = () => achView.renderMilestonePage();