/* js/story_data/story_adventure.js (V5 骨架嚴格對齊與事件魔改整合版) */
(function() {
    const DB = window.FragmentDB;
    if (!DB) {
        console.error("❌ 錯誤：找不到 FragmentDB，請確認 story_data_core.js 已優先載入。");
        return;
    }
    
    DB.templates = DB.templates || [];

    DB.templates.push(
        // ============================================================
        // 🗡️ 【階段 1：冒險開局】 (adventure_start)
        // ============================================================
        {
            type: 'adventure_start', id: 'adv_start_class',
            reqTags: ['struct_adventure'], 
            dialogue: [
                { text: { zh: "強烈的暈眩感退去後，你發現自己身處於一座{env_adj}的{env_building}之中。" } },
                { text: { zh: "天空中懸掛著破碎的月亮，遠處傳來了{monster}的嘶吼聲。" } },
                { text: { zh: "你低頭看了看自己的雙手，意識到自己必須依靠力量才能活下去。" } }
            ],
            options: [
                { 
                    label: "握緊重劍 (戰士路線)", action: "node_next", 
                    rewards: { tags: ['class_warrior'], varOps: [{key:'str', val:10, op:'set'}] }, 
                    nextScene: { 
                        dialogue: [{ text: { zh: "沉重的劍身給了你安全感。無論前方有什麼，你都將一刀兩斷。" } }],
                        options: [{ label: "出發", action: "advance_chain" }]
                    } 
                },
                { 
                    label: "詠唱咒文 (法師路線)", action: "node_next", 
                    rewards: { tags: ['class_mage'], varOps: [{key:'int', val:10, op:'set'}] }, 
                    nextScene: { 
                        dialogue: [{ text: { zh: "元素在你指尖跳動。知識就是力量，而你掌握著毀滅的知識。" } }],
                        options: [{ label: "出發", action: "advance_chain" }]
                    } 
                },
                { 
                    label: "隱入黑暗 (刺客路線)", action: "node_next", 
                    rewards: { tags: ['class_rogue'], varOps: [{key:'agi', val:10, op:'set'}] }, 
                    nextScene: { 
                        dialogue: [{ text: { zh: "你壓低了身形，與陰影融為一體。在被發現之前，敵人就已經死了。" } }],
                        options: [{ label: "出發", action: "advance_chain" }]
                    } 
                }
            ]
        },

        // ============================================================
        // 🛡️ 【階段 2：冒險中盤】 (adventure_mid) - 基礎戰鬥與探索補給
        // ============================================================
        
        // 🌟 [整合自：遭遇戰] 魔物伏擊
        {
            type: 'adventure_mid', id: 'adv_mid_ambush',
            dialogue: [
                { text: { zh: "草叢中傳來了急促的沙沙聲。你猛然回頭，正好迎面撞上了一隻{monster}！" } },
                { text: { zh: "對方正張牙舞爪地示威，眼裡閃爍著令人不安的紅光，顯然已經飢餓難耐。" } }
            ],
            options: [
                { 
                    label: "正面迎擊 (STR檢定)", check: { stat: 'STR', val: 5 }, action: "node_next", 
                    nextScene: { dialogue: [{ text: { zh: "你發出怒吼，武器帶著破風聲重重擊中了對方！怪物倒在地上抽搐著。" } }], options: [{ label: "跨過屍體前進", action: "advance_chain" }] }, 
                    failScene: { dialogue: [{ text: { zh: "你的力量輸給了野性。對方將你撲倒在地，留下了深可見骨的傷痕。" } }], rewards: { varOps: [{key:'hp', val:15, op:'-'}] }, options: [{ label: "狼狽逃開", action: "advance_chain" }] } 
                }
            ]
        },
        // 🌟 [整合自：休息與物資] 冒險者的廢棄營地
        {
            type: 'adventure_mid', id: 'adv_mid_camp',
            dialogue: [
                { text: { zh: "在連續的跋涉後，你找到了一處隱蔽的{env_room}。" } },
                { text: { zh: "角落裡有其他冒險者留下的營火痕跡，旁邊還散落著一些急救用品和乾糧。" } },
                { text: { zh: "這裡暫時沒有怪物的蹤跡，是個絕佳的休息點。" } }
            ],
            options: [
                { label: "點燃營火休息 (大幅恢復精力)", action: "advance_chain", rewards: { varOps: [{key:'energy', val:20, op:'+'}] } },
                { label: "搜刮物資然後立刻離開 (恢復HP與金幣)", action: "advance_chain", rewards: { gold: 30, varOps: [{key:'hp', val:10, op:'+'}] } }
            ]
        },
        // 🌟 [整合自：商人] 地城流浪商人
        {
            type: 'adventure_mid', id: 'adv_mid_merchant',
            dialogue: [
                { text: { zh: "在地城深處，你居然遇到了一名背著巨大行囊的神秘商人。" } },
                { speaker: "商人", text: { zh: "嘿，勇敢的冒險者！不管前面的{boss}有多可怕，帶上我的藥水絕對能保命！" } },
                { text: { zh: "對方展示了幾瓶散發著奇異光芒的魔藥。" } }
            ],
            options: [
                { 
                    label: "購買高階回復藥 (金幣-50)", condition: { stats: { gold: '>49' } }, action: "node_next", 
                    rewards: { varOps: [{key:'gold', val:50, op:'-'}, {key:'hp', val:30, op:'+'}, {key:'energy', val:20, op:'+'}] },
                    nextScene: { dialogue: [{ text: { zh: "你喝下藥水，傷口瞬間癒合，感覺狀態好極了。" } }], options: [{ label: "繼續旅程", action: "advance_chain" }] }
                },
                { label: "沒錢，握緊武器離開", action: "advance_chain" }
            ]
        },

        // ============================================================
        // 🗺️ 【階段 3：進階考驗】 (adventure_adv) - 陷阱、精英與遺跡
        // ============================================================

        // 🌟 [整合自：遺跡] 魔法方尖碑
        {
            type: 'adventure_adv', id: 'adv_adv_monument',
            dialogue: [
                { text: { zh: "你發現了一座古老的方尖碑，上面刻滿了散發微光的符文。" } },
                { text: { zh: "在{env_light}的映照下，這座石碑周圍的魔法能量非常活躍。" } }
            ],
            options: [
                { 
                    label: "嘗試解讀符文 (INT檢定)", check: { stat: 'INT', val: 7 }, action: "node_next", 
                    nextScene: { dialogue: [{ text: { zh: "你成功解讀了碑文，獲得了遠古的知識，大腦一陣清明！" } }], rewards: { exp: 50 }, options: [{ label: "心滿意足地離開", action: "advance_chain" }] },
                    failScene: { dialogue: [{ text: { zh: "符文的知識太過深奧，強行解讀讓你的大腦一陣刺痛。" } }], rewards: { varOps: [{key:'energy', val:10, op:'-'}] }, options: [{ label: "放棄解讀", action: "advance_chain" }] }
                },
                { label: "直接把石碑上的寶石摳下來 (獲得金幣)", action: "advance_chain", rewards: { gold: 50, varOps: [{key:'sanity', val:5, op:'-'}] } }
            ]
        },
        // 🌟 [整合自：陷阱/虛驚一場] 致命的機關
        {
            type: 'adventure_adv', id: 'adv_adv_trap',
            dialogue: [
                { text: { zh: "你正走在狹窄的通道中，腳下的地磚突然下陷！" } },
                { text: { zh: "「喀嚓」一聲，隱藏在{env_feature}的機關被觸發了！兩側的牆壁開始噴射出毒箭。" } }
            ],
            options: [
                { 
                    label: "靠反應閃避 (AGI檢定)", check: { stat: 'AGI', val: 6 }, action: "node_next", 
                    nextScene: { dialogue: [{ text: { zh: "你的身體比意識更快做出了反應！你在箭雨中穿梭，毫髮無傷。" } }], options: [{ label: "好險...", action: "advance_chain" }] }, 
                    failScene: { dialogue: [{ text: { zh: "你盡力躲避了，但一支毒箭還是擦傷了你的手臂。傷口傳來了一陣麻痺感。" } }], rewards: { varOps: [{key:'hp', val:20, op:'-'}] }, options: [{ label: "忍痛前進", action: "advance_chain" }] } 
                }
            ]
        },
        // 🌟 [整合自：酒館鬥毆] 魔物爭奪地盤
        {
            type: 'adventure_adv', id: 'adv_adv_infight',
            dialogue: [
                { text: { zh: "你悄悄探出頭，發現前方的{env_room}裡一片混亂。" } },
                { text: { zh: "兩群不同種族的{monster}正在為了領地互相撕咬，鮮血飛濺。" } },
                { text: { zh: "地上散落著一個散發著強大波動的{combo_item_simple}。" } }
            ],
            options: [
                { 
                    label: "殺進去搶奪寶物！(STR檢定)", check: { stat: 'STR', val: 8 }, action: "node_next", 
                    nextScene: { dialogue: [{ text: { zh: "你宛如戰神般殺入敵陣，怪物們被你殺得四處逃竄。你順利拿到了戰利品！" } }], rewards: { exp: 50, gold: 80 }, options: [{ label: "瀟灑離去", action: "advance_chain" }] },
                    failScene: { dialogue: [{ text: { zh: "你低估了牠們的數量！你被怪物圍攻，受了重傷才勉強脫身。" } }], rewards: { varOps: [{key:'hp', val:30, op:'-'}] }, options: [{ label: "狼狽逃離", action: "advance_chain" }] }
                },
                { label: "趁亂摸走邊緣的金幣 (AGI)", check: { stat: 'AGI', val: 6 }, action: "advance_chain", rewards: { gold: 30 } },
                { label: "太危險了，繞道而行", action: "advance_chain" }
            ]
        },

        // ============================================================
        // 👑 【階段 4：冒險高潮】 (adventure_climax) - 迎擊首領
        // ============================================================
        {
            type: 'adventure_climax', id: 'adv_climax_boss',
            reqTags: ['struct_adventure'], 
            dialogue: [
                { text: { zh: "大地的震動越來越劇烈。在{env_building}的最深處，龐大的陰影籠罩了你。" } },
                { text: { zh: "那是這片區域的霸主——{boss}！" } },
                { text: { zh: "對方發出了一聲震耳欲聾的咆哮，強大的風壓幾乎讓你站立不穩。" } }
            ],
            // 💡 關鍵：這裡打贏了用 advance_chain 前往結局，打輸了用 finish_chain 直接Game Over
            options: [
                { 
                    label: "拔劍，正面硬剛！(戰士)", condition: { tags: ['class_warrior'] }, style: "danger", check: { stat: 'STR', val: 8 }, action: "node_next", 
                    nextScene: { dialogue: [{ text: { zh: "你燃燒了最後的生命力，將劍送入了怪物的心臟！" } }], rewards: { gold: 500 }, options: [{ label: "走向勝利", action: "advance_chain" }] }, 
                    failScene: { dialogue: [{ text: { zh: "實力的差距是絕望的。你的武器折斷了，視野逐漸被黑暗吞沒...\n【結局：無名的屍骸】" } }], options: [{ label: "黯然倒下", action: "finish_chain" }] } 
                },
                { 
                    label: "釋放禁咒天雷！(法師)", condition: { tags: ['class_mage'] }, style: "danger", check: { stat: 'INT', val: 8 }, action: "node_next", 
                    nextScene: { dialogue: [{ text: { zh: "毀滅的雷霆貫穿了怪物的身軀！焦黑的巨獸轟然倒下。" } }], rewards: { gold: 500 }, options: [{ label: "走向勝利", action: "advance_chain" }] }, 
                    failScene: { dialogue: [{ text: { zh: "咒語在最後一刻被打斷，狂暴的魔力將你與怪物一同吞噬...\n【結局：魔力反噬】" } }], options: [{ label: "黯然倒下", action: "finish_chain" }] } 
                },
                { 
                    label: "死角暗殺！(刺客)", condition: { tags: ['class_rogue'] }, style: "danger", check: { stat: 'AGI', val: 8 }, action: "node_next", 
                    nextScene: { dialogue: [{ text: { zh: "你化作一道殘影，在怪物咆哮的瞬間，精準地切斷了它的咽喉。" } }], rewards: { gold: 500 }, options: [{ label: "走向勝利", action: "advance_chain" }] }, 
                    failScene: { dialogue: [{ text: { zh: "你的速度稍微慢了一拍，怪物的尾巴將你狠狠掃飛...\n【結局：喋血陰影】" } }], options: [{ label: "黯然倒下", action: "finish_chain" }] } 
                },
                { 
                    label: "硬著頭皮上！ (無職業保底)", excludeTags: ['class_warrior', 'class_mage', 'class_rogue'], style: "danger", check: { stat: 'STR', val: 10 }, action: "node_next", 
                    nextScene: { dialogue: [{ text: { zh: "憑藉著超乎常人的運氣，你奇蹟般地找到了對方的弱點並擊敗了牠！" } }], rewards: { gold: 200 }, options: [{ label: "走向勝利", action: "advance_chain" }] },
                    failScene: { dialogue: [{ text: { zh: "沒有力量的你，瞬間化為灰燼...\n【結局：螻蟻的悲歌】" } }], options: [{ label: "結束", action: "finish_chain" }] }
                }
            ]
        },

        // ============================================================
        // 🏆 【階段 5：冒險結局】 (adventure_end) - 結算榮耀
        // ============================================================
        {
            type: 'adventure_end', id: 'adv_end_victory',
            dialogue: [
                { text: { zh: "看著倒下的{boss}，你長長地吐出了一口氣。" } },
                { text: { zh: "你收集了傳說中的戰利品，踏出了這座壓抑的{env_building}。" } },
                { text: { zh: "外面的陽光格外刺眼，而你的名字，將被吟遊詩人永遠傳唱。" } },
                { text: { zh: "【結局：傳奇冒險者】" } }
            ],
            options: [
                { label: "滿載而歸", action: "finish_chain", rewards: { title: "傳奇冒險者" } }
            ]
        }

    );

    console.log("⚔️ 冒險劇本已載入 (V5 骨架嚴格對齊與整合版)");
})();