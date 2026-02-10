/* js/data_piece.js - V80.0 (Expanded Narrative Database) */

window.FragmentDB = {
    // ============================================================
    // 1. 碎片庫 (Fragments) - 用於填空的名詞庫
    // ============================================================
    fragments: {
    // --- 1. 形容詞庫 (Prefixes) ---
    adj_spooky: [ 
        { val: { zh: "染血的" } }, { val: { zh: "佈滿灰塵的" } }, { val: { zh: "被詛咒的" } }, { val: { zh: "發出怪聲的" } } 
    ],
    adj_luxury: [ 
        { val: { zh: "鑲金的" } }, { val: { zh: "極其昂貴的" } }, { val: { zh: "閃閃發光的" } }, { val: { zh: "皇家御用的" } } 
    ],
    adj_personality: [ 
        { val: { zh: "傲嬌的" } }, { val: { zh: "溫柔的" } }, { val: { zh: "腹黑的" } }, { val: { zh: "天然呆的" } } 
    ],

    // --- 2. 名詞庫 (Nouns) ---
    item_base: [ 
        { val: { zh: "匕首" } }, { val: { zh: "日記本" } }, { val: { zh: "懷錶" } }, { val: { zh: "鑰匙" } } 
    ],
    location_base: [ 
        { val: { zh: "古堡" } }, { val: { zh: "地下室" } }, { val: { zh: "圖書館" } }, { val: { zh: "花園" } } 
    ],
    npc_role: [
        { val: { zh: "學妹" } }, { val: { zh: "總裁" } }, { val: { zh: "青梅竹馬" } }, { val: { zh: "轉學生" } }
    ],
        location: [
            { val: { zh: "被暴風雪封鎖的深山別墅", en: "Snowy Villa" }, tags: ['cold', 'isolated'] },
            { val: { zh: "午夜時分的廢棄綜合醫院", en: "Abandoned Hospital" }, tags: ['scary', 'dark'] },
            { val: { zh: "行駛在太平洋上的豪華郵輪", en: "Luxury Cruise" }, tags: ['luxury', 'sea'] },
            { val: { zh: "停電後的國立圖書館禁書區", en: "Dark Library" }, tags: ['quiet', 'dark'] },
            { val: { zh: "剛發生過火災的百年古堡", en: "Burnt Castle" }, tags: ['ruin', 'history'] },
            { val: { zh: "充滿迷霧的倫敦地下水道", en: "London Sewer" }, tags: ['damp', 'dirty'] }
        ],
        item: [
            { val: { zh: "一把沾著乾涸血跡的銀質拆信刀" }, tags: ['weapon'] },
            { val: { zh: "一本被撕去了最後幾頁的皮革日記" }, tags: ['clue'] },
            { val: { zh: "一卷錄有奇怪雜訊的舊式錄音帶" }, tags: ['clue'] },
            { val: { zh: "一串刻有神祕符號的黃銅鑰匙" }, tags: ['key'] },
            { val: { zh: "一條散發著苦杏仁味的絲質手帕" }, tags: ['poison'] },
            { val: { zh: "一份剛剛修改過的遺產繼承文件" }, tags: ['motive'] },
            { val: { zh: "一隻停在案發時間的破碎懷錶" }, tags: ['time'] }
        ],
        enemy: [
            { val: { zh: "手持生鏽巨斧的處刑者" } },
            { val: { zh: "雙眼散發紅光的變異野狼" } },
            { val: { zh: "全身纏滿繃帶的古代守衛" } },
            { val: { zh: "發出金屬摩擦聲的機械人偶" } }
        ],
        // 角色庫
        detective: [ { val: { zh: "眼神銳利的私家偵探" } }, { val: { zh: "經驗豐富的刑警隊長" } }, { val: { zh: "路過的推理小說家" } } ],
        victim: [ { val: { zh: "性格孤僻的珠寶大亨" } }, { val: { zh: "剛繼承遺產的年輕寡婦" } }, { val: { zh: "聲名狼藉的地下錢莊老闆" } } ],
        suspect_A: [ { val: { zh: "神色慌張的兼職女僕" } }, { val: { zh: "沈默寡言的園丁老伯" } } ],
        suspect_B: [ { val: { zh: "欠下鉅款的遠房姪子" } }, { val: { zh: "野心勃勃的生意合夥人" } } ],
        killer: [ { val: { zh: "一直表現完美的管家" } }, { val: { zh: "負責驗屍的法醫助手" } } ],
        survivor: [ { val: { zh: "唯一的倖存者愛麗絲" } }, { val: { zh: "受傷的記者里昂" } } ],
        monster: [ { val: { zh: "揮舞電鋸的瘋狂殺手" } }, { val: { zh: "長髮遮面的紅衣女鬼" } }, { val: { zh: "來自深淵的觸手怪物" } } ],
        haunted_place: [ { val: { zh: "被詛咒的第13號病房" } }, { val: { zh: "傳說中的猛鬼學校" } } ]
		r_hobby: [ { val: { zh: "繪畫" } }, { val: { zh: "劍術" } }, { val: { zh: "魔法" } }, { val: { zh: "禮儀" } } ],
    r_job: [ { val: { zh: "女僕" } }, { val: { zh: "農夫" } }, { val: { zh: "家教" } } ],
    r_dream: [ { val: { zh: "嫁給王子" } }, { val: { zh: "成為勇者" } }, { val: { zh: "世界首富" } } ],
    daughter: [ { val: { zh: "女兒" } }, { val: { zh: "妹妹" } } ], // 稱呼
    butler: [ { val: { zh: "管家賽巴斯" } }, { val: { zh: "妖精吉普" } } ],
    rival: [ { val: { zh: "高傲的千金" } }, { val: { zh: "天才魔法少女" } } ]
	},

    // ============================================================
    // 2. 劇本模板 (Templates)
    // ============================================================
    templates: [
        
        // ==========================================
        // [BLOCK A] 🕵️‍♂️ 懸疑偵探流 (Mystery)
        // ==========================================
        
        // --- Setup: 案發開端 ---
        {
            type: 'setup_crime', id: 'mys_setup_classic',
            text: { zh: [
                "窗外的雷聲轟鳴，閃電瞬間照亮了{location}的大廳。", 
                "當燈光再次亮起時，原本坐在主位上的{victim}已經癱軟在椅子上。",
                "他的胸口插著一把兇器，鮮血染紅了名貴的地毯。",
                "空氣中瀰漫著一股令人窒息的血腥味與火藥味。"
            ]},
            slots: ['location', 'victim', 'detective'],
            dialogue: [
                { speaker: "旁白", text: { zh: "尖叫聲此起彼落，直到一個冷靜的聲音控制了全場。" } },
                { speaker: "{detective}", text: { zh: "諸位請冷靜！在警方到達之前，任何人不得離開這個房間。" } },
                { speaker: "你", text: { zh: "（吞了口口水）看來這將是一個漫長的夜晚..." } }
            ],
            options: [{ 
                label: "協助封鎖現場", 
                action: "advance_chain", 
                rewards: { tags: ['case_started'], varOps: [{ key: 'clue_progress', val: 0, op: 'set' }] } 
            }]
        },

        // --- Investigate: 現場搜查 (需要 case_started) ---
        {
            type: 'investigate', id: 'mys_inv_detail',
            reqTag: 'case_started',
            text: { zh: [
                "你蹲下身子，避開地上的血跡，仔細檢查案發現場的角落。",
                "在昏暗的燈光下，沙發底部的陰影中似乎藏著什麼東西。",
                "你伸手去摸索，指尖觸碰到了一個冰冷、堅硬的物體。"
            ]},
            slots: ['item'],
            dialogue: [
                { speaker: "你", text: { zh: "這是什麼？這不應該出現在這裡..." } },
                { speaker: "旁白", text: { zh: "你用鑷子小心翼翼地夾起了一個物件——{item}。" } }
            ],
            options: [
                { 
                    label: "仔細收好證物", 
                    action: "advance_chain", 
                    rewards: { tags: ['clue_found'], varOps: [{ key: 'clue_progress', val: 20, op: '+' }] }, 
                    nextTags: ['clue_found'] 
                },
                { label: "這看起來無關緊要", action: "advance_chain", nextTags: ['risk_high'] }
            ]
        },

        // --- Interrogate: 嫌疑人詢問 (需要 clue_found) ---
        {
            type: 'interrogate', id: 'mys_ask_nervous',
            reqTag: 'clue_found',
            text: { zh: [
                "你拿著剛找到的證物，將目光轉向了角落裡的{suspect_A}。",
                "他看起來坐立難安，額頭上布滿了細密的汗珠。",
                "當你看向他時，他下意識地避開了你的視線，雙手緊緊抓著衣角。"
            ]},
            slots: ['suspect_A', 'victim'],
            dialogue: [
                { speaker: "你", text: { zh: "案發當時你在哪裡？為什麼這東西會有你的指紋？" } },
                { speaker: "{suspect_A}", text: { zh: "我... 我在洗手間！我根本沒去過大廳！你不能冤枉好人！" } }
            ],
            options: [
                { label: "施加心理壓力 (INT檢定)", check: { stat: 'INT', val: 6 }, rewards: { varOps: [{ key: 'clue_progress', val: 30, op: '+' }], tags: ['motive_confirmed'] }, action: "advance_chain" },
                { label: "安撫情緒", action: "advance_chain", rewards: { varOps: [{ key: 'clue_progress', val: 10, op: '+' }] } }
            ]
        },

        // --- Deduction: 推理時刻 ---
        {
            type: 'deduction_moment', id: 'mys_deduct_logic',
            reqTag: 'motive_confirmed',
            text: { zh: [
                "夜已深，所有的證詞都已攤在桌面上。",
                "你將所有的線索在腦海中重新排列組合。",
                "不在場證明、兇器上的指紋、死者死前的留言... 一切的矛頭都指向了同一個人。"
            ]},
            slots: ['detective', 'item'],
            dialogue: [
                { speaker: "{detective}", text: { zh: "拼圖已經完成了。兇手以為自己做得天衣無縫，但他疏忽了最關鍵的一點。" } },
                { speaker: "你", text: { zh: "你是說那個{item}嗎？沒錯，那就是鐵證。" } }
            ],
            options: [{ label: "準備揭發真相！", action: "advance_chain", nextTags: ['risk_high'] }]
        },

        // --- Confrontation: 結局對決 ---
        {
            type: 'confrontation', id: 'mys_final_reveal',
            text: { zh: [
                "【終局時刻】",
                "所有的燈光聚焦在大廳中央。",
                "你在眾人的注視下，緩緩舉起手，指向了人群中那個看似最無辜的人。"
            ]},
            slots: ['killer', 'detective', 'victim'],
            dialogue: [
                { speaker: "{detective}", text: { zh: "殺害{victim}的真兇，就是你——{killer}！" } },
                { speaker: "{killer}", text: { zh: "呵呵... 既然被發現了，那就沒辦法了。你們都得死在這裡！" } }
            ],
            options: [
                { 
                    label: "與偵探聯手制伏兇手！ (戰鬥)", 
                    style: "danger", check: { stat: 'STR', val: 5 },
                    nextScene: { text: "經過一番搏鬥，兇手被壓制在地上。正義終於得到了伸張。", rewards: { exp: 500, removeTags: ['clue_found', 'case_started', 'motive_confirmed'] }, options: [{ label: "案件終結 (離開)", action: "finish_chain" }] },
                    failScene: { text: "兇手撞破窗戶逃入了黑暗之中... 雖然真相大白，但正義遲到了。", rewards: { exp: 200, removeTags: ['clue_found', 'case_started', 'motive_confirmed'] }, options: [{ label: "結束調查 (離開)", action: "finish_chain" }] }
                }
            ]
        },

        // ==========================================
        // [BLOCK B] 👻 恐怖生存流 (Horror)
        // ==========================================

        // --- Setup: 凶兆 ---
        {
            type: 'setup_omen', id: 'hor_setup',
            text: { zh: [
                "你不該來這裡的...", 
                "大門在你身後重重關上，發出令人牙酸的金屬撞擊聲。",
                "這個傳說中的{haunted_place}比想像中更加陰冷，空氣中飄浮著灰塵和霉味。",
                "你的手電筒閃爍了兩下，似乎電力不足了。"
            ]},
            slots: ['haunted_place', 'survivor'],
            dialogue: [
                { speaker: "{survivor}", text: { zh: "聽說進來過的人，沒有一個能活著出去。" } },
                { speaker: "旁白", text: { zh: "黑暗中，似乎有無數雙眼睛正在盯著你。" } }
            ],
            options: [{ label: "吞了口口水，握緊手電筒", action: "advance_chain", rewards: { tags: ['horror_started'] } }]
        },

        // --- Explore: 探索異象 ---
        {
            type: 'explore_eerie', id: 'hor_explore_1',
            reqTag: 'horror_started',
            text: { zh: [
                "你沿著長長的走廊前行，腳下的木地板發出嘎吱嘎吱的聲音。",
                "牆壁上寫滿了紅色的字跡，有些已經乾涸發黑，有些卻像是剛寫上去的。",
                "你湊近細看，那些字跡寫得極度潦草與瘋狂。"
            ]},
            dialogue: [{ speaker: "牆上的字", text: { zh: "『快逃』、『牠在看著你』、『不要回頭』..." } }],
            options: [{ label: "強壓恐懼，繼續深入", action: "advance_chain", nextTags: ['risk_high'] }]
        },

        // --- Encounter: 遭遇怪物 ---
        {
            type: 'encounter_monster', id: 'hor_monster',
            reqTag: 'horror_started',
            text: { zh: [
                "一陣令人作嘔的腐臭味撲鼻而來。",
                "走廊盡頭的黑暗開始蠕動，慢慢凝聚成一個巨大的實體。",
                "那是{monster}！牠手裡的武器拖在地板上，發出刺耳的摩擦聲。"
            ]},
            slots: ['monster'],
            dialogue: [{ speaker: "{monster}", text: { zh: "吼喔喔喔喔——！！" } }],
            options: [{ label: "轉身逃跑！", action: "advance_chain", nextTags: ['risk_high'] }]
        },

        // --- Chase: 逃亡戰 ---
        {
            type: 'escape_chase', id: 'hor_chase',
            reqTag: 'risk_high',
            text: { zh: [
                "你的肺部像火燒一樣，雙腿像灌了鉛，但你不敢停下。",
                "身後的腳步聲越來越近，每一次重踏都讓地面隨之震動。",
                "前方出現了一個分岔路口，左邊是樓梯，右邊是微掩的房門。"
            ]},
            dialogue: [{ speaker: "旁白", text: { zh: "{monster}的嘶吼聲已經近在咫尺！" } }],
            options: [
                { label: "衝向樓梯 (AGI檢定)", check: { stat: 'AGI', val: 5 }, action: "advance_chain" },
                { label: "躲進房間", action: "advance_chain" }
            ]
        },

        // --- Final: 逃出生天 ---
        {
            type: 'final_survival', id: 'hor_end',
            text: { zh: [
                "前方出現了一絲微弱的光亮，那是出口！",
                "你用盡最後一絲力氣撞開了被封死的木板。",
                "新鮮的空氣湧入肺部，你跌跌撞撞地衝出了大門，癱倒在草地上。"
            ]},
            slots: ['survivor', 'haunted_place'], 
            dialogue: [
                { speaker: "{survivor}", text: { zh: "哈... 哈... 終於... 結束了嗎？" } },
                { speaker: "旁白", text: { zh: "你回頭望去，{haunted_place}依然靜靜地矗立在夜色中，彷彿什麼都沒發生過。" } }
            ],
            options: [{ label: "逃出生天 (結算)", action: "finish_chain", rewards: { removeTags: ['horror_started', 'risk_high', 'safe_spot'] } }]
        },

        // ==========================================
        // [BLOCK C] ⚔️ 異世界/冒險流 (Isekai / Adventure)
        // ==========================================

        // --- Setup: 穿越開局 ---
        {
            type: 'setup', id: 'isekai_start',
            noTag: 'style_selected',
            text: { zh: [
                "一陣暈眩過後，你睜開眼，發現自己不再熟悉的城市裡。",
                "眼前是一片荒蕪的{location}，天空中掛著兩個月亮。",
                "遠處傳來了{enemy}的咆哮聲，而你手邊只有一把生鏽的劍和一件破舊的斗篷。"
            ]},
            slots: ['location', 'enemy'],
            options: [
                { 
                    label: "拿起劍，準備戰鬥 (進入戰鬥線)", 
                    action: "advance_chain", 
                    rewards: { tags: ['style_selected', 'style_combat'], varOps: [{key:'hp', val:100, op:'set'}] } 
                },
                { 
                    label: "披上斗篷，隱匿氣息 (進入潛行線)", 
                    action: "advance_chain", 
                    rewards: { tags: ['style_selected', 'style_stealth'], varOps: [{key:'stealth', val:50, op:'set'}] } 
                }
            ]
        },

        // --- Event: 戰鬥遭遇 (需要 style_combat) ---
        {
            type: 'event', id: 'isekai_event_fight',
            reqTag: 'style_combat',
            text: { zh: [
                "一群{enemy}從岩石後方竄了出來，擋住了你的去路！",
                "牠們看起來飢腸轆轆，顯然把你當成了今晚的晚餐。",
                "你握緊手中的劍，掌心微微出汗，準備迎接這場生死之戰。"
            ]},
            slots: ['enemy'],
            options: [
                { label: "正面突破！(STR檢定)", check: { stat: 'STR', val: 5 }, action: "advance_chain", nextScene: { text: "你像戰神一樣揮舞武器，殺出了一條血路！" }, failScene: { text: "雙拳難敵四手，你受了傷，勉強才突圍。", rewards: { energy: -10 } } },
                { label: "尋找掩體射擊", action: "advance_chain" }
            ]
        },

        // --- Event: 潛行任務 (需要 style_stealth) ---
        {
            type: 'event', id: 'isekai_event_sneak',
            reqTag: 'style_stealth',
            text: { zh: [
                "你發現了一支巡邏隊正在靠近。",
                "如果現在被發現，以你目前的裝備絕對死路一條。",
                "你必須利用周圍的地形，像影子一樣穿過他們的封鎖線。"
            ]},
            options: [
                { label: "屏住呼吸 (AGI檢定)", check: { stat: 'AGI', val: 5 }, action: "advance_chain", nextScene: { text: "他們從你身邊經過，完全沒發現你的存在。" }, failScene: { text: "你踩到了枯樹枝！不得不狼狽逃跑。", rewards: { energy: -10 } } },
                { label: "製造聲東擊西", action: "advance_chain" }
            ]
        },

        // --- Boss: 守門者 ---
        {
            type: 'boss', id: 'isekai_boss',
            reqTag: 'style_selected',
            text: { zh: [
                "終於來到了傳送門的出口。",
                "但在那裡守著的是強大的{monster}，牠巨大的身軀擋住了所有的光線。",
                "這是回到原本世界的最後一道關卡。"
            ]},
            slots: ['monster'],
            options: [
                { 
                    label: "拔劍決一死戰！", 
                    condition: { hasTag: 'style_combat' },
                    action: "finish_chain", 
                    rewards: { removeTags: ['style_selected', 'style_combat'] } 
                },
                { 
                    label: "從背後發動偷襲！", 
                    condition: { hasTag: 'style_stealth' },
                    action: "finish_chain", 
                    rewards: { removeTags: ['style_selected', 'style_stealth'] } 
                }
            ]
        },

        // ==========================================
        // [BLOCK D] 🧩 萬用填充區 (Universal Filler)
        // ==========================================
        // 用於調節節奏，避免連續高壓事件，或當沒牌可抽時的兜底。

        // --- Filler: 休息 ---
        {
            type: 'event', id: 'filler_rest',
            text: { zh: [
                "經歷了剛才的波折，你感到些許疲憊。",
                "你找到了一個相對乾燥且隱蔽的角落，決定稍作休息。",
                "這裡暫時沒有危險的氣息，只有遠處偶爾傳來的滴水聲。"
            ]},
            options: [{ label: "閉目養神，恢復體力 (精力+5)", action: "advance_chain", rewards: { energy: 5 } }]
        },

        // --- Filler: 虛驚一場 ---
        {
            type: 'event', id: 'filler_noise',
            text: { zh: [
                "突然，一陣奇怪的聲響讓你立刻停下了腳步。",
                "你屏住呼吸，死死盯著黑暗的深處，手心捏了一把冷汗。",
                "幾秒鐘後，一隻肥碩的老鼠從角落竄出，原來只是虛驚一場。"
            ]},
            options: [{ label: "鬆了一口氣，繼續前進", action: "advance_chain" }]
        },

        // --- Filler: 搜索無果 ---
        {
            type: 'investigate', id: 'mys_filler_search',
            text: { zh: [
                "你翻遍了附近的櫃子和抽屜，希望能找到什麼有用的線索。",
                "遺憾的是，這裡除了一些發霉的文件和生活垃圾外，一無所獲。",
                "看來必須去別的地方碰碰運氣了。"
            ]},
            options: [{ label: "前往下一個房間", action: "advance_chain" }]
        },

        // --- Filler: 神秘商人 (彩蛋) ---
        {
            type: 'event', id: 'univ_merchant',
            text: { zh: [
                "在轉角的陰影中，你遇到了一位戴著烏鴉面具的神秘商人。",
                "他身邊堆滿了各種奇奇怪怪的道具，看起來像是一個移動的雜貨舖。",
                "「嘿嘿... 旅行者，需要點好東西來保命嗎？童叟無欺。」"
            ]},
            dialogue: [{ speaker: "商人", text: { zh: "只要你有足夠的金幣，我這裡甚至有神的消息。" } }],
            options: [
                { 
                    label: "購買關鍵情報 (金幣-50 / 獲得Clue)", 
                    condition: { var: { key: 'gold', val: 50, op: '>=' } },
                    action: "advance_chain", 
                    rewards: { gold: -50, tags: ['clue_found', 'motive_confirmed'] } 
                },
                { 
                    label: "購買強力藥水 (金幣-20 / 精力全滿)", 
                    condition: { var: { key: 'gold', val: 20, op: '>=' } },
                    action: "advance_chain", 
                    rewards: { gold: -20, energy: 100 } 
                },
                { label: "搖搖頭離開", action: "advance_chain" }
            ]
        },

        // --- Filler: 幸運寶箱 ---
        {
            type: 'event', id: 'univ_lucky_chest',
            text: { zh: [
                "在廢墟的瓦礫堆中，你發現了一個散發著微弱金光的寶箱。",
                "箱子上沒有鎖，上面刻著一行小字：『獻給有緣人』。",
                "這是陷阱？還是天上掉下來的禮物？"
            ]},
            options: [
                { 
                    label: "賭一把打開它 (LUCK檢定)", 
                    check: { stat: 'LUCK', val: 1 }, 
                    action: "advance_chain",
                    nextScene: { text: "哇！裡面裝滿了古代金幣和寶石！運氣太好了！", rewards: { gold: 100, tags: ['lucky_buff'] } },
                    failScene: { text: "是寶箱怪！它狠狠咬了你的手一口，你痛得甩開了它。", rewards: { energy: -10 } }
                },
                { label: "太可疑了，無視", action: "advance_chain" }
            ]
        },
		// ==========================================
// [BLOCK E] 💕 戀愛養成流 (Romance)
// ==========================================

// --- 階段 1: 命運的相遇 (Love Meet) ---
{
    type: 'love_meet', id: 'rom_meet_bump',
    text: { zh: [
        "這是一個陽光明媚的午後。",
        "你在轉角處太過匆忙，不小心撞倒了一位{adj_personality}{npc_role}。",
        "書本散落了一地。"
    ]},
    slots: ['adj_personality', 'npc_role', 'lover'], // 這裡 lover 會被存入記憶
    dialogue: [
        { speaker: "{lover}", text: { zh: "好痛... 你走路都不看路的嗎？" } }, // lover 會自動代入上面生成的 {npc_role}
        { speaker: "你", text: { zh: "抱歉！我幫你撿起來！" } }
    ],
    options: [
        { 
            label: "溫柔地道歉 (魅力檢定)", 
            check: { stat: 'CHR', val: 3 }, // 假設你有 CHR 屬性，沒有也沒關係
            action: "advance_chain", 
            rewards: { 
                varOps: [{ key: 'love_meter', val: 10, op: 'set' }], // 初始化好感度
                tags: ['romantic_vibe'] 
            },
            nextScene: { text: "對方臉紅了，留下了聯絡方式。" }
        },
        { 
            label: "匆忙離開", 
            action: "advance_chain", 
            rewards: { varOps: [{ key: 'love_meter', val: 0, op: 'set' }] } 
        }
    ]
},

// --- 階段 2: 日常相處 (Love Chat) ---
{
    type: 'love_chat', id: 'rom_chat_hobby',
    reqTag: 'romantic_vibe', // 氣氛對了才聊得起來
    text: { zh: ["你和{lover}約在咖啡廳見面。", "你們聊起了彼此的興趣。"] },
    slots: ['lover'],
    options: [
        { 
            label: "聊聊美食 (+10 好感)", 
            action: "advance_chain", 
            rewards: { varOps: [{ key: 'love_meter', val: 10, op: '+' }] }
        },
        { 
            label: "聊聊工作 (無聊...)", 
            action: "advance_chain",
            rewards: { varOps: [{ key: 'love_meter', val: 0, op: '+' }] },
            nextScene: { text: "{lover} 打了個哈欠。" }
        }
    ]
},

// --- 階段 3: 約會事件 (Love Date) ---
{
    type: 'love_date', id: 'rom_date_park',
    text: { zh: ["週末，你們來到了{location_base}約會。", "這裡的氣氛非常{adj_luxury}。"] }, // 應用形容詞分離
    slots: ['location_base', 'adj_luxury', 'lover'],
    dialogue: [
        { speaker: "{lover}", text: { zh: "能在這裡散步，感覺真好。" } }
    ],
    options: [
        { 
            label: "牽起對方的手 (需好感 20)", 
            condition: { var: { key: 'love_meter', val: 20, op: '>=' } },
            action: "advance_chain",
            rewards: { varOps: [{ key: 'love_meter', val: 20, op: '+' }], tags: ['hand_hold'] },
            nextScene: { text: "指尖傳來了溫暖的觸感。" }
        },
        { 
            label: "保持距離", 
            action: "advance_chain" 
        }
    ]
},

// --- 階段 4: 突發危機 (Love Crisis) ---
{
    type: 'love_crisis', id: 'rom_crisis_rival',
    text: { zh: ["就在氣氛正好時，一個{adj_personality}人影擋住了去路。", "那是你的情敵——{rival}！"] },
    slots: ['adj_personality', 'rival', 'lover'],
    dialogue: [
        { speaker: "{rival}", text: { zh: "{lover}，這傢伙是誰？配得上你嗎？" } }
    ],
    options: [
        { 
            label: "挺身而出 (戰鬥/辯論)", 
            action: "advance_chain", 
            rewards: { varOps: [{ key: 'love_meter', val: 30, op: '+' }] },
            nextScene: { text: "{lover} 看著你的背影，眼神充滿了崇拜。" }
        },
        { 
            label: "猶豫不決", 
            action: "advance_chain",
            rewards: { varOps: [{ key: 'love_meter', val: 10, op: '-' }] }
        }
    ]
},

// --- 階段 5: 告白結局 (Love Confession) ---
{
    type: 'love_confession', id: 'rom_end_best',
    text: { zh: ["夕陽西下，{lover}停下了腳步，轉身看著你。", "臉上的紅暈比晚霞還要迷人。"] },
    slots: ['lover'],
    options: [
        // 結局 A: 完美結局
        { 
            label: "「我喜歡你！」 (需好感 60)", 
            style: "primary",
            condition: { var: { key: 'love_meter', val: 60, op: '>=' } },
            action: "finish_chain", 
            nextScene: { 
                text: "【Happy End】\n{lover}微笑著抱住了你。「我也等你這句話很久了。」",
                rewards: { exp: 1000, tags: ['relationship_official'] }
            }
        },
        // 結局 B: 好人卡
        { 
            label: "告白...", 
            condition: { var: { key: 'love_meter', val: 60, op: '<' } },
            action: "finish_chain", 
            nextScene: { 
                text: "【Normal End】\n{lover}露出為難的表情：「你是個好人，但我們還是當朋友吧。」",
                rewards: { exp: 100 }
            }
        },
// --- 階段 1: 誕生/收養 (Birth) ---
{
    type: 'r_birth', id: 'raise_start',
    text: { zh: [
        "這是一個星光璀璨的夜晚。",
        "神明將這個孩子託付給了你。",
        "你看著她熟睡的臉龐，決心將她培養成一位出色的人。"
    ]},
    slots: ['daughter', 'butler'],
    dialogue: [
        { speaker: "{butler}", text: { zh: "主人，這孩子的未來就掌握在您手中了。" } }
    ],
    options: [
        { 
            label: "專注於培養氣質 (魅力型)", 
            action: "advance_chain", 
            rewards: { varOps: [{key:'chr', val:50, op:'set'}, {key:'str', val:10, op:'set'}] } 
        },
        { 
            label: "專注於鍛鍊體魄 (戰鬥型)", 
            action: "advance_chain", 
            rewards: { varOps: [{key:'chr', val:10, op:'set'}, {key:'str', val:50, op:'set'}] } 
        }
    ]
},

// --- 階段 2: 童年生活 (Childhood) ---
// 利用隨機填詞讓「興趣」每次都不一樣
{
    type: 'r_childhood', id: 'raise_child_hobby',
    text: { zh: [
        "時光飛逝，{daughter}已經開始展現出她的興趣。",
        "最近她似乎對【{r_hobby}】特別著迷。"
    ]},
    slots: ['daughter', 'r_hobby'],
    options: [
        { 
            label: "支持她的興趣 (金幣-50 / 屬性++)", 
            action: "advance_chain", 
            condition: { var: { key: 'gold', val: 50, op: '>=' } },
            rewards: { gold: -50, varOps: [{key:'stress', val:10, op:'+'}, {key:'int', val:20, op:'+'}] },
            nextScene: { text: "她開心地投入了練習，進步神速。" }
        },
        { 
            label: "讓她幫忙做家事 (壓力- / 魅力+)", 
            action: "advance_chain", 
            rewards: { varOps: [{key:'stress', val:10, op:'-'}, {key:'chr', val:5, op:'+'}] },
            nextScene: { text: "她雖然嘟著嘴，但還是乖乖去掃地了。" }
        }
    ]
},

// --- 階段 3: 青春期/打工 (Adolescence) ---
{
    type: 'r_adolescence', id: 'raise_teen_work',
    text: { zh: [
        "{daughter}長大了，開始嘗試接觸外面的世界。",
        "她找到了一份【{r_job}】的工作。"
    ]},
    slots: ['daughter', 'r_job'],
    options: [
        { 
            label: "鼓勵她努力工作 (獲得金幣)", 
            action: "advance_chain", 
            rewards: { gold: 100, varOps: [{key:'stress', val:20, op:'+'}] } 
        },
        { 
            label: "帶她去海邊散心 (消除壓力)", 
            action: "advance_chain",
            rewards: { varOps: [{key:'stress', val:50, op:'-'}] } 
        }
    ]
},

// --- 階段 4: 慶典/競賽 (Event) ---
{
    type: 'r_event', id: 'raise_festival',
    text: { zh: [
        "一年一度的王國慶典開始了！",
        "廣場上人山人海，你的勁敵{rival}也出現了。"
    ]},
    slots: ['rival'],
    dialogue: [
        { speaker: "{rival}", text: { zh: "哼，這次冠軍非我莫屬。" } }
    ],
    options: [
        { 
            label: "參加選美大賽 (檢定魅力)", 
            check: { stat: 'CHR', val: 50 }, // 假設你有這個屬性
            action: "advance_chain",
            nextScene: { text: "全場都被她的美貌驚豔了！冠軍！", rewards: { gold: 500, tags: ['fame_high'] } },
            failScene: { text: "可惜，評審似乎更喜歡另一種風格。", rewards: { varOps: [{key:'stress', val:20, op:'+'}] } }
        },
        { 
            label: "參加武鬥大會 (檢定力量)", 
            check: { stat: 'STR', val: 50 }, 
            action: "advance_chain",
            nextScene: { text: "她一拳擊倒了對手！冠軍！", rewards: { gold: 500, tags: ['fame_high'] } }
        }
    ]
},

// --- 階段 5: 職業結局 (Ending) ---
{
    type: 'r_ending', id: 'raise_end_check',
    text: { zh: "終於，到了她獨立的這一天。" },
    slots: ['daughter', 'r_dream'],
    dialogue: [
        { speaker: "{daughter}", text: { zh: "謝謝您養育我長大... 我決定去追尋我的夢想：{r_dream}！" } }
    ],
    options: [
        // 結局 A: 女王 (要求最高)
        { 
            label: "見證她的加冕 (CHR > 100)", 
            style: "primary",
            condition: { 
                vars: [{key:'chr', val:100, op:'>='}, {key:'fame_high', op:'hasTag'}] // 假設 checkCondition 支援 hasTag
            }, 
            action: "finish_chain", 
            nextScene: { text: "【結局：王國女王】\n她成為了史上最受愛戴的女王。" }
        },
        // 結局 B: 將軍 (力量型)
        { 
            label: "送她上戰場 (STR > 80)", 
            condition: { var: { key: 'str', val: 80, op: '>=' } }, 
            action: "finish_chain",
            nextScene: { text: "【結局：王國將軍】\n她的名字將響徹沙場。" }
        },
        // 結局 C: 平凡幸福
        { 
            label: "祝福她", 
            action: "finish_chain",
            nextScene: { text: "【結局：平凡的幸福】\n她嫁給了一個普通人，過著快樂的日子。" }
        }
    ]
};