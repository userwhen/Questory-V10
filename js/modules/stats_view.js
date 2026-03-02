/* js/modules/stats_view.js - V43.0 Pure Architecture Upgrade */
window.statsView = {
    // =========================================
    // 1. 主渲染入口
    // =========================================
    render: function() {
        window.TempState.currentView = 'stats';
        const container = document.getElementById('page-stats');
        if (!container) return;

        const gs = window.GlobalState;
        let currentTab = window.TempState.statsTab || 'attr';

        // =========================================================
        // [A] 頂部儀表板 (已縮小高度並優化間距)
        // =========================================================
        let chartContent = '';
        if (currentTab === 'attr') {
            // 高度從 220px 縮小至 170px
            chartContent = `<div style="height:170px; width:100%; position:relative;"><canvas id="radar-canvas"></canvas></div>`;
        } else {
            const maxCal = (gs.settings && gs.settings.calMax) || 2000;
            const currentCal = gs.cal ? gs.cal.today : 0;
            const diff = maxCal - currentCal;
            
            const statusColor = diff >= 0 ? 'var(--color-correct)' : 'var(--color-danger)'; 
            const statusBg = diff >= 0 ? 'var(--color-correct-soft)' : 'var(--color-danger-soft)';
            
            const pct = Math.min(100, Math.max(0, (currentCal / maxCal) * 100));
            const progressHtml = `<div class="u-progress"><div class="u-progress-bar" style="width:${pct}%;"></div><div class="u-progress-text">${currentCal}/${maxCal}</div></div>`;
            const badgeHtml = ui.atom.badgeBase({ text: `${diff>=0?'剩餘額度':'已超標'} ${Math.abs(diff)} kcal`, style: `color:${statusColor}; background:${statusBg}; border-color:${statusColor};` });

            // 緊湊化：高度 170px，數字字體從 3.5rem 降至 2.8rem
            chartContent = `
                <div style="height:170px; display:flex; flex-direction:column; align-items:center; justify-content:center;">
                    <div style="font-size:0.85rem; color:var(--text-muted); font-weight:700;">🔥 今日淨攝取</div>
                    <div style="font-size:2.8rem; font-weight:bold; color:var(--text); font-family:monospace; line-height:1.2; text-shadow:0 2px 4px rgba(0,0,0,0.1);">${currentCal}</div>
                    <div style="width:80%; margin:10px 0;">
                        ${progressHtml}
                    </div>
                    ${badgeHtml}
                </div>`;
        }
        
        // [V43] 捨棄舊版 segment，改用原生 buttonBase 迴圈
        const tabs = [{label:'● 能力分析', val:'attr'}, {label:'● 熱量監控', val:'cal'}];
        const tabsHtml = `
            <div style="margin-top: 5px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.2); display:flex; width:100%;">
                ${tabs.map(opt => {
                    const isActive = currentTab === opt.val;
                    return ui.atom.buttonBase({
                        label: opt.label, theme: isActive ? 'correct' : 'normal',
                        style: `flex:1; margin:2px; ${isActive ? 'box-shadow:inset 0 2px 4px rgba(0,0,0,0.1);' : ''}`,
                        action: `act.switchStatsTab('${opt.val}')`
                    });
                }).join('')}
            </div>
        `;

        const glassDashboard = `
            <div class="glass-dashboard" style="padding: 10px 15px;">
                ${chartContent}
                ${tabsHtml}
            </div>`;

        // =========================================================
        // [B] 捲動內容
        // =========================================================
        let bodyContent = '';

        if (currentTab === 'attr') {
            const attrs = gs.attrs ? Object.values(gs.attrs) : [];
            const attrCardsHtml = attrs.map(a => {
                const pct = Math.min(100, Math.max(0, (a.exp / (a.v*100)) * 100));
                return `
                <div class="u-box" style="padding:12px; display:flex; flex-direction:column; justify-content:center; border:none; box-shadow:var(--shadow-xs); background:var(--bg-card);">
                    <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                        <span style="font-size:1rem; color:var(--text);">${a.icon} <b>${a.name}</b></span>
                        <span style="font-weight:bold; color:var(--color-gold-dark);">Lv.${a.v}</span>
                    </div>
                    <div class="u-progress"><div class="u-progress-bar" style="width:${pct}%;"></div><div class="u-progress-text">${a.exp}/${a.v*100}</div></div>
                </div>`;
            }).join('');
            
            const gridSection = `<div style="display:grid; grid-template-columns:repeat(2, 1fr); gap:10px; width:100%;">${attrCardsHtml}</div>`;

            const skillHead = `
                <div style="display:flex; justify-content:space-between; align-items:center; margin:25px 0 10px 0; padding: 0 5px;">
                    <h3 style="margin:0; font-size:1.1rem; color:var(--text-2);">修煉技能</h3>
                    ${ui.atom.buttonBase({label:'+ 新增', theme:'normal', size:'sm', action:'act.openAddSkill()'})}
                </div>`;
            
            const skillList = (gs.skills && gs.skills.length > 0) ? gs.skills.map(s => {
                const pAttr = (s.parent && gs.attrs[s.parent]) ? gs.attrs[s.parent] : {icon:'❓'};
                const pct = Math.min(100, Math.max(0, (s.exp / (s.lv*10)) * 100));
                const prog = `<div class="u-progress" style="margin-top:6px;"><div class="u-progress-bar" style="width:${pct}%;"></div><div class="u-progress-text">${s.exp}/${s.lv*10}</div></div>`;
                const btnHtml = ui.atom.buttonBase({label:'⚙️', theme:'ghost', action:`event.stopPropagation(); act.editSkill('${s.name}')`, style:'padding:5px; font-size:1.2rem; border:none;'});
                
                // [V43] 取代舊版 card.row
                return `
                <div class="std-card" onclick="act.editSkill('${s.name}')" style="flex-direction:row; justify-content:space-between; border-left-color:var(--color-gold); margin-bottom:10px; cursor:pointer;">
                    <div class="card-icon" style="font-size:2rem; margin-right:12px;">${pAttr.icon}</div>
                    <div class="card-col-center" style="flex:1; min-width:0;">
                        <div style="font-weight:bold; font-size:1rem; color:var(--text); margin-bottom:4px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${s.name}</div>
                        ${prog}
                    </div>
                    <div style="flex-shrink:0; margin-left:10px;" onclick="event.stopPropagation();">${btnHtml}</div>
                </div>`;
            }).join('') : `<div class="ui-empty"><div class="ui-empty-icon">⚔️</div>尚無技能</div>`;

            bodyContent = `<div style="padding:0 15px;">${gridSection}${skillHead}${skillList}</div>`;

        } else {
            const logs = gs.cal?.logs || [];
            const logItems = logs.map(l => {
                const match = l.match(/([+-]?\d+)$/);
                const val = match ? parseInt(match[1]) : 0;
                const txt = l.replace(/([+-]?\d+)$/, '').trim();
                
                const color = val <= 0 ? 'var(--color-correct)' : 'var(--color-danger)'; 
                const sign = val > 0 ? '+' : '';

                return `
                <div style="display:flex; justify-content:space-between; padding:12px 0; border-bottom:1px dashed var(--border); font-family:monospace;">
                    <span style="font-family:inherit; color:var(--text-2); font-size:0.95rem;">${txt}</span>
                    <span style="font-weight:bold; color:${color}; font-size:1.1rem;">${sign}${val}</span>
                </div>`;
            }).join('');

            bodyContent = `
                <div style="padding:0 15px;">
                    <div class="u-box" style="background:var(--bg-card); padding:20px; box-shadow:var(--shadow-sm); position:relative; min-height:300px; border:none;">
                        <h3 style="text-align:center; color:var(--text-muted); margin-bottom:20px; border-bottom:2px solid var(--border); display:inline-block; padding-bottom:5px;">Daily Logs</h3>
                        ${logs.length > 0 ? logItems : `<div class="ui-empty"><div class="ui-empty-icon">🍽️</div>尚無紀錄</div>`}
                        <div style="margin-top:20px; text-align:center; color:var(--text-ghost); font-size:0.8rem;">--- 每日 00:00 自動重置 ---</div>
                    </div>
                </div>`;
        }
        
        const isBasicMode = (gs.settings && gs.settings.mode === 'basic');
        
        // [V43] 捨棄 ui.layout.page，改用純 Flex 佈局
        container.innerHTML = `
            <div style="display:flex; flex-direction:column; height:100%; overflow:hidden; background:var(--bg-panel);">
                ${ui.composer.pageHeader({
                    title: '📊 狀態分析',
                    backAction: isBasicMode ? '' : "act.navigate('main')",
                    style: 'background:transparent; border:none;'
                })}
                <div style="flex-shrink:0;">${glassDashboard}</div>
                <div style="flex:1; overflow-y:auto; overflow-x:hidden; position:relative; z-index:10; padding-bottom: 20px;">
                    ${bodyContent}
                </div>
            </div>
        `;

        if (currentTab === 'attr') {
            setTimeout(() => this.drawRadarChart(gs.attrs || {}), 100);
        }
    },

    renderSkillModal: function(skillName = null) {
        const gs = window.GlobalState;
        const skill = skillName ? gs.skills.find(s => s.name === skillName) : null;
        const isEdit = !!skill;

        window.TempState = window.TempState || {};
        window.TempState.editingSkill = {
            editId: isEdit ? skill.name : null,
            name: isEdit ? skill.name : '',
            parent: isEdit ? skill.parent : 'STR'
        };

        const attrOpts = Object.keys(gs.attrs).map(k => ({
            value: k, 
            label: `${gs.attrs[k].icon} ${gs.attrs[k].name}`
        }));

        // [V43] 改用 composer.formField + atom.inputBase
        const bodyHtml = `
            ${ui.composer.formField({
                label: '技能名稱', 
                inputHtml: ui.atom.inputBase({type:'text', val: window.TempState.editingSkill.name, placeholder: "例如: 跑酷...", onChange: "window.TempState.editingSkill.name = this.value"})
            })}
            ${ui.composer.formField({
                label: '綁定主屬性', 
                inputHtml: ui.atom.inputBase({type:'select', val: window.TempState.editingSkill.parent, onChange: "window.TempState.editingSkill.parent = this.value", options: attrOpts}), 
                hint: '技能經驗將同時回饋給此屬性'
            })}
            ${isEdit ? `
            <div style="margin-top:15px; padding:12px; background:var(--color-gold-soft); border-radius:var(--radius-sm); font-size:0.85rem; color:var(--color-gold-dark); box-shadow:var(--shadow-inner);">
                🔥 目前等級: Lv.${skill.lv} <br> 累積經驗: ${skill.exp}
            </div>` : ''}
        `;

        const footHtml = isEdit 
            ? `${ui.atom.buttonBase({label:'刪除', theme:'danger', action:`act.deleteSkill('${skill.name}')`})} 
               ${ui.atom.buttonBase({label:'儲存變更', theme:'correct', style:'flex:1;', action:'act.saveSkill()'})}`
            : ui.atom.buttonBase({label:'確認新增', theme:'correct', style:'width:100%;', action:'act.saveSkill()'});

        ui.modal.render(isEdit ? '編輯技能' : '新增技能', bodyHtml, footHtml, 'overlay');
    },

    drawRadarChart: function(attrs) {
        const canvas = document.getElementById('radar-canvas');
        if (!canvas || !window.Chart) return;
        if (window.myStatsChart) window.myStatsChart.destroy();
        
        const order = ['STR', 'INT', 'AGI', 'CHR', 'VIT', 'LUK'];
        const labels = [];
        const dataValues = [];

        order.forEach(key => {
            if (attrs[key]) {
                labels.push(attrs[key].name);
                dataValues.push(attrs[key].v);
            }
        });

        const bodyStyle = getComputedStyle(document.body);
        const goldHex = bodyStyle.getPropertyValue('--color-gold').trim() || '#f5a623';
        const textMutedHex = bodyStyle.getPropertyValue('--text-muted').trim() || '#8c6e52';
        
        const hexToRgba = (hex, alpha) => {
            const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
            return `rgba(${r}, ${g}, ${b}, ${alpha})`;
        };

        window.myStatsChart = new Chart(canvas, {
            type: 'radar',
            data: {
                labels: labels,
                datasets: [{
                    label: '能力值',
                    data: dataValues,
                    backgroundColor: hexToRgba(goldHex, 0.4), 
                    borderColor: goldHex,                    
                    borderWidth: 2,
                    pointBackgroundColor: '#fff', 
                    pointBorderColor: goldHex
                }]
            },
            options: {
                maintainAspectRatio: false,
                scales: {
                    r: { 
                        beginAtZero: true, 
                        suggestedMax: Math.max(...dataValues) + 2,
                        ticks: { display: false }, 
                        pointLabels: { font: { size: 12, weight: 'bold' }, color: textMutedHex }, 
                        grid: { color: 'rgba(0,0,0,0.06)' }, 
                        angleLines: { color: 'rgba(0,0,0,0.06)' } 
                    }
                },
                plugins: { legend: { display: false } }
            }
        });
    }
};

window.view = window.view || {};
window.view.renderStats = () => window.statsView.render();
window.view.renderSkillModal = (n) => window.statsView.renderSkillModal(n);