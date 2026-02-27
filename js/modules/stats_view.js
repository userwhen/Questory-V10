/* js/modules/stats_view.js - V42.0 UI System Upgrade */
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
        // [A] 頂部儀表板
        // =========================================================
        let chartContent = '';
        if (currentTab === 'attr') {
            chartContent = `<div style="height:220px; width:100%; position:relative;"><canvas id="radar-canvas"></canvas></div>`;
        } else {
            const maxCal = (gs.settings && gs.settings.calMax) || 2000;
            const currentCal = gs.cal ? gs.cal.today : 0;
            const diff = maxCal - currentCal;
            
            // 使用變數字串供 badge 使用
            const statusColor = diff >= 0 ? '--color-correct' : '--color-danger'; 
            const statusBg = diff >= 0 ? '--color-correct-soft' : '--color-danger-soft';
            
            chartContent = `
                <div style="height:220px; display:flex; flex-direction:column; align-items:center; justify-content:center;">
                    <div style="font-size:0.9rem; color:var(--text-muted); font-weight:700;">🔥 今日淨攝取</div>
                    <div style="font-size:3.5rem; font-weight:bold; color:var(--text); font-family:monospace; line-height:1.2; text-shadow:0 2px 4px rgba(0,0,0,0.1);">${currentCal}</div>
                    <div style="width:80%; margin:15px 0;">
                        ${ui.progress.bar(Math.max(0, currentCal), maxCal, `${currentCal}/${maxCal}`)}
                    </div>
                    ${ui.component.badge(`${diff>=0?'剩餘額度':'已超標'} ${Math.abs(diff)} kcal`, statusColor, statusBg)}
                </div>`;
        }
        
        const tabsHtml = `
            <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.2); display:flex; width:100%;">
                ${ui.component.segment([
                    {label:'● 能力分析', val:'attr'}, {label:'● 熱量監控', val:'cal'}
                ], currentTab, "act.switchStatsTab")}
            </div>
        `;

        // [優化] 直接套用 CSS 的 glass-dashboard 類別
        const glassDashboard = `
            <div class="glass-dashboard">
                ${chartContent}
                ${tabsHtml}
            </div>`;

        // =========================================================
        // [B] 捲動內容
        // =========================================================
        let bodyContent = '';

        if (currentTab === 'attr') {
            // --- 1. 屬性網格 ---
            const attrs = gs.attrs ? Object.values(gs.attrs) : [];
            const attrCardsHtml = attrs.map(a => `
                <div class="u-box" style="padding:12px; display:flex; flex-direction:column; justify-content:center; border:none; box-shadow:var(--shadow-xs); background:var(--bg-card);">
                    <div style="display:flex; justify-content:space-between; margin-bottom:8px;">
                        <span style="font-size:1rem; color:var(--text);">${a.icon} <b>${a.name}</b></span>
                        <span style="font-weight:bold; color:var(--color-gold-dark);">Lv.${a.v}</span>
                    </div>
                    ${ui.progress.bar(a.exp, a.v*100, `${a.exp}/${a.v*100}`)}
                </div>
            `).join('');
            
            const gridSection = ui.layout.grid(attrCardsHtml, 2, '10px');

            // --- 2. 技能列表 ---
            const skillHead = `
                <div style="display:flex; justify-content:space-between; align-items:center; margin:25px 0 10px 0; padding: 0 5px;">
                    <h3 style="margin:0; font-size:1.1rem; color:var(--text-2);">修煉技能</h3>
                    ${ui.component.btn({label:'+ 新增', theme:'normal', size:'sm', action:'act.openAddSkill()'})}
                </div>`;
            
            const skillList = (gs.skills && gs.skills.length > 0) ? gs.skills.map(s => {
                const pAttr = (s.parent && gs.attrs[s.parent]) ? gs.attrs[s.parent] : {icon:'❓'};
                return ui.card.row({
                    iconHtml: pAttr.icon,
                    title: s.name,
                    subTitle: ui.progress.bar(s.exp, s.lv*10, `${s.exp}/${s.lv*10}`, 'margin-top:6px;'),
                    rightHtml: ui.component.btn({label:'⚙️', theme:'ghost', action:`event.stopPropagation(); act.editSkill('${s.name}')`, style:'padding:5px; font-size:1.2rem; border:none;'}),
                    themeColor: 'var(--color-gold)',
                    onClick: `act.editSkill('${s.name}')`
                });
            }).join('') : ui.layout.empty('尚無技能', '⚔️');

            bodyContent = `<div style="padding:0 15px;">${gridSection}${skillHead}${skillList}</div>`;

        } else {
            // --- 熱量帳本 ---
            const logs = gs.cal?.logs || [];
            const logItems = logs.map(l => {
                const match = l.match(/([+-]?\d+)$/);
                const val = match ? parseInt(match[1]) : 0;
                const txt = l.replace(/([+-]?\d+)$/, '').trim();
                
                // 使用變數做判斷
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
                        ${logs.length > 0 ? logItems : ui.layout.empty('尚無紀錄', '🍽️')}
                        <div style="margin-top:20px; text-align:center; color:var(--text-ghost); font-size:0.8rem;">--- 每日 00:00 自動重置 ---</div>
                    </div>
                </div>`;
        }
        
        const isBasicMode = (gs.settings && gs.settings.mode === 'basic');
        container.innerHTML = ui.layout.page({
            title: '📊 狀態分析',
            back: !isBasicMode, 
            fixedTop: glassDashboard,
            body: bodyContent
        });

        // [C] 繪製雷達圖
        if (currentTab === 'attr') {
            setTimeout(() => this.drawRadarChart(gs.attrs || {}), 100);
        }
    },

    // =========================================
    // 2. 編輯視窗
    // =========================================
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

        // [優化] 使用 ui.input.field
        const bodyHtml = `
            ${ui.input.field('技能名稱', ui.input.text(window.TempState.editingSkill.name, "例如: 跑酷...", "window.TempState.editingSkill.name = this.value"))}
            ${ui.input.field('綁定主屬性', ui.input.select(attrOpts, window.TempState.editingSkill.parent, "window.TempState.editingSkill.parent = this.value"), '技能經驗將同時回饋給此屬性')}
            ${isEdit ? `
            <div style="margin-top:15px; padding:12px; background:var(--color-gold-soft); border-radius:var(--radius-sm); font-size:0.85rem; color:var(--color-gold-dark); box-shadow:var(--shadow-inner);">
                🔥 目前等級: Lv.${skill.lv} <br> 累積經驗: ${skill.exp}
            </div>` : ''}
        `;

        const footHtml = isEdit 
            ? `${ui.component.btn({label:'刪除', theme:'danger', action:`act.deleteSkill('${skill.name}')`})} 
               ${ui.component.btn({label:'儲存變更', theme:'correct', style:'flex:1;', action:'act.saveSkill()'})}`
            : ui.component.btn({label:'確認新增', theme:'correct', style:'width:100%;', action:'act.saveSkill()'});

        ui.modal.render(isEdit ? '編輯技能' : '新增技能', bodyHtml, footHtml, 'overlay');
    },

    // =========================================
    // 3. 繪圖
    // =========================================
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

        window.myStatsChart = new Chart(canvas, {
            type: 'radar',
            data: {
                labels: labels,
                datasets: [{
                    label: '能力值',
                    data: dataValues,
                    backgroundColor: 'rgba(245, 166, 35, 0.4)', // 對應新版 var(--color-gold) 的 rgba
                    borderColor: '#f5a623',                     // 對應新版 var(--color-gold)
                    borderWidth: 2,
                    pointBackgroundColor: '#fff', 
                    pointBorderColor: '#f5a623'
                }]
            },
            options: {
                maintainAspectRatio: false,
                scales: {
                    r: { 
                        beginAtZero: true, 
                        suggestedMax: Math.max(...dataValues) + 2,
                        ticks: { display: false }, 
                        pointLabels: { font: { size: 12, weight: 'bold' }, color: '#8c6e52' }, // 對應 var(--text-muted)
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