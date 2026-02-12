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
        {
            type: 'setup', 
            id: 'mys_start_route_A',
            text: { zh: [ "雷雨交加的夜晚，{noun_location_building}被封鎖了。{victim}倒在{noun_location_room}中央。", "在場只有兩個人有嫌疑：{adj_npc_trait}{suspect_A}，以及{adj_npc_trait}{suspect_B}。", "雖然表面平靜，但你注意到{suspect_A}的眼神有些閃爍，似乎在隱藏什麼。" ]},
            slots: ['noun_location_building', 'noun_location_room', 'victim', 'suspect_A', 'suspect_B', 'adj_npc_trait'],
            options: [{ label: "封鎖現場，開始調查", action: "advance_chain", rewards: { tags: ['truth_A', 'case_started'] } }]
        },
        {
            type: 'setup', 
            id: 'mys_start_route_B',
            text: { zh: [ "雷雨交加的夜晚，{noun_location_building}被封鎖了。{victim}倒在{noun_location_room}中央。", "在場只有兩個人有嫌疑：{adj_npc_trait}{suspect_A}，以及{adj_npc_trait}{suspect_B}。", "雖然表面平靜，但你注意到{suspect_B}的手在微微顫抖，似乎非常緊張。" ]},
            slots: ['noun_location_building', 'noun_location_room', 'victim', 'suspect_A', 'suspect_B', 'adj_npc_trait'],
            options: [{ label: "封鎖現場，開始調查", action: "advance_chain", rewards: { tags: ['truth_B', 'case_started'] } }]
        },
        {
            type: 'investigate', 
            id: 'mys_clue_for_A', 
            reqTag: 'truth_A',
            text: { zh: [ "你來到{noun_location_room}的角落，{verb_contact}了一個被藏起來的{noun_item_common}。", "仔細檢查後，你發現上面刻著{suspect_A}的名字，而且還沾著些許{adj_item_look}痕跡！", "這無疑是{suspect_A}犯案的關鍵證據。" ]},
            slots: ['noun_location_room', 'verb_contact', 'noun_item_common', 'suspect_A', 'adj_item_look'],
            options: [{ label: "收好這份關鍵證據", action: "advance_chain", rewards: { tags: ['evidence_got_A'], varOps: [{key:'clue', val:1, op:'+'}] } }]
        },
        {
            type: 'investigate', 
            id: 'mys_clue_for_B', 
            reqTag: 'truth_B',
            text: { zh: [ "你在沙發縫隙中{verb_detect}一股異味，隨後找到了一把{noun_item_weapon}。", "這東西屬於{suspect_B}，且表面{adj_item_look}。為什麼它會出現在這裡？", "所有的線索都指向了{suspect_B}。" ]},
            slots: ['verb_detect', 'noun_item_weapon', 'suspect_B', 'adj_item_look'],
            options: [{ label: "這就是鐵證", action: "advance_chain", rewards: { tags: ['evidence_got_B'], varOps: [{key:'clue', val:1, op:'+'}] } }]
        },
        {
            type: 'twist', 
            id: 'mys_twist_event',
            text: { zh: [ "就在調查進行到一半時，{noun_location_building}的燈光{adv_time}熄滅了！", "黑暗中傳來了玻璃破碎的聲音和{noun_npc_generic}的尖叫聲。", "當燈光再次亮起，你發現現場被破壞了，有人試圖掩蓋真相。" ]},
            slots: ['noun_location_building', 'adv_time', 'noun_npc_generic'],
            options: [{ label: "鎮定眾人，準備推理", action: "advance_chain" }]
        },
        {
            type: 'deduction', 
            id: 'mys_final_logic',
            text: { zh: [ "所有的碎片都已經拼湊完成。面對在場的眾人，你{adv_manner}走到了大廳中央。", "現在，是時候指出那個隱藏在幕後的真兇了。" ]},
            slots: ['adv_manner'],
            options: [
                { label: "兇手是 {suspect_A}！", condition: { tags: ['truth_A', 'evidence_got_A'] }, action: "finish_chain", nextScene: { text: "「不...怎麼可能被發現...」{suspect_A}崩潰地跪倒在地，承認了罪行。\n你成功還原了真相。", rewards: { exp: 500, title: "名偵探" } } },
                { label: "兇手是 {suspect_B}！", condition: { tags: ['truth_B', 'evidence_got_B'] }, action: "finish_chain", nextScene: { text: "{suspect_B}冷笑了一聲，試圖反駁，但在你的鐵證面前，他無話可說。\n正義得到了伸張。", rewards: { exp: 500, title: "名偵探" } } },
                { label: "我...還不確定...", action: "finish_chain", nextScene: { text: "你猶豫了。就在這瞬間，真兇抓住了機會製造混亂逃跑了。\n雖然無人再受傷，但真相永遠石沈大海。", rewards: { exp: 50 } } }
            ]
        },
		{
            type: 'setup', 
            id: 'mys_start_noir',
            // 【口味設定】只有被標記為 'theme_noir' (嚴肅風格) 時才會抽到
            reqTag: 'theme_noir', 
            text: { zh: [ 
                "大雨滂沱的夜晚，{noun_location_building}發生命案。",
                "死者是{victim}，死因不明。現場只有兩個嫌疑人：{suspect_A}與{suspect_B}。",
                "直覺告訴你，這不是一起簡單的案件，因為現場遺留了一個「上鎖的保險箱」。" 
            ]},
            slots: ['noun_location_building', 'victim', 'suspect_A', 'suspect_B'],
            options: [
                { 
                    label: "接手調查 (進入困難解謎)", 
                    action: "advance_chain", 
                    // 【關鍵】同時給予「真相A」和「需要解謎」的標籤
                    rewards: { tags: ['truth_A', 'case_started', 'exp_puzzle'] } 
                }
            ]
        },

        // ==========================================
        // 2. [Investigate] 調查：設下門檻 (The Lock)
        // ==========================================
        
        // ❌ 情況 A：玩家還沒有鑰匙 (卡關狀態)
        // 玩家會一直抽到這張卡，直到他去通用碎片撿到鑰匙為止
        {
            type: 'investigate', 
            id: 'mys_clue_locked',
            reqTag: 'truth_A',
            // 【邏輯】只有在「沒有鑰匙」的時候才會出現
            noTag: 'has_safe_key', 
            text: { zh: [ 
                "你找到了那個關鍵的保險箱，裡面肯定鎖著指認{suspect_A}的證據。",
                "但是保險箱鎖得很死，你嘗試了各種密碼都打不開。",
                "「該死...鑰匙一定就在這棟房子的某個角落。」" 
            ]},
            slots: ['suspect_A'],
            options: [
                { 
                    label: "去別的地方找找鑰匙 (進入通用碎片)", 
                    action: "advance_chain",
                    // 這裡不給證據，強迫玩家繼續再跑一輪
                }
            ]
        },

        // ✅ 情況 B：玩家已經拿到鑰匙 (解謎成功)
        {
            type: 'investigate', 
            id: 'mys_clue_unlocked',
            reqTag: 'truth_A',
            // 【邏輯】必須持有 'has_safe_key' 標籤才能觸發
            conditions: { "has_safe_key": true }, 
            text: { zh: [ 
                "你拿出了剛才找到的銹蝕鑰匙，插入保險箱的鎖孔。",
                "「喀嚓」一聲，櫃門開了！",
                "裡面是一把沾血的{noun_item_weapon}，上面刻著{suspect_A}的名字！" 
            ]},
            slots: ['noun_item_weapon', 'suspect_A'],
            options: [
                { 
                    label: "拿到鐵證了！", 
                    action: "advance_chain", 
                    // 【獎勵】終於拿到指認兇手的證據
                    rewards: { tags: ['evidence_got_A'], varOps: [{key:'clue', val:1, op:'+'}] } 
                }
            ]
        },

        // ==========================================
        // 3. [Universal Filler] 通用碎片：放置鑰匙 (The Key)
        // ==========================================
        // 這些通常放在 data_piece.js，但我寫在這裡方便你看邏輯
        {
            type: 'univ_filler',
            id: 'uni_find_key',
            // 【邏輯】只有在「需要解謎」且「還沒拿到鑰匙」時才會出現
            conditions: { "exp_puzzle": true, "has_safe_key": false },
            weight: 100, // 權重設高一點，讓玩家容易撿到
            text: { zh: [ 
                "你在走廊的{noun_env_feature}下面發現了一個閃閃發光的東西。",
                "撿起來一看，是一把造型古老的鑰匙！",
                "這該不會就是那個保險箱的鑰匙吧？" 
            ]},
            slots: ['noun_env_feature'],
            options: [
                { 
                    label: "收下鑰匙", 
                    action: "advance_chain", 
                    // 【獎勵】獲得鑰匙標籤
                    rewards: { tags: ['has_safe_key', 'found_something'] } 
                }
            ]
        },

        // ==========================================
        // 4. [Twist] & [Deduction] (維持原樣)
        // ==========================================
        {
            type: 'twist', 
            id: 'mys_twist_noir',
            reqTag: 'theme_noir',
            text: { zh: ["突然，燈光熄滅了... (省略)"] },
            options: [{ label: "保持鎮定", action: "advance_chain" }]
        },
        {
            type: 'deduction', 
            id: 'mys_final_noir',
            reqTag: 'theme_noir',
            text: { zh: ["真相大白。你指著犯人說..."] },
            options: [
                { 
                    label: "兇手是 {suspect_A}", 
                    // 【邏輯】必須要有證據才能選，否則按鈕會隱藏或失效
                    condition: { tags: ['truth_A', 'evidence_got_A'] }, 
                    action: "finish_chain", 
                    nextScene: { text: "你亮出了保險箱裡的血衣，{suspect_A}無話可說。" } 
                },
                { 
                    label: "證據不足... (Bad End)", 
                    action: "finish_chain", 
                    nextScene: { text: "因為沒能打開保險箱，你無法定罪，兇手逍遙法外。" } 
                }
            ]
        },
		{
    type: 'investigate', 
    id: 'mys_inv_generic_1',
    // 不設 reqTag，代表任何路線都能抽到
    text: { zh: [ 
        "你繼續在{noun_location_room}搜索。",
        "雖然沒有發現決定性的證據，但你感覺自己離真相越來越近了。",
        "這裡的{noun_env_feature}似乎有人移動過的痕跡。" 
    ]},
    slots: ['noun_location_room', 'noun_env_feature'],
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
    options: [{ label: "換個角度思考", action: "advance_chain", rewards: { varOps: [{key:'mp', val:5, op:'-'}] } }]
},

