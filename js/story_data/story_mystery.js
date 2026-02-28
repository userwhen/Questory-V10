/* js/story_data/story_mystery.js (V5 語法與演員對齊版) */
(function() {
    // 1. 取得核心活頁簿
    const DB = window.FragmentDB;
    if (!DB) {
        console.error("❌ 錯誤：找不到 FragmentDB，請確認 story_data_core.js 已優先載入。");
        return;
    }

    // 🛡️ 防呆金牌
    DB.templates = DB.templates || [];

    // 2. 追加劇本 (Templates)
    DB.templates.push(
        // ==========================================
        // [BLOCK A] 🕵️‍♂️ 懸疑偵探流 (Mystery)
        // ==========================================
        
        // --- 路線 A 開場 ---
        {
            type: 'mystery_start', 
            id: 'mys_start_route_A',
            dialogue: [
                { text: { zh: "在一個{env_weather}的夜晚，這座{env_adj}{env_building}被封鎖了。{actor_victim}倒在{env_room}中央。" } },
                { text: { zh: "在場只有兩個人有嫌疑：{actor_suspect_A}，以及{actor_suspect_B}。" } },
                { text: { zh: "雖然表面平靜，但你注意到{actor_suspect_A}的眼神有些閃爍，似乎在隱藏什麼。" } }
            ],
            options: [{ label: "封鎖現場，開始調查", action: "advance_chain", rewards: { tags: ['truth_A', 'case_started'] } }]
        },
        
        // --- 路線 B 開場 ---
        {
            type: 'mystery_start', 
            id: 'mys_start_route_B',
            dialogue: [
                { text: { zh: "在一個{env_weather}的夜晚，這座{env_adj}{env_building}被封鎖了。{actor_victim}倒在{env_room}中央。" } },
                { text: { zh: "在場只有兩個人有嫌疑：{actor_suspect_A}，以及{actor_suspect_B}。" } },
                { text: { zh: "雖然表面平靜，但你注意到{actor_suspect_B}的手在微微顫抖，似乎非常緊張。" } }
            ],
            options: [{ label: "封鎖現場，開始調查", action: "advance_chain", rewards: { tags: ['truth_B', 'case_started'] } }]
        },

        // --- 路線 A 關鍵線索 ---
        {
            type: 'mystery_mid', 
            id: 'mys_clue_for_A', 
            reqTags: ['truth_A'], 
            dialogue: [
                { text: { zh: "你來到{env_room}的角落，在{env_feature}發現了一個被刻意藏起來的{combo_item_simple}。" } },
                { text: { zh: "仔細檢查後，你發現上面竟然刻著{actor_suspect_A}的名字，而且還沾染著暗沉的血跡！" } },
                { text: { zh: "這無疑是{actor_suspect_A}犯案的關鍵證據。" } }
            ],
            options: [{ label: "收好這份關鍵證據", action: "advance_chain", rewards: { tags: ['evidence_got_A'], varOps: [{key:'clue', val:1, op:'+'}] } }]
        },

        // --- 路線 B 關鍵線索 ---
        {
            type: 'mystery_mid', 
            id: 'mys_clue_for_B', 
            reqTags: ['truth_B'],
            dialogue: [
                { text: { zh: "你在沙發的縫隙中聞到一股異味，隨後摸出了一把{combo_item_simple}。" } },
                { text: { zh: "這東西顯然屬於{actor_suspect_B}。為什麼對方隨身攜帶的物品會掉在命案現場？" } },
                { text: { zh: "所有的線索都指向了{actor_suspect_B}。" } }
            ],
            options: [{ label: "這就是鐵證", action: "advance_chain", rewards: { tags: ['evidence_got_B'], varOps: [{key:'clue', val:1, op:'+'}] } }]
        },

        // --- 轉折事件 (Twist) ---
        {
            type: 'mystery_climax', 
            id: 'mys_twist_event',
            dialogue: [
                { text: { zh: "就在調查進行到一半時，{env_building}的燈光{atom_time}熄滅了！" } },
                { text: { zh: "黑暗中傳來了玻璃破碎的聲音和一陣淒厲的尖叫聲。" } },
                { text: { zh: "當{env_light}再次亮起，你發現現場被破壞了，有人試圖掩蓋真相。" } }
            ],
            options: [{ label: "鎮定眾人，準備推理", action: "advance_chain" }]
        },

        // ==========================================
        // [Noir 困難解謎分支]
        // ==========================================
        {
            type: 'mystery_start', 
            id: 'mys_start_noir',
            reqTags: ['theme_noir'], 
            dialogue: [ 
                { text: { zh: "大雨滂沱的夜晚，這座{env_building}發生命案。" } },
                { text: { zh: "死者是{actor_victim}，死因不明。現場只有兩個嫌疑人：{actor_suspect_A}與{actor_suspect_B}。" } },
                { text: { zh: "直覺告訴你，這不是一起簡單的案件，因為現場遺留了一個「上鎖的保險箱」。" } } 
            ],
            options: [
                { 
                    label: "接手調查 (進入困難解謎)", 
                    action: "advance_chain", 
                    rewards: { tags: ['truth_A', 'case_started', 'exp_puzzle'] } 
                }
            ]
        },
        {
            type: 'mystery_mid', 
            id: 'mys_clue_locked',
            reqTags: ['truth_A'],
            excludeTags: ['has_safe_key'], 
            dialogue: [ 
                { text: { zh: "你找到了那個關鍵的保險箱，裡面肯定鎖著指認{actor_suspect_A}的證據。" } },
                { text: { zh: "但是保險箱鎖得很死，你嘗試了各種密碼都打不開。" } },
                { speaker: "你", text: { zh: "該死...鑰匙一定就在這棟房子的某個角落。" } } 
            ],
            options: [{ label: "去別的地方找找鑰匙", action: "advance_chain" }]
        },
        {
            type: 'mystery_mid', 
            id: 'mys_clue_unlocked',
            reqTags: ['truth_A'],
            conditions: { "has_safe_key": true }, 
            dialogue: [ 
                { text: { zh: "你拿出了剛才找到的銹蝕鑰匙，插入保險箱的鎖孔。" } },
                { text: { zh: "「喀嚓」一聲，櫃門開了！" } },
                { text: { zh: "裡面是一把沾血的{combo_item_simple}，上面還刻著{actor_suspect_A}的名字！" } } 
            ],
            options: [
                { 
                    label: "拿到鐵證了！", 
                    action: "advance_chain", 
                    rewards: { tags: ['evidence_got_A'], varOps: [{key:'clue', val:1, op:'+'}] } 
                }
            ]
        },
        {
            type: 'mystery_adv',
            id: 'mys_find_key',
            conditions: { "exp_puzzle": true, "has_safe_key": false },
            weight: 100,
            dialogue: [ 
                { text: { zh: "你在走廊的{env_feature}下面發現了一個閃閃發光的東西。" } },
                { text: { zh: "撿起來一看，是一把造型古老的鑰匙！" } },
                { text: { zh: "這該不會就是那個保險箱的鑰匙吧？" } } 
            ],
            options: [
                { 
                    label: "收下鑰匙", 
                    action: "advance_chain", 
                    rewards: { tags: ['has_safe_key', 'found_something'] } 
                }
            ]
        },
        {
            type: 'mystery_end', 
            id: 'mys_final_noir',
            reqTags: ['theme_noir'],
            dialogue: [{ text: { zh: "真相大白。你指著犯人說..." } }],
            options: [
                { 
                    label: "兇手是 {actor_suspect_A}", 
                    condition: { tags: ['truth_A', 'evidence_got_A'] }, 
                    action: "node_next", 
                    nextScene: { 
                        dialogue: [
                            { text: { zh: "你亮出了保險箱裡的血衣，{actor_suspect_A}無話可說。" } },
                            { text: { zh: "【結局：正義執行】" } }
                        ],
                        rewards: { gold: 50, title: "名偵探" },
                        options: [{ label: "結案", action: "finish_chain" }]
                    } 
                },
                { 
                    label: "證據不足... (Bad End)", 
                    action: "node_next", 
                    nextScene: { 
                        dialogue: [
                            { text: { zh: "因為沒能打開保險箱，你無法定罪，兇手逍遙法外。" } },
                            { text: { zh: "【結局：完美犯罪】" } }
                        ],
                        rewards: { gold: 5 },
                        options: [{ label: "不甘心地結案", action: "finish_chain" }] 
                    } 
                }
            ]
        },

        // ==========================================
        // [Generic] 通用調查
        // ==========================================
        {
            type: 'mystery_mid', 
            id: 'mys_inv_generic_1',
            dialogue: [ 
                { text: { zh: "你繼續在{env_room}裡搜索。" } },
                { text: { zh: "雖然沒有發現決定性的證據，但你感覺自己離真相越來越近了。" } },
                { text: { zh: "這裡的{env_feature}似乎有人移動過的痕跡。" } } 
            ],
            options: [{ label: "記錄下來，繼續搜查", action: "advance_chain" }]
        },
        {
            type: 'mystery_mid', 
            id: 'mys_inv_generic_2',
            dialogue: [ 
                { text: { zh: "調查陷入了膠著。" } },
                { text: { zh: "你重新審視了目前的線索，試圖找出遺漏的地方。" } },
                { text: { zh: "或許該去問問其他人？" } } 
            ],
            options: [{ label: "換個角度思考", action: "advance_chain", rewards: { varOps: [{key:'energy', val:5, op:'-'}] } }] 
        },
        {
            type: 'mystery_mid', 
            id: 'mys_inv_generic_witness',
            dialogue: [ 
                { text: { zh: "突然，{combo_person_appearance}，對方看起來神情十分緊張。" } },
                { speaker: "目擊者", text: { zh: "那個...我當時好像看到了一個人影往{env_room}的方向跑去。" } },
                { text: { zh: "這條證詞或許能佐證你的推論。" } } 
            ],
            options: [{ label: "感謝情報", action: "advance_chain" }]
        },
        {
            type: 'mystery_adv',
            id: 'mys_item_magnifier',
            weight: 80,
            conditions: { "exp_puzzle": true, "has_magnifier": false },
            dialogue: [
                { text: { zh: "經過書房時，你被桌上的一個物件吸引了目光。" } },
                { text: { zh: "那是一個做工精良的放大鏡，雖然邊緣有點磨損，但還能用。" } },
                { text: { zh: "有了這個，或許能看清一些原本忽略的細節。" } }
            ],
            options: [{ label: "裝備放大鏡", action: "advance_chain", rewards: { tags: ['has_magnifier'] } }]
        },
        
        // --- 備案 (Safety Net) ---
        {
            type: 'mystery_climax', 
            id: 'fallback_mystery_twist',
            dialogue: [
                { text: { zh: "隨著調查深入，你發現了一個驚人的事實！" } },
                { text: { zh: "原本以為無關緊要的線索，居然全部串聯了起來。" } }
            ],
            options: [{ label: "進入最終推理！", action: "advance_chain" }]
        },
        {
            type: 'mystery_end', 
            id: 'fallback_mystery_end',
            dialogue: [
                { text: { zh: "你指著名單上的那個名字，一切真相大白。" } },
                { text: { zh: "犯人低下了頭，承認了所有的罪行。這場風波終於平息了。" } }
            ],
            options: [{ label: "結案 (獲得獎勵)", action: "finish_chain", rewards: { gold: 100, exp: 50 } }]
        },

        // ==========================================
        // [Deduction] 最終推理 (含保底機制)
        // ==========================================
        {
            type: 'mystery_end', 
            id: 'mys_final_logic',
            dialogue: [ 
                { text: { zh: "所有的碎片都已經拼湊完成。面對在場的眾人，你冷靜地走到了大廳中央。" } },
                { text: { zh: "現在，是時候指出那個隱藏在幕後的真兇了。" } } 
            ],
            options: [
                { 
                    label: "兇手是 {actor_suspect_A}！", 
                    condition: { tags: ['truth_A', 'evidence_got_A'] }, 
                    action: "node_next", 
                    nextScene: { 
                        dialogue: [
                            { text: { zh: "你亮出了鐵證，{actor_suspect_A}崩潰認罪。" } },
                            { text: { zh: "【結局：真相大白】" } }
                        ],
                        rewards: { gold: 50, title: "名偵探" },
                        options: [{ label: "結案", action: "finish_chain" }]
                    } 
                },
                { 
                    label: "兇手是 {actor_suspect_B}！", 
                    condition: { tags: ['truth_B', 'evidence_got_B'] }, 
                    action: "node_next", 
                    nextScene: { 
                        dialogue: [
                            { text: { zh: "你亮出了鐵證，{actor_suspect_B}無話可說。" } },
                            { text: { zh: "【結局：正義執行】" } }
                        ],
                        rewards: { gold: 50, title: "名偵探" },
                        options: [{ label: "結案", action: "finish_chain" }]
                    } 
                },
                { 
                    label: "我...還不確定 (證據不足)", 
                    action: "node_next", 
                    nextScene: { 
                        dialogue: [
                            { text: { zh: "你猶豫了。就在這瞬間，真兇製造混亂逃跑了。" } },
                            { text: { zh: "【結局：懸案】" } }
                        ],
                        rewards: { gold: 5 },
                        options: [{ label: "帶著遺憾離開", action: "finish_chain" }]
                    } 
                }
            ]
        }
    );

    console.log("🕵️‍♂️ 懸疑偵探劇本已載入 (V5 演員與場景升級版)");
})();