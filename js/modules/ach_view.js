/* js/modules/ach_view.js - V51.4 Fixed Layout + CheckIn + Claim */
window.SQ = window.SQ || {};
window.SQ.View = window.SQ.View || {};
window.SQ.View.Ach = {
    // =========================================
    // 1. 成就列表渲染
    // =========================================
    renderList: function() {
        const achs = window.SQ.Engine.Ach.getSortedAchievements();
        const currentAchCat = window.SQ.Temp.achFilter || '全部';
        const achCats = ['全部', '每日', '里程碑', '官方'];
        
        const displayAchs = achs.filter(a => {
            // ✅ 關鍵 1：直接把舊的系統每日打卡卡片攔截掉，不讓它渲染
            if (a.id === 'sys_daily_checkin') return false; 
            
            if (a.claimed && a.type !== 'check_in') return false; 
            
            // ✅ 關鍵 2：當玩家點擊「每日」分類時，除了顯示自訂打卡，也要顯示合併後的「冒險足跡」
            if (currentAchCat === '每日') {
                return a.type === 'check_in' || a.id === 'sys_login_days';
            }
            if (currentAchCat === '里程碑') return a.type !== 'check_in' && !a.isSystem;
            if (currentAchCat === '官方') return a.isSystem;
            return true;
        });

        displayAchs.sort((a, b) => {
            // 每日打卡永遠置頂
            if (a.id === 'sys_daily_checkin') return -1;
            if (b.id === 'sys_daily_checkin') return 1;
            // 冒險足跡次頂
            if (a.id === 'sys_login_days') return -1;
            if (b.id === 'sys_login_days') return 1;
            const scoreA = (a.done && !a.claimed) ? 2 : (!a.done ? 1 : 0);
            const scoreB = (b.done && !b.claimed) ? 2 : (!b.done ? 1 : 0);
            return scoreB - scoreA;
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
                const isReady = isCheckIn ? !a.done : (a.curr >= a.target && !a.claimed);

                // ✅ [修正 3] 簽到按鈕直接手寫 HTML，不透過 buttonBase 的 stop 參數
                // 避免 buttonBase 若未支援 stop:true 導致點擊冒泡到外層 editAch
                let btnHtml = '';
            // 抓取隱藏的每日打卡狀態
            const checkInAch = window.SQ.State.achievements ? window.SQ.State.achievements.find(ach => ach.id === 'sys_daily_checkin') : null;

            // === 視覺合併特化區塊：冒險足跡 ===
            if (a.id === 'sys_login_days') {
                a.title = '👣 冒險啟程'; 
                const isDailyDone = checkInAch ? checkInAch.done : true;

                if (isDailyDone) {
                    btnHtml = `<button disabled
                        style="padding:5px 12px; border-radius:var(--radius-sm); border:1px solid var(--border);
                               background:var(--bg-box); color:var(--text-ghost); font-size:0.8rem;
                               cursor:not-allowed; white-space:nowrap;">
                        今日已領
                    </button>`;
                } else {
                    btnHtml = `<button
                        data-action="checkInAch"
                        data-id="sys_daily_checkin"
                        data-stop="true"
                        style="padding:5px 12px; border-radius:var(--radius-sm); border:none;
                               background:var(--color-correct); color:#fff; font-size:0.8rem;
                               cursor:pointer; font-weight:600; white-space:nowrap;">
                        🎁 每日領取
                    </button>`;
                }
            } 
            // === 一般進度成就 ===
            else {
                const isReady = (a.curr >= a.target && !a.claimed);
                if (isReady) {
                    btnHtml = `<button
                        data-action="claimReward"
                        data-id="${a.id}"
                        data-stop="true"
                        style="padding:5px 12px; border-radius:var(--radius-sm); border:none;
                               background:var(--color-gold); color:var(--color-gold-dark); font-size:0.8rem;
                               cursor:pointer; font-weight:700; white-space:nowrap;">
                        🎁 領取
                    </button>`;
                } else {
                    btnHtml = `<button disabled
                        style="padding:5px 12px; border-radius:var(--radius-sm); border:1px solid var(--border);
                               background:var(--bg-box); color:var(--text-ghost); font-size:0.8rem;
                               cursor:not-allowed; white-space:nowrap;">
                        未完成
                    </button>`;
                }
            }

                let icon = isCheckIn ? '📅' : '🏅';
                let tierBadge = '';
                if (a.tier) {
                    if (a.tier === 'S') {
                        icon = '👑';
                        tierBadge = ui.atom.badgeBase({text:'S', style:'color:var(--color-gold-dark); background:var(--color-gold-soft); border-color:var(--color-gold-dark);'});
                    } else if (a.tier === 'A') {
                        icon = '💎';
                        tierBadge = ui.atom.badgeBase({text:'A', style:'color:var(--color-info); background:var(--color-info-soft); border-color:var(--color-info);'});
                    } else {
                        tierBadge = ui.atom.badgeBase({text: a.tier});
                    }
                }
				let conditionTag = '';
					if (a.targetType === 'tag') conditionTag = `🏷️ ${a.targetValue}`;
					else if (a.targetType === 'attr') conditionTag = `💪 ${a.targetValue}`;
					else if (a.targetType === 'focus_time') conditionTag = `⏱️ 專注`;
					else if (a.targetType === 'pomodoro') conditionTag = `🍅 番茄`;
					else if (a.targetType === 'login_days' || a.targetType === 'login_streak') conditionTag = `👣 登入`;

					let tagHtml = conditionTag ? `<span style="background:var(--bg-box); padding:2px 6px; border-radius:4px; font-size:0.75rem; color:var(--text-muted); border:1px solid var(--border);">${conditionTag}</span>` : '';
                // progress bar（check_in 類型不顯示）
                let progressHtml = '';
                if (!isCheckIn) {
                    const pct = Math.min(100, Math.max(0, (a.curr / a.target) * 100));
                    progressHtml = `<div class="u-progress" style="margin-top:6px;">
                        <div class="u-progress-bar" style="width:${pct}%;"></div>
                        <div class="u-progress-text">${a.curr} / ${a.target}</div>
                    </div>`;
                }

                const borderColor = isReady ? 'var(--color-correct)' : 'var(--border)';
				const editAction = a.isSystem ? '' : `data-action="editAch" data-id="${a.id}"`;
				const cursorStyle = a.isSystem ? 'cursor:default;' : 'cursor:pointer;';

                // ✅ [修正 4] 外層卡片加 align-items:center，讓左右兩側 icon/按鈕對齊卡片垂直中線
                return `
				<div class="std-card" ${editAction}
					 style="flex-direction:row; align-items:center; justify-content:space-between;
							border-left-color:${borderColor}; margin-bottom:10px; ${cursorStyle}">
					<div style="font-size:2rem; flex-shrink:0; margin-right:12px; line-height:1;">${icon}</div>
					<div style="flex:1; min-width:0;">
                        <div style="font-weight:bold; font-size:1rem; color:var(--text); margin-bottom:4px;
                                    white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${a.title}</div>
                        <div style="display:flex; align-items:center; gap:6px; margin-bottom:4px; flex-wrap:wrap;">
							${tierBadge} ${tagHtml}
							<span style="font-size:0.82rem; color:var(--text-ghost); overflow:hidden;
										 text-overflow:ellipsis; white-space:nowrap; flex:1;">
								${a.desc || ''}
							</span>
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
    // 2. 編輯表單
    // =========================================
    renderCreateAchForm: function(achId = null) {
        const gs = window.SQ.State;
        const achs = gs ? (gs.milestones || []) : []; 
        const ach = achId && achId !== 'null' ? achs.find(a => a.id === achId) : null;
        const isEdit = !!ach;

        window.SQ.Temp = window.SQ.Temp || {};
        if (!window.SQ.Temp.editingAch || window.SQ.Temp.editingAch.id !== achId) {
            window.SQ.Temp.editingAch = ach
                ? JSON.parse(JSON.stringify(ach))
                : { id: null, title: '', targetType: 'tag', targetValue: '每日', tier: 'C' };
        }
        const data = window.SQ.Temp.editingAch;

        let bodyHtml = ui.composer.formField({
            label: '目標標題', 
            inputHtml: ui.atom.inputBase({type: 'text', val: data.title, placeholder: "例如: 健身達人", action: "updateAchField", actionId: "title"})
        });

        const typeOpts = [ 
            {value:'tag', label:'🏷️ 任務分類'}, 
            {value:'attr', label:'💪 屬性鍛鍊'}, 
            {value:'focus_time', label:'⏱️ 專注時間'},
            {value:'pomodoro', label:'🍅 番茄農夫'},
            {value:'login_streak', label:'🔥 連續打卡'}
        ];
        
        bodyHtml += `
            <div class="u-box" style="margin-top:10px;">
                ${ui.composer.formField({label: '達成條件', inputHtml: ui.atom.inputBase({type: 'select', val: data.targetType, action: "updateAchField", actionId: "targetType", options: typeOpts})})}
                <div style="margin-top:10px;">
                    ${this._renderTargetValueInput(data)}
                </div>
            </div>`;

        const config = window.SQ.Engine.Ach._getTierConfig(data.tier, data.targetType);
        const unitStr = window.SQ.Engine.Ach._getUnitString(data.targetType);

        const tierArr = ['S', 'A', 'B', 'C']; 
        const tierButtons = tierArr.map(t => {
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
                    <div>🎯 目標：累積完成 <b>${config.target}</b> ${unitStr}</div>
                    <div>🎁 獎勵：💰${config.reward.gold} ✨${config.reward.exp}</div>
                </div>
            </div>`;

        bodyHtml += `
            <div class="u-box" style="margin-top:10px;">
                <label style="display:flex; align-items:center; gap:8px; cursor:pointer; font-size:0.95rem; color:var(--text);">
                    <input type="checkbox" data-change="updateAchField" data-id="isUpgradeable" ${data.isUpgradeable ? 'checked' : ''} style="width:18px; height:18px; accent-color:var(--color-correct);">
                    達成後自動開啟下一階段挑戰
                </label>
            </div>`;

        const footHtml = isEdit 
            ? `${ui.atom.buttonBase({label:'刪除', theme:'danger', action: 'deleteAchievement', actionId: ach.id})} ${ui.atom.buttonBase({label:'儲存', theme:'correct', style:'flex:1;', action: 'submitMilestone'})}`
            : ui.atom.buttonBase({label:'建立目標', theme:'correct', style:'width:100%;', action: 'submitMilestone'});

        ui.modal.render(isEdit ? '編輯目標' : '建立新目標', bodyHtml, footHtml, 'overlay');
    },

    _renderTargetValueInput: function(data) {
        const gs = window.SQ.State;
        if (data.targetType === 'focus_time') {
            return `<div style="color:var(--text-muted); font-size:0.9rem;"><i>將根據你每次「正計時」與「倒數」的分鐘數累積</i></div>`;
        }
        if (data.targetType === 'pomodoro') {
            return `<div style="color:var(--text-muted); font-size:0.9rem;"><i>每完成一次「番茄鐘」循環將累積 1 顆番茄</i></div>`;
        }
        if (data.targetType === 'login_streak') {
            return `<div style="color:var(--text-muted); font-size:0.9rem;"><i>需連續每天登入，若中斷則從 1 開始計算</i></div>`;
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
    // 3. 殿堂頁面
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
                <div class="std-card" style="flex-direction:row; align-items:center; justify-content:space-between;
                     border-left-color:var(--color-gold); margin-bottom:10px;">
                    <div style="font-size:2rem; flex-shrink:0; margin-right:12px; line-height:1;">🏅</div>
                    <div style="flex:1; min-width:0;">
                        <div style="font-weight:bold; font-size:1rem; color:var(--text); margin-bottom:4px;
                                    white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${a.title}</div>
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

// 轉接器
window.SQ.Actions.updateAchField = (f, v) => window.SQ.View.Ach.updateField(f, v);

window.SQ.View.Main.renderMilestonePage = () => window.SQ.View.Ach.renderMilestonePage();