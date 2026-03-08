/* js/story_data/data_words.js
 * 職責：原子字詞庫（最小單位，可被隨機抽取組合）
 * 包含：動態種子、建築物、房間、身份、修飾詞、物品、環境感官詞
 * 載入順序：data_dictionary → data_words → data_sentences
 *
 * 新增字詞：直接在對應 key 的陣列裡加一個 { val: "...", tag: [...] }
 * 新增新的 key：加在最底部，並在 data_sentences.js 的 {佔位符} 裡引用
 */
(function() {
    window.FragmentDB = window.FragmentDB || { fragments: {}, templates: [] };
    const DB = window.FragmentDB;

    Object.assign(DB.fragments, {

    // ============================================================
    // 🌱 Layer 0 — 動態種子庫（Dynamic Seeds）
    //    供 story_generator 引擎開局抽取，決定本局的世界基調
    // ============================================================

        global_player_trait: [
            { val: "幸運的",     tag: "trait_lucky" },
            { val: "倒楣的",     tag: "trait_unlucky" },
            { val: "富有的",     tag: "trait_rich" },
            { val: "貧窮的",     tag: "trait_poor" },
            { val: "直覺敏銳的", tag: "trait_sharp" },
            { val: "萬人迷的",   tag: "trait_charming" }
        ],

        global_world_vibe: [
            { val: "戰亂",     tag: "war" },
            { val: "和平",     tag: "peace" },
            { val: "魔法復甦", tag: "magic" },
            { val: "古老文明", tag: "ancient" },
            { val: "賽博龐克", tag: "sci-fi" },
            { val: "末日廢土", tag: "post_apocalyptic" }
        ],

        env_weather: [
            { val: "暴風雨",             tag: "env_storm" },
            { val: "濃霧瀰漫",           tag: "env_fog" },
            { val: "狂風大作",           tag: "env_wind" },
            { val: "伸手不見五指的深夜", tag: "env_dark" },
            { val: "細雨綿綿",           tag: "env_rain" },
            { val: "風雪交加",           tag: "env_snow" },
            { val: "悶熱的午後",         tag: "env_hot" },
            { val: "陽光明媚的早晨",     tag: "env_sunny" }
        ],

        env_atmosphere: [
            { val: "詭異的",     tag: "vibe_creepy" },
            { val: "悲傷的",     tag: "vibe_sad" },
            { val: "充滿敵意的", tag: "vibe_hostile" },
            { val: "死寂的",     tag: "vibe_silent" },
            { val: "溫馨的",     tag: "vibe_warm" }
        ],

        // 劇本專屬種子
        mystery_motive: [
            { val: "遺產爭奪", tag: "motive_money" },
            { val: "情殺",     tag: "motive_love" },
            { val: "復仇",     tag: "motive_revenge" },
            { val: "掩蓋秘密", tag: "motive_secret" }
        ],

        horror_curse_type: [
            { val: "古代詛咒",   tag: "curse_ancient" },
            { val: "怨靈附身",   tag: "curse_ghost" },
            { val: "未知生物變異", tag: "curse_mutant" },
            { val: "邪神低語",   tag: "curse_god" }
        ],

        adventure_world_state: [
            { val: "戰火蔓延",   tag: "world_war" },
            { val: "魔物肆虐",   tag: "world_monster" },
            { val: "和平但腐敗", tag: "world_corrupt" }
        ],

        adventure_start_bonus: [
            { val: "神聖的",   tag: "bonus_holy" },
            { val: "被詛咒的", tag: "bonus_cursed" },
            { val: "生鏽的",   tag: "bonus_rusty" },
            { val: "傳說中的", tag: "bonus_legendary" }
        ],

        romance_meet_location: [
            { val: "轉角處",       tag: "meet_corner" },
            { val: "圖書館的深處", tag: "meet_library" },
            { val: "雨中的屋簷下", tag: "meet_rain" },
            { val: "喧囂的舞會上", tag: "meet_party" }
        ],

        raising_goal: [
            { val: "奪得皇家競技場的冠軍",   tag: "goal_combat" },
            { val: "通過最嚴苛的魔法大考",   tag: "goal_magic" },
            { val: "重振沒落家族的榮耀",     tag: "goal_family" },
            { val: "在末日中存活下來",       tag: "goal_survival" }
        ],

        training_location: [
            { val: "皇家訓練場",   tag: "train_royal" },
            { val: "禁忌的圖書館", tag: "train_library" },
            { val: "魔物出沒的後山", tag: "train_forest" },
            { val: "破舊的地下道場", tag: "train_underground" }
        ],

    // ============================================================
    // 🏰 Layer 1 — 環境地點
    // ============================================================

        env_building: [
            // 驚悚/懸疑
            { val: "廢棄醫院", tag: ["location", "horror", "mystery"] },
            { val: "孤兒院",   tag: ["location", "horror"] },
            { val: "療養院",   tag: ["location", "horror"] },
            { val: "偏僻莊園", tag: ["location", "mystery"] },
            // 冒險/奇幻
            { val: "古老教堂", tag: ["location", "magic", "mystery"] },
            { val: "邊境堡壘", tag: ["location", "war", "adventure"] },
            { val: "神殿遺跡", tag: ["location", "magic", "ancient"] },
            // 戀愛/養成
            { val: "皇家學院", tag: ["location", "romance", "raising", "magic"] },
            { val: "繁華劇院", tag: ["location", "romance", "mystery"] },
            { val: "貴族別墅", tag: ["location", "romance", "mystery"] },
            // 科幻/日常
            { val: "地下研究所", tag: ["location", "sci-fi", "horror"] },
            { val: "老舊旅館",   tag: ["location", "mystery", "romance"] },
            { val: "星際郵輪",   tag: ["location", "sci-fi", "romance"] }
        ],

        env_room: [
            { val: "大廳",     tag: ["room"] },
            { val: "地下室",   tag: ["room", "horror"] },
            { val: "圖書館",   tag: ["room", "mystery", "raising"] },
            { val: "手術室",   tag: ["room", "horror"] },
            { val: "宴會廳",   tag: ["room", "romance"] },
            { val: "走廊",     tag: ["room"] },
            { val: "臥室",     tag: ["room", "romance"] },
            { val: "書房",     tag: ["room", "mystery"] },
            { val: "密室",     tag: ["room", "mystery"] },
            { val: "儲藏室",   tag: ["room"] },
            { val: "牢房",     tag: ["room", "horror"] },
            { val: "控制室",   tag: ["room", "sci-fi"] },
            { val: "祭壇室",   tag: ["room", "magic", "horror"] },
            { val: "實驗室",   tag: ["room", "sci-fi", "raising"] },
            { val: "廚房",     tag: ["room", "mystery", "alibi"] },
            { val: "二樓陽台", tag: ["room", "mystery", "alibi"] },
            { val: "溫室",     tag: ["room", "mystery", "romance", "alibi"] },
            { val: "僕人房",   tag: ["room", "mystery", "alibi"] },
            { val: "中庭",     tag: ["room", "mystery", "alibi"] },
            { val: "化妝室",   tag: ["room", "mystery", "romance", "alibi"] },
            { val: "地下酒窖", tag: ["room", "mystery", "alibi", "horror"] },
            { val: "閣樓",     tag: ["room", "mystery", "horror", "alibi"] },
            { val: "管家室",   tag: ["room", "mystery", "alibi"] },
            { val: "彈藥庫",   tag: ["room", "mystery", "combat"] }
        ],

        env_adj: [
            { val: "" }, { val: "廢棄的" }, { val: "豪華的" }, { val: "古老的" },
            { val: "陰暗的" }, { val: "血跡斑斑的" }, { val: "破敗的" },
            { val: "死一般寂靜的" }, { val: "陰森的" }, { val: "潮濕的" },
            { val: "神祕的" }, { val: "溫馨的" }
        ],

        env_feature: [
            { val: "陰暗的角落" }, { val: "發霉的天花板" }, { val: "厚重的帷幕後方" },
            { val: "濃密的陰影中" }, { val: "斑駁的牆壁上" }, { val: "昏暗的樓梯下方" },
            { val: "凌亂的桌面上" }, { val: "黑暗深處" }
        ],

        env_light: [
            { val: "微弱的燭光" }, { val: "刺眼的閃電" }, { val: "慘白的月光" },
            { val: "搖曳的火光" }, { val: "昏暗的燈光" }, { val: "殘存的微光" },
            { val: "溫暖的夕陽" },
            // 戀愛劇本專用
            { val: "昏黃的燈光", tag: ["romance"] },
            { val: "月光",       tag: ["romance", "mystery"] },
            { val: "餘暉",       tag: ["romance"] },
            { val: "搖曳的燭光", tag: ["romance", "horror"] }
        ],

        env_sound: [
            { val: "滴答的水滴聲" }, { val: "急促的腳步聲" }, { val: "詭異的低語" },
            { val: "痛苦的喘息聲" }, { val: "若有似無的哭聲" }, { val: "令人發毛的笑聲" },
            { val: "淒厲的尖叫聲" }, { val: "呼嘯的風聲" }, { val: "遠處傳來的鐘聲" }
        ],

        // 氣味系列
        env_smell: [
            { val: "潮濕的霉味" }, { val: "刺鼻的鐵鏽味" }, { val: "濃烈的血腥味" },
            { val: "令人作嘔的腐臭味" }, { val: "濃郁的藥水味" },
            { val: "燒焦的焦糊味" }, { val: "腐敗的甜膩氣息" }, { val: "酸澀的鏽蝕味" }
        ],
        env_smell_pleasant: [
            { val: "淡淡的花香" }, { val: "溫柔的薰衣草氣息" }, { val: "清新的青草香" },
            { val: "剛沖泡的熱茶香" }, { val: "松木與泥土的混合氣息" },
            { val: "雨後清新的泥土氣息" }, { val: "沁人心脾的梔子花香" }
        ],
        env_smell_food: [
            { val: "新鮮烤麵包的香氣" }, { val: "燉肉飄散的濃郁香氣" },
            { val: "肉桂與香料的甜辛味" }, { val: "剛出爐甜點的奶香" },
            { val: "炭火燒烤交織的焦香" }, { val: "熱湯翻滾的鮮味" }
        ],

        // 嗅覺反應詞
        smell_reaction_bad: [
            { val: "令人作嘔" }, { val: "讓人皺眉" }, { val: "令人窒息" },
            { val: "讓人頭暈目眩" }, { val: "讓人忍不住後退一步" }, { val: "令人胃部一陣翻騰" }
        ],
        smell_reaction_good: [
            { val: "令人心曠神怡" }, { val: "讓人不由自主地放鬆" },
            { val: "令人精神為之一振" }, { val: "讓人感到一絲安慰" },
            { val: "令人心情舒緩" }, { val: "讓人忍不住多吸了一口氣" },
            { val: "令人興喜" }, { val: "讓人愉悅" }
        ],
        smell_reaction_food: [
            { val: "讓人飢腸轆轆" }, { val: "令人食慾大振" },
            { val: "讓人忍不住嚥了口水" }, { val: "讓胃不爭氣地叫了一聲" },
            { val: "讓人幾乎忘記了身處何地" }, { val: "令人垂涎三尺" }
        ],

        // 時間與天氣原子詞
        atom_weather: [
            { val: "狂風呼嘯的夜晚" }, { val: "細雨霏霏的清晨" }, { val: "大雨傾盆的深夜" },
            { val: "烈日當頭的午後" }, { val: "陰霾密布的黃昏" }, { val: "霧氣瀰漫的清晨" },
            { val: "雷聲隆隆的暴風夜" }, { val: "悶熱無風的夏夜" }, { val: "寒風刺骨的冬晨" }
        ],
        atom_time: [
            { val: "瞬間" }, { val: "緩慢地" }, { val: "片刻後" }, { val: "漸漸地" },
            { val: "突然" }, { val: "不久後" }, { val: "隨後" }, { val: "最終" }
        ],
        atom_manner: [
            { val: "驚恐地" }, { val: "奮不顧身地" }, { val: "張牙舞爪地" },
            { val: "冷靜地" }, { val: "絕望地" }, { val: "狂笑著" },
            { val: "猛然" }, { val: "悄悄地" }, { val: "警戒地" }, { val: "溫柔地" },
            { val: "平靜地" }, { val: "冷冷地" }, { val: "猶豫地" },
            { val: "低聲" }, { val: "突然" }, { val: "若無其事地" }
        ],

    // ============================================================
    // 👤 Layer 2 — 人物詞彙
    // ============================================================

        trait_prefix: [
            { val: "" }, { val: "" }, // 刻意增加「無前綴」機率
            { val: "皇家" }, { val: "神秘" }, { val: "瘋狂" }, { val: "豪門" },
            { val: "落魄" }, { val: "傲嬌" }, { val: "溫柔" }, { val: "冷酷" },
            { val: "天才" }, { val: "笨拙" }, { val: "不良" }, { val: "退役" },
            { val: "嚴厲" }, { val: "霸道" }, { val: "嗜血" }, { val: "流浪" },
            { val: "首席" }, { val: "病嬌" }, { val: "變異" }, { val: "殘暴" },
            { val: "高雅的" }, { val: "被詛咒的" }, { val: "傳說中的" }
        ],

        core_identity: [
            // 懸疑/犯罪
            { val: "{trait_prefix}偵探",   tag: ["human", "mystery"] },
            { val: "{trait_prefix}法醫",   tag: ["human", "mystery"] },
            { val: "{trait_prefix}嫌疑犯", tag: ["human", "mystery"] },
            { val: "{trait_prefix}怪盜",   tag: ["human", "mystery"] },
            { val: "{trait_prefix}目擊者", tag: ["human", "mystery"] },
            { val: "{trait_prefix}寡婦",   tag: ["human", "mystery", "romance"] },
            { val: "{trait_prefix}保鑣",   tag: ["human", "mystery", "combat"] },
            // 恐怖 - 人類
            { val: "{trait_prefix}倖存者", tag: ["human", "horror", "survivor"] },
            { val: "{trait_prefix}除靈師", tag: ["human", "horror", "magic"] },
            { val: "{trait_prefix}靈媒",   tag: ["human", "horror", "magic"] },
            { val: "{trait_prefix}科學家", tag: ["human", "horror", "sci-fi"] },
            // 恐怖 - 怪物
            { val: "{trait_prefix}觸手",   tag: ["monster", "horror", "mutant"] },
            { val: "{trait_prefix}怨靈",   tag: ["monster", "horror", "spirit"] },
            { val: "{trait_prefix}食屍鬼", tag: ["monster", "horror", "undead"] },
            { val: "{trait_prefix}無面者", tag: ["monster", "horror", "creepy"] },
            { val: "{trait_prefix}喪屍",   tag: ["monster", "horror", "undead"] },
            { val: "{trait_prefix}血肉傀儡", tag: ["monster", "horror", "construct"] },
            // 冒險/奇幻 - 人類
            { val: "{trait_prefix}獵人",   tag: ["human", "adventure", "combat"] },
            { val: "{trait_prefix}騎士",   tag: ["human", "adventure", "combat"] },
            { val: "{trait_prefix}弓箭手", tag: ["human", "adventure", "magic"] },
            { val: "{trait_prefix}魔法師", tag: ["human", "adventure", "magic"] },
            { val: "{trait_prefix}賞金獵人", tag: ["human", "adventure", "combat"] },
            { val: "{trait_prefix}吟遊詩人", tag: ["human", "adventure", "romance"] },
            // 冒險/奇幻 - 怪物
            { val: "{trait_prefix}史萊姆", tag: ["monster", "adventure", "beast"] },
            { val: "{trait_prefix}哥布林", tag: ["monster", "adventure", "beast"] },
            { val: "{trait_prefix}巨熊",   tag: ["monster", "adventure", "beast"] },
            { val: "{trait_prefix}石像鬼", tag: ["monster", "adventure", "construct"] },
            { val: "{trait_prefix}巨龍",   tag: ["monster", "adventure", "boss"] },
            { val: "{trait_prefix}巫妖",   tag: ["monster", "adventure", "boss"] },
            // 戀愛
            { val: "{trait_prefix}青梅竹馬", tag: ["human", "romance"] },
            { val: "{trait_prefix}總裁",   tag: ["human", "romance", "rich"] },
            { val: "{trait_prefix}轉學生", tag: ["human", "romance", "mystery"] },
            { val: "{trait_prefix}千金",   tag: ["human", "romance", "rich"] },
            { val: "{trait_prefix}學長",   tag: ["human", "romance"] },
            { val: "{trait_prefix}未婚夫", tag: ["human", "romance"] },
            // 養成
            { val: "{trait_prefix}導師",   tag: ["human", "raising", "mentor"] },
            { val: "{trait_prefix}教官",   tag: ["human", "raising", "mentor"] },
            { val: "{trait_prefix}考官",   tag: ["human", "raising", "mentor"] },
            { val: "{trait_prefix}見習生", tag: ["human", "is_trainee"] },
            { val: "{trait_prefix}學徒",   tag: ["human", "is_trainee"] },
            { val: "{trait_prefix}少年",   tag: ["human", "is_trainee"] },
            // 動物/怪物學徒
            { val: "{trait_prefix}史萊姆寶寶", tag: ["monster", "is_trainee", "beast"] },
            { val: "{trait_prefix}幼龍",   tag: ["monster", "is_trainee", "dragon"] },
            { val: "{trait_prefix}機關犬", tag: ["monster", "is_trainee", "construct"] },
            // 通用路人
            { val: "{trait_prefix}村民",   tag: ["human", "civilian"] },
            { val: "{trait_prefix}商人",   tag: ["human", "civilian"] },
            { val: "{trait_prefix}老人",   tag: ["human", "civilian"] },
            { val: "{trait_prefix}酒館老闆", tag: ["human", "civilian"] }
        ],

        identity_modifier: [
            { val: "" },
            { val: "年輕的",     tag: ["romance", "raising"] },
            { val: "年邁的" },
            { val: "成熟的",     tag: ["romance"] },
            { val: "蒼老的",     tag: ["ancient", "horror"] },
            { val: "不朽的",     tag: ["ancient", "magic"] },
            { val: "新生的",     tag: ["mutant", "raising"] },
            { val: "神祕的",     tag: ["mystery"] },
            { val: "落魄的",     tag: ["poor"] },
            { val: "身穿制服的", tag: ["sci-fi", "raising"] },
            { val: "腐敗的",     tag: ["horror", "undead"] },
            { val: "異化的",     tag: ["horror", "sci-fi"] },
            { val: "氣質高雅的", tag: ["romance", "rich"] },
            { val: "滿身傷痕的", tag: ["combat", "survivor"] }
        ],

        state_modifier: [
            { val: "身受重傷",               tag: ["combat", "horror"] },
            { val: "陷入了沉睡" },
            { val: "看起來十分虛弱" },
            { val: "正處於失控的邊緣",       tag: ["horror", "magic"] },
            { val: "神情充滿驚恐",           tag: ["horror"] },
            { val: "正冷靜地觀察著四周",     tag: ["mystery"] },
            { val: "渾身都在顫抖" },
            { val: "眼神中充滿絕望",         tag: ["horror"] },
            { val: "正發出詭異的狂笑",       tag: ["horror", "creepy"] },
            { val: "處於高度警戒狀態",       tag: ["combat"] },
            { val: "正張牙舞爪地示威",       tag: ["monster"] },
            { val: "臉上帶著溫柔的微笑",     tag: ["romance"] },
            { val: "正專注地翻閱著筆記",     tag: ["raising", "mystery"] }
        ],

        trait_clause: [
            { val: "渾身散發著墮落的氣息",           tag: ["horror", "magic"] },
            { val: "似乎被某種古老的詛咒纏身",       tag: ["horror", "ancient"] },
            { val: "身上帶著濃烈的血腥味",           tag: ["horror", "combat"] },
            { val: "給人一種極度危險的壓迫感",       tag: ["combat", "boss"] },
            { val: "身上佈滿了不明原因的變異痕跡",   tag: ["horror", "sci-fi"] },
            { val: "舉手投足間散發著迷人的魅力",     tag: ["romance"] },
            { val: "眼中閃爍著對知識的狂熱",         tag: ["raising", "magic"] }
        ],

        verb_equip: [
            { val: "把玩著" },
            { val: "緊緊握著",   tag: ["combat", "horror"] },
            { val: "死死盯著",   tag: ["horror"] },
            { val: "小心隱藏著", tag: ["mystery"] },
            { val: "輕輕撫摸著", tag: ["romance"] },
            { val: "高高舉起",   tag: ["combat"] },
            { val: "急忙清理著", tag: ["mystery", "horror"] },
            { val: "偷偷保養著", tag: ["mystery"] },
            { val: "整理著",     tag: ["mystery", "alibi"] },
            { val: "尋找遺失的", tag: ["mystery", "alibi"] },
            { val: "悄悄燒毀著", tag: ["mystery", "horror"] },
            { val: "顫抖著翻閱", tag: ["mystery", "horror"] },
            { val: "仔細擦拭著", tag: ["mystery", "combat"] },
            { val: "切著",       tag: ["mystery", "alibi"] },
            { val: "倒著",       tag: ["mystery", "alibi"] }
        ],

    // ============================================================
    // ⚔️ Layer 3 — 物品詞彙
    // ============================================================

        item_core: [
            { val: "懷錶",         tag: ["item", "mystery", "romance"] },
            { val: "鑰匙",         tag: ["item", "mystery"] },
            { val: "日記本",       tag: ["item", "mystery", "romance"] },
            { val: "匕首",         tag: ["item", "weapon", "combat"] },
            { val: "戒指",         tag: ["item", "romance", "magic"] },
            { val: "護符",         tag: ["item", "magic", "horror"] },
            { val: "信件",         tag: ["item", "mystery", "romance"] },
            { val: "藥瓶",         tag: ["item", "sci-fi", "horror"] },
            { val: "寶石",         tag: ["item", "valuable", "magic"] },
            { val: "長劍",         tag: ["item", "weapon", "adventure"] },
            { val: "訓練木劍",     tag: ["item", "weapon", "raising"] },
            { val: "不明祭品",     tag: ["item", "horror", "magic"] },
            { val: "手帕",         tag: ["item", "mystery", "clue"] },
            { val: "安眠藥瓶",     tag: ["item", "mystery", "horror", "clue"] },
            { val: "破碎的酒杯",   tag: ["item", "mystery", "clue"] },
            { val: "燒了一半的信", tag: ["item", "mystery", "clue"] },
            { val: "血跡斑斑的手套",   tag: ["item", "mystery", "horror", "clue"] },
            { val: "遺囑副本",     tag: ["item", "mystery", "clue"] },
            { val: "密碼鎖記事本", tag: ["item", "mystery", "clue"] },
            { val: "奇怪的藥粉",   tag: ["item", "mystery", "horror", "clue"] },
            { val: "帶有香水味的手帕",   tag: ["item", "mystery", "romance", "clue", "fake_clue"] },
            { val: "寫著數字的紙條",     tag: ["item", "mystery", "clue", "fake_clue"] },
            { val: "沾著泥土的鞋底",     tag: ["item", "mystery", "clue", "fake_clue"] },
            { val: "不明來源的鑰匙",     tag: ["item", "mystery", "clue"] }
        ],

        item_physical_state: [
            { val: "" }, { val: "黃銅製的" },
            { val: "純銀的",         tag: ["magic"] },
            { val: "生鏽的",         tag: ["horror", "ancient"] },
            { val: "皮革製的" },
            { val: "骨製的",         tag: ["horror", "ancient"] },
            { val: "破碎的" },
            { val: "染血的",         tag: ["horror", "combat"] },
            { val: "精緻的",         tag: ["romance", "rich"] },
            { val: "被嚴重腐蝕的",   tag: ["horror", "sci-fi"] },
            { val: "溫熱的",         tag: ["romance", "magic"] },
            { val: "沾著泥土的",     tag: ["mystery", "horror"] },
            { val: "帶有神祕香味的", tag: ["mystery", "romance"] },
            { val: "燒了一半的",     tag: ["mystery", "horror"] },
            { val: "密封在信封裡的", tag: ["mystery"] },
            { val: "帶著名字刻印的", tag: ["mystery", "romance"] }
        ],

        item_power_clause: [
            { val: "它似乎能封印靈魂",               tag: ["magic", "horror"] },
            { val: "它似乎在吸收周圍的生命力",       tag: ["magic", "horror"] },
            { val: "表面散發著微弱的光芒",           tag: ["magic", "mystery"] },
            { val: "拿在手上會帶來一股刺骨的寒意",   tag: ["horror"] },
            { val: "上面沾染著無法洗去的暗沉血跡",   tag: ["horror", "combat"] },
            { val: "只要靠近，腦海中就會引發詭異的幻覺", tag: ["horror", "sci-fi"] },
            { val: "這似乎是某人珍藏多年的信物",     tag: ["romance"] }
        ],

    // ============================================================
    // 🌐 Layer 4 — 語言學習詞庫（日文/韓文）
    // ============================================================

        jp_warning: [
            { val: "危ない！ここは開けないで",   tag: ["learning", "adventure", "jp"] },
            { val: "逃げろ！今すぐここを出ろ！", tag: ["learning", "horror", "jp"] },
            { val: "触れるな、呪われるぞ",       tag: ["learning", "horror", "jp"] },
            { val: "前へ進め、後ろを見るな",     tag: ["learning", "adventure", "jp"] },
            { val: "右は危険、左へ進め",         tag: ["learning", "adventure", "jp"] },
            { val: "後ろの石板を押せ、早く！",   tag: ["learning", "adventure", "jp", "risk_high"] }
        ],
        kr_warning: [
            { val: "뒤를 보지 마라！",     tag: ["learning", "horror", "kr"] },
            { val: "도망쳐！빨리！",       tag: ["learning", "horror", "kr"] },
            { val: "조심해！위험해！",     tag: ["learning", "horror", "kr"] },
            { val: "왼쪽으로 가！",       tag: ["learning", "adventure", "kr"] },
            { val: "절대 포기하지 마라",   tag: ["learning", "raising", "kr"] },
            { val: "지금 당장 도망쳐！",   tag: ["learning", "horror", "kr", "risk_high"] }
        ],
        jp_clue: [
            { val: "彼が撃たれた",         tag: ["learning", "mystery", "jp"] },
            { val: "彼女を脅した",         tag: ["learning", "mystery", "jp"] },
            { val: "鍵はここだ",           tag: ["learning", "mystery", "jp"] },
            { val: "私が書かされた",       tag: ["learning", "mystery", "jp"] },
            { val: "祭壇で儀式を行え",     tag: ["learning", "adventure", "jp"] },
            { val: "前の扉を開けよ",       tag: ["learning", "adventure", "jp"] }
        ],
        jp_intimate: [
            { val: "ねえ、今夜会えない？",       tag: ["learning", "romance", "jp"] },
            { val: "昨日はありがとうね。また会いたい", tag: ["learning", "romance", "jp"] },
            { val: "もう、心配しすぎだよ",       tag: ["learning", "romance", "jp"] },
            { val: "そんな顔しないでよ",         tag: ["learning", "romance", "jp"] }
        ],
        kr_intimate: [
            { val: "야, 오늘 밤에 만나",         tag: ["learning", "romance", "kr"] },
            { val: "어제 정말 재미있었어. 또 만나자", tag: ["learning", "romance", "kr"] },
            { val: "내가 네 생각만 해",           tag: ["learning", "romance", "kr"] },
            { val: "지금도 네 생각하고 있어",     tag: ["learning", "romance", "kr"] }
        ],
        bilingual_mix: [
            { val: "뒤를 봐라——そして前へ逃げろ", tag: ["learning", "mix", "risk_high"] },
            { val: "조심해、危険だ！",             tag: ["learning", "mix", "horror"] },
            { val: "逃げろ！빨리！",               tag: ["learning", "mix", "horror"] },
            { val: "있었어——でも今はいない",       tag: ["learning", "mix", "mystery"] }
        ],

    // ============================================================
    // 🔍 Layer 5 — 劇本專屬原子詞（不含完整句子的最小單位）
    // ============================================================

        // 懸疑
        alibi_action: [
            { val: "{verb_equip}那個{item_core}",   tag: ["mystery"] },
            { val: "忙著{verb_equip}幾樣東西",     tag: ["mystery"] },
            { val: "{verb_equip}一瓶{item_core}",   tag: ["mystery"] }
        ],

        clue_physical: [
            { val: "一根染血的髮夾",   tag: ["mystery", "evidence"] },
            { val: "撕破的遺書碎片",   tag: ["mystery", "evidence"] },
            { val: "上了鎖的日記",     tag: ["mystery", "evidence"] },
            { val: "被人動過的毒藥瓶", tag: ["mystery", "evidence", "horror"] },
            { val: "被偽造的帳目",     tag: ["mystery", "evidence", "motive_money"] }
        ],
        clue_testimony: [
            { val: "那天晚上我聽到了爭吵聲",   tag: ["mystery"] },
            { val: "有人深夜進出過那個房間",   tag: ["mystery"] },
            { val: "死者生前說過他很害怕某個人", tag: ["mystery"] }
        ],

        // 恐怖
        horror_sound: [
            { val: "低沉的哭泣聲",             tag: ["horror", "ghost"] },
            { val: "指甲劃過牆壁的聲音",       tag: ["horror", "creepy"] },
            { val: "不規律的心跳聲",           tag: ["horror", "curse_god"] },
            { val: "用你不認識的語言低語",     tag: ["horror", "ancient"] },
            { val: "孩子的笑聲，但背後沒有人", tag: ["horror", "ghost", "creepy"] }
        ],
        horror_vision: [
            { val: "牆上出現了會移動的影子" },
            { val: "鏡子裡的自己慢了半秒才動" },
            { val: "你看見有人站在窗外，但這裡是三樓" },
            { val: "桌上的蠟燭同時熄滅了" }
        ],
        curse_symptom: [
            { val: "你的手指開始顫抖，停不下來", tag: ["cursed"] },
            { val: "你忘記了自己剛才在做什麼",   tag: ["cursed", "sanity"] },
            { val: "你聽見了有人在叫你的名字",   tag: ["cursed", "ghost"] }
        ],

        // 冒險
        loot_desc: [
            { val: "一枚嵌著紅寶石的戒指",   tag: ["adventure", "magic"] },
            { val: "沾滿黑血的古老地圖",     tag: ["adventure", "ancient"] },
            { val: "精心偽裝過的密道入口",   tag: ["adventure", "mystery"] }
        ],

        // 戀愛
        lover_action: [
            { val: "輕輕地嘆了口氣",               tag: ["romance"] },
            { val: "把視線移開，假裝在看窗外",     tag: ["romance"] },
            { val: "用指尖輕輕碰了一下你的袖口",   tag: ["romance"] },
            { val: "沉默了很久，才開口",           tag: ["romance"] }
        ],
        rival_action: [
            { val: "表情沒有變，但眼神變了",         tag: ["romance"] },
            { val: "突然走到你旁邊，壓低聲音說話",   tag: ["romance"] },
            { val: "若無其事地笑了笑",               tag: ["romance"] }
        ],

        // 養成
        training_result: [
            { val: "勉強完成了任務，但還有很大的進步空間",       tag: ["raising"] },
            { val: "超出了{mentor}的預期，對方難得誇了你一句",   tag: ["raising", "mentor"] },
            { val: "失敗了，但你清楚知道下次要怎麼改",           tag: ["raising"] }
        ],
        mentor_remark: [
            { val: "「還不夠快。」",                         tag: ["raising", "mentor"] },
            { val: "「方向對了，但力道不足。」",             tag: ["raising", "mentor"] },
            { val: "「這次做得不錯。繼續。」",               tag: ["raising", "mentor"] },
            { val: "「如果你昨天有練習，現在就不會出錯。」", tag: ["raising", "mentor"] }
        ],

        // 戰鬥結果
        battle_result_win: [
            { val: "對方轟然倒地，戰鬥結束。",             tag: ["combat"] },
            { val: "{boss}發出最後的嘶吼，消失在黑暗中。", tag: ["combat", "boss"] },
            { val: "你勉強撐了下來，身上帶著幾道新傷。",   tag: ["combat", "survivor"] }
        ],
        battle_result_lose: [
            { val: "你力竭倒地，失去了意識。",     tag: ["combat"] },
            { val: "對方把你逼到了角落，你無路可退。", tag: ["combat", "risk_high"] }
        ],

    // ============================================================
    // 🔧 Layer 6 — data_piece.js 需要的環境詞（原缺漏）
    // ============================================================

        // 藏身地點（搭配 rest_activity 使用）
        rest_location: [
            { val: "廢棄的儲藏室角落" }, { val: "厚重的木桌底下" },
            { val: "腐舊書架的縫隙後方" }, { val: "半掩的門後" },
            { val: "散落麻布袋的陰暗角落" }, { val: "牆上脫落的隔板後方" },
            { val: "陳舊的壁爐旁" }, { val: "貨物堆砌形成的夾縫中" }
        ],

        // 補給品來源地點
        supply_source: [
            { val: "翻倒的貨架上" }, { val: "被遺棄的行李旁" },
            { val: "角落的破木箱裡" }, { val: "灰塵覆蓋的桌面上" },
            { val: "廢棄推車的暗格裡" }, { val: "牆角的麻布袋中" },
            { val: "落滿灰塵的儲藏格" }, { val: "掀開的地板暗格" }
        ],

    });

    console.log("✅ data_words.js 已載入");
})();