/* js/story_data/story_raising.js (V8 雙模式終極版：壓力箱庭 + 經典養成) */
(function() {
    const DB = window.FragmentDB;
    if (!DB) {
        console.error("❌ 錯誤：找不到 FragmentDB，請確認 story_data_core.js 已優先載入。");
        return;
    }

    // ==========================================
    // 🚪 1. 養成箱庭共用選項 (行程安排與排程)
    // ==========================================
    const raisingHubOptions = [
        { 
            label: "⚔️ 嚴格體能訓練 (加實力/加壓力)", 
            action: "advance_chain", 
            rewards: { tags: ['visit_train'], removeTags: ['visit_show', 'visit_relax'], varOps: [{key: 'time_left', val: 1, op: '-'}] } 
        },
        { 
            label: "🎭 安排街頭表演 (加魅力/賺金幣)", 
            action: "advance_chain", 
            rewards: { tags: ['visit_show'], removeTags: ['visit_train', 'visit_relax'], varOps: [{key: 'time_left', val: 1, op: '-'}] } 
        },
        { 
            label: "☕ 帶去市區放鬆 (降壓力/加好感)", 
            action: "advance_chain", 
            rewards: { tags: ['visit_relax'], removeTags: ['visit_train', 'visit_show'], varOps: [{key: 'time_left', val: 1, op: '-'}] } 
        }
    ];

    DB.templates = DB.templates || [];
    DB.templates.push(
        // ========================================================================
        // 🟥 【模式 A】養成箱庭模式 (Hub Mode) - 排程管理與壓力爆炸
        // ========================================================================
        
        // --- 🎬 箱庭開場 ---
        {
            type: 'start', id: 'raise_hub_start',
            reqTags: ['raising', 'is_hub_mode'],
            onEnter: { 
                varOps: [
                    {key: 'tension', val: 0, op: 'set', msg: "🎯 訓練計畫開始"}, 
                    {key: 'time_left', val: 3, op: 'set', msg: "⏳ 距離最終選拔還有 3 週"}
                ] 
            },
            dialogue: [
                { text: { zh: "距離最終的皇家選拔賽只剩下 3 週了。" } },
                { text: { zh: "你看著眼前的【{trainee}】，對方眼中閃爍著對未來的渴望。" } },
                { text: { zh: "作為導師，你必須妥善安排接下來的每一週。記住，過度的壓力會毀了一切。" } }
            ],
            options: raisingHubOptions
        },

        // --- 💥 壓力爆炸攔截 (Risk High) - 張力破 80 自動觸發！ ---
        {
            type: 'middle', id: 'raise_hub_stress_explode',
            reqTags: ['raising', 'is_hub_mode', 'risk_high'], 
            onEnter: { varOps: [{key: 'tension', val: 40, op: '-', msg: "📉 壓力釋放 (大幅流失進度)"}] },
            dialogue: [
                { text: { zh: "【警告：壓力過載】" } },
                { text: { zh: "【{trainee}】的眼神變得空洞，身體忍不住發抖。長時間的高壓終於壓垮了理智。" } },
                { speaker: "{trainee}", text: { zh: "我做不到... 導師，我真的做不到！" } }
            ],
            options: [
                {
                    label: "立刻中斷行程，緊急安撫！", action: "node_next",
                    nextScene: { 
                        dialogue: [{ text: { zh: "你抱住對方不斷安撫，雖然勉強穩住了情緒，但這週的訓練徹底泡湯了。" } }], 
                        options: raisingHubOptions 
                    }
                }
            ]
        },

        // --- 🏋️ 箱庭 Middle：訓練 ---
        {
            type: 'middle', id: 'raise_hub_mid_train',
            reqTags: ['raising', 'is_hub_mode', 'visit_train'], excludeTags: ['risk_high'],
            onEnter: { varOps: [{key: 'str', val: 20, op: '+'}, {key: 'tension', val: 30, op: '+'}] },
            dialogue: [
                { text: { zh: "汗水揮灑在訓練場上。你毫不留情地糾正【{trainee}】的每一個動作。" } },
                { text: { zh: "雖然過程極度痛苦，但對方的【實力】肉眼可見地提升了。" } }
            ],
            options: [{ label: "結算本週", action: "node_next", nextScene: { dialogue: [{ text: { zh: "本週結束。請安排下週行程：" } }], options: raisingHubOptions } }]
        },
        // --- 🎭 箱庭 Middle：表演 ---
        {
            type: 'middle', id: 'raise_hub_mid_show',
            reqTags: ['raising', 'is_hub_mode', 'visit_show'], excludeTags: ['risk_high'],
            onEnter: { varOps: [{key: 'chr', val: 20, op: '+'}, {key: 'tension', val: 15, op: '+'}, {key: 'gold', val: 50, op: '+'}] },
            dialogue: [
                { text: { zh: "你安排【{trainee}】在廣場進行街頭表演。群眾的目光讓對方一開始有些怯場。" } },
                { text: { zh: "但在你的鼓勵下，對方逐漸找回自信，展現了驚人的【魅力】，還賺到了一些資金！" } }
            ],
            options: [{ label: "結算本週", action: "node_next", nextScene: { dialogue: [{ text: { zh: "本週結束。請安排下週行程：" } }], options: raisingHubOptions } }]
        },
        // --- ☕ 箱庭 Middle：放鬆 ---
        {
            type: 'middle', id: 'raise_hub_mid_relax',
            reqTags: ['raising', 'is_hub_mode', 'visit_relax'], excludeTags: ['risk_high'],
            onEnter: { varOps: [{key: 'tension', val: 30, op: '-'}, {key: 'favor', val: 15, op: '+'}] },
            dialogue: [
                { text: { zh: "勞逸結合是必要的。你帶著【{trainee}】去市區逛街吃甜點。" } },
                { text: { zh: "看著對方開心的笑容，你緊繃的神經也放鬆了下來。你們的【好感度】增加了。" } }
            ],
            options: [{ label: "結算本週", action: "node_next", nextScene: { dialogue: [{ text: { zh: "本週結束。請安排下週行程：" } }], options: raisingHubOptions } }]
        },

        // --- 🏁 箱庭 Adv (最後一週的收尾，強制進入高潮) ---
        {
            type: 'adv', id: 'raise_hub_adv_train',
            reqTags: ['raising', 'is_hub_mode', 'visit_train'], excludeTags: ['risk_high'],
            onEnter: { varOps: [{key: 'str', val: 20, op: '+'}, {key: 'tension', val: 30, op: '+'}, {key: 'time_left', val: 0, op: 'set'}] },
            dialogue: [{ text: { zh: "最後一週，你們選擇了在汗水中度過。訓練結束的哨聲響起，【{trainee}】的眼神已經蛻變。" } }],
            options: [{ label: "前往最終選拔！", action: "advance_chain" }]
        },
        {
            type: 'adv', id: 'raise_hub_adv_show',
            reqTags: ['raising', 'is_hub_mode', 'visit_show'], excludeTags: ['risk_high'],
            onEnter: { varOps: [{key: 'chr', val: 20, op: '+'}, {key: 'tension', val: 15, op: '+'}, {key: 'time_left', val: 0, op: 'set'}] },
            dialogue: [{ text: { zh: "最後一週的表演完美落幕。人群的歡呼聲為【{trainee}】注入了強大的自信心。" } }],
            options: [{ label: "前往最終選拔！", action: "advance_chain" }]
        },
        {
            type: 'adv', id: 'raise_hub_adv_relax',
            reqTags: ['raising', 'is_hub_mode', 'visit_relax'], excludeTags: ['risk_high'],
            onEnter: { varOps: [{key: 'tension', val: 30, op: '-'}, {key: 'favor', val: 15, op: '+'}, {key: 'time_left', val: 0, op: 'set'}] },
            dialogue: [{ text: { zh: "最後一週，你們選擇了沉澱心靈。以最完美的心理狀態迎接明天的挑戰。" } }],
            options: [{ label: "前往最終選拔！", action: "advance_chain" }]
        },

        // --- 🏆 箱庭高潮：最終選拔 (Climax) ---
        {
            type: 'climax', id: 'raise_hub_climax',
            reqTags: ['raising', 'is_hub_mode'],
            dialogue: [
                { text: { zh: "聚光燈打在舞台上，皇家選拔賽正式開始。" } },
                { text: { zh: "這是檢驗 3 週以來所有心血的時刻。你想讓【{trainee}】以什麼方式征服評審？" } }
            ],
            options: [
                {
                    label: "展現壓倒性的實力 (需 STR >= 40)", condition: { vars: [{key: 'str', val: 40, op: '>='}] },
                    action: "node_next", rewards: { tags: ['hub_win_str'] },
                    nextScene: { dialogue: [{ text: { zh: "轟！強大的氣場與完美的技巧震懾了全場！評審們甚至站起來鼓掌！" } }], options: [{ label: "迎向結局", action: "advance_chain" }] }
                },
                {
                    label: "展現無與倫比的魅力 (需 CHR >= 40)", condition: { vars: [{key: 'chr', val: 40, op: '>='}] },
                    action: "node_next", rewards: { tags: ['hub_win_chr'] },
                    nextScene: { dialogue: [{ text: { zh: "優雅的台風與迷人的氣質讓全場觀眾陷入瘋狂！閃光燈此起彼落！" } }], options: [{ label: "迎向結局", action: "advance_chain" }] }
                },
                {
                    label: "硬著頭皮上吧...",
                    action: "node_next",
                    nextScene: { dialogue: [{ text: { zh: "表現平平，失誤連連。雖然很努力了，但在這種殿堂級的舞台上，還遠遠不夠。" } }], options: [{ label: "黯然退場", action: "advance_chain" }] }
                }
            ]
        },

        // --- 🎬 箱庭尾聲 (End) ---
        {
            type: 'end', id: 'raise_hub_end_str', reqTags: ['raising', 'is_hub_mode', 'hub_win_str'],
            dialogue: [{ text: { zh: "【武之巔峰】你們以絕對的實力奪下了冠軍！這對師徒的名字，將永遠刻在皇家的歷史上。" } }],
            options: [{ label: "領取獎勵", action: "finish_chain", rewards: { gold: 1000, title: "傳奇導師" } }]
        },
        {
            type: 'end', id: 'raise_hub_end_chr', reqTags: ['raising', 'is_hub_mode', 'hub_win_chr'],
            dialogue: [{ text: { zh: "【魅力偶像】你們成為了全城矚目的焦點！無數的合約與邀請雪片般飛來。" } }],
            options: [{ label: "領取獎勵", action: "finish_chain", rewards: { gold: 1000, title: "金牌經紀人" } }]
        },


        // ========================================================================
        // 🟦 【模式 B】線性敘事模式 (Linear Mode) - 經典養成路線
        // ========================================================================

        // --- 🎬 線性開場 ---
        {
            type: 'start', id: 'raise_lin_start_select',
            reqTags: ['raising', 'is_linear_mode'],
            dialogue: [
                { text: { zh: "這是一個平凡的日子，你在{env_building}的角落發現了那個獨特的存在。" } },
                { text: { zh: "那是一名{identity_modifier}{trainee}，雖然現在看起來還很弱小，但你從對方的眼神中看到了無限的潛力。" } },
                { text: { zh: "命運將你們聯繫在了一起，你決定成為對方的..." } }
            ],
            options: [
                { 
                    label: "嚴厲的導師 (注重實力)", action: "advance_chain", 
                    rewards: { tags: ['style_power'], varOps: [{key:'str', val:30, op:'set'}, {key:'tension', val:0, op:'set'}] } 
                },
                { 
                    label: "溫柔的守護者 (注重魅力)", action: "advance_chain", 
                    rewards: { tags: ['style_charm'], varOps: [{key:'chr', val:30, op:'set'}, {key:'tension', val:0, op:'set'}] } 
                }
            ]
        },

        // --- 📈 線性 Middle：訓練日常 ---
        {
            type: 'middle', id: 'raise_lin_train_day',
            reqTags: ['raising', 'is_linear_mode'],
            dialogue: [
                { text: { zh: "時光飛逝，【{trainee}】在你的指導下飛速成長。" } },
                { text: { zh: "現在正是突破瓶頸的好機會，你決定安排..." } }
            ],
            options: [
                { label: "魔鬼特訓 (大幅加壓力)", action: "advance_chain", rewards: { tags: ['tag_strength'], varOps: [{key:'tension', val:40, op:'+'}] } },
                { label: "藝術薰陶 (微幅加壓力)", action: "advance_chain", rewards: { tags: ['tag_fame'], varOps: [{key:'tension', val:20, op:'+'}] } },
                { label: "放鬆休息 (大幅扣除壓力)", action: "advance_chain", rewards: { varOps: [{key:'tension', val:30, op:'-'}] } }
            ]
        },

        // --- 🌟 線性 Adv：初次登台 ---
        {
            type: 'adv', id: 'raise_lin_event_show',
            reqTags: ['raising', 'is_linear_mode'],
            dialogue: [
                { text: { zh: "【{trainee}】迎來了第一次公開展示的機會。然而在上場前的後台..." } }
            ],
            options: [
                { 
                    label: "狀況不對勁...", condition: { vars: [{key:'tension', val:60, op:'>='}] }, 
                    style: "danger", action: "node_next", 
                    nextScene: { dialogue: [{ text: { zh: "【{trainee}】承受不住巨大的壓力，逃離了會場。\n【結局：不堪重負】" } }], options: [{ label: "結束一切", action: "finish_chain" }] } 
                },
                { 
                    label: "展示華麗的技巧", condition: { tags: ['tag_fame'], vars: [{key:'tension', val:60, op:'<'}] }, 
                    action: "advance_chain", rewards: { gold: 300, tags: ['fame_mid'] } 
                },
                { 
                    label: "展示壓倒性的力量", condition: { tags: ['tag_strength'], vars: [{key:'tension', val:60, op:'<'}] }, 
                    action: "advance_chain", rewards: { gold: 300, tags: ['fame_mid'] } 
                },
                { 
                    label: "中規中矩地完成", condition: { vars: [{key:'tension', val:60, op:'<'}] }, 
                    action: "advance_chain"
                }
            ]
        },

        // --- 👑 線性 Climax：高潮決戰 ---
        {
            type: 'climax', id: 'raise_lin_final_battle', 
            reqTags: ['raising', 'is_linear_mode'],
            dialogue: [
                { text: { zh: "決戰之日終於來臨。站在巔峰的對手強大得令人窒息。" } },
                { text: { zh: "在此刻，你想向【{trainee}】說的最後一句話是..." } }
            ],
            options: [
                { label: "「去吧，讓世界看到你的光芒！」", action: "advance_chain", rewards: { varOps: [{key:'chr', val:10, op:'+'}, {key:'str', val:10, op:'+'}] } },
                { label: "「發揮出你的全力！」", action: "advance_chain", rewards: { varOps: [{key:'tension', val:10, op:'-'}] } }
            ]
        },

        // --- 🎬 線性 End：結局 ---
        {
            type: 'end', id: 'raise_lin_end_result',
            reqTags: ['raising', 'is_linear_mode'],
            dialogue: [
                { text: { zh: "塵埃落定。你看著眼前這個光芒萬丈的存在，回想起最初相遇的那一刻。" } }
            ],
            options: [
                { 
                    label: "見證：至高明日之星", condition: { tags: ['tag_fame'] }, 
                    style: "primary", action: "finish_chain", rewards: { gold: 200, title: "金牌製作人" } 
                },
                { 
                    label: "見證：最強鬥士", condition: { tags: ['tag_strength'] }, 
                    style: "danger", action: "finish_chain", rewards: { gold: 200, title: "王者之師" } 
                },
                { 
                    label: "回歸平凡的幸福", action: "finish_chain", rewards: { gold: 80 } 
                }
            ]
        },

        // 🏁 共用保底結尾
        {
            type: 'end', id: 'raise_shared_end',
            reqTags: ['raising'],
            dialogue: [{ text: { zh: "無論未來的路有多長，這段時光都將成為你們最寶貴的財富。" } }],
options: [{ label: "結束劇本", action: "finish_chain", rewards: { gold: 50 } }]
    }
); // 🌟 1. 關閉大陣列

DB.templates.push(DB.createHubTemplate('raising', 5));

    console.log("🌱 養成劇本已載入...");
})();