{
    type: 'investigate', 
    id: 'mys_inv_generic_witness',
    text: { zh: [ 
        "一位{base_npc_id}怯生生地走了過來。",
        "「那個...我當時好像看到了一個人影往{noun_location_room}跑去。」",
        "這條證詞或許能佐證你的推論。" 
    ]},
    slots: ['base_npc_id', 'noun_location_room'],
    options: [{ label: "感謝情報", action: "advance_chain" }]
},

// ==========================================
// [修正] 結局階段 (Deduction) - 確保有「混淆按鈕」
// ==========================================
{
    type: 'deduction', 
    id: 'mys_final_logic',
    text: { zh: [ "所有的碎片都已經拼湊完成。面對在場的眾人，你{adv_manner}走到了大廳中央。", "現在，是時候指出那個隱藏在幕後的真兇了。" ]},
    slots: ['adv_manner'],
    options: [
        // 選項 A：只有拿到證據A才能選
        { 
            label: "兇手是 {suspect_A}！", 
            condition: { tags: ['truth_A', 'evidence_got_A'] }, // 引擎修好後，這行就會生效
            action: "finish_chain", 
            nextScene: { text: "你亮出了鐵證，{suspect_A}崩潰認罪。\n(結局：真相大白)", rewards: { exp: 500, title: "名偵探" } } 
        },
        
        // 選項 B：只有拿到證據B才能選
        { 
            label: "兇手是 {suspect_B}！", 
            condition: { tags: ['truth_B', 'evidence_got_B'] }, 
            action: "finish_chain", 
            nextScene: { text: "你亮出了鐵證，{suspect_B}無話可說。\n(結局：正義執行)", rewards: { exp: 500, title: "名偵探" } } 
        },

        // 選項 C：混淆/失敗按鈕 (永遠顯示，作為保底)
        { 
            label: "我...還不確定 (證據不足)", 
            // 不設 condition，或者設為 always true
            action: "finish_chain", 
            nextScene: { text: "你猶豫了。就在這瞬間，真兇製造混亂逃跑了。\n(結局：懸案)", rewards: { exp: 50 } } 
        }
    ]
},
    );

    console.log("🕵️‍♂️ 偵探劇本已載入");
})();