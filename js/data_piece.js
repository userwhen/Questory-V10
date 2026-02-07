/* js/data_piece.js - V3.0 Dialogue & Item Fix */
window.FragmentDB = {
    fragments: {
        location: [
            { val: { zh: "陰森的墓穴", en: "Gloomy Tomb" }, tags: ['dark', 'danger'] },
            { val: { zh: "陽光普照的遺跡", en: "Sunny Ruins" }, tags: ['light', 'safe'] },
            { val: { zh: "潮濕的地下水道", en: "Damp Sewer" }, tags: ['water', 'dirty'] },
            { val: { zh: "被詛咒的圖書館", en: "Cursed Library" }, tags: ['magic', 'dark'] },
            { val: { zh: "巨龍的巢穴", en: "Dragon's Lair" }, tags: ['fire', 'danger'] }
        ],
        enemy: [
            { val: { zh: "哥布林斥候", en: "Goblin Scout" }, tags: ['weak'] },
            { val: { zh: "飢餓的野狼", en: "Hungry Wolf" }, tags: ['beast'] },
            { val: { zh: "骷髏士兵", en: "Skeleton Soldier" }, tags: ['undead'] },
            { val: { zh: "史萊姆", en: "Slime" }, tags: ['magic'] },
            { val: { zh: "暗影刺客", en: "Shadow Assassin" }, tags: ['humanoid'] }
        ],
        item: [
            { val: { zh: "古老的金幣", en: "Old Coin" } },
            { val: { zh: "發光的寶石", en: "Glowing Gem" } },
            { val: { zh: "破損的地圖", en: "Torn Map" }, tags: ['map_item'] }, 
            { val: { zh: "生鏽的鑰匙", en: "Rusty Key" }, tags: ['key_item'] }
        ],
        adj: [
            { val: { zh: "令人不安的", en: "Unsettling" } },
            { val: { zh: "充滿神秘的", en: "Mysterious" } },
            { val: { zh: "寂靜的", en: "Silent" } },
            { val: { zh: "腐臭的", en: "Putrid" } }
        ]
    },

    templates: [
        // ================= SETUP =================
        {
            type: 'setup',
            id: 'setup_quest',
            structure: { baseDepth: 3, variance: 2 },
            text: { zh: "你接下委託，來到了目的地。" },
            slots: ['adj', 'location'],
            dialogue: [
                { speaker: "委託人", text: { zh: "就是這裡了，那個{adj}{location}。" } },
                { speaker: "你", text: { zh: "看起來有點危險，但我會盡力而為。" } },
                { speaker: "委託人", text: { zh: "祝你好運，我在城裡等你。" } }
            ],
            outTags: ['quest_start']
        },
        {
            type: 'setup',
            id: 'setup_accident',
            structure: { baseDepth: 2, variance: 0 },
            text: { zh: "糟糕！地板塌陷了！" },
            slots: ['location'],
            dialogue: [
                { speaker: "你", text: { zh: "啊啊啊啊啊——！" } },
                { speaker: "旁白", text: { zh: "你重重地摔在地上，四周一片漆黑。" } },
                { speaker: "你", text: { zh: "痛死了... 這裡是哪裡？{location}？" } }
            ],
            outTags: ['accident']
        },

        // ================= EVENT =================
        // 1. 戰鬥遭遇
        {
            type: 'event',
            id: 'event_combat_1',
            text: { zh: "敵人出現了！" },
            slots: ['enemy'],
            dialogue: [
                { speaker: "你", text: { zh: "有動靜！" } },
                { speaker: "{enemy}", text: { zh: "嘎啊啊啊！(發出敵意的吼叫)" } },
                { speaker: "你", text: { zh: "看來無法溝通了，準備戰鬥！" } }
            ],
            options: [
                { label: "拔劍戰鬥", check: { stat: 'STR', val: 6 }, nextTags: ['combat_win'], failNextTags: ['combat_defeat'], rewards: { exp: 20 } },
                { label: "嘗試逃跑", check: { stat: 'AGI', val: 5 }, nextTags: ['escaped'] }
            ]
        },
        // 2. 發現物品 (修復版：動態 Tag)
        {
            type: 'event',
            id: 'event_find_item',
            text: { zh: "你發現了寶物。" },
            slots: ['item'],
            dialogue: [
                { speaker: "你", text: { zh: "嗯？那裡好像有什麼東西在發光。" } },
                { speaker: "旁白", text: { zh: "你走近一看，是一個{item}。" } },
                { speaker: "你", text: { zh: "運氣真好！這應該能賣點錢。" } }
            ],
            options: [
                { 
                    label: "撿起來", 
                    action: "advance_chain", 
                    // [Fix] 這裡的 {item} 現在會被 generator 自動替換成 '古老的金幣' 或 '生鏽的鑰匙'
                    rewards: { tags: ['{item}'] } 
                }
            ]
        },
        // 3. 陷阱
        {
            type: 'event',
            id: 'event_trap_1',
            text: { zh: "陷阱觸發！" },
            dialogue: [
                { speaker: "旁白", text: { zh: "咔嚓。你踩到了一塊鬆動的地板。" } },
                { speaker: "你", text: { zh: "糟了！" } },
                { speaker: "旁白", text: { zh: "無數支箭矢從牆壁射出！" } }
            ],
            options: [
                { label: "跳躍閃避", check: { stat: 'AGI', val: 7 }, rewards: { exp: 15 } },
                { label: "護住頭部", action: "advance_chain", rewards: { energy: -10 } }
            ]
        },

        // ================= ENDING =================
        {
            type: 'ending',
            id: 'end_normal',
            text: { zh: "冒險結束。" },
            dialogue: [
                { speaker: "你", text: { zh: "終於看到出口了。" } },
                { speaker: "旁白", text: { zh: "你拍了拍身上的灰塵，雖然疲憊，但收穫滿滿。" } }
            ],
            rewards: { exp: 50, gold: 30 }
        }
    ]
};