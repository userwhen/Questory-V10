/* js/story_data/story_data_core.js */
(function() {
    // 1. 初始化容器
    window.FragmentDB = window.FragmentDB || {
        fragments: {}, 
        templates: [] 
    };
    const DB = window.FragmentDB;

    // 2. 放入基礎詞彙
    // ❌ 錯誤寫法: Object.assign(DB.fragments: {
    // ✅ 正確寫法: Object.assign(DB.fragments, {  <--- 注意這裡是逗號
    Object.assign(DB.fragments, {
    // ============================================================
    // [Layer 0] 基底元素
    // ============================================================
    
    // 0-1. 物品材質與狀態
    base_mat_metal: [ { val: "黃銅" }, { val: "白銀" }, { val: "生鏽的鐵" }, { val: "漆黑的鋼" } ],
    base_mat_organic: [ { val: "皮革" }, { val: "象牙" }, { val: "不知名的骨頭" }, { val: "染血的布料" } ],
    base_state_bad: [ { val: "破碎的" }, { val: "積滿灰塵的" }, { val: "變形的" }, { val: "散發惡臭的" } ],
    base_state_good: [ { val: "精緻的" }, { val: "散發微光的" }, { val: "鑲嵌寶石的" }, { val: "保存完好的" } ],

    // 0-2. 物品本體
    base_item_tool: [ { val: "懷錶" }, { val: "提燈" }, { val: "指南針" }, { val: "打火機" } ],
    base_item_doc: [ { val: "日記本" }, { val: "契約書" }, { val: "泛黃信紙" }, { val: "舊照片" } ],
    base_item_key: [ { val: "鑰匙" }, { val: "徽章" }, { val: "戒指" }, { val: "護身符" } ],
    base_item_weapon: [ { val: "匕首" }, { val: "手斧" }, { val: "拆信刀" } ],

    // 0-3. 環境細節
    base_env_light: [ { val: "微弱的燭光" }, { val: "刺眼的閃電" }, { val: "冷冽的月光" }, { val: "忽明忽暗的燈光" } ],
    base_env_sound: [ { val: "水滴聲" }, { val: "風聲" }, { val: "老鼠的吱吱聲" }, { val: "沈悶的腳步聲" } ],
    base_env_smell: [ { val: "霉味" }, { val: "鐵鏽味" }, { val: "燒焦味" }, { val: "淡淡的香水味" } ],

    // 0-4. 角色特徵
    base_npc_trait: [ { val: "眼神銳利的" }, { val: "神色慌張的" }, { val: "面無表情的" }, { val: "滿身酒氣的" } ],
    base_npc_id: [ { val: "老人" }, { val: "年輕女子" }, { val: "流浪漢" }, { val: "穿著制服的男人" } ],

    // ============================================================
    // [Layer 1] 組合層
    // ============================================================

    noun_item_common: [
        { val: "{base_mat_metal}製的{base_item_tool}" },    
        { val: "{base_state_bad}{base_item_tool}" },        
        { val: "{base_mat_organic}製成的{base_item_doc}" }, 
        { val: "{base_state_good}{base_item_key}" },        
        { val: "刻有名字的{base_item_tool}" }
    ],
    
    noun_item_weapon: [
        { val: "{base_state_bad}{base_item_weapon}" },      
        { val: "{base_mat_metal}打造的{base_item_weapon}" }, 
        { val: "沾有血跡的{base_item_weapon}" }
    ],

    adj_env_vibe: [
        { val: "空氣中瀰漫著{base_env_smell}" },            
        { val: "遠處不時傳來{base_env_sound}" },            
        { val: "在{base_env_light}的照耀下顯得格外詭異" },   
        { val: "安靜得令人窒息" }
    ],

    noun_npc_generic: [
        { val: "一位{base_npc_trait}{base_npc_id}" },       
        { val: "躲在陰影中的{base_npc_id}" },
        { val: "似乎受了傷的{base_npc_id}" }
    ],

    // ============================================================
    // [Layer 2] 句型層
    // ============================================================

    pattern_found_item: [
        { val: "你發現了{noun_item_common}。" },
        { val: "在角落裡，你撿到了一個{noun_item_common}。" },
        { val: "你的腳邊踢到了什麼，仔細一看，是{noun_item_common}。" },
        { val: "{noun_item_common}！它就這樣被隨意丟棄在這裡。" }
    ],

    pattern_look_around: [
        { val: "你環顧四周，{adj_env_vibe}。" },
        { val: "這裡{adj_env_vibe}，讓你本能地感到不安。" },
        { val: "四周一片死寂，只有{base_env_sound}迴盪在耳邊。" }
    ],

    pattern_enemy_appear: [
        { val: "突然，一隻{noun_role_monster}從陰影中竄了出來！" },
        { val: "你感覺到背後有動靜，猛然回頭，發現了{noun_role_monster}。" },
        { val: "{noun_role_monster}擋住了你的去路，它發出了低沈的嘶吼。" }
    ],

    // ============================================================
    // [Layer 3] 保留區
    // ============================================================

    noun_role_job: [ { val: "私家偵探" }, { val: "刑警隊長" }, { val: "探險家" } ],
    noun_role_monster: [ { val: "變異野狼" }, { val: "古代守衛" }, { val: "失控的機械人偶" }, { val: "嗜血蝙蝠" } ],
    
    noun_location_room: [ { val: "大廳" }, { val: "地下室" }, { val: "圖書館" }, { val: "手術室" } ],
    noun_location_building: [ { val: "深山別墅" }, { val: "廢棄醫院" }, { val: "豪華郵輪" }, { val: "古老教堂" } ],
    noun_env_feature: [ { val: "角落的陰影" }, { val: "地面的塵埃" }, { val: "破碎的窗戶" } ],
    
    adv_manner: [ { val: "小心翼翼地" }, { val: "猶豫不決地" }, { val: "大膽地" }, { val: "顫抖著" } ],
    adv_time: [ { val: "突然" }, { val: "隱約" }, { val: "毫無預警地" } ],
    verb_contact: [ { val: "觸碰" }, { val: "拾起" }, { val: "檢查" } ],
    verb_detect: [ { val: "聽見" }, { val: "嗅到" }, { val: "感覺到" } ],

    detective: [ { val: "私家偵探" }, { val: "刑警" } ],
    victim: [ { val: "珠寶大亨" }, { val: "年輕寡婦" }, { val: "銀行家" } ],
    suspect_A: [ { val: "女僕" }, { val: "園丁" } ], 
    suspect_B: [ { val: "管家" }, { val: "姪子" } ],
    survivor: [ { val: "愛麗絲" }, { val: "里昂" } ],
    lover: [ { val: "青梅竹馬" }, { val: "神秘轉學生" } ], 
    rival: [ { val: "學生會長" }, { val: "高傲的貴族" } ],
    trainee: [ { val: "孤兒少女" }, { val: "新人歌手" }, { val: "受傷的幼龍" } ],
    adj_npc_trait: [ { val: "{base_npc_trait}" } ],
    adj_item_look: [{ val: "{base_state_bad}" },{ val: "{base_state_good}" }],
    noun_item_record: [ { val: "{base_item_doc}" } ],
    verb_move_univ: [{ val: "緩慢爬行" },{ val: "瘋狂逼近" },{ val: "在陰影中蠕動" },{ val: "悄悄靠近" }]
    
    }); // 結束 Object.assign

    console.log("✅ 核心資料庫與基礎詞彙已啟動");
})();