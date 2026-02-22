/* js/story_data/story_data_core.js (V4 極致脫水與環境補完版) */
(function() {
    window.FragmentDB = window.FragmentDB || { fragments: {}, templates: [] };
    const DB = window.FragmentDB;

    Object.assign(DB.fragments, {
    // ============================================================
    // 🧱 [Layer 0] 原子詞彙 (Atomic Words) - 完全脫水，不帶「的」
    // ============================================================
    
    // 👤 人物/生物基礎
    atom_person: [ { val: "男子" }, { val: "女子" }, { val: "老人" }, { val: "小孩" }, { val: "人影" } ],
    atom_title: [ { val: "大亨" }, { val: "守衛" }, { val: "管家" }, { val: "寡婦" }, { val: "偵探" }, { val: "會長" }, { val: "貴族" } ],
    atom_monster: [ { val: "野狼" }, { val: "機械人偶" }, { val: "蝙蝠" }, { val: "史萊姆" }, { val: "怨靈" } ],
    
    // 🏷️ 人物/生物修飾 (脫水版)
    atom_age: [ {val:""},{ val: "年輕" }, { val: "年邁" }, { val: "稚嫩" } ],
    atom_status: [ {val:""},{ val: "制服" }, { val: "失控" }, { val: "神祕" }, { val: "古代" }, { val: "重傷" }, { val: "落魄" } ],
    atom_domain: [ {val:""},{ val: "珠寶" }, { val: "石油" }, { val: "科技" }, { val: "魔法" }, { val: "地下" } ],
	atom_manner: [ {val:""},{ val: "驚恐" }, { val: "奮不顧身" }, { val: "張牙舞爪" }, { val: "冷靜" }, { val: "興奮" } ],

    // ⚔️ 物品基礎 (脫水版)
    atom_mat: [ {val:""},{ val: "黃銅" }, { val: "純銀" }, { val: "生鏽" }, { val: "皮革" }, { val: "骨製" } ],
    atom_item_state: [ {val:""},{ val: "破碎" }, { val: "染血" }, { val: "精緻" }, { val: "發光" }, { val: "陳舊" } ],
    atom_item_name: [ { val: "懷錶" }, { val: "提燈" }, { val: "鑰匙" }, { val: "日記本" }, { val: "匕首" }, { val: "手斧" } ],

    // ✋ 互動動詞
    verb_equip: [ { val: "把玩著" }, { val: "緊握著" }, { val: "攜帶著" }, { val: "凝視著" }, { val: "隱藏著" } ],

    // 🏰 [新增] 地點與建築 (脫水版)
    atom_building: [ { val: "別墅" }, { val: "醫院" }, { val: "郵輪" }, { val: "教堂" }, { val: "學院" }, { val: "莊園" } ],
    atom_room: [ { val: "大廳" }, { val: "地下室" }, { val: "圖書館" }, { val: "手術室" }, { val: "宴會廳" }, { val: "走廊" } ],
    atom_env_adj: [ {val:""},{ val: "廢棄" }, { val: "豪華" }, { val: "古老" }, { val: "陰暗" }, { val: "血跡斑斑" } ], // 這裡保留的，因為修飾建築用

    // 🌬️ [新增] 環境與感官細節
    atom_light: [ { val: "燭光" }, { val: "閃電" }, { val: "月光" }, { val: "霓虹燈" }, { val: "火光" } ],
    atom_sound: [ { val: "水滴聲" }, { val: "急促的腳步聲" }, { val: "老鼠的吱吱聲" }, { val: "詭異的低語" } ],
    atom_smell: [ { val: "霉味" }, { val: "鐵鏽味" }, { val: "濃烈的血腥味" }, { val: "廉價香水味" } ],
    atom_feature: [ { val: "角落" }, { val: "天花板" }, { val: "地板縫隙" }, { val: "破碎的窗戶" }, { val: "帷幕後方" } ],
	atom_time: [ { val: "瞬間" }, { val: "緩慢" }, { val: "一時" }, { val: "片刻" }, { val: "漸漸" } ],
	atom_weather: [ { val: "狂風" }, { val: "暖風" }, { val: "豔陽" }, { val: "風雪" }, { val: "悶熱" } ],

    // ============================================================
    // 🧬 [Layer 1] 分子組合層 (Composite Words) - 拼裝脫水詞彙
    // ============================================================

    // 🏰 組合地點 (例：廢棄的 + 醫院)
    combo_building: [ { val: "{atom_env_adj}{atom_building}" } ],
    combo_room: [ { val: "{atom_env_adj}{atom_room}" } ],
    combo_feature: [ { val: "{atom_env_adj}{atom_feature}" } ],

    // ⚔️ 組合物品 (例：皮革 + 懷錶 = 皮革懷錶 -> 完美避開「的」)
    combo_item: [
        { val: "{atom_mat}{atom_item_name}" },       // 黃銅懷錶, 生鏽手斧
        { val: "{atom_item_state}{atom_item_name}" } // 染血匕首, 破碎日記本
    ],

    // 👤 組合人物/怪物 (例：制服 + 男子 = 制服男子)
    combo_person_basic: [
        { val: "{atom_age}{atom_person}" },       // 年輕女子
        { val: "{atom_status}{atom_person}" },    // 制服男子, 重傷老人
        { val: "{atom_status}{atom_monster}" },   // 失控機械人偶
    ],
    
    combo_person_titled: [
        { val: "{atom_domain}{atom_title}" },     // 石油大亨, 魔法守衛
        { val: "{atom_status}{atom_title}" },     // 古代貴族, 落魄偵探
    ],

    // ============================================================
    // 🌟 [Layer 2] 複雜句型層 (消除疊加的「的」)
    // ============================================================
    
    // 目標 A：穿帶著{物品}的{人物} 
    // 結果：把玩著皮革懷錶的制服男子 (只有1個「的」，非常通順！)
    combo_person_with_item: [
        { val: "{verb_equip}{combo_item}的{combo_person_basic}" },
        { val: "{verb_equip}{combo_item}的{combo_person_titled}" }
    ],

    // 目標 B：具有{頭銜/職位}的{人物} 
    // 結果：身為石油大亨的年輕女子
    combo_person_with_title: [
        { val: "身為{combo_person_titled}的{combo_person_basic}" }
    ],

    // 組合環境氣氛
    sentence_env_vibe: [
        { val: "空氣中瀰漫著{atom_smell}" },
        { val: "遠處不時傳來{atom_sound}" },
        { val: "在微弱的{atom_light}照耀下顯得格外詭異" }
    ],

    // ============================================================
    // 📦 [Layer 3] 統整匯出池 (Global Pools)
    // ============================================================
    
    noun_npc: [
        { val: "{combo_person_basic}" },       // 年輕女子
        { val: "{combo_person_titled}" },      // 石油大亨
        { val: "{combo_person_with_item}" },   // 緊握著染血匕首的管家
        { val: "{combo_person_with_title}" }   // 身為古代貴族的失控男子
    ],

    noun_monster: [
        { val: "{combo_person_basic}" } 
    ],

    // ============================================================
    // 🔗 [Layer 4] 舊版劇本相容性轉接層 (Backward Compatibility)
    // ============================================================
    
    // 【人物轉接】
    base_npc_id: [ { val: "{noun_npc}" } ], 
    noun_npc_generic: [ { val: "{noun_npc}" } ],
    adj_npc_trait: [ { val: "看起來" }, { val: "神情緊張的" }, { val: "" } ],

    // 【場景與環境轉接】
    noun_location_building: [ { val: "{combo_building}" } ],
    noun_location_room: [ { val: "{combo_room}" } ],
    noun_env_feature: [ { val: "{combo_feature}" }, { val: "{atom_feature}" } ],
    
    // 【環境氛圍轉接】
    adj_env_vibe: [ 
        { val: "瀰漫著{atom_smell}的" }, 
        { val: "被{atom_light}籠罩的" },
        { val: "死寂得令人發毛的" }
    ],

    // 【物品轉接】
    noun_item_common: [ { val: "{combo_item}" } ],
    noun_item_weapon: [ { val: "{combo_item}" } ],
    noun_item_record: [ { val: "神秘日記本" }, { val: "染血合約" } ],
    adj_item_look: [ { val: "破舊的" }, { val: "詭異的" } ], // 舊版修飾語

    // 【感官轉接】
    base_env_sound: [ { val: "{atom_sound}" } ],
    base_env_light: [ { val: "{atom_light}" } ],
    pattern_look_around: [
        { val: "你環顧四周，這裡{sentence_env_vibe}。" },
        { val: "四周一片死寂，只有{atom_sound}迴盪著。" }
    ],
    pattern_enemy_appear: [
        { val: "突然，一隻{noun_monster}從{atom_feature}竄了出來！" }
    ],

    // 【演員記憶專用】
    detective: [ { val: "{noun_npc}" } ],
    victim: [ { val: "{noun_npc}" } ],
    suspect_A: [ { val: "{noun_npc}" } ], 
    suspect_B: [ { val: "{noun_npc}" } ],
    survivor: [ { val: "{noun_npc}" } ],
    lover: [ { val: "{noun_npc}" } ], 
    rival: [ { val: "{noun_npc}" } ],
    trainee: [ { val: "{noun_npc}" } ],
    
    }); 

    console.log("✅ 核心資料庫與基礎詞彙已啟動 (V4 極致脫水與環境補完版)");
})();