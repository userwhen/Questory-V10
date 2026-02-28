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

        const achFilterArea = ui.layout.filterBar(
            achCats, currentAchCat, "act.setAchFilter",
            ui.component.btn({ label:'🏆 殿堂', theme:'normal', size:'sm', action:"act.navigate('milestone')" })
        );

        let achListItems = '';
        if (displayAchs.length === 0) {
            achListItems = ui.layout.empty('暫無成就', '🏅');
        } else {
            // [優化] 全面改用 ui.card.row 來生成標準卡片
            achListItems = displayAchs.map(a => {
                const isCheckIn = a.type === 'check_in';
                const isReady = isCheckIn ? !a.done : (a.curr >= a.target); 
                
                let btnHtml = '';
                if (isCheckIn) {
                    btnHtml = a.done 
                        ? ui.component.btn({ label:'已簽到', disabled:true, size:'sm' })
                        : ui.component.btn({ label:'簽到', theme:'correct', size:'sm', action:`event.stopPropagation(); act.checkInAch('${a.id}')` });
                } else {
                    btnHtml = isReady 
                        // 修復：theme 改為 paper，對應系統的金色按鈕
                        ? ui.component.btn({ label:'🎁 領取', theme:'paper', size:'sm', action:`event.stopPropagation(); act.claimReward('${a.id}')` })
                        : ui.component.btn({ label:'未完成', disabled:true, size:'sm' });
                }
                
                let icon = isCheckIn ? '📅' : '🏅';
                let tierBadge = '';
                if (a.tier) {
                    if (a.tier === 'S') { icon = '👑'; tierBadge = ui.component.badge('S', '--color-gold-dark', '--color-gold-soft'); }
                    else if (a.tier === 'A') { icon = '💎'; tierBadge = ui.component.badge('A', '--color-info', '--color-info-soft'); }
                    else { tierBadge = ui.component.badge(a.tier); }
                }

                // 將進度條與描述包裝進 subTitle
                const subTitleHtml = `
                    <div style="display:flex; align-items:baseline; gap:6px; margin-bottom:4px;">
                        ${tierBadge}
                        <span style="font-size:0.85rem; color:var(--text-ghost); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; flex:1;">- ${a.desc || ''}</span>
                    </div>
                    <div style="margin-top:6px;">
                        ${ui.progress.bar(a.curr, a.target)}
                    </div>`;

                return ui.card.row({
                    iconHtml: icon,
                    title: a.title,
                    subTitle: subTitleHtml,
                    rightHtml: `<div onclick="event.stopPropagation();">${btnHtml}</div>`,
                    themeColor: isReady ? 'var(--color-correct)' : 'var(--border)',
                    onClick: `act.editAch('${a.id}')`,
                    style: 'margin-bottom: 10px;'
                });
            }).join('');
        }

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

        // 修復：按鈕改用 ui.component.btn 以確保樣式與動畫一致
        const tierButtons = Object.keys(tierInfo).map(t => {
            const theme = data.tier === t ? 'correct' : 'normal';
            return ui.component.btn({
                label: t,
                theme: theme,
                action: `achView.updateField('tier', '${t}')`,
                style: `flex:1; padding:6px; border-radius:var(--radius-sm);`
            });
        }).join('');

        bodyHtml += `
            <div class="u-box" style="margin-top:10px; border-color:var(--color-gold); background:var(--color-gold-soft);">
                <label class="section-title">難度層級</label>
                <div style="display:flex; gap:5px; margin-bottom:10px;">
                    ${tierButtons}
                </div>
                <div style="font-size:0.9rem; color:var(--text-2); background:rgba(255,255,255,0.5); padding:8px; border-radius:var(--radius-sm);">
                    <div>🎯 目標：累積 <b>${currentTier.target}</b> 點 Impact</div>
                    <div>🎁 獎勵：${currentTier.reward}</div>
                </div>
            </div>`;

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

        const listHtml = achs.length === 0 
            ? ui.layout.empty('尚無榮譽紀錄', '🏅')
            : `<div style="padding: 14px;">` + achs.map(a => {
                const d = new Date(a.finishDate || Date.now());
                const dateStr = `${d.getFullYear()}/${d.getMonth()+1}/${d.getDate()}`;
                
                return ui.card.row({
                    iconHtml: '🏅',
                    title: a.title,
                    subTitle: a.desc,
                    rightHtml: `<div style="font-size:0.8rem; color:var(--text-ghost);">${dateStr}</div>`,
                    themeColor: 'var(--color-gold)',
                    style: 'margin-bottom: 10px;'
                });
            }).join('') + `</div>`;

        // [優化] 使用升級版的 ui.layout.page 取代手寫容器
        container.innerHTML = ui.layout.page({
            title: '🏆 榮譽殿堂',
            back: "act.navigate('task')",
            headerBg: 'var(--bg-card)',
            body: listHtml
        });
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