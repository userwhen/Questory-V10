/* js/data_piece.js (通用劇本) */
(function() {
    const DB = window.FragmentDB;
    if (!DB) return;

    // 這裡直接 push 物件，不要再寫 templates: [...]
    DB.templates.push(
        // [通用碎片] 1. 環境描寫
        { 
            type: 'univ_filler', 
            id: 'uni_env_normal',
            weight: 10,
            text: { zh: ["{pattern_look_around}"] }, 
            options: [
                { label: "保持警惕，繼續前進", action: "advance_chain" },
                { label: "仔細觀察周圍 (INT檢定)", check: { stat: 'INT', val: 5 }, action: "advance_chain", rewards: { tags: ['observed'] } }
            ] 
        },

        // 2. 環境描寫 - 危險/高壓狀態
        { 
            type: 'univ_filler', 
            id: 'uni_env_danger',
            conditions: { "risk_high": true },
            text: { zh: [
                "你的心跳聲在{base_env_sound}中顯得格外刺耳。",
                "光線在{base_env_light}中扭曲，你總覺得角落裡有東西在看著你。",
                "{pattern_enemy_appear} 不... 仔細一看，那只是{noun_env_feature}投下的陰影。" 
            ] }, 
            options: [
                { label: "握緊武器", action: "advance_chain", rewards: { varOps: [{key:'stress', val:5, op:'+'}] } },
                { label: "深呼吸平復心情", action: "advance_chain", rewards: { varOps: [{key:'stress', val:5, op:'-'}] } }
            ] 
        },

        // 3. 物品發現
        { 
            type: 'univ_filler', 
            id: 'uni_item_discovery',
            text: { zh: ["{pattern_found_item}"] }, 
            rewards: { tags: ['found_something'] },
            options: [
                { label: "撿起來看看", action: "advance_chain", rewards: { tags: ['item_checked'] } },
                { label: "不要亂碰比較好", action: "advance_chain" }
            ] 
        },

        // 4. 感官敘事
        {
            type: 'univ_filler', 
            id: 'uni_sense_mix',
            text: { zh: [
                "{adv_time}，一股{base_env_smell}飄了過來，讓你皺起了眉頭。",
                "你停下腳步。{base_env_sound}... 聲音似乎是從{noun_location_room}深處傳來的。",
                "一陣寒意{adv_time}爬上了你的脊椎。這裡肯定發生過什麼。"
            ] },
            options: [{ label: "循著感覺探索", action: "advance_chain" }]
        },

        // 5. 休息片段
        {
            type: 'univ_filler', 
            id: 'uni_rest_moment',
            text: { zh: [
                "連續的探索讓你感到有些疲憊。這裡暫時看起來是安全的。",
                "你靠在{noun_env_feature}旁，稍微整理了一下思緒。",
                "雖然{adj_env_vibe}，但你必須讓自己冷靜下來。"
            ] },
            options: [
                { label: "原地休息片刻 (HP+10)", action: "advance_chain", rewards: { varOps: [{key:'hp', val:10, op:'+'}] } },
                { label: "檢查裝備", action: "advance_chain" }
            ]
        },

        // ============================================================
        // [Safety Net] 全域通用備案
        // ============================================================
        
        // 1. 通用戰鬥備案
        {
            type: 'event_battle',
            id: 'fallback_battle',
            text: { zh: ["路邊突然衝出了一隻{noun_role_monster}！", "它似乎飢餓難耐，直接向你發動了攻擊。", "避無可避，唯有戰鬥。"] },
            slots: ['noun_role_monster'],
            options: [
                { label: "正面迎擊", check: { stat: 'STR', val: 5 }, action: "advance_chain", nextScene: { text: "你費盡九牛二虎之力擊退了它。" }, failScene: { text: "你受了點傷才勉強趕跑它。", rewards: { varOps: [{key:'hp', val:10, op:'-'}] } } },
                { label: "嘗試逃跑", check: { stat: 'AGI', val: 5 }, action: "advance_chain", nextScene: { text: "你像風一樣消失在牠的視野中。" } }
            ]
        },

        // 2. 通用高潮備案
        {
            type: 'climax', 
            id: 'fallback_climax',
            text: { zh: ["終於來到了旅途的終點。", "強大的氣息從前方傳來，你知道，最後的試煉就在眼前。", "無論勝敗，這都將是決定性的一戰。"] },
            options: [
                { label: "放手一搏！", style: "danger", action: "finish_chain", nextScene: { text: "戰鬥結束了... 你的命運就此定格。" } }
            ]
        },

        // 3. 通用獎勵/休息備案
        {
            type: 'univ_filler',
            id: 'fallback_rest',
            text: { zh: ["四周暫時恢復了平靜。", "你利用這難得的機會整理裝備，並包紮傷口。"] },
            options: [{ label: "休息 (HP+10)", action: "advance_chain", rewards: { varOps: [{key:'hp', val:10, op:'+'}] } }]
        },

        // 4. 通用養成備案
        {
            type: 'raise_climax', 
            id: 'raise_final_battle_low_fame',
            text: { zh: [
                "決戰之日來臨，雖然{trainee}的名氣還不足以撼動全場，但這是一次證明自己的機會。",
                "對手{rival}甚至沒有正眼看過來，這份輕視或許能成為反擊的動力。",
                "在此刻，你想對他說/牠最後一句話是..."
            ]},
            slots: ['trainee', 'rival'],
            options: [{ 
                label: "「輸贏不重要，只要發揮出你的全力！」", 
                action: "advance_chain", 
                rewards: { varOps: [{key:'stress', val:10, op:'-'}] }, 
                nextScene: { text: "{trainee}深吸了一口氣，點點頭。雖然沒有觀眾的歡呼，但他的眼神依然堅定。" } 
            }]
        },

        // 5. 通用戀愛備案
        {
            type: 'love_bond', 
            id: 'rom_bond_normal',
            text: { zh: [
                "雖然你們還稱不上是親密夥伴，但{lover}似乎有話想對你說。",
                "他/她約你在{noun_location_room}見面，表情顯得有些嚴肅。",
                "「關於{rival}的事情... 我覺得你需要知道真相。」"
            ]},
            slots: ['lover', 'noun_location_room', 'rival'],
            options: [
                { 
                    label: "洗耳恭聽", 
                    action: "advance_chain", 
                    rewards: { varOps: [{key:'trust', val:5, op:'+'}] }, 
                    nextScene: { text: "你們交換了情報。雖然氣氛有些公事公辦，但這也是一種進展。" } 
                }
            ]
        },
		{
    type: 'univ_filler',
    id: 'uni_item_key_safe',
    weight: 100, // 高權重，讓卡關的玩家容易抽到
    conditions: { "exp_puzzle": true, "has_safe_key": false },
    text: { zh: [
        "你在走廊的{noun_env_feature}下面發現了一個閃閃發光的東西。",
        "撿起來一看，是一把造型古老的鑰匙，上面刻著奇怪的花紋。",
        "這該不會就是那個保險箱的鑰匙吧？"
    ]},
    slots: ['noun_env_feature'],
    options: [
        { 
            label: "收下鑰匙", 
            action: "advance_chain", 
            rewards: { tags: ['has_safe_key', 'found_something'] },
            nextScene: { text: "你把鑰匙放進口袋。現在你可以回去試試看那個保險箱了。" }
        }
    ]
},

// 2. 發現放大鏡 (解鎖微小線索用)
// 邏輯：只有在「解謎模式」且「沒放大鏡」時出現
{
    type: 'univ_filler',
    id: 'uni_item_magnifier',
    weight: 80,
    conditions: { "exp_puzzle": true, "has_magnifier": false },
    text: { zh: [
        "經過書房時，你被桌上的一個物件絆倒了。",
        "那是一個做工精良的放大鏡，雖然鏡片有點裂痕，但還能用。",
        "有了這個，或許能看清一些原本忽略的細節。"
    ]},
    options: [
        { 
            label: "裝備放大鏡", 
            action: "advance_chain", 
            rewards: { tags: ['has_magnifier'] } 
        }
    ]
},

// ==========================================
// [擴充] 一般環境與氣氛類 (Atmosphere)
// ==========================================

// 3. 遇到黑貓 (不祥之兆)
{
    type: 'univ_filler',
    id: 'uni_event_blackcat',
    text: { zh: [
        "一隻黑貓突然從{noun_env_feature}後面竄出，把你嚇了一跳！",
        "它停在遠處，用那雙發亮的眼睛死死盯著你，隨後消失在陰影中。",
        "這是不祥的預兆，還是某種指引？"
    ]},
    slots: ['noun_env_feature'],
    options: [
        { label: "別自己嚇自己", action: "advance_chain" },
        { label: "試著跟上去 (AGI檢定)", check: { stat: 'AGI', val: 6 }, action: "advance_chain", nextScene: { text: "你追到了轉角，發現地上有一張被撕碎的紙條..." }, rewards: { tags: ['found_scrap'] } }
    ]
},

// 4. 奇怪的低語 (Sanity Check)
{
    type: 'univ_filler',
    id: 'uni_event_whisper',
    conditions: { "risk_high": true }, // 只有在高壓狀態下才會出現
    text: { zh: [
        "你似乎聽到了有人在耳邊低語... 「回頭...別去...」",
        "你猛然回頭，身後卻只有空蕩蕩的走廊和{noun_env_feature}。",
        "是幻覺嗎？還是你的精神已經開始緊繃了？"
    ]},
    slots: ['noun_env_feature'],
    options: [
        { label: "保持理智 (SAN檢定)", check: { stat: 'MND', val: 5 }, action: "advance_chain", failScene: { text: "恐懼在心中蔓延...", rewards: { varOps: [{key:'stress', val:10, op:'+'}] } } },
        { label: "大聲喝斥壯膽", action: "advance_chain" }
    ]
},

// 5. 發現補給品 (Resource)
{
    type: 'univ_filler',
    id: 'uni_find_supply',
    text: { zh: [
        "在櫃子裡，你幸運地發現了一些急救用品和乾糧。",
        "雖然不多，但足以讓你恢復一些體力。",
        "在這個危險的地方，這些物資比黃金還珍貴。"
    ]},
    options: [
        { label: "使用急救包 (HP+20)", action: "advance_chain", rewards: { varOps: [{key:'hp', val:20, op:'+'}] } },
        { label: "留著以備不時之需", action: "advance_chain" }
    ]
},
/* js/data_piece.js */

// 1. 天氣變化 (氣氛渲染)
{
    type: 'univ_filler',
    id: 'uni_gen_weather_change',
    text: { zh: [
        "天空突然變得陰沉，烏雲遮蔽了光線。",
        "一陣強風吹過，捲起了地上的塵土與落葉。",
        "這種壓抑的感覺，彷彿預示著{noun_role_monster}或是某種不祥之物的靠近。"
    ]},
    // 無論什麼模式，都有可能變天
    options: [
        { label: "加快腳步 (消耗體力)", action: "advance_chain", rewards: { varOps: [{key:'stamina', val:5, op:'-'}] } },
        { label: "尋找避雨處", action: "advance_chain" }
    ]
},

// 2. 偶遇旅行商人 (資源交換)
{
    type: 'univ_filler',
    id: 'uni_gen_merchant',
    text: { zh: [
        "在路邊，你遇到了一位背著大包小包的神秘行商。",
        "「嘿，朋友！不管你是{noun_role_job}還是冒險者，總需要點補給吧？」",
        "他展示了一些看起來很實用的物資。"
    ]},
    options: [
        { 
            label: "購買補給 (金幣-50)", 
            // 這裡用了條件檢查：錢夠才顯示
            condition: { stats: { gold: '>49' } }, 
            action: "advance_chain", 
            rewards: { varOps: [{key:'gold', val:50, op:'-'}, {key:'hp', val:20, op:'+'}] },
            nextScene: { text: "你買了一些藥水和乾糧，感覺體力恢復了不少。" }
        },
        { label: "沒錢，揮手拒絕", action: "advance_chain" },
        // 如果是「盜賊(rogue)」或「壞人(evil)」標籤，可以搶劫
        { 
            label: "試圖搶劫 (惡人限定)", 
            condition: { tags: ['evil'] }, // 需要 evil 標籤
            action: "advance_chain",
            rewards: { varOps: [{key:'gold', val:100, op:'+'}] },
            nextScene: { text: "你搶走了商人的錢袋，他嚇得落荒而逃。你的罪惡感增加了。" }
        }
    ]
},

// 3. 發現不明遺跡 (知識檢定)
{
    type: 'univ_filler',
    id: 'uni_gen_ruins',
    text: { zh: [
        "你發現了一塊殘破的石碑，上面刻著古老的文字。",
        "雖然大部分已經風化，但隱約能辨認出關於「{base_item_key}」的記載。",
        "這或許是關於這個世界歷史的重要線索。"
    ]},
    options: [
        { 
            label: "解讀文字 (INT檢定)", 
            check: { stat: 'INT', val: 5 }, 
            action: "advance_chain", 
            rewards: { exp: 50, tags: ['knowledge_ancient'] },
            nextScene: { text: "你成功解讀了碑文，獲得了關於古代文明的知識。" }
        },
        { label: "看不懂，離開", action: "advance_chain" }
    ]
},

// 4. 短暫的寧靜 (整理思緒)
{
    type: 'univ_filler',
    id: 'uni_gen_reflection',
    text: { zh: [
        "周圍暫時沒有危險，難得的寧靜讓你陷入了沉思。",
        "你回想起出發時的初衷，以及這一路上的遭遇。",
        "無論前方有什麼，你都必須堅持下去。"
    ]},
    options: [
        { label: "自我激勵 (恢復MP/SAN)", action: "advance_chain", rewards: { varOps: [{key:'mp', val:10, op:'+'}] } },
        // 如果是「后宮(theme_harem)」模式，會想到戀人
        { 
            label: "想念心愛的人", 
            condition: { tags: ['theme_harem'] }, 
            action: "advance_chain",
            nextScene: { text: "你想起了{lover}的笑容，這給了你無窮的動力。" }
        }
    ]
},

// 5. 遭遇陷阱/意外 (通用危機)
{
    type: 'univ_filler',
    id: 'uni_gen_trap',
    text: { zh: [
        "小心！你感覺腳下一空！",
        "這是一個隱蔽的{noun_env_feature}陷阱！",
        "一切發生得太快，你必須立刻做出反應！"
    ]},
    options: [
        { 
            label: "靈巧閃避 (AGI檢定)", 
            check: { stat: 'AGI', val: 6 }, 
            action: "advance_chain", 
            nextScene: { text: "你在千鈞一髮之際翻滾躲開了陷阱。好險！" },
            failScene: { text: "你反應不及，重重地摔了一跤。", rewards: { varOps: [{key:'hp', val:15, op:'-'}] } }
        },
        { label: "用身體硬抗 (STR檢定)", check: { stat: 'STR', val: 8 }, action: "advance_chain" }
    ]
},
{
    type: 'univ_filler',
    text: { zh: ["你摸了摸口袋..."] },
    options: [
        { 
            label: "我是有錢人！", 
            condition: { tags: ['trait_rich'] }, // 只有抽到有錢人tag才會出現
            action: "advance_chain",
            nextScene: { text: "你隨手撒了一把金幣，路人紛紛撿拾。" }
        }
    ]
}
    );

    console.log("✅ 通用劇本(data_piece)已載入");
})();