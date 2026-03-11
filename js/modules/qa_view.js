/* js/modules/qa_view.js - V1.0
 * Q&A 彈出視窗：說明 / 關於我們 / 聯絡
 * 從 quickIcon ❓ 按鈕觸發，由 showQA action 呼叫
 */
window.SQ = window.SQ || {};
window.SQ.View = window.SQ.View || {};
window.SQ.View.QA = {

    // =========================================================
    // 說明內容資料
    // 日後新增圖片時在每個 item 加 img: 'path/to/img.png' 即可
    // =========================================================
    guideData: [
        {
            category: '🌱 新手入門',
            items: [
                {
                    title: '什麼是 Levelife？',
                    desc: 'Levelife 是一款把日常生活遊戲化的 App。完成真實任務來提升角色屬性，讓每天的努力都看得見。'
                },
                {
                    title: '如何開始使用？',
                    desc: '完成新手教學後，你就有一個角色與初始任務。每天完成任務、累積經驗，讓角色一起成長。'
                },
                {
                    title: '什麼是等級與經驗值？',
                    desc: '完成任務會獲得 EXP，累積到門檻後角色升級。等級代表你的整體成長進度，沒有上限。'
                }
            ]
        },
        {
            category: '✅ 任務系統',
            items: [
                {
                    title: '任務類型有哪些？',
                    desc: '任務分為每日任務（Daily）、一般待辦、以及帶截止日的限時任務。每日任務會在換日後自動重置。'
                },
                {
                    title: '完成任務能獲得什麼？',
                    desc: '完成任務可獲得 EXP、金幣，並提升綁定屬性的技能熟練度。嚴格模式下，逾期會扣除經驗。'
                },
                {
                    title: '什麼是嚴格模式？',
                    desc: '開啟嚴格模式後，任務逾期失敗時會扣除角色經驗與屬性值。此功能為 DLC 解鎖項目。'
                }
            ]
        },
        {
            category: '🏆 成就系統',
            items: [
                {
                    title: '成就和里程碑有什麼不同？',
                    desc: '成就是你自訂的個人里程碑，完成後可領取獎勵。里程碑則是系統追蹤的長期記錄，如連續登入天數。'
                },
                {
                    title: '如何領取成就獎勵？',
                    desc: '在成就頁面找到已達成的項目，點擊「領取」按鈕即可獲得鑽石或其他獎勵。'
                }
            ]
        },
        {
            category: '📊 屬性系統',
            items: [
                {
                    title: '六大屬性是什麼？',
                    desc: '角色有體能(💪)、思考(🧠)、技術(🛠️)、魅力(✨)、創造(🎨)、經營(💼)六個屬性，對應生活中不同的能力面向。'
                },
                {
                    title: '技能和屬性的關係？',
                    desc: '每個技能都綁定一個主屬性。完成有該技能的任務時，技能與其主屬性都會同步提升。技能達到 Lv.10 後進入榮譽殿堂。'
                }
            ]
        },
        {
            category: '🛒 商店系統',
            items: [
                {
                    title: '金幣和鑽石怎麼用？',
                    desc: '金幣用於購買普通道具；免費鑽石(💎)可買限定物品；付費鑽石(💠)用於高級內容。鑽石可從成就和活動獲得。'
                },
                {
                    title: '主題如何購買和切換？',
                    desc: '在設定 → 模式商店中購買主題後，基礎面板可直接套用；沉浸世界主題在設定選單中啟用。'
                }
            ]
        },
        {
            category: '📖 劇情模式',
            items: [
                {
                    title: '什麼是劇情精力？',
                    desc: '每次進入劇情探索會消耗精力值。精力每日自動恢復，也可透過特定道具補充。精力上限會隨角色成長提升。'
                },
                {
                    title: '劇情選擇有影響嗎？',
                    desc: '劇情分支會影響後續的故事走向與 NPC 關係。部分選項需要特定屬性達到門檻才能解鎖。'
                }
            ]
        }
    ],

    // =========================================================
    // 主渲染函式
    // =========================================================
    render: function() {
        const tab = window.SQ.Temp.qaTab || 'guide';
        const version = window.SQ.Config?.System?.Version || '1.0.0';

        // Tab 切換列
        const tabs = [
            { val: 'guide',   label: '📖 說明' },
            { val: 'about',   label: '🏢 關於' },
            { val: 'contact', label: '📬 聯絡' }
        ];
        const tabsHtml = `
            <div style="display:flex; gap:6px; margin-bottom:16px; border-bottom:1px solid var(--border); padding-bottom:12px;">
                ${tabs.map(t => `
                    <button data-action="switchQATab" data-val="${t.val}"
                        style="flex:1; padding:8px 4px; border-radius:8px; border:none; cursor:pointer; font-size:0.82rem; font-weight:700;
                               background:${tab === t.val ? 'var(--color-gold-soft)' : 'var(--bg-box)'};
                               color:${tab === t.val ? 'var(--color-gold-dark)' : 'var(--text-muted)'};
                               border:1px solid ${tab === t.val ? 'var(--color-gold)' : 'transparent'};">
                        ${t.label}
                    </button>`).join('')}
            </div>`;

        let bodyContent = '';

        // ── Tab 1: 說明 ──────────────────────────────────────
        if (tab === 'guide') {
            const selectedCat = window.SQ.Temp.qaCat || this.guideData[0].category;

            // 分類選單
            const catMenuHtml = `
                <div style="display:flex; flex-wrap:wrap; gap:6px; margin-bottom:14px;">
                    ${this.guideData.map(cat => `
                        <button data-action="switchQACat" data-val="${cat.category}"
                            style="padding:5px 10px; border-radius:20px; border:none; cursor:pointer; font-size:0.78rem; font-weight:700;
                                   background:${selectedCat === cat.category ? 'var(--color-gold)' : 'var(--bg-elevated)'};
                                   color:${selectedCat === cat.category ? '#fff' : 'var(--text-muted)'};">
                            ${cat.category}
                        </button>`).join('')}
                </div>`;

            // 說明內容
            const catData = this.guideData.find(c => c.category === selectedCat) || this.guideData[0];
            const itemsHtml = catData.items.map(item => `
                <div style="margin-bottom:14px; padding:14px; background:var(--bg-card);
                            border-radius:12px; border:1px solid var(--border); box-shadow:var(--shadow-xs);">
                    <div style="font-weight:800; color:var(--text); font-size:0.92rem; margin-bottom:6px;">${item.title}</div>
                    <div style="font-size:0.84rem; color:var(--text-2); line-height:1.6;">${item.desc}</div>
                </div>`).join('');

            // 重新觀看教學按鈕
            const tutorialBtn = `
                <div style="margin-top:6px; padding:12px; background:var(--color-info-soft);
                            border-radius:12px; border:1px solid var(--color-info); text-align:center;">
                    <div style="font-size:0.82rem; color:var(--text-muted); margin-bottom:8px;">需要重新了解基本操作？</div>
                    <button data-action="showQATutorial"
                        style="padding:9px 20px; border-radius:8px; border:none; cursor:pointer;
                               background:var(--color-info); color:#fff; font-weight:800; font-size:0.85rem;">
                        🧚 重新觀看新手教學
                    </button>
                </div>`;

            bodyContent = catMenuHtml + itemsHtml + tutorialBtn;
        }

        // ── Tab 2: 關於我們 ───────────────────────────────────
        else if (tab === 'about') {
            bodyContent = `
                <!-- App Logo 區 -->
                <div style="text-align:center; padding:20px 0 16px;">
                    <div style="font-size:3.5rem; margin-bottom:8px;">⚔️</div>
                    <div style="font-size:1.3rem; font-weight:900; color:var(--text); letter-spacing:0.05em;">Levelife</div>
                    <div style="font-size:0.78rem; color:var(--text-muted); margin-top:4px; letter-spacing:0.08em;">把生活變成冒險</div>
                    <div style="display:inline-block; margin-top:8px; padding:3px 12px; border-radius:999px;
                                background:var(--bg-elevated); font-size:0.72rem; color:var(--text-ghost);">
                        v${version}
                    </div>
                </div>

                <!-- 開發者資訊 -->
                <div style="background:var(--bg-card); border-radius:14px; border:1px solid var(--border);
                            padding:16px; margin-bottom:12px;">
                    <div style="font-size:0.8rem; font-weight:800; color:var(--text-muted); letter-spacing:0.1em; margin-bottom:12px;">開發者</div>
                    <div style="display:flex; align-items:center; gap:12px;">
                        <div style="width:44px; height:44px; border-radius:12px; background:var(--color-gold-soft);
                                    border:1px solid var(--color-gold); display:flex; align-items:center; justify-content:center; font-size:1.5rem;">
                            🎮
                        </div>
                        <div>
                            <div style="font-weight:800; color:var(--text); font-size:0.95rem;">LevLife Studio</div>
                            <div style="font-size:0.76rem; color:var(--text-muted); margin-top:2px;">獨立開發 · 台灣</div>
                        </div>
                    </div>
                </div>

                <!-- 版本與法律 -->
                <div style="background:var(--bg-card); border-radius:14px; border:1px solid var(--border);
                            padding:0 16px; margin-bottom:12px;">
                    ${[
                        { icon: '📋', label: '隱私政策', action: 'openPrivacyPolicy' },
                        { icon: '📄', label: '使用條款', action: 'openTermsOfService' },
                    ].map((row, i, arr) => `
                        <div data-action="${row.action}"
                             style="display:flex; align-items:center; justify-content:space-between;
                                    padding:13px 0; cursor:pointer;
                                    ${i < arr.length - 1 ? 'border-bottom:1px solid var(--border);' : ''}">
                            <div style="display:flex; align-items:center; gap:10px;">
                                <span style="font-size:1.1rem;">${row.icon}</span>
                                <span style="font-size:0.88rem; font-weight:600; color:var(--text);">${row.label}</span>
                            </div>
                            <span style="color:var(--text-ghost); font-size:0.9rem;">›</span>
                        </div>`).join('')}
                </div>

                <!-- Copyright -->
                <div style="text-align:center; padding:12px 0 4px;">
                    <div style="font-size:0.72rem; color:var(--text-ghost); line-height:1.7;">
                        © 2025 LevLife Studio. All rights reserved.<br>
                        本 App 之所有內容、設計與程式碼均受著作權法保護。
                    </div>
                </div>`;
        }

        // ── Tab 3: 聯絡 ──────────────────────────────────────
        else if (tab === 'contact') {
            const contactLinks = [
                {
                    icon: '📧',
                    title: '電子郵件',
                    desc: 'contact@levlife.app',
                    action: 'openContactEmail',
                    label: '發送郵件'
                },
                {
                    icon: '🌐',
                    title: '官方網站',
                    desc: 'www.levlife.app',
                    action: 'openContactWebsite',
                    label: '前往網站'
                },
                {
                    icon: '📝',
                    title: '意見回饋表單',
                    desc: '問題回報 / 功能建議',
                    action: 'openContactForm',
                    label: '填寫表單'
                }
            ];

            bodyContent = `
                <div style="margin-bottom:14px; padding:12px 14px; background:var(--color-gold-soft);
                            border-radius:12px; border:1px solid var(--color-gold);">
                    <div style="font-size:0.84rem; color:var(--color-gold-dark); line-height:1.6;">
                        💬 有任何問題、建議或合作邀請，歡迎透過以下管道聯繫我們。我們通常會在 2 個工作天內回覆。
                    </div>
                </div>

                ${contactLinks.map(link => `
                    <div style="background:var(--bg-card); border-radius:14px; border:1px solid var(--border);
                                padding:14px 16px; margin-bottom:10px; display:flex; align-items:center; gap:14px;">
                        <div style="width:44px; height:44px; border-radius:12px; background:var(--bg-elevated);
                                    display:flex; align-items:center; justify-content:center; font-size:1.4rem; flex-shrink:0;">
                            ${link.icon}
                        </div>
                        <div style="flex:1; min-width:0;">
                            <div style="font-weight:800; color:var(--text); font-size:0.9rem;">${link.title}</div>
                            <div style="font-size:0.76rem; color:var(--text-muted); margin-top:2px;
                                        white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${link.desc}</div>
                        </div>
                        <button data-action="${link.action}"
                            style="padding:7px 12px; border-radius:8px; border:1px solid var(--color-gold);
                                   background:var(--color-gold-soft); color:var(--color-gold-dark);
                                   font-size:0.78rem; font-weight:800; cursor:pointer; flex-shrink:0; white-space:nowrap;">
                            ${link.label}
                        </button>
                    </div>`).join('')}

                <div style="margin-top:6px; padding:12px; background:var(--bg-elevated);
                            border-radius:10px; text-align:center;">
                    <div style="font-size:0.76rem; color:var(--text-ghost); line-height:1.6;">
                        如果你喜歡 Levelife，歡迎在 App Store 留下評分！<br>
                        你的支持是我們持續開發的最大動力 🙏
                    </div>
                </div>`;
        }

        const fullBody = tabsHtml + `<div style="min-height:200px;">${bodyContent}</div>`;

        ui.modal.render('❓ 說明與關於', fullBody, null, 'overlay');
    }
};

