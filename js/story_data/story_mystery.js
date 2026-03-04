/* js/story_data/story_mystery.js (V8 雙模式融合終極版：箱庭 + 線性) */
(function() {
    const DB = window.FragmentDB;
    if (!DB) return;

    // ==========================================
    // 🎲 1. 懸疑專屬種子 (開局決定真相！)
    // ==========================================
    Object.assign(DB.fragments, {
        mystery_true_culprit: [
            { val: "嫌疑犯A", tag: ["truth_A"] },
            { val: "嫌疑犯B", tag: ["truth_B"] }
        ],
        mystery_murder_weapon: [
            { val: "染血的{item_core}", tag: ["weapon_physical"] },
            { val: "致命的毒藥瓶", tag: ["weapon_poison"] }
        ]
    });

    // ==========================================
    // 🚪 2. 箱庭大廳共用選項 (完美連動時間與地圖)
    // ==========================================
    const hubOptions = [
        { 
            label: "🔍 繼續搜查房間 (耗時 1)", 
            action: "advance_chain", 
            rewards: { varOps: [{key: 'time_left', val: 1, op: '-'}] } 
        },
        { 
            label: "🗺️ 推開未知的門 (耗時 1)", 
            action: "map_explore_new", 
            rewards: { varOps: [{key: 'time_left', val: 1, op: '-'}] } 
        }
    ];

    DB.templates = DB.templates || [];
    DB.templates.push(
        // ========================================================================
        // 🟥 【模式 A】箱庭探索模式 (Hub Mode) - 帶有倒數計時與大廳選項
        // ========================================================================
        
        // --- 🎬 箱庭開場 ---
        {
            type: 'start', id: 'mys_hub_start', 
            reqTags: ['mystery', 'is_hub_mode'], // 🌟 嚴格鎖定箱庭模式
            onEnter: { 
                varOps: [
                    {key: 'tension', val: 0, op: 'set'}, 
                    {key: 'time_left', val: 3, op: 'set', msg: "⏳ 警方將在 3 小時後接管現場"}
                ] 
            },
            dialogue: [
                { text: { zh: "【在一個{env_weather}的夜晚，這座{env_building}發生命案了。" } },
                { text: { zh: "{victim}倒在血泊中。你有 3 小時的時間搜查現場。" } },
                { text: { zh: "這場案件的真兇，就在嫌疑犯A與嫌疑犯B之中..." } } 
            ],
            options: DB.getHubOptions('mystery')
        },
        // --- 🔍 箱庭：找到關鍵凶器 ---
        {
            type: 'middle', id: 'mys_hub_mid_weapon', 
            reqTags: ['mystery', 'is_hub_mode'], excludeTags: ['has_weapon'],
            onEnter: { varOps: [{key: 'tension', val: 10, op: '+'}] },
            dialogue: [
                { text: { zh: "你在{env_feature}仔細搜索..." } },
                { text: { zh: "突然，你發現了關鍵凶器：【{murder_weapon}】！" } },
                { text: { zh: "上面竟然刻著【{true_culprit}】的名字！這絕對是鐵證。" } }
            ],
            options: [
                { 
                    label: "收起凶器", action: "node_next", 
                    rewards: { tags: ['has_weapon'], varOps: [{key: 'exp', val: 10, op: '+'}] }, 
                    nextScene: { dialogue: [{ text: { zh: "你將證據妥善保管。請決定下一步行動：" } }], options: DB.getHubOptions('mystery') }
                }
            ]
        },
        // --- 🔍 箱庭：浪費時間 ---
        {
            type: 'middle', id: 'mys_hub_mid_nothing', 
            reqTags: ['mystery', 'is_hub_mode'],
            dialogue: [
                { text: { zh: "你在房間裡翻箱倒櫃，但除了灰塵之外什麼也沒找到。" } },
                { text: { zh: "時間一分一秒地流逝，你感到一陣焦慮。" } }
            ],
            options: [
                {
                    label: "重新整理思緒", action: "node_next",
                    rewards: { varOps: [{key: 'tension', val: 15, op: '+'}] },
                    nextScene: { dialogue: [{ text: { zh: "白白浪費了時間。請決定下一步行動：" } }], options: DB.getHubOptions('mystery') }
                }
            ]
        },
        // --- 🚨 箱庭結算大會 ---
        {
            type: 'climax', id: 'mys_hub_climax', 
            reqTags: ['mystery', 'is_hub_mode'],
            onEnter: { varOps: [{key: 'time_left', val: 0, op: 'set', msg: "🚨 時間到了！警方已包圍現場"}] },
            dialogue: [
                { text: { zh: "時間到了！你將所有人召集到大廳。真正的兇手，就是——" } }
            ],
            options: [
                {
                    label: "提出完美推理 (需凶器)", 
                    condition: { tags: ['has_weapon'] }, 
                    action: "node_next",
                    rewards: { varOps: [{key: 'exp', val: 50, op: '+'}], tags: ['perfect_clear'] },
                    nextScene: { 
                        dialogue: [{ text: { zh: "你拿出了{murder_weapon}！這是一場完美的推理！【{true_culprit}】當場崩潰認罪。" } }], 
                        options: [{ label: "迎向結局", action: "advance_chain" }] 
                    }
                },
                {
                    label: "我...沒有足夠的證據", 
                    action: "node_next",
                    nextScene: { 
                        dialogue: [{ text: { zh: "你支支吾吾，真兇趁亂混入人群逃跑了... 這成了一樁【懸案】。" } }], 
                        options: [{ label: "黯然結案", action: "advance_chain" }] 
                    }
                }
            ]
        },

        // ========================================================================
        // 🟦 【模式 B】線性敘事模式 (Linear Mode) - 經典視覺小說推進
        // ========================================================================
        
        // --- 🎬 線性開場 (普通) ---
        {
            type: 'start', id: 'mys_lin_start_normal',
            reqTags: ['mystery', 'is_linear_mode'], 
            onEnter: { varOps: [{key: 'tension', val: 5, op: 'set'}] },
            dialogue: [
                { text: { zh: "在一個{env_weather}的夜晚，這座{env_adj}{env_building}被封鎖了。{victim}倒在{env_room}中央。" } },
                { text: { zh: "在場只有兩個人有嫌疑：嫌疑犯A，以及嫌疑犯B。" } },
                { text: { zh: "雖然表面平靜，但你注意到【{true_culprit}】的眼神有些閃爍，似乎在隱藏什麼。" } }
            ],
            options: [{ label: "封鎖現場，開始調查", action: "advance_chain" }]
        },

        // --- 🎬 線性開場 (Noir 困難保險箱變體) ---
        {
            type: 'start', id: 'mys_lin_start_noir',
            reqTags: ['mystery', 'is_linear_mode'], 
            onEnter: { varOps: [{key: 'tension', val: 20, op: 'set'}] },
            dialogue: [ 
                { text: { zh: "大雨滂沱的夜晚，這座{env_building}發生命案。" } },
                { text: { zh: "直覺告訴你這不是一起簡單的案件，因為現場遺留了一個「上鎖的保險箱」。" } } 
            ],
            options: [{ label: "接手調查 (進入困難解謎)", action: "advance_chain", rewards: { tags: ['theme_noir'] } }]
        },

        // --- 🔍 線性：一般調查 (改寫舊版) ---
        {
            type: 'middle', id: 'mys_lin_inv_generic',
            reqTags: ['mystery', 'is_linear_mode'],
            dialogue: [ 
                { text: { zh: "你繼續在{env_room}裡搜索。" } },
                { text: { zh: "雖然沒有發現決定性的證據，但你感覺自己離真相越來越近了。" } },
                { text: { zh: "這裡的{env_feature}似乎有人移動過的痕跡。" } } 
            ],
            options: [{ label: "記錄下來，繼續搜查", action: "advance_chain", rewards: { varOps: [{key: 'exp', val: 5, op: '+'}] } }]
        },

        // --- 🔍 線性：路人證詞 (改寫舊版) ---
        {
            type: 'middle', id: 'mys_lin_inv_witness',
            reqTags: ['mystery', 'is_linear_mode'],
            dialogue: [ 
                { text: { zh: "突然，一名{combo_person_appearance}走了過來，對方看起來神情十分緊張。" } },
                { speaker: "目擊者", text: { zh: "那個...我當時好像看到【{true_culprit}】往{env_room}的方向跑去。" } },
                { text: { zh: "這條證詞或許能佐證你的推論。" } } 
            ],
            options: [{ label: "感謝情報", action: "advance_chain", rewards: { tags: ['has_testimony'] } }]
        },

        // --- 🔒 線性：Noir 專屬解謎 (尋找鑰匙) ---
        {
            type: 'middle', id: 'mys_lin_clue_locked',
            reqTags: ['mystery', 'is_linear_mode', 'theme_noir'], excludeTags: ['has_safe_key'], 
            dialogue: [ 
                { text: { zh: "你找到了那個關鍵的保險箱，裡面肯定鎖著指認【{true_culprit}】的證據。" } },
                { text: { zh: "但是保險箱鎖得很死，你嘗試了各種密碼都打不開。" } } 
            ],
            options: [{ label: "去別的地方找找鑰匙", action: "advance_chain", rewards: { varOps: [{key: 'tension', val: 5, op: '+'}] } }]
        },
        {
            type: 'middle', id: 'mys_lin_find_key',
            reqTags: ['mystery', 'is_linear_mode', 'theme_noir'], excludeTags: ['has_safe_key'],
            dialogue: [ 
                { text: { zh: "你在走廊的{env_feature}下面發現了一個閃閃發光的東西。" } },
                { text: { zh: "撿起來一看，是一把造型古老的鑰匙！這該不會就是保險箱的鑰匙吧？" } } 
            ],
            options: [{ label: "收下鑰匙", action: "advance_chain", rewards: { tags: ['has_safe_key'] } }]
        },
        {
            type: 'middle', id: 'mys_lin_clue_unlocked',
            reqTags: ['mystery', 'is_linear_mode', 'has_safe_key', 'theme_noir'], excludeTags: ['has_weapon'],
            dialogue: [ 
                { text: { zh: "你拿出了剛才找到的鑰匙，插入保險箱的鎖孔。「喀嚓」一聲，櫃門開了！" } },
                { text: { zh: "裡面是一把【{murder_weapon}】，上面還刻著【{true_culprit}】的名字！" } } 
            ],
            options: [{ label: "拿到鐵證了！", action: "advance_chain", rewards: { tags: ['has_weapon'] } }]
        },

        // --- 🚨 線性轉折 (Climax) ---
        {
            type: 'climax', id: 'mys_lin_climax_twist',
            reqTags: ['mystery', 'is_linear_mode'],
            dialogue: [
                { text: { zh: "就在調查進行到一半時，{env_building}的燈光{atom_time}熄滅了！" } },
                { text: { zh: "黑暗中傳來了玻璃破碎的聲音。當{env_light}再次亮起，所有的碎片都已經拼湊完成。" } },
                { text: { zh: "你冷靜地走到了大廳中央。是時候指出那個隱藏在幕後的真兇了。" } }
            ],
            options: [{ label: "開始最終推理", action: "advance_chain" }]
        },

        // ========================================================================
        // 🏁 【共用尾聲】 (End) - 兩種模式都會走到這裡
        // ========================================================================
        {
            type: 'end', id: 'mys_shared_end',
            reqTags: ['mystery'],
            dialogue: [
                { text: { zh: "案件正式落幕了。隨著警笛聲遠去，這座{env_building}重新恢復了寧靜。" } }
            ],
            options: [{ label: "結束劇本", action: "finish_chain" }]
    }
); // 🌟 1. 關閉大陣列

DB.templates.push(DB.createHubTemplate('mystery', 5));

    console.log("🕵️‍♂️ 懸疑偵探劇本已載入 (V8 雙模式融合終極版)");
})();