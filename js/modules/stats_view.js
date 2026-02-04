/* js/modules/stats_view.js - V43.0 Visuals Fixed */
window.statsView = {
    // =========================================
    // 1. 主渲染入口
    // =========================================
    render: function() {
        window.TempState.currentView = 'stats';
        const container = document.getElementById('page-stats');
        if (!container) return;

        const gs = window.GlobalState;
        const currentTab = window.TempState.statsTab || 'attr'; // attr | cal

        // =========================================================
        // [A] 頂部儀表板
        // =========================================================
        let chartContent = '';
        if (currentTab === 'attr') {
            chartContent = `<div style="height:220px; width:100%; position:relative;"><canvas id="radar-canvas"></canvas></div>`;
        } else {
            const maxCal = (gs.settings && gs.settings.calMax) || 2000;
            const currentCal = gs.cal ? gs.cal.today : 0;
            // 計算剩餘/超標
            // currentCal 若為負數 (例如 -300)，代表還有 2300 的額度
            const diff = maxCal - currentCal;
            const statusColor = diff >= 0 ? '#2e7d32' : '#d32f2f'; // 綠/紅
            
            chartContent = `
                <div style="height:220px; display:flex; flex-direction:column; align-items:center; justify-content:center;">
                    <div style="font-size:0.9rem; color:#666;">🔥 今日淨攝取</div>
                    <div style="font-size:3.5rem; font-weight:bold; color:#3e2723; font-family:monospace; line-height:1.2;">${currentCal}</div>
                    <div style="width:80%; margin:15px 0;">
                        ${ui.progress.bar(Math.max(0, currentCal), maxCal, `${currentCal}/${maxCal}`, '', 'height:8px; border-radius:4px;')}
                    </div>
                    <div class="u-pill" style="border:1px solid ${statusColor}; color:${statusColor}; background:rgba(255,255,255,0.5);">
                        ${diff>=0?'剩餘額度':'已超標'} ${diff} kcal
                    </div>
                </div>`;
        }

        const tabsHtml = `
            <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.5); display:flex; width:100%;">
                ${ui.component.segment([
                    {label:'● 能力分析', val:'attr'}, {label:'● 熱量監控', val:'cal'}
                ], currentTab, "act.switchStatsTab")}
            </div>
        `;

        const glassDashboard = `
            <div style="background: rgba(255, 255, 255, 0.2); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
                border-radius: 20px; margin: 0 15px 10px 15px; padding: 15px;
                box-shadow: 0 4px 15px rgba(0,0,0,0.08); border: 1px solid rgba(255,255,255,0.4);">
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
                <div class="u-box" style="padding:10px; display:flex; flex-direction:column; justify-content:center;">
                    <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                        <span style="font-size:1rem;">${a.icon} <b>${a.name}</b></span>
                        <span style="font-weight:bold; color:var(--color-primary);">Lv.${a.v}</span>
                    </div>
                    ${ui.progress.bar(a.exp, a.v*100, `${a.exp}/${a.v*100}`, 'height:10px;')}
                </div>
            `).join('');
            
            const gridSection = ui.layout.grid(attrCardsHtml, 2, '10px');

            // --- 2. 技能列表 (修復 ICON 顯示) ---
            const skillHead = `
                <div style="display:flex; justify-content:space-between; align-items:center; margin:25px 0 10px 0; padding: 0 5px;">
                    <h3 style="margin:0; font-size:1.1rem; color:#5d4037;">修煉技能</h3>
                    ${ui.component.btn({label:'+ 新增', theme:'normal', size:'sm', action:'act.openAddSkill()'})}
                </div>`;

            const skillList = (gs.skills && gs.skills.length > 0) ? gs.skills.map(s => {
                // [修復] 根據 parent 查找正確的 ICON
                const pAttr = (s.parent && gs.attrs[s.parent]) ? gs.attrs[s.parent] : {icon:'❓'};
                
                return ui.card.row({
                    iconHtml: pAttr.icon, // 使用父屬性 ICON
                    title: s.name,
                    subTitle: ui.progress.bar(s.exp, s.lv*10, `${s.exp}/${s.lv*10}`, 'height:10px; margin-top:3px;'),
                    rightHtml: ui.component.btn({label:'⚙️', theme:'ghost', action:`act.editSkill('${s.name}')`, style:'padding:5px; font-size:1.2rem;'}),
                    themeColor: '#8d6e63',
                    onClick: `act.editSkill('${s.name}')`
                });
            }).join('') : `<div style="text-align:center; padding:20px; color:#aaa;">尚無技能</div>`;

            bodyContent = `<div style="padding:0 15px;">${gridSection}${skillHead}${skillList}</div>`;

        } else {
            // --- 熱量帳本 (修復負值顯示) ---
            const logs = gs.cal?.logs || [];
            const logItems = logs.map(l => {
                // [修復] 解析包含負號的數值 (例如: "-75")
                const match = l.match(/([+-]?\d+)$/);
                const val = match ? parseInt(match[1]) : 0;
                // 去除數值部分，保留文字
                const txt = l.replace(/([+-]?\d+)$/, '').trim();
                
                // 判斷顏色: 負數(燃燒)為綠，正數(攝取)為紅
                const color = val <= 0 ? '#2e7d32' : '#d32f2f'; 
                const sign = val > 0 ? '+' : '';

                return `
                <div style="display:flex; justify-content:space-between; padding:12px 0; border-bottom:1px dashed #ccc; font-family:monospace;">
                    <span style="font-family:sans-serif; color:#444;">${txt}</span>
                    <span style="font-weight:bold; color:${color}; font-size:1.1rem;">${sign}${val}</span>
                </div>`;
            }).join('');

            bodyContent = `
                <div style="padding:0 15px;">
                    <div style="background:rgba(255, 255, 255, 0.4); padding:20px; box-shadow:0 2px 10px rgba(0,0,0,0.05); position:relative; min-height:300px;">
                        <h3 style="text-align:center; color:#8d6e63; margin-bottom:20px; border-bottom:2px solid #8d6e63; display:inline-block; padding-bottom:5px;">Daily Logs</h3>
                        ${logs.length > 0 ? logItems : '<div style="text-align:center; color:#ccc; padding:20px;">尚無紀錄</div>'}
                        
                        <div style="margin-top:20px; text-align:center; color:#999; font-size:0.8rem;">--- 每日 00:00 自動重置 ---</div>
                    </div>
                </div>`;
        }

        container.innerHTML = ui.layout.page({
            title: '📊 狀態分析',
            back: true,
            fixedTop: glassDashboard,
            body: bodyContent
        });

        // [C] 繪製雷達圖 (修復數值來源)
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

        const bodyHtml = `
            <div class="input-group">
                <label class="section-title">技能名稱</label>
                ${ui.input.text(window.TempState.editingSkill.name, "例如: 跑酷...", "window.TempState.editingSkill.name = this.value")}
            </div>
            <div class="u-box" style="margin-top:10px;">
                <label class="section-title">綁定主屬性</label>
                <div style="font-size:0.8rem; color:#666; margin-bottom:5px;">技能經驗將同時回饋給此屬性</div>
                ${ui.input.select(attrOpts, window.TempState.editingSkill.parent, "window.TempState.editingSkill.parent = this.value")}
            </div>
            ${isEdit ? `
            <div style="margin-top:15px; padding:10px; background:#fff3e0; border-radius:8px; font-size:0.85rem; color:#e65100;">
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
    // 3. 繪圖 (修復數值讀取)
    // =========================================
    drawRadarChart: function(attrs) {
        const canvas = document.getElementById('radar-canvas');
        if (!canvas || !window.Chart) return;
        if (window.myStatsChart) window.myStatsChart.destroy();
        
        // [修復] 確保屬性順序一致 (STR, INT, AGI...)
        const order = ['STR', 'INT', 'AGI', 'CHR', 'VIT', 'LUK'];
        const labels = [];
        const dataValues = [];

        order.forEach(key => {
            if (attrs[key]) {
                labels.push(attrs[key].name);
                dataValues.push(attrs[key].v); // 取 Level 數值
            }
        });

        window.myStatsChart = new Chart(canvas, {
            type: 'radar',
            data: {
                labels: labels,
                datasets: [{
                    label: '能力值',
                    data: dataValues,
                    backgroundColor: 'rgba(255, 179, 0, 0.4)', 
                    borderColor: '#ffb300', 
                    borderWidth: 2,
                    pointBackgroundColor: '#fff', 
                    pointBorderColor: '#ffb300'
                }]
            },
            options: {
                maintainAspectRatio: false,
                scales: {
                    r: { 
                        beginAtZero: true, 
                        // 建議設定 max 以讓圖表好看 (例如 max = 當前最高等級 + 5)
                        suggestedMax: Math.max(...dataValues) + 2,
                        ticks: { display: false }, 
                        pointLabels: { font: { size: 12, weight: 'bold' }, color: '#5d4037' }, 
                        grid: { color: 'rgba(0,0,0,0.05)' }, 
                        angleLines: { color: 'rgba(0,0,0,0.05)' } 
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