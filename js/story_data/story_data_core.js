/* js/story_data/story_data_core.js */
(function() {
    window.FragmentDB = window.FragmentDB || { fragments: {}, templates: [] };
    const DB = window.FragmentDB;

    // 🌟 [Step 5 新增] 通用 HUB 選項生成器
    DB.getHubOptions = function(theme) {
        // 預設的選項文字
        let opt1 = "🔍 仔細搜查當前房間 (耗時 1)";
        let opt2 = "🗺️ 推開未知的門 (耗時 1)";

        // 根據不同主題微調文字，增加沉浸感
        if (theme === 'adventure') {
            opt1 = "🔍 仔細搜刮當前房間 (耗時 1)";
            opt2 = "🗺️ 推開未知的門深入地城 (耗時 1)";
        } else if (theme === 'horror') {
            opt2 = "🏃 趕快離開，推開新門 (耗時 1)";
        }

        return [
            { 
                label: opt1, 
                action: "advance_chain", 
                rewards: { varOps: [{key: 'time_left', val: 1, op: '-'}] } 
            },
            { 
                label: opt2, 
                action: "map_explore_new", 
                rewards: { varOps: [{key: 'time_left', val: 1, op: '-'}] } 
            }
        ];
    };
	// 🌟【升級版】全自訂 HUB 工廠函數（V8.2）
	DB.createHubTemplate = function(theme, time = 5, custom = {}) {
		const defaultText = `{env_weather}的時刻，你身處於{env_building}之中。{env_pack_visual}`;
		const defaultBrief = `📍 ${theme.toUpperCase()} HUB — 剩餘時間：{time_left}　狀態：{#tags}`;

		return {
			id: `hub_${theme}_generic`,
			type: 'start',
			isHub: true,
			reqTags: [theme],
			
			// 優先使用自訂文字，沒有才用預設
			dialogue: custom.dialogue || [{ text: { zh: custom.text || defaultText } }],
			
			briefText: custom.briefText || defaultBrief,
			
			onEnter: custom.onEnter || { 
				varOps: [{ key: 'time_left', val: time, op: 'set' }] 
			},
			
			// 允許完全自訂 options，或用主題預設
			options: custom.options || DB.getHubOptions(theme)
		};
	};
    // 👇 👇 👇 🌟 [新增] 全域多國語言字典 (i18n)
    window.I18N_DICT = {
        // 系統狀態標籤 (Tags)
        'observed': { zh: '已觀察', en: 'Observed', ko: '관찰됨', jp: '観察済み' },
        'item_found': { zh: '發現物品', en: 'Item Found', ko: '아이템 발견', jp: 'アイテム発見' },
        'risk_high': { zh: '高風險', en: 'High Risk', ko: '고위험', jp: '高リスク' },
        'cursed': { zh: '受詛咒', en: 'Cursed', ko: '저주받은', jp: '呪われた' },
        'knowledge_found': { zh: '獲得知識', en: 'Knowledge', ko: '지식 획득', jp: '知識獲得' },
        'cautious': { zh: '保持警戒', en: 'Cautious', ko: '경계', jp: '警戒中' },
        
        // 屬性與變數 (Vars)
        'sanity': { zh: '理智', en: 'SAN', ko: '이성', jp: '正気度' },
        'energy': { zh: '精力', en: 'Energy', ko: '에너지', jp: 'スタミナ' },
        'time_left': { zh: '剩餘時間', en: 'Time Left', ko: '남은 시간', jp: '残り時間' },
        'stress': { zh: '壓力', en: 'Stress', ko: '스트레스', jp: 'ストレス' },
        'trust': { zh: '信任度', en: 'Trust', ko: '신뢰', jp: '信頼度' },
        'favor': { zh: '好感度', en: 'Favor', ko: '호감도', jp: '好感度' },
        'hp': { zh: '生命值', en: 'HP', ko: 'HP', jp: 'HP' },
        'exp': { zh: '經驗值', en: 'EXP', ko: 'EXP', jp: 'EXP' },
        'gold': { zh: '金幣', en: 'Gold', ko: '골드', jp: 'ゴールド' },
        'youth_given': { zh: '奉獻的青春', en: 'Youth Given', ko: '바친 청춘', jp: '捧げた青春' },
        'dignity': { zh: '尊嚴', en: 'Dignity', ko: '존엄', jp: '尊厳' },
        'route_illicit': { zh: '禁忌路線', en: 'Illicit Route', ko: '금지된 경로', jp: '禁忌ルート' }
    };

    window.t_tag = function(key) {
        if (!key) return "";
        let lang = (window.GlobalState && window.GlobalState.settings && window.GlobalState.settings.targetLang) 
                   ? window.GlobalState.settings.targetLang 
                   : 'zh';
        
        // 🌟 防呆機制：如果語言是 mix，或者字典裡剛好沒有這個語言的翻譯，就強制使用中文 (zh)
        if (lang === 'mix' || (window.I18N_DICT[key] && !window.I18N_DICT[key][lang])) {
            lang = 'zh';
        }

        if (window.I18N_DICT[key] && window.I18N_DICT[key][lang]) return window.I18N_DICT[key][lang];
        return key; 
    };

    Object.assign(DB.fragments, {
    // ============================================================
    // 🧱 [Layer 0] 語法化原子詞彙與動態種子庫 (V5 標籤生態系)
    // ============================================================
        
        // 🌟【1. 動態種子庫 (Dynamic Seeds)】- 供 story_generator.js 引擎開局抽取
        // ------------------------------------------------------------
        global_player_trait: [
            { val: "幸運的", tag: "trait_lucky" }, { val: "倒楣的", tag: "trait_unlucky" },
            { val: "富有的", tag: "trait_rich" }, { val: "貧窮的", tag: "trait_poor" },
            { val: "直覺敏銳的", tag: "trait_sharp" }, { val: "萬人迷的", tag: "trait_charming" }
        ],
        global_world_vibe: [
            { val: "戰亂", tag: "war" }, { val: "和平", tag: "peace" },
            { val: "魔法復甦", tag: "magic" }, { val: "古老文明", tag: "ancient" },
            { val: "賽博龐克", tag: "sci-fi" }, { val: "末日廢土", tag: "post_apocalyptic" }
        ],
        env_weather: [ 
            { val: "暴風雨", tag: "env_storm" }, { val: "濃霧瀰漫", tag: "env_fog" }, 
            { val: "狂風大作", tag: "env_wind" }, { val: "伸手不見五指的深夜", tag: "env_dark" },
            { val: "細雨綿綿", tag: "env_rain" }, { val: "風雪交加", tag: "env_snow" },
            { val: "悶熱的午後", tag: "env_hot" }, { val: "陽光明媚的早晨", tag: "env_sunny" }
        ],
        env_atmosphere: [ 
            { val: "詭異的", tag: "vibe_creepy" }, { val: "悲傷的", tag: "vibe_sad" }, 
            { val: "充滿敵意的", tag: "vibe_hostile" }, { val: "死寂的", tag: "vibe_silent" },
            { val: "溫馨的", tag: "vibe_warm" } // 適合戀愛/養成
        ],
        
        // 🎭 劇本專屬種子 (Skeleton Seeds)
        mystery_motive: [ 
            { val: "遺產爭奪", tag: "motive_money" }, { val: "情殺", tag: "motive_love" }, 
            { val: "復仇", tag: "motive_revenge" }, { val: "掩蓋秘密", tag: "motive_secret" }
        ],
        horror_curse_type: [ 
            { val: "古代詛咒", tag: "curse_ancient" }, { val: "怨靈附身", tag: "curse_ghost" }, 
            { val: "未知生物變異", tag: "curse_mutant" }, { val: "邪神低語", tag: "curse_god" }
        ],
        adventure_world_state: [ 
            { val: "戰火蔓延", tag: "world_war" }, { val: "魔物肆虐", tag: "world_monster" }, 
            { val: "和平但腐敗", tag: "world_corrupt" } 
        ],
        adventure_start_bonus: [ 
            { val: "神聖的", tag: "bonus_holy" }, { val: "被詛咒的", tag: "bonus_cursed" }, 
            { val: "生鏽的", tag: "bonus_rusty" }, { val: "傳說中的", tag: "bonus_legendary" } 
        ],
        romance_meet_location: [
            { val: "轉角處", tag: "meet_corner" }, { val: "圖書館的深處", tag: "meet_library" },
            { val: "雨中的屋簷下", tag: "meet_rain" }, { val: "喧囂的舞會上", tag: "meet_party" }
        ],
        raising_goal: [ // 🌟 新增：養成劇本目標
            { val: "奪得皇家競技場的冠軍", tag: "goal_combat" }, 
            { val: "通過最嚴苛的魔法大考", tag: "goal_magic" }, 
            { val: "重振沒落家族的榮耀", tag: "goal_family" },
            { val: "在末日中存活下來", tag: "goal_survival" }
        ],
        training_location: [ // 🌟 新增：養成劇本場地
            { val: "皇家訓練場", tag: "train_royal" }, { val: "禁忌的圖書館", tag: "train_library" },
            { val: "魔物出沒的後山", tag: "train_forest" }, { val: "破舊的地下道場", tag: "train_underground" }
        ],

        // 🏰【2. 建築物 (Buildings)】- 開局定調，帶有強烈主題標籤
        // ------------------------------------------------------------
        env_building: [
            // 驚悚/懸疑
            { val: "廢棄醫院", tag: ["location", "horror", "mystery"] }, 
            { val: "孤兒院", tag: ["location", "horror"] },
            { val: "療養院", tag: ["location", "horror"] },
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
            { val: "老舊旅館", tag: ["location", "mystery", "romance"] },
            { val: "星際郵輪", tag: ["location", "sci-fi", "romance"] }
        ],
        // (env_room 維持原樣，作為建築物內的隨機房間)
        env_room: [
            { val: "大廳", tag: ["room"] }, { val: "地下室", tag: ["room", "horror"] }, 
            { val: "圖書館", tag: ["room", "mystery", "raising"] }, { val: "手術室", tag: ["room", "horror"] }, 
            { val: "宴會廳", tag: ["room", "romance"] }, { val: "走廊", tag: ["room"] }, 
            { val: "臥室", tag: ["room", "romance"] }, { val: "書房", tag: ["room", "mystery"] }, 
            { val: "密室", tag: ["room", "mystery"] }, { val: "儲藏室", tag: ["room"] }, 
            { val: "牢房", tag: ["room", "horror"] }, { val: "控制室", tag: ["room", "sci-fi"] }, 
            { val: "祭壇室", tag: ["room", "magic", "horror"] }, { val: "實驗室", tag: ["room", "sci-fi", "raising"] },
			{ val: "廚房",     tag: ["room", "mystery", "alibi"] },
			{ val: "二樓陽台", tag: ["room", "mystery", "alibi"] },
			{ val: "溫室",     tag: ["room", "mystery", "romance", "alibi"] },
			{ val: "僕人房",   tag: ["room", "mystery", "alibi"] },
			{ val: "中庭",     tag: ["room", "mystery", "alibi"] },
			{ val: "化妝室",   tag: ["room", "mystery", "romance", "alibi"] },
			{ val: "地下酒窖", tag: ["room", "mystery", "alibi", "horror"] },
			{ val: "閣樓",     tag: ["room", "mystery", "horror", "alibi"] },
			{ val: "管家室",   tag: ["room", "mystery", "alibi"] },
			{ val: "彈藥庫",   tag: ["room", "mystery", "combat"] },
        ],

        // 🌟【新增：性格與階級前綴 (Trait Prefix)】- 取代原本寫死的組合
        trait_prefix: [
            { val: "" }, { val: "" }, // 故意放兩個空值，增加「沒有前綴」的普通機率
            { val: "皇家" }, { val: "神秘" }, { val: "瘋狂" }, { val: "豪門" }, 
            { val: "落魄" }, { val: "傲嬌" }, { val: "溫柔" }, { val: "冷酷" }, 
            { val: "天才" }, { val: "笨拙" }, { val: "不良" }, { val: "退役" }, 
            { val: "嚴厲" }, { val: "霸道" }, { val: "嗜血" }, { val: "流浪" }, 
            { val: "首席" }, { val: "病嬌" }, { val: "變異" }, { val: "殘暴" },
            { val: "高雅的" }, { val: "被詛咒的" }, { val: "傳說中的" }
        ],

        // 👤【3. 核心身份 (Core Identity)】- V8 Rogue-like 百搭生態系！
        // ------------------------------------------------------------
        core_identity: [ 
            // 🕵️ 懸疑/犯罪 (Mystery) - 拆解豪門寡婦、瘋狂法醫等
            { val: "{trait_prefix}偵探", tag: ["human", "mystery"] }, 
            { val: "{trait_prefix}法醫", tag: ["human", "mystery"] },
            { val: "{trait_prefix}嫌疑犯", tag: ["human", "mystery"] }, 
            { val: "{trait_prefix}怪盜", tag: ["human", "mystery"] },
            { val: "{trait_prefix}目擊者", tag: ["human", "mystery"] }, 
            { val: "{trait_prefix}寡婦", tag: ["human", "mystery", "romance"] },
            { val: "{trait_prefix}保鑣", tag: ["human", "mystery", "combat"] },

            // 👻 恐怖/驚悚 (Horror) - 人類
            { val: "{trait_prefix}倖存者", tag: ["human", "horror", "survivor"] }, 
            { val: "{trait_prefix}除靈師", tag: ["human", "horror", "magic"] },
            { val: "{trait_prefix}靈媒", tag: ["human", "horror", "magic"] }, 
            { val: "{trait_prefix}科學家", tag: ["human", "horror", "sci-fi"] },
            // 👻 恐怖/驚悚 (Horror) - 怪物
            { val: "{trait_prefix}觸手", tag: ["monster", "horror", "mutant"] }, 
            { val: "{trait_prefix}怨靈", tag: ["monster", "horror", "spirit"] },
            { val: "{trait_prefix}食屍鬼", tag: ["monster", "horror", "undead"] }, 
            { val: "{trait_prefix}無面者", tag: ["monster", "horror", "creepy"] },
            { val: "{trait_prefix}喪屍", tag: ["monster", "horror", "undead"] }, 
            { val: "{trait_prefix}血肉傀儡", tag: ["monster", "horror", "construct"] },

            // ⚔️ 冒險/奇幻 (Adventure) - 人類
            { val: "{trait_prefix}獵人", tag: ["human", "adventure", "combat"] }, 
            { val: "{trait_prefix}騎士", tag: ["human", "adventure", "combat"] },
            { val: "{trait_prefix}弓箭手", tag: ["human", "adventure", "magic"] }, 
            { val: "{trait_prefix}魔法師", tag: ["human", "adventure", "magic"] },
            { val: "{trait_prefix}賞金獵人", tag: ["human", "adventure", "combat"] }, 
            { val: "{trait_prefix}吟遊詩人", tag: ["human", "adventure", "romance"] },
            // ⚔️ 冒險/奇幻 (Adventure) - 怪物
            { val: "{trait_prefix}史萊姆", tag: ["monster", "adventure", "beast"] }, 
            { val: "{trait_prefix}哥布林", tag: ["monster", "adventure", "beast"] },
            { val: "{trait_prefix}巨熊", tag: ["monster", "adventure", "beast"] }, 
            { val: "{trait_prefix}石像鬼", tag: ["monster", "adventure", "construct"] },
            { val: "{trait_prefix}巨龍", tag: ["monster", "adventure", "boss"] }, 
            { val: "{trait_prefix}巫妖", tag: ["monster", "adventure", "boss"] },

            // 💕 戀愛 (Romance)
            { val: "{trait_prefix}青梅竹馬", tag: ["human", "romance"] }, 
            { val: "{trait_prefix}總裁", tag: ["human", "romance", "rich"] },
            { val: "{trait_prefix}轉學生", tag: ["human", "romance", "mystery"] }, 
            { val: "{trait_prefix}千金", tag: ["human", "romance", "rich"] },
            { val: "{trait_prefix}學長", tag: ["human", "romance"] }, 
            { val: "{trait_prefix}未婚夫", tag: ["human", "romance"] },

            // 📈 養成 (Raising) - 導師與學徒
            { val: "{trait_prefix}導師", tag: ["human", "raising", "mentor"] },
            { val: "{trait_prefix}教官", tag: ["human", "raising", "mentor"] },
            { val: "{trait_prefix}考官", tag: ["human", "raising", "mentor"] }, 
            { val: "{trait_prefix}見習生", tag: ["human", "is_trainee"] }, 
            { val: "{trait_prefix}學徒", tag: ["human", "is_trainee"] }, 
            { val: "{trait_prefix}少年", tag: ["human", "is_trainee"] },
            
            // 👇 這是你的動物/怪物學徒！
            { val: "{trait_prefix}史萊姆寶寶", tag: ["monster", "is_trainee", "beast"] }, 
            { val: "{trait_prefix}幼龍", tag: ["monster", "is_trainee", "dragon"] },
            { val: "{trait_prefix}機關犬", tag: ["monster", "is_trainee", "construct"] },

            // 🏘️ 通用路人 (Civilian - 補底用)
            { val: "{trait_prefix}村民", tag: ["human", "civilian"] }, { val: "{trait_prefix}商人", tag: ["human", "civilian"] },
            { val: "{trait_prefix}老人", tag: ["human", "civilian"] }, { val: "{trait_prefix}酒館老闆", tag: ["human", "civilian"] }
        ],

        // 🏷️【4. 實體前綴修飾 (Identity Modifier)】- 帶「的」，只能加在名詞前
        // ------------------------------------------------------------
        identity_modifier: [ 
            { val: "" }, { val: "年輕的", tag: ["romance", "raising"] }, { val: "年邁的" }, 
            { val: "成熟的", tag: ["romance"] }, { val: "蒼老的", tag: ["ancient", "horror"] }, 
            { val: "不朽的", tag: ["ancient", "magic"] }, { val: "新生的", tag: ["mutant", "raising"] },
            { val: "神祕的", tag: ["mystery"] }, { val: "落魄的", tag: ["poor"] }, 
            { val: "身穿制服的", tag: ["sci-fi", "raising"] }, { val: "腐敗的", tag: ["horror", "undead"] },
            { val: "異化的", tag: ["horror", "sci-fi"] }, { val: "氣質高雅的", tag: ["romance", "rich"] }, 
            { val: "滿身傷痕的", tag: ["combat", "survivor"] }
        ],

        // 🎭【5. 實體狀態與特質副句 (State & Trait Clauses)】
        // ------------------------------------------------------------
        state_modifier: [ 
            { val: "身受重傷", tag: ["combat", "horror"] }, { val: "陷入了沉睡" }, 
            { val: "看起來十分虛弱" }, { val: "正處於失控的邊緣", tag: ["horror", "magic"] }, 
            { val: "神情充滿驚恐", tag: ["horror"] }, { val: "正冷靜地觀察著四周", tag: ["mystery"] }, 
            { val: "渾身都在顫抖" }, { val: "眼神中充滿絕望", tag: ["horror"] }, 
            { val: "正發出詭異的狂笑", tag: ["horror", "creepy"] }, { val: "處於高度警戒狀態", tag: ["combat"] },
            { val: "正張牙舞爪地示威", tag: ["monster"] }, { val: "臉上帶著溫柔的微笑", tag: ["romance"] },
            { val: "正專注地翻閱著筆記", tag: ["raising", "mystery"] }
        ],
        trait_clause: [ 
            { val: "渾身散發著墮落的氣息", tag: ["horror", "magic"] }, 
            { val: "似乎被某種古老的詛咒纏身", tag: ["horror", "ancient"] }, 
            { val: "身上帶著濃烈的血腥味", tag: ["horror", "combat"] }, 
            { val: "給人一種極度危險的壓迫感", tag: ["combat", "boss"] }, 
            { val: "身上佈滿了不明原因的變異痕跡", tag: ["horror", "sci-fi"] }, 
            { val: "舉手投足間散發著迷人的魅力", tag: ["romance"] },
            { val: "眼中閃爍著對知識的狂熱", tag: ["raising", "magic"] }
        ],
        verb_equip: [ 
            { val: "把玩著" }, { val: "緊緊握著", tag: ["combat", "horror"] }, 
            { val: "死死盯著", tag: ["horror"] }, { val: "小心隱藏著", tag: ["mystery"] }, 
            { val: "輕輕撫摸著", tag: ["romance"] }, { val: "高高舉起", tag: ["combat"] },
			{ val: "急忙清理著",     tag: ["mystery", "horror"] },    // 兇手洗手？
			{ val: "偷偷保養著",     tag: ["mystery"] },               // 武器？
			{ val: "整理著",         tag: ["mystery", "alibi"] },      // 不在場證明：整理房間
			{ val: "尋找遺失的",     tag: ["mystery", "alibi"] },      // 不在場證明：找東西
			{ val: "悄悄燒毀著",     tag: ["mystery", "horror"] },     // 銷毀證據
			{ val: "顫抖著翻閱",     tag: ["mystery", "horror"] },     // 找線索
			{ val: "仔細擦拭著",     tag: ["mystery", "combat"] },     // 擦武器
			{ val: "切著",           tag: ["mystery", "alibi"] },      // 廚房：切菜
			{ val: "倒著",           tag: ["mystery", "alibi"] },      // 廚房：倒酒
        ],

        // ⚔️【6. 物品組件 (Item Parts)】- 同樣補上標籤！
        // ------------------------------------------------------------
        item_core: [ 
            { val: "懷錶", tag: ["item", "mystery", "romance"] }, { val: "鑰匙", tag: ["item", "mystery"] }, 
            { val: "日記本", tag: ["item", "mystery", "romance"] }, { val: "匕首", tag: ["item", "weapon", "combat"] }, 
            { val: "戒指", tag: ["item", "romance", "magic"] }, { val: "護符", tag: ["item", "magic", "horror"] }, 
            { val: "信件", tag: ["item", "mystery", "romance"] }, { val: "藥瓶", tag: ["item", "sci-fi", "horror"] }, 
            { val: "寶石", tag: ["item", "valuable", "magic"] }, { val: "長劍", tag: ["item", "weapon", "adventure"] },
            { val: "訓練木劍", tag: ["item", "weapon", "raising"] }, { val: "不明祭品", tag: ["item", "horror", "magic"] },
			{ val: "手帕",         tag: ["item", "mystery", "clue"] },
			{ val: "安眠藥瓶",     tag: ["item", "mystery", "horror", "clue"] },
			{ val: "破碎的酒杯",   tag: ["item", "mystery", "clue"] },
			{ val: "燒了一半的信", tag: ["item", "mystery", "clue"] },
			{ val: "血跡斑斑的手套", tag: ["item", "mystery", "horror", "clue"] },
			{ val: "遺囑副本",     tag: ["item", "mystery", "clue"] },
			{ val: "密碼鎖記事本", tag: ["item", "mystery", "clue"] },
			{ val: "奇怪的藥粉",   tag: ["item", "mystery", "horror", "clue"] },
			{ val: "帶有香水味的手帕", tag: ["item", "mystery", "romance", "clue", "fake_clue"] },
			{ val: "寫著數字的紙條", tag: ["item", "mystery", "clue", "fake_clue"] },
			{ val: "沾著泥土的鞋底", tag: ["item", "mystery", "clue", "fake_clue"] },
			{ val: "不明來源的鑰匙", tag: ["item", "mystery", "clue"] },
        ],
        item_physical_state: [
            { val: "" }, { val: "黃銅製的" }, { val: "純銀的", tag: ["magic"] }, 
            { val: "生鏽的", tag: ["horror", "ancient"] }, { val: "皮革製的" }, 
            { val: "骨製的", tag: ["horror", "ancient"] }, { val: "破碎的" }, 
            { val: "染血的", tag: ["horror", "combat"] }, { val: "精緻的", tag: ["romance", "rich"] }, 
            { val: "被嚴重腐蝕的", tag: ["horror", "sci-fi"] }, { val: "溫熱的", tag: ["romance", "magic"] },
			{ val: "沾著泥土的",       tag: ["mystery", "horror"] },
			{ val: "帶有神祕香味的",   tag: ["mystery", "romance"] },
			{ val: "燒了一半的",       tag: ["mystery", "horror"] },
			{ val: "密封在信封裡的",   tag: ["mystery"] },
			{ val: "帶著名字刻印的",   tag: ["mystery", "romance"] },
        ],
        item_power_clause: [
            { val: "它似乎能封印靈魂", tag: ["magic", "horror"] }, 
            { val: "它似乎在吸收周圍的生命力", tag: ["magic", "horror"] }, 
            { val: "表面散發著微弱的光芒", tag: ["magic", "mystery"] }, 
            { val: "拿在手上會帶來一股刺骨的寒意", tag: ["horror"] }, 
            { val: "上面沾染著無法洗去的暗沉血跡", tag: ["horror", "combat"] },
            { val: "只要靠近，腦海中就會引發詭異的幻覺", tag: ["horror", "sci-fi"] }, 
            { val: "這似乎是某人珍藏多年的信物", tag: ["romance"] }
        ],

        // (環境修飾語維持原樣，不影響功能)
        env_adj: [ 
            { val: "" }, { val: "廢棄的" }, { val: "豪華的" }, { val: "古老的" }, 
            { val: "陰暗的" }, { val: "血跡斑斑的" }, { val: "破敗的" }, { val: "死一般寂靜的" }, 
            { val: "陰森的" }, { val: "潮濕的" }, { val: "神祕的" }, { val: "溫馨的" } 
        ],
        env_feature: [ 
            { val: "陰暗的角落" }, { val: "發霉的天花板" }, { val: "厚重的帷幕後方" }, 
            { val: "濃密的陰影中" }, { val: "斑駁的牆壁上" }, { val: "昏暗的樓梯下方" }, 
            { val: "凌亂的桌面上" }, { val: "黑暗深處" } 
        ],
        env_light: [ 
            { val: "微弱的燭光" }, { val: "刺眼的閃電" }, { val: "慘白的月光" }, 
            { val: "搖曳的火光" }, { val: "昏暗的燈光" }, { val: "殘存的微光" },
            { val: "溫暖的夕陽" } // 適合戀愛
        ],
        env_sound: [ 
            { val: "滴答的水滴聲" }, { val: "急促的腳步聲" }, { val: "詭異的低語" }, 
            { val: "痛苦的喘息聲" }, { val: "若有似無的哭聲" }, { val: "令人發毛的笑聲" }, 
            { val: "淒厲的尖叫聲" }, { val: "呼嘯的風聲" }, { val: "遠處傳來的鐘聲" } 
        ],
        env_smell: [ 
            { val: "潮濕的霉味" }, { val: "刺鼻的鐵鏽味" }, { val: "濃烈的血腥味" }, 
            { val: "令人作嘔的腐臭味" }, { val: "濃郁的藥水味" }, { val: "淡淡的花香" } // 花香適合戀愛
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
    // 🧬 [Layer 1] 分子組合層 (Composite Words) - V5 語法化短句
    // ============================================================

    // 🏰 1. 組合地點與環境包 (Environment Packs)
    combo_location: [
        { val: "{env_adj}{env_building}的{env_room}" }, // 例：廢棄莊園的地下室
        { val: "{env_adj}{env_room}" }                  // 例：陰暗的走廊
    ],
    
    env_pack_visual: [
        { val: "在{env_light}的映照下，{env_feature}顯得格外詭異。" },
        { val: "{env_light}勉強照亮了四周，地上的影子隨著光線扭動。" },
        { val: "{env_feature}隱沒在黑暗中，讓人看不清虛實。" },
        { val: "周圍的{env_feature}給人一種莫名的壓迫感。" }
    ],
    env_pack_sensory: [
        { val: "空氣中瀰漫著{env_smell}，令人作嘔。" },
        { val: "四周死一般寂靜，只有{env_sound}在空間裡迴盪。" },
        { val: "遠處不時傳來{env_sound}，讓人毛骨悚然。" },
        { val: "你隱約感覺到有一股視線從{env_feature}投射過來。" }
    ],

    // ⚔️ 2. 組合物品 (Item Combos)
    combo_item_simple: [
        { val: "{item_physical_state}{item_core}" } // 例：生鏽的匕首
    ],
    combo_item_desc: [
        { val: "一個{item_physical_state}{item_core}，{item_power_clause}。" },
        { val: "一把{item_physical_state}{item_core}，拿在手上傳來異常的觸感。" },
        { val: "一個看似普通的{item_core}，但{item_power_clause}。" }
    ],

    // 👤 3. 人物與實體組合 (Entity Appearance)
    // ⚠️ 備註：這是給「隨機通用事件」抽路人用的。
    // 如果劇本要呼叫主線角色，請直接在對話裡寫 {lover}, {detective}, {mentor} 等記憶變數！
    combo_person_appearance: [
        { val: "一名{identity_modifier}{core_identity}" },
        { val: "一名{identity_modifier}{core_identity}，對方{state_modifier}。" },
        { val: "一名{core_identity}，對方{trait_clause}。" },
        { val: "一名{identity_modifier}{core_identity}，手中{verb_equip}一個{combo_item_simple}。" }
    ],

    // ============================================================
    // 🌟 [Layer 2] 複雜句型層 (Complex Sentences) - 用於事件觸發
    // ============================================================

    sentence_event_sudden: [
        { val: "{atom_time}，{env_sound}突然響起，打破了平靜！" },
        { val: "毫無預兆地，{env_light}猛然熄滅，周圍陷入一片黑暗。" },
        { val: "你的直覺瘋狂示警，{env_feature}傳來了不尋常的動靜。" }
    ],

    sentence_encounter: [
        { val: "一個黑影從{env_feature}竄了出來！仔細一看，是{combo_person_appearance}！" },
        { val: "你猛然回頭，赫然發現{combo_person_appearance}正盯著你。" },
        { val: "伴隨著一聲異響，{combo_person_appearance}擋住了你的去路！" }
    ],

    sentence_tension: [
        { val: "你的心臟在胸腔裡狂跳，冷汗順著額頭滑落。" },
        { val: "大腦一片空白，你必須立刻做出決定。" },
        { val: "理智告訴你應該逃跑，但雙腿卻像灌了鉛一樣沉重。" },
        { val: "空氣中瀰漫著危險又極具張力的氣息。" },
        { val: "你屏住呼吸，連大氣都不敢喘一聲。" }
    ],
	// B. 偵探專用新詞庫（全新 key，直接加進 DB.fragments 裡）
	alibi_action: [
    { val: "{verb_equip}那個{item_core}",tag: ["mystery"] },
    { val: "忙著{verb_equip}幾樣東西",tag: ["mystery"] },
    { val: "{verb_equip}一瓶{item_core}",tag: ["mystery"] },
	],
	alibi_claim: [
    { val: "你胡說！案發當時我明明在{env_room}，{verb_equip}那個{item_core}！",tag: ["mystery"] },
    { val: "這是誣陷！我一直待在{env_room}，根本沒有離開過！",tag: ["mystery"] },
    { val: "你有什麼證據！？那時候我正在{env_room}{verb_equip}東西，有人親眼看見！",tag: ["mystery"] },
    { val: "你不過是在猜測！我當時在{env_room}，而且我可以證明！",tag: ["mystery"] },
	],
	culprit_exposed: [
    { val: "那...那個...！（{true_culprit}的眼神開始躲閃）" },
    { val: "不...不可能！這東西怎麼會在你手上！？" },
    { val: "（{true_culprit}臉色瞬間蒼白，嘴唇輕顫）...我...我可以解釋..." },
    { val: "住嘴！你...你根本不知道你在說什麼！" },
	],
	// 🔍 嫌疑人反擊台詞（玩家出示假線索時）
	culprit_counter: [
		{ val: "就這個？哈。這只能說明你毫無頭緒。",tag: ["mystery"] },
		{ val: "{true_culprit}冷冷一笑：「{item_core}？這和我有什麼關係？」",tag: ["mystery"] },
		{ val: "你是在開玩笑嗎？這種程度的『證物』連警察都說服不了，更別說我了。", tag: ["mystery"] },
	],

	// 🔍 圍觀者反應（公信度高時）
	crowd_trust: [
		{ val: "「確實...這說不過去。」有人低聲說道。" },
		{ val: "周圍的人開始交頭接耳，氣氛明顯轉向。" },
		{ val: "「你繼續說！」一個聲音從人群中喊出。" },
	],

	// 🔍 圍觀者懷疑（公信度低時）
	crowd_doubt: [
		{ val: "「這人是不是瘋了？」有人小聲嘀咕。" },
		{ val: "周圍的人投來懷疑的眼神，氣氛越來越對你不利。" },
		{ val: "「你才是兇手吧？」有人突然指向你。" },
	],

	// 🔍 生存者路線：躲藏時的心理獨白
	survivor_hiding: [
		{ val: "你屏住呼吸，蜷縮在{env_feature}後面，聽著外面的動靜。",tag: ["survivor", "horror"] },
		{ val: "心跳聲大到你以為對方一定能聽見。腳步聲...停了。",tag: ["survivor", "horror"] },
		{ val: "你用雙手捂住嘴，防止自己因為恐懼而發出聲音。",tag: ["survivor", "horror"] },
		{ val: "幾秒鐘的沉默，比幾個小時還要漫長。",tag: ["survivor", "horror"] },
	],

	// 🔍 生存者路線：目擊偵探行動的旁觀台詞
	survivor_witness: [
		{ val: "從縫隙中，你看到那個自告奮勇的傢伙正在搜查什麼...",tag: ["survivor", "mystery"] },
		{ val: "你沒有插手的能力，只能看著事情在你眼前發展。",tag: ["survivor"] },
		{ val: "他似乎找到了什麼——你看到他臉上露出了複雜的表情。",tag: ["survivor", "mystery"] },
	],
	clue_physical: [
    { val: "一根染血的髮夾", tag: ["mystery", "evidence"] },
    { val: "撕破的遺書碎片", tag: ["mystery", "evidence"] },
    { val: "上了鎖的日記", tag: ["mystery", "evidence"] },
    { val: "被人動過的毒藥瓶", tag: ["mystery", "evidence", "horror"] },
    { val: "被偽造的帳目", tag: ["mystery", "evidence", "motive_money"] }
	],
	clue_testimony: [
		{ val: "那天晚上我聽到了爭吵聲", tag: ["mystery"] },
		{ val: "有人深夜進出過那個房間", tag: ["mystery"] },
		{ val: "死者生前說過他很害怕某個人", tag: ["mystery"] }
	],
	deduction_sentence: [
		{ val: "根據{alibi_claim}，{suspect_A}的時間線對不上。" },
		{ val: "如果{suspect_B}說的是真話，那{murder_weapon}就不可能在那個地方。" },
		{ val: "只有知道暗道位置的人，才能做到這件事。" }
	],

	// ── 恐怖劇本需要 ─────────────────────────────────────────
	horror_sound: [
		{ val: "低沉的哭泣聲", tag: ["horror", "ghost"] },
		{ val: "指甲劃過牆壁的聲音", tag: ["horror", "creepy"] },
		{ val: "不規律的心跳聲", tag: ["horror", "curse_god"] },
		{ val: "用你不認識的語言低語", tag: ["horror", "ancient"] },
		{ val: "孩子的笑聲，但背後沒有人", tag: ["horror", "ghost", "creepy"] }
	],
	horror_vision: [
		{ val: "牆上出現了會移動的影子" },
		{ val: "鏡子裡的自己慢了半秒才動" },
		{ val: "你看見有人站在窗外，但那是三樓" },
		{ val: "桌上的蠟燭同時熄滅了" }
	],
	curse_symptom: [
		{ val: "你的手指開始顫抖，停不下來", tag: ["cursed"] },
		{ val: "你忘記了自己剛才在做什麼", tag: ["cursed", "sanity"] },
		{ val: "你聽見了有人在叫你的名字", tag: ["cursed", "ghost"] }
	],

	// ── 冒險劇本需要 ─────────────────────────────────────────
	battle_result_win: [
		{ val: "對方轟然倒地，戰鬥結束。", tag: ["combat"] },
		{ val: "{boss}發出最後的嘶吼，消失在黑暗中。", tag: ["combat", "boss"] },
		{ val: "你勉強撐了下來，身上帶著幾道新傷。", tag: ["combat", "survivor"] }
	],
	battle_result_lose: [
		{ val: "你力竭倒地，失去了意識。", tag: ["combat"] },
		{ val: "對方把你逼到了角落，你無路可退。", tag: ["combat", "risk_high"] }
	],
	loot_desc: [
		{ val: "一枚嵌著紅寶石的戒指", tag: ["adventure", "magic"] },
		{ val: "沾滿黑血的古老地圖", tag: ["adventure", "ancient"] },
		{ val: "精心偽裝過的密道入口", tag: ["adventure", "mystery"] }
	],

	// ── 戀愛劇本需要 ─────────────────────────────────────────
	env_light: [
		{ val: "昏黃的燈光", tag: ["romance"] },
		{ val: "月光", tag: ["romance", "mystery"] },
		{ val: "餘暉", tag: ["romance"] },
		{ val: "搖曳的燭光", tag: ["romance", "horror"] }
	],
	// （romance 劇本大量用了 {env_light}，但 data_core 裡沒有這個 key）
	lover_action: [
		{ val: "輕輕地嘆了口氣", tag: ["romance"] },
		{ val: "把視線移開，假裝在看窗外", tag: ["romance"] },
		{ val: "用指尖輕輕碰了一下你的袖口", tag: ["romance"] },
		{ val: "沉默了很久，才開口", tag: ["romance"] }
	],
	rival_action: [
		{ val: "表情沒有變，但眼神變了", tag: ["romance"] },
		{ val: "突然走到你旁邊，壓低聲音說話", tag: ["romance"] },
		{ val: "若無其事地笑了笑", tag: ["romance"] }
	],

	// ── 養成劇本需要 ─────────────────────────────────────────
	training_result: [
		{ val: "勉強完成了任務，但還有很大的進步空間", tag: ["raising"] },
		{ val: "超出了{mentor}的預期，對方難得誇了你一句", tag: ["raising", "mentor"] },
		{ val: "失敗了，但你清楚知道下次要怎麼改", tag: ["raising"] }
	],
	mentor_remark: [
		{ val: "「還不夠快。」", tag: ["raising", "mentor"] },
		{ val: "「方向對了，但力道不足。」", tag: ["raising", "mentor"] },
		{ val: "「這次做得不錯。繼續。」", tag: ["raising", "mentor"] },
		{ val: "「如果你昨天有練習，現在就不會出錯。」", tag: ["raising", "mentor"] }
	],

    // ============================================================
    // 🎬 [Layer 3] 動態句型庫 (Dynamic Phrase Library) - V5 電影級過場
    // ============================================================

    phrase_explore_start: [
        { val: "{atom_time}，你輕步走進了{combo_location}。" },
        { val: "推開沉重的門，映入眼簾的是{combo_location}。" },
        { val: "穿過漫長的通道，你終於來到了{combo_location}。" }
    ],
    phrase_explore_vibe: [
        { val: "{env_pack_visual}" },
        { val: "{env_pack_sensory}" },
        { val: "{env_pack_visual}{env_pack_sensory}" } 
    ],

    phrase_danger_warn: [
        { val: "{sentence_event_sudden}" },
        { val: "{sentence_tension}{sentence_event_sudden}" },
		{ val: "門把突然被緩緩轉動，有人正在外面...",tag: ["mystery", "horror", "survivor"] },
		{ val: "走廊上的腳步聲越來越近，然後停在了你的門前。", tag: ["mystery", "horror", "survivor"] },
		{ val: "燈光突然熄滅，整個房間陷入黑暗。",tag: ["mystery", "horror", "survivor"] },
		{ val: "你的名字被某人以極低的聲音呼喚著。",tag: ["mystery", "horror", "survivor"] },
		{ val: "窗外映出一個黑影，緩慢地移動著。",tag: ["mystery", "horror", "survivor"] },
    ],
    phrase_danger_appear: [
        { val: "{sentence_encounter}" },
        { val: "前方的陰影中，緩緩走出了一個身影... 是{combo_person_appearance}！" },{ val: "你感覺到床底有某種東西正在蠕動。",tag: ["horror", "survivor"] },
		{ val: "衣櫃的門從裡面被猛地推開，一個身影衝了出來！",tag: ["horror", "mystery", "survivor"] },
		{ val: "鏡子裡的倒影...與你的動作不同步。",tag: ["horror", "mystery"] },
		{ val: "你轉身，那人已經站在你身後不到一步的距離，手中持著某物。", tag: ["horror", "mystery", "survivor"] },
    ],

    phrase_find_action: [
        { val: "你蹲下身，仔細檢查著{env_feature}。" },
        { val: "在{env_light}的映照下，某個反光的東西吸引了你的目光。" },
        { val: "你翻開了旁邊的雜物，赫然發現了什麼。" }
    ],
    phrase_find_result: [
        { val: "竟然是{combo_item_desc}" }, 
        { val: "你找到了一個{combo_item_simple}。這東西為什麼會出現在這裡？" },
        { val: "那是一個{combo_item_simple}，上面還殘留著使用過的痕跡。" }
    ],

    // [修改] 移除針對特定 actor_xxx 的依賴，改為通用戰鬥描述
    phrase_combat_start: [
        { val: "你拔出武器，死死盯著眼前的威脅。" },
        { val: "對方發出震耳欲聾的怒吼，朝你猛撲過來！" },
        { val: "沒有交涉的餘地，戰鬥一觸即發！" }
    ],
    horror_chase_start: [
        { val: "你轉過身，看到那恐怖的身影正站在走廊盡頭。" },
        { val: "燈光閃爍了一下，對方突然出現在你面前！" },
        { val: "耳邊傳來急促的腳步聲，有什麼東西正在瘋狂地追逐你！" }
    ],

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
	// ── 全新複合動態句型 (Phase 6) ──────────────────────────────
        time_aware_desc: [
            { val: "這已經不是你第一次在這條走廊上徘徊了。" },
            { val: "你覺得時間越來越少，空氣變得稀薄。" },
            { val: "某種感覺告訴你，終點就在不遠處。" }
        ],
        env_full_desc: [
            { val: "{env_pack_visual}<br>{env_pack_sensory}<br>你停下腳步，感覺到{sentence_tension}" },
            { val: "在{env_weather}的氣氛下，{env_pack_visual}讓整個場景多了幾分{atmosphere}的色彩。" }
        ],

        // ── 恐怖與戰鬥補充詞庫 ──────────────────────────────
        horror_sound: [
            { val: "低沉的哭泣聲", tag: ["horror", "ghost"] },
            { val: "指甲劃過牆壁的聲音", tag: ["horror", "creepy"] },
            { val: "不規律的心跳聲", tag: ["horror", "curse_god"] },
            { val: "孩子的笑聲，但背後沒有人", tag: ["horror", "ghost", "creepy"] }
        ],
        horror_vision: [
            { val: "牆上出現了會移動的影子" },
            { val: "你看見有人站在窗外，但這裡是三樓" },
            { val: "桌上的蠟燭同時熄滅了" }
        ],
        battle_result_win: [
            { val: "對方轟然倒地，戰鬥結束。", tag: ["combat"] },
            { val: "{boss}發出最後的嘶吼，消失在黑暗中。", tag: ["combat", "boss"] }
        ],

        // ── 戀愛與養成補充詞庫 ──────────────────────────────
        lover_action: [
            { val: "輕輕地嘆了口氣", tag: ["romance"] },
            { val: "把視線移開，假裝在看窗外", tag: ["romance"] },
            { val: "用指尖輕輕碰了一下你的袖口", tag: ["romance"] }
        ],
        rival_action: [
            { val: "表情沒有變，但眼神變了", tag: ["romance"] },
            { val: "若無其事地笑了笑", tag: ["romance"] }
        ],
        training_result: [
            { val: "勉強完成了任務，但還有很大的進步空間", tag: ["raising"] },
            { val: "超出了{mentor}的預期，對方難得誇了你一句", tag: ["raising", "mentor"] }
        ],
        mentor_remark: [
            { val: "「方向對了，但力道不足。」", tag: ["raising", "mentor"] },
            { val: "「這次做得不錯。繼續。」", tag: ["raising", "mentor"] }
        ],
});

console.log("✅ story_data_core_mystery_patch.js 已載入（偵探詞庫擴充包）");
})();