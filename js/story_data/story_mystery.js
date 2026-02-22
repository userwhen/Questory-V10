/* js/story_data/story_mystery.js */
(function() {
    // 1. 取得核心活頁簿
    const DB = window.FragmentDB;
    if (!DB) {
        console.error("❌ 錯誤：找不到 FragmentDB，請確認 story_data_core.js 已優先載入。");
        return;
    }

    // 2. 追加劇本 (Templates)
    DB.templates.push(
        // ==========================================
        // [BLOCK A] 🕵️‍♂️ 懸疑偵探流 (Mystery)
        // ==========================================
        
        // --- 路線 A 開場 ---
        {
            type: 'setup', 
            id: 'mys_start_route_A',
            // 完美結合 generator 的 {weather} 種子與 V4 詞庫
            text: { zh: [ "在一個{weather}，這座{noun_location_building}被封鎖了。{victim}倒在{noun_location_room}中央。", "在場只有兩個人有嫌疑：{suspect_A}，以及{suspect_B}。", "雖然表面平靜，但你注意到{suspect_A}的眼神有些閃爍，似乎在隱藏什麼。" ]},
            options: [{ label: "封鎖現場，開始調查", action: "advance_chain", rewards: { tags: ['truth_A', 'case_started'] } }]
        },
        
        // --- 路線 B 開場 ---
        {
            type: 'setup', 
            id: 'mys_start_route_B',
            text: { zh: [ "在一個{weather}，這座{noun_location_building}被封鎖了。{victim}倒在{noun_location_room}中央。", "在場只有兩個人有嫌疑：{suspect_A}，以及{suspect_B}。", "雖然表面平靜，但你注意到{suspect_B}的手在微微顫抖，似乎非常緊張。" ]},
            options: [{ label: "封鎖現場，開始調查", action: "advance_chain", rewards: { tags: ['truth_B', 'case_started'] } }]
        },

        // --- 路線 A 關鍵線索 ---
        {
            type: 'investigate', 
            id: 'mys_clue_for_A', 
            reqTag: 'truth_A',
            text: { zh: [ "你來到{noun_location_room}的角落，發現了一個被藏起來的{noun_item_common}。", "仔細檢查後，你發現上面刻著{suspect_A}的名字，而且還呈現{atom_item_state}的狀態！", "這無疑是{suspect_A}犯案的關鍵證據。" ]},
            options: [{ label: "收好這份關鍵證據", action: "advance_chain", rewards: { tags: ['evidence_got_A'], varOps: [{key:'clue', val:1, op:'+'}] } }]
        },

        // --- 路線 B 關鍵線索 ---
        {
            type: 'investigate', 
            id: 'mys_clue_for_B', 
            reqTag: 'truth_B',
            text: { zh: [ "你在沙發縫隙中聞到一股異味，隨後找到了一把{noun_item_weapon}。", "這東西屬於{suspect_B}，且表面呈現{atom_item_state}的狀態。為什麼對方會出現在這裡？", "所有的線索都指向了{suspect_B}。" ]},
            options: [{ label: "這就是鐵證", action: "advance_chain", rewards: { tags: ['evidence_got_B'], varOps: [{key:'clue', val:1, op:'+'}] } }]
        },

        // --- 轉折事件 (Twist) ---
        {
            type: 'twist', 
            id: 'mys_twist_event',
            text: { zh: [ "就在調查進行到一半時，{noun_location_building}的燈光{atom_time}熄滅了！", "黑暗中傳來了玻璃破碎的聲音和{noun_npc_generic}的尖叫聲。", "當燈光再次亮起，你發現現場被破壞了，有人試圖掩蓋真相。" ]},
            options: [{ label: "鎮定眾人，準備推理", action: "advance_chain" }]
        },

        // ==========================================
        // [Noir 困難解謎分支]
        // ==========================================
        {
            type: 'setup', 
            id: 'mys_start_noir',
            reqTag: 'theme_noir', 
            text: { zh: [ 
                "大雨滂沱的夜晚，{noun_location_building}發生命案。",
                "死者是{victim}，死因不明。現場只有兩個嫌疑人：{suspect_A}與{suspect_B}。",
                "直覺告訴你，這不是一起簡單的案件，因為現場遺留了一個「上鎖的保險箱」。" 
            ]},
            options: [
                { 
                    label: "接手調查 (進入困難解謎)", 
                    action: "advance_chain", 
                    rewards: { tags: ['truth_A', 'case_started', 'exp_puzzle'] } 
                }
            ]
        },
        {
            type: 'investigate', 
            id: 'mys_clue_locked',
            reqTag: 'truth_A',
            noTag: 'has_safe_key', 
            text: { zh: [ 
                "你找到了那個關鍵的保險箱，裡面肯定鎖著指認{suspect_A}的證據。",
                "但是保險箱鎖得很死，你嘗試了各種密碼都打不開。",
                "「該死...鑰匙一定就在這棟房子的某個角落。」" 
            ]},
            options: [{ label: "去別的地方找找鑰匙", action: "advance_chain" }]
        },
        {
            type: 'investigate', 
            id: 'mys_clue_unlocked',
            reqTag: 'truth_A',
            conditions: { "has_safe_key": true }, 
            text: { zh: [ 
                "你拿出了剛才找到的銹蝕鑰匙，插入保險箱的鎖孔。",
                "「喀嚓」一聲，櫃門開了！",
                "裡面是一把沾血的{noun_item_weapon}，上面刻著{suspect_A}的名字！" 
            ]},
            options: [
                { 
                    label: "拿到鐵證了！", 
                    action: "advance_chain", 
                    rewards: { tags: ['evidence_got_A'], varOps: [{key:'clue', val:1, op:'+'}] } 
                }
            ]
        },
        {
            type: 'univ_filler',
            id: 'uni_find_key',
            conditions: { "exp_puzzle": true, "has_safe_key": false },
            weight: 100,
            text: { zh: [ 
                "你在走廊的{noun_env_feature}下面發現了一個閃閃發光的東西。",
                "撿起來一看，是一把造型古老的鑰匙！",
                "這該不會就是那個保險箱的鑰匙吧？" 
            ]},
            options: [
                { 
                    label: "收下鑰匙", 
                    action: "advance_chain", 
                    rewards: { tags: ['has_safe_key', 'found_something'] } 
                }
            ]
        },
        {
            type: 'deduction', 
            id: 'mys_final_noir',
            reqTag: 'theme_noir',
            text: { zh: ["真相大白。你指著犯人說..."] },
            options: [
                { 
                    label: "兇手是 {suspect_A}", 
                    condition: { tags: ['truth_A', 'evidence_got_A'] }, 
                    action: "finish_chain", 
                    nextScene: { text: "你亮出了保險箱裡的血衣，{suspect_A}無話可說。\n【結局：正義執行】", rewards: { exp: 500, title: "名偵探" } } 
                },
                { 
                    label: "證據不足... (Bad End)", 
                    action: "finish_chain", 
                    nextScene: { text: "因為沒能打開保險箱，你無法定罪，兇手逍遙法外。\n【結局：完美犯罪】", rewards: { exp: 50 } } 
                }
            ]
        },

        // ==========================================
        // [Generic] 通用調查
        // ==========================================
        {
            type: 'investigate', 
            id: 'mys_inv_generic_1',
            text: { zh: [ 
                "你繼續在{noun_location_room}搜索。",
                "雖然沒有發現決定性的證據，但你感覺自己離真相越來越近了。",
                "這裡的{noun_env_feature}似乎有人移動過的痕跡。" 
            ]},
            options: [{ label: "記錄下來，繼續搜查", action: "advance_chain" }]
        },
        {
            type: 'investigate', 
            id: 'mys_inv_generic_2',
            text: { zh: [ 
                "調查陷入了膠著。",
                "你重新審視了目前的線索，試圖找出遺漏的地方。",
                "或許該去問問其他人？" 
            ]},
            options: [{ label: "換個角度思考", action: "advance_chain", rewards: { varOps: [{key:'energy', val:5, op:'-'}] } }] // 注意：這裡原本扣 MP，我幫你改成扣 energy
        },
        {
            type: 'investigate', 
            id: 'mys_inv_generic_witness',
            text: { zh: [ 
                "一位{noun_npc_generic}怯生生地走了過來。",
                "「那個...我當時好像看到了一個人影往{noun_location_room}跑去。」",
                "這條證詞或許能佐證你的推論。" 
            ]},
            options: [{ label: "感謝情報", action: "advance_chain" }]
        },

        // ==========================================
        // [Deduction] 最終推理 (含保底機制)
        // ==========================================
        {
            type: 'deduction', 
            id: 'mys_final_logic',
            text: { zh: [ "所有的碎片都已經拼湊完成。面對在場的眾人，你{atom_manner}走到了大廳中央。", "現在，是時候指出那個隱藏在幕後的真兇了。" ]},
            options: [
                { 
                    label: "兇手是 {suspect_A}！", 
                    condition: { tags: ['truth_A', 'evidence_got_A'] }, 
                    action: "finish_chain", 
                    nextScene: { text: "你亮出了鐵證，{suspect_A}崩潰認罪。\n【結局：真相大白】", rewards: { exp: 500, title: "名偵探" } } 
                },
                { 
                    label: "兇手是 {suspect_B}！", 
                    condition: { tags: ['truth_B', 'evidence_got_B'] }, 
                    action: "finish_chain", 
                    nextScene: { text: "你亮出了鐵證，{suspect_B}無話可說。\n【結局：正義執行】", rewards: { exp: 500, title: "名偵探" } } 
                },
                { 
                    label: "我...還不確定 (證據不足)", 
                    action: "finish_chain", 
                    nextScene: { text: "你猶豫了。就在這瞬間，真兇製造混亂逃跑了。\n【結局：懸案】", rewards: { exp: 50 } } 
                }
            ]
        }
    );

    console.log("🕵️‍♂️ 偵探劇本已載入");
})();