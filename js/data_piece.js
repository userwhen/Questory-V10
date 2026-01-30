/* js/data_piece.js - V44.2 (Mode Fixed & Ruby Safe) */

window.FragmentDB = {
    
    simActions: {
        act_train: { id: "act_train", cost: { energy: 15 }, effects: { str: 3, vit: 2 }, tags: ["training_event"] },
        act_study: { id: "act_study", cost: { energy: 10 }, effects: { int: 4, wis: 1 }, tags: ["library_event"] },
        act_pray:  { id: "act_pray",  cost: { energy: 5 },  effects: { luc: 2, san: 5 }, tags: ["temple_event"] }
    },

    // ============================================================
    // 1. 選項規則 (避免使用半形 [] 導致 Ruby 誤判)
    // ============================================================
    optionRules: [
        // [A] 初遇
        {
            reqTag: 'encounter_npc',
            options: [
                {
                    label: { zh:"【魅力】友善攀談", en:"Talk friendly" },
                    style: "primary",
                    check: { stat: "chr", val: 10 },
                    action: "advance_chain",
                    nextTags: ["trust_gained", "next_day"],
                    failNextTags: ["ignored_npc"] // 失敗則當作沒發生
                },
                {
                    label: { zh:"保持警惕離開", en:"Leave" },
                    style: "normal",
                    action: "advance_chain",
                    nextTags: ["ignored_npc", "next_day"]
                }
            ]
        },
        // [B] 陷阱/戰鬥
        {
            reqTag: 'trapped',
            options: [
                {
                    label: { zh:"【敏捷】尋找出口", en:"[DEX] Find Exit" },
                    style: "warning",
                    check: { stat: "dex", val: 12 },
                    action: "advance_chain",
                    nextTags: ["escape_success"],
                    failNextTags: ["escape_fail"]
                },
                {
                    label: { zh:"【力量】破壞鐵籠", en:"[STR] Break Cage" },
                    style: "danger",
                    check: { stat: "str", val: 14 },
                    action: "advance_chain",
                    nextTags: ["escape_success"],
                    failNextTags: ["escape_fail"]
                }
            ]
        },
        // [C] 敵對
        {
            reqTag: 'hostile',
            options: [
                {
                    label: { zh:"【力量】正面迎戰", en:"Attack" },
                    style: "danger",
                    check: { stat: "str", val: 12 },
                    action: "advance_chain",
                    nextTags: ["combat_victory"],
                    failNextTags: ["combat_defeat"]
                }
            ]
        }
    ],

    // ============================================================
    // 2. 劇本模板 (全部補上 mode: "adventurer")
    // ============================================================
    templates: [
        
        // --- Layer 1: Setup ---
        {
            id: "tmpl_meet_stranger",
            type: "setup",
            mode: "adventurer", // [Critical Fix]
            text: {
                zh: "你冒險來到了{location}，在路邊遇見了一位{npc}。他微笑著向你招手，似乎對你{activity}很感興趣。",
                en: "You arrived at {location} and met a {npc}."
            },
            slots: ["location", "npc", "activity"],
            outTags: ["encounter_npc"]
        },
        {
            id: "tmpl_dungeon_start",
            type: "setup",
            mode: "adventurer", // [Critical Fix]
            text: {
                zh: "你踏入了{location}，空氣中瀰漫著{atmosphere}的味道。陰影中似乎有什麼東西在蠢蠢欲動。",
                en: "You enter {location}..."
            },
            slots: ["location", "atmosphere"],
            outTags: ["hostile"]
        },

        // --- Layer 2: Event (陷阱) ---
        {
            id: "tmpl_trap_reveal",
            type: "event",
            mode: "adventurer", // [Critical Fix]
            reqTag: "trust_gained", 
            text: {
                zh: "翌日，經過{memory:npc}的熱情介紹，你來到了一處據說是寶藏地點的{trap_loc}。然而當你踏入時，身後的鐵閘門轟然落下！這居然是個陷阱！",
            },
            slots: ["trap_loc"],
            outTags: ["trapped"]
        },

        // --- Layer 2: Event (平淡) ---
        {
            id: "tmpl_nothing_happened",
            type: "event",
            mode: "adventurer", // [Critical Fix]
            reqTag: "ignored_npc",
            text: {
                zh: "你沒有理會那個人，徑直離開了。這或許是個明智的決定，因為你的直覺告訴你這裡並不安全。",
            },
            outTags: ["safe_end"]
        },

        // --- Layer 2: Event (戰鬥勝) ---
        {
            id: "tmpl_combat_win",
            type: "event",
            mode: "adventurer", // [Critical Fix]
            reqTag: "combat_victory",
            text: {
                zh: "經過一番激戰，你成功擊退了敵人！你氣喘吁吁地檢查戰場，尋找有價值的東西。",
            },
            outTags: ["loot_phase"]
        },

        // --- Layer 3: Ending (成功) ---
        {
            id: "tmpl_escape_good",
            type: "ending",
            mode: "adventurer", // [Critical Fix]
            reqTag: "escape_success",
            text: {
                zh: "憑藉著過人的身手，你成功逃出了{memory:trap_loc}！這次經歷讓你學到了寶貴的一課：不要輕易相信陌生人。",
            },
            outTags: ["complete"]
        },

        // --- Layer 3: Ending (失敗) ---
        {
            id: "tmpl_escape_bad",
            type: "ending",
            mode: "adventurer", // [Critical Fix]
            reqTag: "escape_fail",
            text: {
                zh: "機關太過複雜，你沒能打開。體力耗盡的你，只能眼睜睜看著{memory:npc}帶著手下逼近...",
            },
            outTags: ["bad_end"]
        },
        
        // --- Layer 3: Ending (通用) ---
        {
            id: "tmpl_generic_end",
            type: "ending",
            mode: "adventurer", // [Critical Fix]
            text: {
                zh: "一段旅程結束了。你在{location}稍作休息，整理裝備，準備迎接下一次的挑戰。",
            },
            slots: ["location"],
            outTags: ["complete"]
        },
		
		{
            id: "tmpl_combat_defeat",
            type: "event",
            mode: "adventurer",
            reqTag: "combat_defeat",
            text: {
                zh: "敵人的實力遠超你的想像！你被打得節節敗退，最後不得不狼狽地逃離戰場。",
                en: "Defeated, you flee..."
            },
            outTags: ["bad_end"]
        },
		
    ],

    // ============================================================
    // 3. 碎片庫
    // ============================================================
    fragments: {
        location: [
            { id: "loc_village", val: { zh:"邊境小村" }, weight: 1 },
            { id: "loc_market", val: { zh:"黑市暗巷" }, weight: 1 },
            { id: "loc_ruins", val: { zh:"古老遺跡" }, weight: 1 }
        ],
        atmosphere: [
            { id: "atmo_damp", val: { zh:"潮濕腐敗" }, weight: 1 },
            { id: "atmo_blood", val: { zh:"鐵鏽與血腥" }, weight: 1 }
        ],
        trap_loc: [
            { id: "tl_cave", val: { zh:"廢棄礦坑" }, weight: 1 },
            { id: "tl_dungeon", val: { zh:"地下水牢" }, weight: 1 }
        ],
        npc: [
            { id: "npc_thief", val: { zh:"看起來很誠懇的嚮導" }, weight: 1 },
            { id: "npc_merchant", val: { zh:"滿臉堆笑的古董商" }, weight: 1 },
            { id: "npc_beggar", val: { zh:"神秘的兜帽客" }, weight: 1 }
        ],
        activity: [
            { id: "act_sword", val: { zh:"背後的寶劍" }, weight: 1 },
            { id: "act_magic", val: { zh:"身上的魔力波動" }, weight: 1 }
        ]
    }
};