// =========================================================
// Action 註冊
// =========================================================
window.SQ.Actions = window.SQ.Actions || {};

// showQA — quickIcon ❓ 觸發點
window.SQ.Actions.showQA = function() {
    window.SQ.Temp.qaTab = 'guide';
    window.SQ.Temp.qaCat = null;
    window.SQ.View.QA.render();
    window.SQ.Actions.openModal('overlay');
};

// Tab 切換
window.SQ.Actions.switchQATab = function(tab) {
    window.SQ.Temp.qaTab = tab;
    window.SQ.View.QA.render();
};

// 分類切換
window.SQ.Actions.switchQACat = function(cat) {
    window.SQ.Temp.qaCat = cat;
    window.SQ.View.QA.render();
};

// 重新觀看教學（從 QA 觸發）
window.SQ.Actions.showQATutorial = function() {
    window.SQ.Actions.closeModal('overlay');
    if (window.SQ.Actions.restartTutorial) {
        window.SQ.Actions.restartTutorial();
    } else {
        window.SQ.Actions.toast('教學模組尚未載入');
    }
};

// 聯絡連結（佔位，之後換成真實 URL）
window.SQ.Actions.openContactEmail   = () => { window.open('mailto:contact@levlife.app', '_blank'); };
window.SQ.Actions.openContactWebsite = () => { window.open('https://www.levlife.app', '_blank'); };
window.SQ.Actions.openContactForm    = () => { window.open('https://forms.levlife.app', '_blank'); };

// 法律頁面（佔位）
window.SQ.Actions.openPrivacyPolicy   = () => { window.open('https://www.levlife.app/privacy', '_blank'); };
window.SQ.Actions.openTermsOfService  = () => { window.open('https://www.levlife.app/terms', '_blank'); };

console.log('❓ [QA View] 就緒');
