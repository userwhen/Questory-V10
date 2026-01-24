/* js/modules/stats_view.js - Stats View (V33.7 Enhanced with V19 Calorie UI) */
window.statsView = {
    // 1. 主渲染入口
    render: function() {
        window.TempState.currentView = 'stats';
        const container = document.getElementById('page-stats');
        if (!container) return;

        const gs = window.GlobalState;
        const currentTab = window.TempState.statsTab || 'attr'; // attr | cal
        const showCalMode = gs.settings && gs.settings.calMode; // 檢查設定

        // =========================================================
        // A. 頂部圖表區 (移植 V19 Dashboard)
        // =========================================================
        let chartContent = '';
        
        if (currentTab === 'attr') {
            chartContent = '<canvas id="radar-canvas"></canvas>';
        } else {
            // [V19 移植] 熱量儀表板邏輯
            const maxCal = (gs.settings && gs.settings.calMax) || 2000;
            const currentCal = gs.cal ? gs.cal.today : 0;
            const diff = maxCal - currentCal;
            // 邏輯：剩餘量 >= 0 為綠色(安全)，超標(負數) 為紅色(警告)
            const statusText = diff >= 0 ? `還能攝取 ${diff}` : `⚠️ 超標 ${Math.abs(diff)}`;
            const statusColor = diff >= 0 ? '#2e7d32' : '#d32f2f';
            const progressPct = Math.min(100, (currentCal / maxCal) * 100);

            chartContent = `
                <div class="cal-dashboard-display" style="text-align:center; padding:30px 20px;">
                    <div style="font-size:1rem; color:#8d6e63; margin-bottom:10px;">🔥 今日攝取總量</div>
                    <div class="cal-hero-num" style="font-size:3rem; font-weight:bold; color:#3e2723; line-height:1;">
                        ${currentCal} <span style="font-size:1.2rem; color:#888; font-weight:normal;">kcal</span>
                    </div>
                    <div style="margin-top:15px;">
                         ${ui.progress.bar(currentCal, maxCal, '', 'height:8px; border-radius:4px;')}
                    </div>
                    <div class="cal-sub-info" style="margin-top:15px; display:inline-block; padding:5px 15px; border-radius:20px; font-weight:bold; color:${statusColor}; border:1px solid ${statusColor}; background:rgba(255,255,255,0.9);">
                        目標 ${maxCal} / ${statusText}
                    </div>
                </div>
            `;
        }

        const chartArea = `
            <div style="min-height:250px; position:relative; background:#fff; margin-bottom:10px; border-radius:0 0 20px 20px; box-shadow:0 4px 10px rgba(0,0,0,0.05); overflow:hidden;">
                ${chartContent}
            </div>
        `;

        // =========================================================
        // B. 分頁切換
        // =========================================================
        const tabs = ui.container.bar(
            ui.component.segment([
                {label:'● 能力分析', val:'attr'}, {label:'● 熱量監控', val:'cal'}
            ], currentTab, "act.switchStatsTab"), 
            'margin:0 15px 15px 15px;'
        );

        // =========================================================
        // C. 列表內容區
        // =========================================================
        let contentHtml = '';
        
        if (currentTab === 'attr') {
            // --- 1. 屬性列表 (保持 V34 原樣) ---
            const attrList = (gs.attrs ? Object.values(gs.attrs) : []).map(a => `
                <div class="u-box" style="margin-bottom:8px; padding:10px;">
                    <div style="display:flex; justify-content:space-between; margin-bottom:6px;">
                        <b style="font-size:1rem;">${a.icon} ${a.name}</b> 
                        <span style="color:var(--color-primary); font-weight:bold;">Lv.${a.v}</span>
                    </div>
                    ${ui.progress.bar(a.exp, a.v * 100)}
                </div>
            `).join('');

            // --- 2. 技能列表 (保持 V34 原樣) ---
            const skillHeader = `
                <div style="display:flex; justify-content:space-between; align-items:center; margin:20px 0 10px 0;">
                    <h3 style="margin:0;">修煉技能</h3>
                    ${ui.component.btn({label:'+ 新增', theme:'ghost', size:'sm', action:'act.openAddSkill()'})}
                </div>
            `;
            
            const skillList = (gs.skills && gs.skills.length > 0) ? gs.skills.map(s => `
                <div class="u-box" style="margin-bottom:8px; display:flex; align-items:center; gap:10px;">
                    <div style="flex:1;">
                        <div style="font-weight:bold;">${s.name} <span style="font-size:0.8rem; color:#888;">(${s.parent})</span></div>
                        <div style="display:flex; justify-content:space-between; font-size:0.8rem; margin-top:4px;">
                            <span>Lv.${s.lv}</span>
                            <span>${s.exp}/${s.lv*10}</span>
                        </div>
                        ${ui.progress.bar(s.exp, s.lv * 10, '', 'height:4px; margin-top:4px;')}
                    </div>
                    <button class="u-btn u-btn-ghost" onclick="act.editSkill('${s.name}')">⚙️</button>
                </div>
            `).join('') : '<div style="text-align:center; color:#999; padding:20px;">尚無技能，快去新增吧！</div>';

            contentHtml = `<div style="padding:0 15px 80px 15px;">${attrList} ${skillHeader} ${skillList}</div>`;
        
        } else {
            // --- [V19 移植] 熱量歷史紀錄表格 ---
            const logs = (gs.cal && gs.cal.logs) ? gs.cal.logs : [];
            
            let logsHtml = '';
            if (logs.length > 0) {
                logsHtml = logs.map(logStr => {
                    // 解析紀錄字串 (例如 "午餐 +500" 或 "跑步 -300")
                    const match = logStr.match(/([+-]?\d+)$/);
                    const val = match ? parseInt(match[1]) : 0;
                    const text = logStr.replace(/([+-]?\d+)$/, '');
                    
                    // V19 樣式還原
                    // 正數(攝取)為紅色/深色，負數(運動)為綠色
                    const colorStyle = val >= 0 ? 'color:#d32f2f;' : 'color:#2e7d32;';
                    const sign = val > 0 ? '+' : '';

                    return `
                        <tr style="border-bottom:1px solid #eee;">
                            <td style="padding:12px 8px; color:#555;">${text}</td>
                            <td style="text-align:right; padding:12px 8px; font-weight:bold; ${colorStyle}">
                                ${sign}${val}
                            </td>
                        </tr>`;
                }).join('');
            } else {
                logsHtml = '<tr><td colspan="2" style="text-align:center; padding:40px; color:#aaa;">今日尚無紀錄 🍂</td></tr>';
            }

            contentHtml = `
                <div style="padding: 15px 15px 80px 15px;">
                    <div class="u-box" style="padding:0; overflow:hidden;">
                        <table style="width:100%; border-collapse:collapse; font-size:0.95rem;">
                            <thead style="background:#f5f5f5; color:#666; font-size:0.85rem;">
                                <tr>
                                    <td style="padding:10px 15px;">項目說明</td>
                                    <td style="text-align:right; padding:10px 15px;">卡路里</td>
                                </tr>
                            </thead>
                            <tbody style="background:#fff;">
                                ${logsHtml}
                            </tbody>
                        </table>
                    </div>
                    <div style="text-align:center; margin-top:20px; color:#999; font-size:0.8rem;">
                        ( 紀錄將於每日重置 )
                    </div>
                </div>
            `;
        }

        // 組合頁面
        container.innerHTML = `
            <div style="display:flex; flex-direction:column; height:100%; overflow-y:auto; overflow-x:hidden;">
                ${chartArea}
                ${tabs}
                ${contentHtml}
            </div>
        `;

        // D. 繪製圖表 (必須在 DOM 插入後執行)
        if (currentTab === 'attr') {
            setTimeout(() => this.drawRadarChart(gs.attrs || {}), 100);
        }
    },

    // 2. 渲染技能編輯彈窗 (保持不變)
    renderSkillModal: function(skill) {
        const isEdit = !!skill;
        window.TempState.editSkillId = isEdit ? skill.name : null;
        
        const nameVal = isEdit ? skill.name : '';
        const parentVal = isEdit ? skill.parent : 'STR';
        const attrs = window.GlobalState.attrs || {};

        const body = `
            <div style="margin-bottom:15px;">
                <label style="display:block; margin-bottom:5px; font-weight:bold;">技能名稱</label>
                ${ui.input.text(nameVal, '例如：伏地挺身', '', 'skill-name-input')}
            </div>
            <div style="margin-bottom:15px;">
                <label style="display:block; margin-bottom:5px; font-weight:bold;">關聯屬性</label>
                <select id="skill-attr-select" style="width:100%; padding:10px; border-radius:8px; border:1px solid #ccc;">
                    ${Object.keys(attrs).map(k => `<option value="${k}" ${k===parentVal?'selected':''}>${attrs[k].icon} ${attrs[k].name}</option>`).join('')}
                </select>
            </div>
        `;

        const foot = ui.component.btn({ 
            label: '保存設定', theme: 'correct', style: 'width:100%;',
            action: "act.submitNewSkill()" 
        });

        ui.modal.render(isEdit ? '編輯技能' : '新增技能', body, foot, 'overlay');
    },

    // 3. 圖表繪製 (保持不變)
    drawRadarChart: function(attrs) {
        const canvas = document.getElementById('radar-canvas');
        if (!canvas || !window.Chart) return;

        if (window.myStatsChart) {
            window.myStatsChart.destroy();
        }

        const labels = Object.keys(attrs).map(k => attrs[k].name);
        const data = Object.keys(attrs).map(k => attrs[k].v);

        window.myStatsChart = new Chart(canvas, {
            type: 'radar',
            data: {
                labels: labels,
                datasets: [{
                    label: '能力值',
                    data: data,
                    backgroundColor: 'rgba(255, 193, 7, 0.2)',
                    borderColor: '#ffc107',
                    pointBackgroundColor: '#ffc107',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: '#ffc107'
                }]
            },
            options: {
                maintainAspectRatio: false,
                scales: {
                    r: {
                        beginAtZero: true,
                        ticks: { display: false },
                        grid: { color: 'rgba(0,0,0,0.05)' },
                        angleLines: { color: 'rgba(0,0,0,0.05)' }
                    }
                },
                plugins: {
                    legend: { display: false }
                }
            }
        });
    }
};