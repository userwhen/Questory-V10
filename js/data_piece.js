/* js/data_piece.js - V79.0 (Clean & Consolidated) */

window.FragmentDB = {
    // ============================================================
    // 1. 碎片庫 (Fragments)
    // ============================================================
    fragments: {
        location: [
            { val: { zh: "陰森的古堡", en: "Old Castle" }, tags: ['dark'] },
            { val: { zh: "廢棄的醫院", en: "Abandoned Hospital" }, tags: ['scary'] },
            { val: { zh: "午夜的地鐵站", en: "Midnight Subway" }, tags: ['modern'] },
            { val: { zh: "暴風雪山莊", en: "Snowy Villa" }, tags: ['cold'] },
            { val: { zh: "被暴風雪封鎖的山莊" }, tags: ['cold'] },
            { val: { zh: "行駛在海上的豪華郵輪" }, tags: ['luxury'] },
            { val: { zh: "停電的私人圖書館" }, tags: ['dark'] },
            { val: { zh: "午夜的東方快車包廂" }, tags: ['classic'] }
        ],
        item: [
            { val: { zh: "染血的匕首" }, tags: ['weapon'] },
            { val: { zh: "撕碎的日記" }, tags: ['clue'] },
            { val: { zh: "奇怪的錄音帶" }, tags: ['clue'] },
            { val: { zh: "生鏽的鑰匙" }, tags: ['key'] },
            { val: { zh: "沾有杏仁味的手帕" }, tags: ['poison'] },
            { val: { zh: "被撕掉一半的遺囑" }, tags: ['motive'] },
            { val: { zh: "停止在 10:30 的懷錶" }, tags: ['time'] },
            { val: { zh: "一隻沾泥的紅舞鞋" }, tags: ['trace'] }
        ],
        enemy: [
            { val: { zh: "武裝哥布林" } },
            { val: { zh: "狂暴的野狼" } },
            { val: { zh: "古代守衛" } }
        ],
        detective: [ { val: { zh: "白羅" } }, { val: { zh: "福爾摩斯" } }, { val: { zh: "金田一" } } ],
        victim: [ { val: { zh: "吝嗇的銀行家" } }, { val: { zh: "過氣的歌劇女伶" } }, { val: { zh: "冷酷的伯爵" } } ],
        suspect_A: [ { val: { zh: "顫抖的女僕" } }, { val: { zh: "忠厚的老園丁" } } ],
        suspect_B: [ { val: { zh: "負債累累的姪子" } }, { val: { zh: "野心勃勃的合夥人" } } ],
        killer: [ { val: { zh: "看似完美的管家" } }, { val: { zh: "負責驗屍的醫生" } } ],
        survivor: [ { val: { zh: "愛麗絲" } }, { val: { zh: "里昂" } } ],
        monster: [ { val: { zh: "電鋸殺人魔" } }, { val: { zh: "紅衣女鬼" } }, { val: { zh: "異形" } } ],
        haunted_place: [ { val: { zh: "第13號病房" } }, { val: { zh: "被詛咒的學校" } } ]
    },

    // ============================================================
    // 2. 劇本模板 (Templates)
    // ============================================================
    templates: [
        // --- Mystery Mode (偵探) ---
        {
            type: 'setup_crime', id: 'mys_setup_classic',
            text: { zh: ["窗外的雷聲轟鳴，閃電瞬間照亮了{location}的大廳。", "當燈光再次亮起時，原本坐在主位上的{victim}已經癱軟在椅子上，胸口插著一把銀刀。", "空氣中瀰漫著一股令人窒息的血腥味。"] },
            slots: ['location', 'victim', 'detective'],
            dialogue: [
                { speaker: "旁白", text: { zh: "尖叫聲此起彼落，直到一個冷靜的聲音控制了全場。" } },
                { speaker: "{detective}", text: { zh: "諸位請冷靜！在警方到達之前，任何人不得離開這個房間。" } },
                { speaker: "你", text: { zh: "（吞了口口水）看來這將是一個漫長的夜晚..." } }
            ],
            options: [{ label: "協助偵探封鎖現場", action: "advance_chain", rewards: { varOps: [{ key: 'clue_progress', val: 0, op: 'set' }] } }]
        },
        {
            type: 'investigate', id: 'mys_inv_detail',
            text: { zh: ["你蹲下身子，仔細檢查案發現場的地毯。"] },
            slots: ['item'],
            dialogue: [
                { speaker: "你", text: { zh: "這是什麼？在沙發的縫隙深處..." } },
                { speaker: "旁白", text: { zh: "你用鑷子小心翼翼地夾起了一個物件——{item}。" } }
            ],
            options: [
                { label: "仔細收好證物", action: "advance_chain", rewards: { tags: ['clue_found'], varOps: [{ key: 'clue_progress', val: 20, op: '+' }] }, nextTags: ['clue_found'] },
                { label: "這看起來無關緊要", action: "advance_chain", nextTags: ['risk_high'] }
            ]
        },
        {
            type: 'interrogate', id: 'mys_ask_nervous',
            text: { zh: "你將目光轉向了角落裡的{suspect_A}。" },
            slots: ['suspect_A', 'victim'],
            dialogue: [
                { speaker: "你", text: { zh: "案發當時你在哪裡？" } },
                { speaker: "{suspect_A}", text: { zh: "我... 我在洗手間！我根本沒去過大廳！" } }
            ],
            options: [
                { label: "施加心理壓力 (INT檢定)", check: { stat: 'INT', val: 6 }, rewards: { varOps: [{ key: 'clue_progress', val: 30, op: '+' }] }, action: "advance_chain" },
                { label: "安撫情緒", action: "advance_chain", rewards: { varOps: [{ key: 'clue_progress', val: 10, op: '+' }] } }
            ]
        },
        {
            type: 'deduction_moment', id: 'mys_deduct_logic',
            text: { zh: "夜已深，所有的證詞都已攤在桌面上。" },
            slots: ['detective'],
            dialogue: [
                { speaker: "{detective}", text: { zh: "拼圖已經完成了。兇手以為自己做得天衣無縫。" } },
                { speaker: "你", text: { zh: "你是說那個{item}嗎？" } }
            ],
            options: [{ label: "準備揭發真相！", action: "advance_chain", nextTags: ['risk_high'] }]
        },
        {
            type: 'confrontation', id: 'mys_final_reveal',
            text: { zh: "【終局時刻】" },
            slots: ['killer', 'detective', 'victim'],
            dialogue: [
                { speaker: "{detective}", text: { zh: "殺害{victim}的真兇，就是你——{killer}！" } },
                { speaker: "{killer}", text: { zh: "呵呵... 既然被發現了，那就沒辦法了。" } }
            ],
            options: [
                { 
                    label: "與偵探聯手制伏兇手！ (戰鬥)", 
                    style: "danger", check: { stat: 'STR', val: 5 },
                    nextScene: { text: "正義終於得到了伸張。", rewards: { exp: 500, removeTags: ['clue_found', 'risk_high', 'safe_spot'] }, options: [{ label: "案件終結 (離開)", action: "finish_chain" }] },
                    failScene: { text: "{killer}逃入了黑暗之中...", rewards: { exp: 200, removeTags: ['clue_found', 'risk_high', 'safe_spot'] }, options: [{ label: "結束調查 (離開)", action: "finish_chain" }] }
                }
            ]
        },

        // --- Horror Mode (恐怖) ---
        {
            type: 'setup_omen', id: 'hor_setup',
            text: { zh: "你不該來這裡的..." },
            slots: ['haunted_place', 'survivor'],
            dialogue: [
                { speaker: "{survivor}", text: { zh: "聽說{haunted_place}有很多傳說。" } },
                { speaker: "旁白", text: { zh: "一陣陰風吹過，大門在你身後重重關上。" } }
            ],
            options: [{ label: "吞了口口水...", action: "advance_chain" }]
        },
        {
            type: 'explore_eerie', id: 'hor_explore_1',
            text: { zh: "牆上寫滿了紅色的字跡..." },
            dialogue: [{ speaker: "牆上的字", text: { zh: "『快逃』、『牠在看著你』..." } }],
            options: [{ label: "繼續深入", action: "advance_chain", nextTags: ['risk_high'] }]
        },
        {
            type: 'encounter_monster', id: 'hor_monster',
            text: { zh: "一個巨大的黑影出現在走廊盡頭！" },
            slots: ['monster'],
            dialogue: [{ speaker: "{monster}", text: { zh: "吼喔喔喔喔——！！" } }],
            options: [{ label: "轉身逃跑", action: "advance_chain", nextTags: ['risk_high'] }]
        },
        {
            type: 'escape_chase', id: 'hor_chase',
            text: { zh: "你的肺部像火燒一樣，但你不敢停下。" },
            dialogue: [{ speaker: "旁白", text: { zh: "{monster}的腳步聲越來越近了！" } }],
            options: [{ label: "拼命狂奔", action: "advance_chain" }]
        },
        {
            type: 'final_survival', id: 'hor_end',
            text: { zh: "出口就在眼前！" },
            dialogue: [
                { speaker: "{survivor}", text: { zh: "終於... 結束了嗎？" } },
                { speaker: "旁白", text: { zh: "你衝出了{haunted_place}，陽光灑在臉上。" } }
            ],
            // [Fix] 這裡顯式定義按鈕，確保有出口
            options: [{ label: "逃出生天", action: "finish_chain", rewards: { removeTags: ['risk_high', 'safe_spot'] } }]
        },
		
		// ==========================================
        // [Random Mode] 傳統隨機與兜底模板 (擴充版 V79.1)
        // ==========================================

        // --- Setup ---
        {
            type: 'setup', id: 'gen_setup_v2',
            text: { zh: ["你來到了一個{location}。", "這裡的氣息有些古怪。"] },
            slots: ['location'],
            dialogue: [{ speaker: "你", text: { zh: "這裡... 似乎很久沒人來過了。" } }],
            options: [{ label: "小心翼翼地前進", action: "advance_chain", rewards: { removeTags: ['random_item_found', 'risk_high'] } }]
        },

        // --- Event A: 發現物品 (既有) ---
        {
            type: 'event', id: 'gen_event_item_v2',
            text: { zh: ["在角落的陰影中，你發現有東西在閃閃發光。", "你走近一看，那是一個{item}。"] },
            slots: ['item'],
            dialogue: [{ speaker: "你", text: { zh: "這是... {item}？運氣真不錯。" } }],
            options: [
                { label: "撿起來", action: "advance_chain", rewards: { tags: ['random_item_found'], varOps: [{ key: 'bag_count', val: 1, op: '+' }] } },
                { label: "不要亂碰", action: "advance_chain" }
            ]
        },

        // --- Event B: 遭遇小怪 (新增) ---
        {
            type: 'event', id: 'gen_event_enemy_small',
            text: { zh: ["前方傳來了低沉的嘶吼聲。", "一隻{enemy}擋住了去路，但看起來並不強。"] },
            slots: ['enemy'],
            dialogue: [
                { speaker: "{enemy}", text: { zh: "嘎啊！" } },
                { speaker: "你", text: { zh: "滾開！" } }
            ],
            options: [
                { label: "驅趕牠 (STR檢定)", check: { stat: 'STR', val: 3 }, action: "advance_chain", nextScene: { text: "你揮舞武器，將牠嚇跑了。" }, failScene: { text: "牠咬了你一口才跑掉。", rewards: { energy: -5 } } },
                { label: "繞路避開", action: "advance_chain", nextTags: ['risk_high'] }
            ]
        },

        // --- Event C: 觸發陷阱 (新增) ---
        {
            type: 'event', id: 'gen_event_trap',
            text: { zh: ["咔嚓一聲。", "你腳下的地板突然下陷！"] },
            dialogue: [
                { speaker: "你", text: { zh: "糟了！是陷阱！" } },
                { speaker: "旁白", text: { zh: "幾支箭矢從牆壁射出！" } }
            ],
            options: [
                { label: "快速閃避 (AGI檢定)", check: { stat: 'AGI', val: 5 }, action: "advance_chain", nextScene: { text: "你以毫釐之差躲過了箭矢。" }, failScene: { text: "你被擦傷了...", rewards: { energy: -10 } } }
            ]
        },

        // --- Event D: 氛圍描述 (新增 - 讓節奏緩下來) ---
        {
            type: 'event', id: 'gen_event_flavor',
            text: { zh: ["你穿過了一條長長的走廊。", "牆上的火把忽明忽滅。"] },
            dialogue: [
                { speaker: "你", text: { zh: "這裡安靜得讓人不舒服。" } }
            ],
            options: [
                { label: "繼續前進", action: "advance_chain" },
                { label: "稍作休息 (+精力)", action: "advance_chain", rewards: { energy: 5 } }
            ]
        },

        // --- Boss ---
        {
            type: 'boss', id: 'gen_boss_v2',
            text: { zh: ["前方的路被擋住了。", "一個巨大的黑影——{enemy}——緩緩轉過身來。"] },
            slots: ['enemy'],
            dialogue: [{ speaker: "{enemy}", text: { zh: "吼喔喔喔——！！" } }],
            options: [{ label: "戰鬥！", action: "finish_chain", rewards: { removeTags: ['random_item_found', 'risk_high', 'clue_found'] } }]
        },

        // --- Ending ---
        {
            type: 'ending', id: 'gen_end_v2',
            text: { zh: "旅程告一段落。" },
            dialogue: [{ speaker: "旁白", text: { zh: "你整理了一下行囊，決定暫時在這裡紮營休息。" } }],
            options: [{ label: "離開", action: "finish_chain", rewards: { removeTags: ['random_item_found', 'risk_high', 'safe_spot', 'clue_found'] } }]
        }
    ]
};