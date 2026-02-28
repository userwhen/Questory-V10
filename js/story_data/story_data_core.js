/* js/story_data/story_data_core.js (V4 極致脫水與環境補完版) */
(function() {
    window.FragmentDB = window.FragmentDB || { fragments: {}, templates: [] };
    const DB = window.FragmentDB;

    Object.assign(DB.fragments, {
	// ============================================================
    // 🧱 [Layer 0] 語法化原子詞彙與動態種子庫 (V5 終極整合版)
    // ============================================================
        // 🌟【1. 動態種子庫 (Dynamic Seeds)】- 供 story_generator.js 引擎開局抽取
        // ------------------------------------------------------------
        global_player_trait: [
            { val: "幸運的", tag: "trait_lucky" }, { val: "倒楣的", tag: "trait_unlucky" },
            { val: "富有的", tag: "trait_rich" }, { val: "貧窮的", tag: "trait_poor" },
            { val: "直覺敏銳的", tag: "trait_sharp" }
        ],
        global_world_vibe: [
            { val: "戰亂", tag: "war" }, { val: "和平", tag: "peace" },
            { val: "魔法復甦", tag: "magic" }, { val: "古老文明", tag: "ancient" }
        ],
        env_weather: [ 
            { val: "暴風雨", tag: "env_storm" }, { val: "濃霧瀰漫", tag: "env_fog" }, 
            { val: "狂風大作", tag: "env_wind" }, { val: "伸手不見五指的深夜", tag: "env_dark" },
            { val: "雷雨交加", tag: "env_storm" }, { val: "細雨綿綿", tag: "env_rain" },
            { val: "風雪交加", tag: "env_snow" }, { val: "悶熱的午後", tag: "env_hot" }
        ],
        env_atmosphere: [ 
            { val: "詭異的", tag: "vibe_creepy" }, { val: "悲傷的", tag: "vibe_sad" }, 
            { val: "充滿敵意的", tag: "vibe_hostile" }, { val: "死寂的", tag: "vibe_silent" }
        ],
        mystery_motive: [ 
            { val: "遺產爭奪", tag: "motive_money" }, { val: "情殺", tag: "motive_love" }, 
            { val: "復仇", tag: "motive_revenge" }, { val: "掩蓋秘密", tag: "motive_secret" }
        ],
        horror_curse_type: [ 
            { val: "古代詛咒", tag: "curse_ancient" }, { val: "怨靈附身", tag: "curse_ghost" }, 
            { val: "未知生物變異", tag: "curse_mutant" }, { val: "邪神低語", tag: "curse_god" }
        ],
        adventure_world_state: [ 
            { val: "戰亂", tag: "world_war" }, { val: "魔物肆虐", tag: "world_monster" }, 
            { val: "和平但腐敗", tag: "world_corrupt" } 
        ],
        adventure_start_bonus: [ 
            { val: "神聖的", tag: "bonus_holy" }, { val: "被詛咒的", tag: "bonus_cursed" }, 
            { val: "生鏽的", tag: "bonus_rusty" } 
        ],
        romance_meet_location: [
            { val: "轉角處", tag: "meet_corner" }, { val: "圖書館", tag: "meet_library" },
            { val: "雨中的屋簷下", tag: "meet_rain" }
        ],

        // 👤【2. 核心身份 (Core Identity)】- 句子的絕對主體，絕不疊加
        // ------------------------------------------------------------
        core_identity: [ 
            // 基礎人類 (civilian)
            { val: "男子", tag: ["human", "civilian"] }, { val: "女子", tag: ["human", "civilian"] }, 
            { val: "老人", tag: ["human", "civilian"] }, { val: "小孩", tag: ["human", "civilian"] }, 
            { val: "青年", tag: ["human", "civilian"] }, { val: "少女", tag: ["human", "civilian"] },
            { val: "壯漢", tag: ["human", "civilian"] }, { val: "婦人", tag: ["human", "civilian"] },
            { val: "村民", tag: ["human", "civilian"] }, { val: "僕從", tag: ["human", "civilian"] },
            { val: "路人", tag: ["human", "civilian"] }, { val: "陌生人", tag: ["human", "civilian"] },
            
            // 邊緣/特殊人類 (outcast / survivor)
            { val: "流浪者", tag: ["human", "outcast"] }, { val: "乞丐", tag: ["human", "outcast"] },
            { val: "囚犯", tag: ["human", "outcast"] }, { val: "逃亡者", tag: ["human", "outcast"] },
            { val: "傷者", tag: ["human", "survivor"] }, { val: "倖存者", tag: ["human", "survivor"] },
            { val: "生還者", tag: ["human", "survivor"] }, { val: "目擊者", tag: ["human", "mystery"] },
            { val: "無名者", tag: ["human", "mystery"] }, { val: "訪客", tag: ["human", "mystery"] },
            { val: "黑影", tag: ["human", "mystery", "horror"] }, { val: "身影", tag: ["human", "mystery"] },

            // 頭銜人類 (titled)
            { val: "大亨", tag: ["human", "mystery"] }, { val: "守衛", tag: ["human", "combat"] },
            { val: "管家", tag: ["human", "mystery", "romance"] }, { val: "寡婦", tag: ["human", "mystery"] },
            { val: "偵探", tag: ["human", "mystery"] }, { val: "會長", tag: ["human", "civilian"] },
            { val: "貴族", tag: ["human", "romance", "midage"] }, { val: "騎士", tag: ["human", "combat", "midage"] },
            { val: "王子", tag: ["human", "romance", "midage"] }, { val: "公主", tag: ["human", "romance", "midage"] },
            { val: "領主", tag: ["human", "midage"] }, { val: "祭司", tag: ["human", "magic"] },
            { val: "刺客", tag: ["human", "combat", "mystery"] }, { val: "傭兵", tag: ["human", "combat", "war"] },
            { val: "獵人", tag: ["human", "combat", "adventure"] }, { val: "法師", tag: ["human", "magic"] },
            { val: "術士", tag: ["human", "magic", "horror"] }, { val: "學者", tag: ["human", "mystery"] },
            { val: "醫生", tag: ["human", "mystery"] }, { val: "將軍", tag: ["human", "war"] },
            { val: "間諜", tag: ["human", "mystery", "war"] }, { val: "叛徒", tag: ["human", "mystery"] },
            { val: "賢者", tag: ["human", "magic"] }, { val: "占卜師", tag: ["human", "magic", "mystery"] },

            // 怪物與異變體 (monster)
            { val: "野狼", tag: ["monster", "beast"] }, { val: "蝙蝠", tag: ["monster", "beast"] },
            { val: "巨狼", tag: ["monster", "beast"] }, { val: "魔狼", tag: ["monster", "beast", "magic"] },
            { val: "史萊姆", tag: ["monster", "adventure"] }, { val: "殭屍", tag: ["monster", "undead", "horror"] },
            { val: "骷髏", tag: ["monster", "undead"] }, { val: "食屍鬼", tag: ["monster", "undead", "horror"] },
            { val: "幽靈", tag: ["monster", "spirit", "horror"] }, { val: "怨靈", tag: ["monster", "spirit", "horror"] },
            { val: "惡靈", tag: ["monster", "spirit", "horror"] }, { val: "魔物", tag: ["monster", "adventure"] },
            { val: "異形", tag: ["monster", "horror", "sci-fi"] }, { val: "變異體", tag: ["monster", "horror"] },
            { val: "寄生獸", tag: ["monster", "horror"] }, { val: "觸手怪", tag: ["monster", "horror"] },
            { val: "石像鬼", tag: ["monster", "construct", "magic"] }, { val: "魔像", tag: ["monster", "construct", "magic"] },
            { val: "機械人偶", tag: ["monster", "construct"] }, { val: "傀儡", tag: ["monster", "construct"] },
            { val: "自動機兵", tag: ["monster", "construct", "war"] }, { val: "飛龍", tag: ["monster", "dragon", "adventure"] },
            { val: "魔龍", tag: ["monster", "dragon", "adventure"] }, { val: "吸血鬼", tag: ["monster", "undead", "horror"] },
            { val: "狼人", tag: ["monster", "beast", "horror"] }, { val: "夢魘", tag: ["monster", "spirit", "magic"] }
        ],

        // 🏷️【3. 實體前綴修飾 (Identity Modifier)】- 帶「的」，只能加在名詞前
        // ------------------------------------------------------------
        identity_modifier: [ 
            { val: "" }, { val: "年輕的" }, { val: "年邁的" }, { val: "稚嫩的" }, { val: "幼小的" }, 
            { val: "成熟的" }, { val: "蒼老的" }, { val: "古老的", tag: ["ancient"] }, 
            { val: "不朽的", tag: ["ancient"] }, { val: "新生的" },
            { val: "神祕的" }, { val: "落魄的" }, { val: "身穿制服的" }, { val: "腐敗的" },
            { val: "被遺忘的" }, { val: "異化的" }, { val: "來自王室的" }, { val: "來自地下的" },
            { val: "深海的" }, { val: "黑市的" }, { val: "禁忌的" }
        ],

        // 🎭【4. 實體狀態與特質副句 (State & Trait Clauses)】- 獨立句子，描述當下動作與氣息
        // ------------------------------------------------------------
        state_modifier: [ 
            { val: "身受重傷" }, { val: "陷入了沉睡" }, { val: "看起來十分虛弱" }, 
            { val: "顯得疲憊不堪" }, { val: "正處於失控的邊緣" }, { val: "神情充滿驚恐" }, 
            { val: "正冷靜地觀察著四周" }, { val: "渾身都在顫抖" }, { val: "眼神中充滿絕望" }, 
            { val: "正發出詭異的狂笑" }, { val: "處於高度警戒狀態" }, { val: "似乎受了驚嚇" },
            { val: "正張牙舞爪地示威" }, { val: "正發出低沉的咆哮" }, { val: "似乎正在徘徊尋找獵物" },
            { val: "正痛苦地掙扎著" }, { val: "眼中充滿著飢餓與渴望" }
        ],
        trait_clause: [ 
            { val: "渾身散發著墮落的氣息" }, { val: "似乎被某種古老的詛咒纏身" }, 
            { val: "身上帶著濃烈的血腥味" }, { val: "給人一種極度危險的壓迫感" }, 
            { val: "眼神空洞，彷彿失去了靈魂" }, { val: "身上佈滿了不明原因的變異痕跡" }, 
            { val: "嘴裡不斷唸叨著聽不懂的低語" }, { val: "似乎正在被某種力量侵蝕" }
        ],
        verb_equip: [ 
            { val: "把玩著" }, { val: "緊緊握著" }, { val: "隨身攜帶著" }, { val: "死死盯著" }, 
            { val: "小心隱藏著" }, { val: "正在檢查" }, { val: "輕輕撫摸著" }, { val: "高高舉起" },
            { val: "佩戴著" }, { val: "小心翼翼地收起" }
        ],

        // ⚔️【5. 物品組件 (Item Parts)】- 核心、物理狀態、能力副句
        // ------------------------------------------------------------
        item_core: [ 
            { val: "懷錶", tag: ["item"] }, { val: "提燈", tag: ["item"] }, { val: "鑰匙", tag: ["item"] }, 
            { val: "日記本", tag: ["item"] }, { val: "匕首", tag: ["item", "weapon"] }, { val: "手斧", tag: ["item", "weapon"] }, 
            { val: "戒指", tag: ["item"] }, { val: "項鍊", tag: ["item"] }, { val: "護符", tag: ["item"] }, 
            { val: "徽章", tag: ["item"] }, { val: "面具", tag: ["item"] }, { val: "卷軸", tag: ["item", "magic"] }, 
            { val: "書籍", tag: ["item"] }, { val: "信件", tag: ["item"] }, { val: "地圖", tag: ["item"] }, 
            { val: "羅盤", tag: ["item"] }, { val: "鏡子", tag: ["item"] }, { val: "藥瓶", tag: ["item"] }, 
            { val: "寶石", tag: ["item", "valuable"] }, { val: "箱子", tag: ["item"] }, { val: "鎖鏈", tag: ["item"] }, 
            { val: "鈴鐺", tag: ["item"] }, { val: "人偶", tag: ["item"] }, { val: "雕像", tag: ["item"] }, 
            { val: "頭骨", tag: ["item"] }, { val: "硬幣", tag: ["item", "valuable"] }, { val: "王冠", tag: ["item", "valuable"] }, 
            { val: "短劍", tag: ["item", "weapon"] }, { val: "長劍", tag: ["item", "weapon"] },
            { val: "機械零件", tag: ["item", "sci-fi"] }, { val: "不明祭品", tag: ["item", "horror"] }
        ],
        item_physical_state: [
            { val: "" }, { val: "黃銅製的" }, { val: "純銀的" }, { val: "生鏽的" }, 
            { val: "皮革製的" }, { val: "骨製的" }, { val: "黑鐵打造成的" }, { val: "水晶製的" },
            { val: "黑曜石的" }, { val: "破碎的" }, { val: "染血的" }, { val: "精緻的" }, 
            { val: "陳舊的" }, { val: "斑駁的" }, { val: "被嚴重腐蝕的" }, { val: "扭曲變形的" }, 
            { val: "燒焦的" }, { val: "冰冷的" }, { val: "溫熱的" }
        ],
        item_power_clause: [
            { val: "它似乎能封印靈魂" }, { val: "它似乎在吸收周圍的生命力" }, 
            { val: "表面散發著微弱的光芒" }, { val: "拿在手上會帶來一股刺骨的寒意" }, 
            { val: "它似乎在微微顫動，彷彿有生命一般" }, { val: "上面沾染著無法洗去的暗沉血跡" },
            { val: "它似乎隱藏著某個失落文明的秘密" }, { val: "它散發著不穩定的能量" },
            { val: "只要靠近，腦海中就會引發詭異的幻覺" }, { val: "它似乎在低鳴，回應著未知的呼喚" }
        ],

        // 🏰【6. 場景與環境 (Location & Environment)】
        // ------------------------------------------------------------
        env_building: [
            { val: "別墅", tag: ["location"] }, { val: "醫院", tag: ["location", "horror"] }, 
            { val: "郵輪", tag: ["location"] }, { val: "教堂", tag: ["location", "magic"] }, 
            { val: "學院", tag: ["location"] }, { val: "莊園", tag: ["location", "mystery"] }, 
            { val: "孤兒院", tag: ["location", "horror"] }, { val: "療養院", tag: ["location", "horror"] }, 
            { val: "監獄", tag: ["location"] }, { val: "燈塔", tag: ["location"] }, 
            { val: "旅館", tag: ["location"] }, { val: "酒吧", tag: ["location"] }, 
            { val: "劇院", tag: ["location"] }, { val: "博物館", tag: ["location"] }, 
            { val: "研究所", tag: ["location", "sci-fi"] }, { val: "工廠", tag: ["location"] }, 
            { val: "神殿", tag: ["location", "magic"] }, { val: "堡壘", tag: ["location", "war"] }, 
            { val: "塔樓", tag: ["location"] }
        ],
        env_room: [
            { val: "大廳", tag: ["room"] }, { val: "地下室", tag: ["room", "horror"] }, 
            { val: "圖書館", tag: ["room", "mystery"] }, { val: "手術室", tag: ["room", "horror"] }, 
            { val: "宴會廳", tag: ["room"] }, { val: "走廊", tag: ["room"] }, 
            { val: "臥室", tag: ["room"] }, { val: "書房", tag: ["room", "mystery"] }, 
            { val: "密室", tag: ["room", "mystery"] }, { val: "儲藏室", tag: ["room"] }, 
            { val: "牢房", tag: ["room"] }, { val: "閣樓", tag: ["room"] }, 
            { val: "浴室", tag: ["room"] }, { val: "控制室", tag: ["room"] }, 
            { val: "祭壇室", tag: ["room", "magic", "horror"] }, { val: "實驗室", tag: ["room", "sci-fi"] }
        ],
        env_adj: [ 
            { val: "" }, { val: "廢棄的" }, { val: "豪華的" }, { val: "古老的" }, 
            { val: "陰暗的" }, { val: "血跡斑斑的" }, { val: "破敗的" }, { val: "荒涼的" }, 
            { val: "死一般寂靜的" }, { val: "陰森的" }, { val: "封閉的" }, { val: "潮濕的" }, 
            { val: "腐朽的" }, { val: "神祕的" }, { val: "詭異的" } 
        ],
        env_feature: [ 
            { val: "陰暗的角落" }, { val: "發霉的天花板" }, { val: "地板的縫隙間" }, 
            { val: "破碎的窗戶旁" }, { val: "厚重的帷幕後方" }, { val: "濃密的陰影中" }, 
            { val: "斑駁的牆壁上" }, { val: "半掩的門後" }, { val: "昏暗的樓梯下方" }, 
            { val: "凌亂的桌面上" }, { val: "佈滿灰塵的鏡子裡" }, { val: "黑暗深處" } 
        ],

        // 🌬️【7. 感官與時間 (Senses & Time)】
        // ------------------------------------------------------------
        env_light: [ 
            { val: "微弱的燭光" }, { val: "刺眼的閃電" }, { val: "慘白的月光" }, 
            { val: "閃爍的霓虹燈" }, { val: "搖曳的火光" }, { val: "昏暗的燈光" }, 
            { val: "冰冷的白光" }, { val: "詭異的紅光" }, { val: "殘存的微光" } 
        ],
        env_sound: [ 
            { val: "滴答的水滴聲" }, { val: "急促的腳步聲" }, { val: "老鼠的吱吱聲" }, 
            { val: "詭異的低語" }, { val: "沉悶的敲擊聲" }, { val: "刺耳的摩擦聲" }, 
            { val: "沉重的金屬碰撞聲" }, { val: "痛苦的喘息聲" }, { val: "若有似無的哭聲" }, 
            { val: "令人發毛的笑聲" }, { val: "淒厲的尖叫聲" }, { val: "呼嘯的風聲" }, 
            { val: "拖拽鎖鏈的聲音" } 
        ],
        env_smell: [ 
            { val: "潮濕的霉味" }, { val: "刺鼻的鐵鏽味" }, { val: "濃烈的血腥味" }, 
            { val: "令人作嘔的腐臭味" }, { val: "刺鼻的焦味" }, { val: "淡淡的煙味" }, 
            { val: "濃郁的藥水味" }, { val: "肉體腐爛的氣味" }, { val: "厚重的灰塵味" } 
        ],
        atom_time: [ 
            { val: "瞬間" }, { val: "緩慢地" }, { val: "片刻後" }, { val: "漸漸地" }, 
            { val: "突然" }, { val: "不久後" }, { val: "隨後" }, { val: "此時此刻" }, 
            { val: "就在那一刻" }, { val: "與此同時" }, { val: "最終" } 
        ],
		// 🏃‍♂️ 動作副詞修飾
		atom_manner: [ 
			{ val: "驚恐地" }, { val: "奮不顧身地" }, { val: "張牙舞爪地" }, 
			{ val: "冷靜地" }, { val: "顫抖地" }, { val: "絕望地" }, 
			{ val: "麻木地" }, { val: "狂笑著" }, { val: "低聲" }, 
			{ val: "猛然" }, { val: "悄悄地" }, { val: "痛苦地" }, 
			{ val: "警戒地" }, { val: "緩慢地" }
		],

// ============================================================
    // 🧬 [Layer 1] 分子組合層 (Composite Words) - V5 語法化短句
    // ============================================================

    // 🏰 1. 組合地點與環境包 (Environment Packs)
    combo_location: [
        { val: "{env_adj}{env_building}的{env_room}" }, // 例：廢棄莊園的地下室
        { val: "{env_adj}{env_room}" }                  // 例：陰暗的走廊
    ],
    
    // 將氣氛拆解為「視覺包」與「聽/嗅覺包」，每次只抽一種，避免句子太長
    env_pack_visual: [
        { val: "在{env_light}的映照下，{env_feature}顯得格外詭異。" },
        { val: "{env_light}勉強照亮了四周，地上的影子隨著光線扭動。" },
        { val: "{env_feature}隱沒在黑暗中，讓人看不清虛實。" }
    ],
    env_pack_sensory: [
        { val: "空氣中瀰漫著{env_smell}，令人作嘔。" },
        { val: "四周死一般寂靜，只有{env_sound}在空間裡迴盪。" },
        { val: "遠處不時傳來{env_sound}，讓人毛骨悚然。" }
    ],

    // ⚔️ 2. 組合物品 (Item Combos) - 主幹 + 從句
    combo_item_simple: [
        { val: "{item_physical_state}{item_core}" } // 例：生鏽的匕首 (純名詞，用於撿起動作)
    ],
    combo_item_desc: [
        { val: "一個{item_physical_state}{item_core}，{item_power_clause}。" }, // 例：一個染血的戒指，它似乎能封印靈魂。
        { val: "一把{item_physical_state}{item_core}，拿在手上傳來異常的觸感。" }
    ],

    // 👤 3. 人物與怪物登場骨架 (Character Appearance) - 徹底解決堆疊災難
    combo_person_appearance: [
        // 骨架 A：簡單明瞭型 (前綴 + 主體)
        { val: "一名{identity_modifier}{core_identity}" },
        // 骨架 B：帶狀態型 (前綴 + 主體 + 狀態副句)
        { val: "一名{identity_modifier}{core_identity}，對方{state_modifier}。" },
        // 骨架 C：帶特質型 (主體 + 特質從句)
        { val: "一名{core_identity}，對方{trait_clause}。" },
        // 骨架 D：帶物品型
        { val: "一名{identity_modifier}{core_identity}，手中{verb_equip}一個{combo_item_simple}。" }
    ],

    // ============================================================
    // 🌟 [Layer 2] 複雜句型層 (Complex Sentences) - 用於事件觸發
    // ============================================================

    // ⚡ 事件突發句 (Sudden Events)
    sentence_event_sudden: [
        { val: "{atom_time}，{env_sound}突然響起，打破了平靜！" },
        { val: "毫無預兆地，{env_light}猛然熄滅，周圍陷入一片黑暗。" },
        { val: "你的直覺瘋狂示警，{env_feature}傳來了不尋常的動靜。" }
    ],

    // 👁️ 遭遇實體句 (Encounter)
    sentence_encounter: [
        { val: "一個黑影從{env_feature}竄了出來！仔細一看，是{combo_person_appearance}" },
        { val: "你猛然回頭，赫然發現{combo_person_appearance}" },
        { val: "伴隨著一聲咆哮，{combo_person_appearance}擋住了你的去路！" }
    ],

    // 🧠 主角心理反應 (Psychological Tension)
    sentence_tension: [
        { val: "你的心臟在胸腔裡狂跳，冷汗順著額頭滑落。" },
        { val: "大腦一片空白，你必須立刻做出決定。" },
        { val: "理智告訴你應該逃跑，但雙腿卻像灌了鉛一樣沉重。" },
        { val: "空氣中瀰漫著危險又極具張力的氣息。" }
    ],
    // ============================================================
    // 🎭 [Layer 3] 劇本演員庫 (Actors Pool) - 供開局種子抽取
    // ============================================================
    // 這些名字只有「核心身份」，形容詞與狀態會由 Layer 1 的骨架在劇情中動態生成！
    
    // 🕵️ 懸疑劇本演員
    actor_detective: [ { val: "偵探", tag: "human" }, { val: "私家偵探", tag: "human" }, { val: "警探", tag: "human" } ],
    actor_victim: [ { val: "富商", tag: "human" }, { val: "寡婦", tag: "human" }, { val: "貴族", tag: "human" }, { val: "流浪漢", tag: "human" } ],
    actor_suspect_A: [ { val: "管家", tag: "human" }, { val: "繼承人", tag: "human" }, { val: "醫生", tag: "human" } ],
    actor_suspect_B: [ { val: "傭人", tag: "human" }, { val: "流氓", tag: "human" }, { val: "神秘客", tag: "human" } ],
    
    // 👻 恐怖劇本演員
    actor_survivor: [ { val: "生還者", tag: "human" }, { val: "學生", tag: "human" }, { val: "旅客", tag: "human" } ],
    actor_monster: [ { val: "狼人", tag: "monster" }, { val: "吸血鬼", tag: "monster" }, { val: "怨靈", tag: "monster" }, { val: "食屍鬼", tag: "monster" }, { val: "變異體", tag: "monster" } ],
    
    // ⚔️ 冒險劇本演員
    actor_hero: [ { val: "騎士", tag: "human" }, { val: "傭兵", tag: "human" }, { val: "法師", tag: "human" } ],
    actor_boss: [ { val: "魔龍", tag: "monster" }, { val: "巫妖", tag: "monster" }, { val: "深淵領主", tag: "monster" } ],
    
    // 💕 戀愛與養成演員
    actor_lover: [ { val: "青梅竹馬", tag: "human" }, { val: "貴族千金", tag: "human" }, { val: "神秘轉學生", tag: "human" } ],
    actor_rival: [ { val: "競爭對手", tag: "human" }, { val: "傲慢的貴族", tag: "human" }, { val: "天才法師", tag: "human" } ],
    actor_trainee: [ { val: "學徒", tag: "human" }, { val: "見習生", tag: "human" }, { val: "新兵", tag: "human" } ],
    actor_mentor: [ { val: "導師", tag: "human" }, { val: "老兵", tag: "human" }, { val: "賢者", tag: "human" } ],


    // ============================================================
    // 🎬 [Layer 4] 動態句型庫 (Dynamic Phrase Library) - V5 電影級過場
    // ============================================================

    // 🚶‍♂️ 1. 場景過場與探索 (Explore)
    phrase_explore_start: [
        { val: "{atom_time}，你輕步走進了{combo_location}。" },
        { val: "推開沉重的門，映入眼簾的是{combo_location}。" },
        { val: "穿過漫長的通道，你終於來到了{combo_location}。" }
    ],
    phrase_explore_vibe: [
        { val: "{env_pack_visual}" },
        { val: "{env_pack_sensory}" },
        { val: "{env_pack_visual}{env_pack_sensory}" } // 機率性雙重描寫，但因為已經模組化，所以不會饒口！
    ],

    // ⚠️ 2. 突發危機與遭遇 (Danger & Encounter)
    phrase_danger_warn: [
        { val: "{sentence_event_sudden}" },
        { val: "{sentence_tension}{sentence_event_sudden}" }
    ],
    phrase_danger_appear: [
        { val: "{sentence_encounter}" }
    ],

    // 🔍 3. 物品發現與線索 (Discovery)
    phrase_find_action: [
        { val: "你蹲下身，仔細檢查著{env_feature}。" },
        { val: "在{env_light}的映照下，某個反光的東西吸引了你的目光。" }
    ],
    phrase_find_result: [
        { val: "竟然是{combo_item_desc}" }, // 例：竟然是一個染血的戒指，它似乎能封印靈魂。
        { val: "你找到了一個{combo_item_simple}。這東西為什麼會出現在這裡？" }
    ],

    // 💥 4. 戰鬥與追逐 (Combat & Chase) - 結合動態 Actors！
    phrase_combat_start: [
        { val: "你拔出武器，死死盯著眼前的{actor_monster}。" },
        { val: "{actor_monster}發出震耳欲聾的怒吼，朝你猛撲過來！" }
    ],
    horror_chase_start: [
        { val: "你轉過身，看到那名{actor_monster}正站在走廊盡頭。" },
        { val: "燈光閃爍了一下，{actor_monster}突然出現在你面前！" }
    ],
	// 🎭 社交互動與反應句型
    phrase_social_action: [
        { val: "對方正用一種難以捉摸的眼神打量著你。" },
        { val: "對方{atom_manner}向前逼近了一步，帶來極大的壓迫感。" },
        { val: "這句話就像一顆炸彈，瞬間改變了周圍的空氣。" },
        { val: "對方輕輕嘆了口氣，語氣裡帶著不加掩飾的情緒。" },
        { val: "場面一度十分尷尬，沒有人敢率先打破沉默。" }
    ],
    phrase_social_react: [
        { val: "你下意識地握緊了拳頭，思考著對策。" },
        { val: "周圍彷彿安靜了下來，只剩下你們兩人的對峙。" },
        { val: "你感覺到背後冒出了一層冷汗。" }
    ],


    // ============================================================
    // 🔗 [Layer 5] 舊版劇本相容轉接層 (將於下一步徹底刪除！)
    // ============================================================
    // 為了保證目前的 data_piece.js 點擊不會崩潰，我們將舊變數強制轉接給 V5 骨架
    
    noun_npc_generic: [ { val: "{combo_person_appearance}" } ],
    noun_monster: [ { val: "{combo_person_appearance}" } ], // 讓舊劇本抽出來的怪物也是完美句型
    noun_location_building: [ { val: "{env_building}" } ],
    noun_location_room: [ { val: "{env_room}" } ],
    noun_env_feature: [ { val: "{env_feature}" } ],
    noun_item_common: [ { val: "{combo_item_simple}" } ],
    noun_item_weapon: [ { val: "{combo_item_simple}" } ],
    adj_env_vibe: [ { val: "瀰漫著{env_smell}的" } ],
    base_env_sound: [ { val: "{env_sound}" } ],
    base_env_light: [ { val: "{env_light}" } ],
    pattern_look_around: [ { val: "你環顧四周。{env_pack_visual}" } ],
    pattern_enemy_appear: [ { val: "{sentence_encounter}" } ]
});

    console.log("✅ 核心資料庫與基礎詞彙已啟動 (V4 極致脫水與環境補完版)");
})();