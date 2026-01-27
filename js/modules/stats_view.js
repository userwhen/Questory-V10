/* js/modules/stats_view.js - V35.1 (Grid Attrs & Ledger Style) */

window.statsView = {
    // 1. 主渲染入口
    render: function() {
        window.TempState.currentView = 'stats';
        const container = document.getElementById('page-stats');
        if (!container) return;

        const gs = window.GlobalState;
        const currentTab = window.TempState.statsTab || 'attr'; // attr | cal

        // =========================================================
        // [A] 準備固定頂部內容 (Fixed Top) - 一體化儀表板
        // =========================================================
        
        // 1. 圖表區內容
        let chartContent = '';
        if (currentTab === 'attr') {
            chartContent = `<div style="height:220px; width:100%; position:relative;"><canvas id="radar-canvas"></canvas></div>`;
        } else {
            const maxCal = (gs.settings && gs.settings.calMax) || 2000;
            const currentCal = gs.cal ? gs.cal.today : 0;
            const diff = maxCal - currentCal;
            const statusColor = diff >= 0 ? '#2e7d32' : '#d32f2f';
            // 熱量大數字
            chartContent = `
                <div style="height:220px; display:flex; flex-direction:column; align-items:center; justify-content:center;">
                    <div style="font-size:0.9rem; color:#666;">🔥 今日攝取總結</div>
                    <div style="font-size:3.5rem; font-weight:bold; color:#3e2723; font-family:monospace; line-height:1.2;">${currentCal}</div>
                    <div style="width:80%; margin:15px 0;">${ui.progress.bar(currentCal, maxCal, `${currentCal}/${maxCal}`, '', 'height:8px; border-radius:4px;')}</div>
                    <div class="u-pill" style="border:1px solid ${statusColor}; color:${statusColor}; background:rgba(255,255,255,0.5);">
                        ${diff>=0?'還有額度':'已超標'} ${Math.abs(diff)} kcal
                    </div>
                </div>`;
        }

        // 2. 分頁按鈕 (Segment) - 現在與圖表區同寬
        // 為了讓按鈕填滿，我們在 segment 外層包一個 flex 容器
        const tabsHtml = `
            <div style="margin-top: 10px; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.5); display:flex; width:100%;">
                ${ui.component.segment([
                    {label:'● 能力分析', val:'attr'}, {label:'● 熱量監控', val:'cal'}
                ], currentTab, "act.switchStatsTab")}
            </div>
        `;

        // 3. 組合毛玻璃容器 (圖表 + 分頁)
        const glassDashboard = `
            <div style="background: rgba(255, 255, 255, 0.2); backdrop-filter: blur(10px); -webkit-backdrop-filter: blur(10px);
                border-radius: 20px; margin: 0 15px 10px 15px; padding: 15px;
                box-shadow: 0 4px 15px rgba(0,0,0,0.08); border: 1px solid rgba(255,255,255,0.4);">
                ${chartContent}
                ${tabsHtml}
            </div>`;

        // =========================================================
        // [B] 準備捲動內容 (Scrollable Body)
        // =========================================================
        let bodyContent = '';

        if (currentTab === 'attr') {
            // --- 1. 屬性網格 (Grid Layout) ---
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
            
            // 使用 ui.layout.grid 進行 2 欄排版
            const gridSection = ui.layout.grid(attrCardsHtml, 2, '10px');

            // --- 2. 技能標題 ---
            const skillHead = `
                <div style="display:flex; justify-content:space-between; align-items:center; margin:25px 0 10px 0; padding: 0 5px;">
                    <h3 style="margin:0; font-size:1.1rem; color:#5d4037;">修煉技能</h3>
                    ${ui.component.btn({label:'+ 新增', theme:'normal', size:'sm', action:'act.openAddSkill()'})}
                </div>`;

            // --- 3. 技能列表 (Smart Cards) ---
            const skillList = (gs.skills && gs.skills.length > 0) ? gs.skills.map(s => {
                const pAttr = gs.attrs[s.parent] || {icon:'❓'};
                return ui.card.row({
                    iconHtml: pAttr.icon,
                    title: s.name,
                    subTitle: ui.progress.bar(s.exp, s.lv*10, `${s.exp}/${s.lv*10}`, 'height:10px; margin-top:3px;'),
                    rightHtml: ui.component.btn({label:'⚙️', theme:'ghost', action:`act.editSkill('${s.name}')`, style:'padding:5px; font-size:1.2rem;'}),
                    themeColor: '#8d6e63',
                    onClick: `act.editSkill('${s.name}')`
                });
            }).join('') : `<div style="text-align:center; padding:20px; color:#aaa;">尚無技能</div>`;

            bodyContent = `<div style="padding:0 15px;">${gridSection}${skillHead}${skillList}</div>`;

        } else {
            // --- 熱量帳本 (Ledger Style) ---
            const logs = gs.cal?.logs || [];
            let totalCal = 0;
            
            const logItems = logs.map(l => {
                const match = l.match(/([+-]?\d+)$/);
                const val = match ? parseInt(match[1]) : 0;
                const txt = l.replace(/([+-]?\d+)$/, '');
                totalCal += val; // 計算總和
                const color = val >= 0 ? '#d32f2f' : '#2e7d32'; // 紅正 綠負
                
                return `
                <div style="display:flex; justify-content:space-between; padding:12px 0; border-bottom:1px dashed #ccc; font-family:monospace;">
                    <span style="font-family:sans-serif; color:#444;">${txt}</span>
                    <span style="font-weight:bold; color:${color}; font-size:1.1rem;">${val>0?'+':''}${val}</span>
                </div>`;
            }).join('');

            // 帳本總結區
            const ledgerSummary = `
                <div style="margin-top:20px; border-top:3px double #aaa; padding-top:15px; display:flex; justify-content:space-between; align-items:center;">
                    <span style="font-weight:bold; color:#666;">今日小計</span>
                    <span style="font-size:1.5rem; font-weight:bold; color:#3e2723; font-family:monospace;">${totalCal}</span>
                </div>
                <div style="text-align:center; margin-top:30px; color:#999; font-size:0.8rem;">--- 每日 00:00 自動重置 ---</div>
            `;

            // 紙張風格容器
            bodyContent = `
                <div style="padding:0 15px;">
                    <div style="background:rgba(255, 255, 255, 0.4); padding:20px; box-shadow:0 2px 10px rgba(0,0,0,0.05); position:relative; min-height:300px;">
                        
                        <h3 style="text-align:center; color:#8d6e63; margin-bottom:20px; border-bottom:2px solid #8d6e63; display:inline-block; padding-bottom:5px;">Daily Logs</h3>
                        
                        ${logs.length > 0 ? logItems : '<div style="text-align:center; color:#ccc; padding:20px;">尚無紀錄</div>'}
                        ${ledgerSummary}
                    </div>
                </div>`;
        }

        // =========================================================
        // [C] 召喚全域模板
        // =========================================================
        container.innerHTML = ui.layout.page({
            title: '📊 狀態分析',
            back: true,
            fixedTop: glassDashboard, // 圖表+按鈕 現在是一體的
            body: bodyContent
        });

        // [D] 繪圖
        if (currentTab === 'attr') {
            setTimeout(() => this.drawRadarChart(gs.attrs || {}), 100);
        }
    },

    // 2. 渲染技能彈窗 (更新 Footer)
    renderSkillModal: function(skill) {
        const isEdit = !!skill;
        window.TempState.editSkillId = isEdit ? skill.name : null;
        const attrs = window.GlobalState.attrs || {};
        
        const body = `
            <div style="margin-bottom:15px;">
                <label style="font-weight:bold;">技能名稱</label>
                ${ui.input.text(isEdit?skill.name:'', '例如：伏地挺身', '', 'skill-name-input')}
            </div>
            <div style="margin-bottom:15px;">
                <label style="font-weight:bold;">關聯屬性</label>
                <select id="skill-attr-select" style="width:100%; padding:10px; border-radius:8px; border:1px solid #ccc;">
                    ${Object.keys(attrs).map(k => `<option value="${k}" ${isEdit && skill.parent===k?'selected':''}>${attrs[k].icon} ${attrs[k].name}</option>`).join('')}
                </select>
            </div>`;
        
        let foot = '';
        if (isEdit) {
            // [V35] 編輯模式：顯示刪除與確定 (Space Between)
            // 左邊：危險按鈕 (刪除)
            const btnDel = ui.component.btn({ label:'🗑️ 刪除', theme:'danger', action:`act.deleteSkill('${skill.name}')` });
            // 右邊：正向按鈕 (保存)
            const btnSave = ui.component.btn({ label:'確定', theme:'correct', action:'act.submitNewSkill()' });
            
            foot = `<div style="display:flex; justify-content:space-between; width:100%;">${btnDel}${btnSave}</div>`;
        } else {
            // 新增模式：只有一個長按鈕
            foot = ui.component.btn({ label:'新增技能', theme:'correct', style:'width:100%;', action:'act.submitNewSkill()' });
        }

        ui.modal.render(isEdit?'編輯技能':'新增技能', body, foot, 'overlay');
    },

    // 3. 繪圖 (保持不變)
    drawRadarChart: function(attrs) {
        const canvas = document.getElementById('radar-canvas');
        if (!canvas || !window.Chart) return;
        if (window.myStatsChart) window.myStatsChart.destroy();
        
        window.myStatsChart = new Chart(canvas, {
            type: 'radar',
            data: {
                labels: Object.values(attrs).map(a => a.name),
                datasets: [{
                    data: Object.values(attrs).map(a => a.v),
                    backgroundColor: 'rgba(255, 179, 0, 0.4)', borderColor: '#ffb300', borderWidth: 2,
                    pointBackgroundColor: '#fff', pointBorderColor: '#ffb300'
                }]
            },
            options: {
                maintainAspectRatio: false,
                scales: {
                    r: { beginAtZero: true, ticks: { display: false }, pointLabels: { font: { size: 12, weight: 'bold' }, color: '#5d4037' }, grid: { color: 'rgba(0,0,0,0.05)' }, angleLines: { color: 'rgba(0,0,0,0.05)' } }
                },
                plugins: { legend: { display: false } }
            }
        });
    }
};