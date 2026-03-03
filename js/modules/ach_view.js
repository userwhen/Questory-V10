/* js/modules/ach_view.js - V51.3 Full Features + Pure CSP */
window.SQ = window.SQ || {};
window.SQ.View = window.SQ.View || {};
window.SQ.View.Ach = {
    // =========================================
    // 1. 成就列表渲染 (List Render)
    // =========================================
    renderList: function() {
        const achs = window.SQ.Engine.Ach.getSortedAchievements();
        const currentAchCat = window.SQ.Temp.achFilter || '全部';
        const achCats = ['全部', '每日', '里程碑', '官方'];
        
        const displayAchs = achs.filter(a => {
            if (a.claimed && a.type !== 'check_in') return false; 
            if (currentAchCat === '每日') return a.type === 'check_in';
            if (currentAchCat === '里程碑') return a.type !== 'check_in' && !a.isSystem;
            if (currentAchCat === '官方') return a.isSystem;
            return true;
        });

        const filterBtnsHtml = achCats.map(opt => {
            const isActive = currentAchCat === opt;
            return ui.atom.buttonBase({
                label: opt,
                theme: isActive ? 'normal' : 'ghost',
                style: 'flex-shrink:0; border-radius:50px; padding:4px 12px;',
                action: 'setAchFilter', actionVal: opt
            });
        }).join('');

        const achFilterArea = `
            <div style="display:flex; align-items:center; gap:8px; margin-bottom:10px;">
                <div style="flex:1; overflow:hidden;">
                    <div class="u-scroll-list" style="-webkit-overflow-scrolling:touch;">${filterBtnsHtml}</div>
                </div>
                <div style="flex-shrink:0;">
                    ${ui.atom.buttonBase({ label:'🏆 殿堂', theme:'normal', size:'sm', action:'navigate', actionVal:'milestone' })}
                </div>
            </div>`;

        let achListItems = '';
        if (displayAchs.length === 0) {
            achListItems = `<div class="ui-empty"><div class="ui-empty-icon">🏅</div>暫無成就</div>`;
        } else {
            achListItems = displayAchs.map(a => {
                const isCheckIn = a.type === 'check_in';
                const isReady = isCheckIn ? !a.done : (a.curr >= a.target); 
                
                let btnHtml = '';
                if (isCheckIn) {
                    btnHtml = a.done 
                        ? ui.atom.buttonBase({ label:'已簽到', disabled:true, size:'sm' })
                        : ui.atom.buttonBase({ label:'簽到', theme:'correct', size:'sm', action:'checkInAch', actionId: a.id, stop:true });
                } else {
                    btnHtml = isReady 
                        ? ui.atom.buttonBase({ label:'🎁 領取', theme:'paper', size:'sm', action:'claimReward', actionId: a.id, stop:true })
                        : ui.atom.buttonBase({ label:'未完成', disabled:true, size:'sm', theme:'ghost' });
                }
                
                let icon = isCheckIn ? '📅' : '🏅';
                let tierBadge = '';
                if (a.tier) {
                    if (a.tier === 'S') { icon = '👑'; tierBadge = ui.atom.badgeBase({text:'S', style:'color:var(--color-gold-dark); background:var(--color-gold-soft); border-color:var(--color-gold-dark);'}); }
                    else if (a.tier === 'A') { icon = '💎'; tierBadge = ui.atom.badgeBase({text:'A', style:'color:var(--color-info); background:var(--color-info-soft); border-color:var(--color-info);'}); }
                    else { tierBadge = ui.atom.badgeBase({text:a.tier}); }
                }

                const pct = Math.min(100, Math.max(0, (a.curr / a.target) * 100));
                const progressHtml = `<div class="u-progress" style="margin-top:6px;"><div class="u-progress-bar" style="width:${pct}%;"></div><div class="u-progress-text">${a.curr} / ${a.target}</div></div>`;
                const borderColor = isReady ? 'var(--color-correct)' : 'var(--border)';

                return `
                <div class="std-card" data-action="editAch" data-id="${a.id}" style="flex-direction:row; justify-content:space-between; border-left-color:${borderColor}; margin-bottom:10px; cursor:pointer;">
                    <div class="card-icon" style="font-size:2rem; margin-right:12px;">${icon}</div>
                    <div class="card-col-center" style="flex:1; min-width:0;">
                        <div style="font-weight:bold; font-size:1rem; color:var(--text); margin-bottom:4px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${a.title}</div>
                        <div style="display:flex; align-items:baseline; gap:6px; margin-bottom:4px;">
                            ${tierBadge}
                            <span style="font-size:0.85rem; color:var(--text-ghost); white-space:nowrap; overflow:hidden; text-overflow:ellipsis; flex:1;">- ${a.desc || ''}</span>
                        </div>
                        ${progressHtml}
                    </div>
                    <div style="flex-shrink:0; margin-left:10px;">${btnHtml}</div>
                </div>`;
            }).join('');
        }

        return achFilterArea + `<div style="padding-bottom:100px;">${achListItems}</div>`;
    },

    // =========================================
    // 2. 編輯表單 (Edit Form)
    // =========================================
    renderCreateAchForm: function(achId = null) {
        const gs = window.SQ.State;
        const achs = gs ? (gs.milestones || []) : []; 
        const ach = achId && achId !== 'null' ? achs.find(a => a.id === achId) : null;
        const isEdit = !!ach;

        window.SQ.Temp = window.SQ.Temp || {};
        if (!window.SQ.Temp.editingAch || window.SQ.Temp.editingAch.id !== achId) {
            window.SQ.Temp.editingAch = ach ? JSON.parse(JSON.stringify(ach)) : { id: null, title: '', targetType: 'tag', targetValue: '每日', tier: 'C' };
        }
        const data = window.SQ.Temp.editingAch;

        let bodyHtml = ui.composer.formField({
            label: '目標標題', 
            inputHtml: ui.atom.inputBase({type: 'text', val: data.title, placeholder: "例如: 健身達人", action: "updateAchField", actionId: "title"})
        });

        const typeOpts = [ {value:'tag', label:'🏷️ 任務分類'}, {value:'attr', label:'💪 屬性鍛鍊'}, {value:'challenge', label:'🔥 極限挑戰'} ];
        
        bodyHtml += `
            <div class="u-box" style="margin-top:10px;">
                ${ui.composer.formField({label: '監聽目標', inputHtml: ui.atom.inputBase({type: 'select', val: data.targetType, action: "updateAchField", actionId: "targetType", options: typeOpts})})}
                <div style="margin-top:10px;">
                    ${this._renderTargetValueInput(data)}
                </div>
            </div>`;

        const tierInfo = {
            'S': { label: 'S - 傳奇', target: 1000, reward: '💰500 ✨1000' },
            'A': { label: 'A - 史詩', target: 500, reward: '💰200 ✨400' },
            'B': { label: 'B - 稀少', target: 200, reward: '💰80 ✨150' },
            'C': { label: 'C - 普通', target: 50, reward: '💰20 ✨50' }
        };
        const currentTier = tierInfo[data.tier] || tierInfo['C'];

        const tierButtons = Object.keys(tierInfo).map(t => {
            const theme = data.tier === t ? 'correct' : 'normal';
            return ui.atom.buttonBase({
                label: t, theme: theme, action: 'updateAchField', actionId: 'tier', actionVal: t,
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
            ? `${ui.atom.buttonBase({label:'刪除', theme:'danger', action: 'deleteAchievement', actionId: ach.id})} ${ui.atom.buttonBase({label:'儲存', theme:'correct', style:'flex:1;', action: 'submitMilestone'})}`
            : ui.atom.buttonBase({label:'建立目標', theme:'correct', style:'width:100%;', action: 'submitMilestone'});

        ui.modal.render(isEdit ? '編輯目標' : '建立新目標', bodyHtml, footHtml, 'overlay');
    },

    _renderTargetValueInput: function(data) {
        const gs = window.SQ.State;
        
        if (data.targetType === 'challenge') {
            return `<div style="color:var(--text-muted); font-size:0.9rem;"><i>監聽重要性與緊急性皆 >= 3 的任務</i></div>`;
        }
        
        if (data.targetType === 'attr') {
            const attrs = gs.attrs ? Object.keys(gs.attrs) : ['STR','INT'];
            const opts = attrs.map(k => ({ value: k, label: `${gs.attrs[k].icon} ${gs.attrs[k].name}` }));
            if (!attrs.includes(data.targetValue)) data.targetValue = attrs[0];
            return ui.composer.formField({label: '選擇屬性', inputHtml: ui.atom.inputBase({type: 'select', val: data.targetValue, action: "updateAchField", actionId: "targetValue", options: opts})});
        }
        
        const cats = gs.taskCats || ['每日', '運動', '工作'];
        const opts = cats.map(c => ({ value: c, label: c }));
        if (!cats.includes(data.targetValue)) data.targetValue = cats[0];
        return ui.composer.formField({label: '選擇分類', inputHtml: ui.atom.inputBase({type: 'select', val: data.targetValue, action: "updateAchField", actionId: "targetValue", options: opts})});
    },

    // =========================================
    // 3. 殿堂頁面 (Milestone Page)
    // =========================================
    renderMilestonePage: function() {
        const container = document.getElementById('page-milestone');
        if(!container) return;

        const achs = window.SQ.Engine.Ach.getSortedAchievements().filter(a => a.claimed);

        const listHtml = achs.length === 0 
            ? `<div class="ui-empty"><div class="ui-empty-icon">🏅</div>尚無榮譽紀錄</div>`
            : `<div style="padding: 14px;">` + achs.map(a => {
                const d = new Date(a.finishDate || Date.now());
                const dateStr = `${d.getFullYear()}/${d.getMonth()+1}/${d.getDate()}`;
                
                return `
                <div class="std-card" style="flex-direction:row; justify-content:space-between; border-left-color:var(--color-gold); margin-bottom:10px;">
                    <div class="card-icon" style="font-size:2rem; margin-right:12px;">🏅</div>
                    <div class="card-col-center" style="flex:1; min-width:0;">
                        <div style="font-weight:bold; font-size:1rem; color:var(--text); margin-bottom:4px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${a.title}</div>
                        <div style="font-size:0.85rem; color:var(--text-muted);">${a.desc}</div>
                    </div>
                    <div style="flex-shrink:0; font-size:0.8rem; color:var(--text-ghost); margin-left:10px;">${dateStr}</div>
                </div>`;
            }).join('') + `</div>`;

        container.innerHTML = `
            <div style="display:flex; flex-direction:column; height:100%; overflow:hidden; background:var(--bg-panel);">
                ${ui.composer.pageHeader({
                    title: '🏆 榮譽殿堂',
                    backAction: 'navigate',
                    backActionVal: 'task',
                    style: 'background:var(--bg-card);'
                })}
                <div style="flex:1; overflow-y:auto; overflow-x:hidden; position:relative; z-index:10; padding-bottom: 20px;">
                    ${listHtml}
                </div>
            </div>
        `;
    },

    updateField: function(field, val) { 
        if(window.SQ.Temp?.editingAch) {
            window.SQ.Temp.editingAch[field] = val;
            if (field === 'targetType' || field === 'tier') {
                this.renderCreateAchForm(window.SQ.Temp.editingAch.id);
            }
        } 
    }
};

// 轉接器 (Adapter) - 註冊給全域大腦
window.SQ.Actions.updateAchField = (f, v) => window.SQ.View.Ach.updateField(f, v);
window.view = window.view || {};
window.SQ.View.Main.renderMilestonePage = () => window.SQ.View.Ach.renderMilestonePage();