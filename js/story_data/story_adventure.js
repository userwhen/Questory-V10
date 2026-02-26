/* js/story_data/story_adventure.js */
(function() {
    const DB = window.FragmentDB;
    if (!DB) {
        console.error("❌ 錯誤：找不到 FragmentDB，請確認 story_data_core.js 已優先載入。");
        return;
    }
    
    // 🛡️ 防呆金牌：確保 templates 陣列絕對存在
    DB.templates = DB.templates || [];

    DB.templates.push(
        // ============================================================
        // [BLOCK C] ⚔️ 異世界戰記 (Adventure Chronicles)
        // ============================================================
        {
            type: 'adventure_setup', id: 'adventure_start_class',
            reqTags: ['struct_adventure'], // 🌟 確保只有冒險劇本會抽到
            dialogue: [
                { text: { zh: "強烈的暈眩感退去後，你發現自己身處於一座{noun_location_building}之中。" } },
                { text: { zh: "天空中懸掛著破碎的月亮，遠處傳來了{noun_monster}的嘶吼聲。" } },
                { text: { zh: "你低頭看了看自己的雙手，意識到自己必須依靠手中的武器活下去。" } }
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
                    label: "檢查短刀 (刺客路線)", action: "node_next", 
                    rewards: { tags: ['class_rogue'], varOps: [{key:'agi', val:10, op:'set'}] }, 
                    nextScene: { 
                        dialogue: [{ text: { zh: "你壓低了身形，與陰影融為一體。在被發現之前，敵人就已經死了。" } }],
                        options: [{ label: "出發", action: "advance_chain" }]
                    } 
                }
            ]
        },
        {
            type: 'event_battle', id: 'adventure_battle_ambush',
            dialogue: [
                { text: { zh: "草叢中傳來了急促的沙沙聲。你{atom_time}轉過身，正好迎面撞上了一隻{noun_monster}！" } },
                { text: { zh: "對方{atom_manner}地張開了利爪，眼裡閃爍著令人不安的紅光，顯然已經飢餓難耐。" } },
                { text: { zh: "避無可避，唯有死戰。" } }
            ],
            options: [
                { 
                    label: "正面迎擊 (STR檢定)", check: { stat: 'STR', val: 5 }, action: "node_next", 
                    nextScene: { 
                        dialogue: [{ text: { zh: "你發出怒吼，武器帶著破風聲重重擊中了對方！怪物發出哀嚎，倒在地上抽搐著。" } }],
                        options: [{ label: "繼續前進", action: "advance_chain" }]
                    }, 
                    failScene: { 
                        dialogue: [{ text: { zh: "你的力量輸給了對方的野性。對方將你撲倒在地，利爪在你身上留下了深可見骨的傷痕。" } }],
                        rewards: { varOps: [{key:'energy', val:5, op:'-'}] },
                        options: [{ label: "狼狽逃開", action: "advance_chain" }]
                    } 
                },
                { 
                    label: "尋找破綻 (INT檢定)", check: { stat: 'INT', val: 5 }, action: "node_next", 
                    nextScene: { 
                        dialogue: [{ text: { zh: "你冷靜地觀察對方的動作，在對方撲過來的瞬間側身閃過，並精準地刺入了對方的要害。" } }],
                        options: [{ label: "繼續前進", action: "advance_chain" }]
                    }, 
                    failScene: { 
                        dialogue: [{ text: { zh: "對方的動作比你預想的更快！你判斷失誤，只能狼狽地在地上打滾躲避攻擊。" } }],
                        rewards: { varOps: [{key:'energy', val:5, op:'-'}] },
                        options: [{ label: "重新站起", action: "advance_chain" }]
                    } 
                }
            ]
        },
        {
            type: 'event_battle', id: 'adventure_battle_magic', 
            reqTags: ['class_mage'], 
            dialogue: [
                { text: { zh: "前方的道路被一群{noun_monster}擋住了。牠們似乎對魔法波動非常敏感。" } },
                { text: { zh: "你感覺到周圍的元素正在躁動，這是一個釋放大型魔法的絕佳機會。" } }
            ],
            options: [
                { 
                    label: "詠唱「爆裂火球」！ (INT檢定)", check: { stat: 'INT', val: 10 }, action: "node_next", 
                    nextScene: { 
                        dialogue: [{ text: { zh: "巨大的火球在怪物群中炸裂！空氣中充滿了焦糊味，敵人瞬間化為了灰燼。" } }],
                        options: [{ label: "帥氣收招", action: "advance_chain" }]
                    }, 
                    failScene: { 
                        dialogue: [{ text: { zh: "施法失敗！魔力反噬讓你跪倒在地，怪物趁機在你身上留下了傷痕。" } }],
                        rewards: { varOps: [{key:'energy', val:5, op:'-'}] },
                        options: [{ label: "狼狽撤退", action: "advance_chain" }]
                    } 
                },
                { 
                    label: "尋找破綻 (INT檢定)", check: { stat: 'INT', val: 5 }, action: "node_next", 
                    nextScene: { 
                        dialogue: [{ text: { zh: "你冷靜地觀察對方的動作，在對方撲過來的瞬間側身閃過，並精準用魔法攻擊對方的要害。" } }],
                        options: [{ label: "繼續前進", action: "advance_chain" }]
                    }, 
                    failScene: { 
                        dialogue: [{ text: { zh: "對方的動作比你預想的更快！你判斷失誤，只能狼狽地在地上打滾躲避攻擊。" } }],
                        rewards: { varOps: [{key:'energy', val:15, op:'-'}] },
                        options: [{ label: "重新站起", action: "advance_chain" }]
                    } 
                }
            ]
        },
        {
            type: 'event_explore', id: 'adventure_explore_ruin',
            dialogue: [
                { text: { zh: "你發現了一座被藤蔓覆蓋的古代遺跡。{sentence_env_vibe}。" } },
                { text: { zh: "在斷裂的石柱旁，躺著一具白骨，他的手裡還死死抓著一把{noun_item_weapon}。" } },
                { text: { zh: "那是某種信物？還是帶來不幸的詛咒之物？" } }
            ],
            options: [
                { 
                    label: "撿起物品", action: "node_next", 
                    rewards: { tags: ['item_found'], varOps: [{key:'gold', val:50, op:'+'}] }, 
                    nextScene: { 
                        dialogue: [{ text: { zh: "你擦去了上面的灰塵。雖然年代久遠，但它依然散發著微弱的魔力波動。" } }],
                        options: [{ label: "收進背包", action: "advance_chain" }]
                    } 
                },
                { 
                    label: "雙手合十，轉身離開", action: "node_next", 
                    rewards: { varOps: [{key:'sanity', val:10, op:'+'}] },
                    nextScene: { 
                        dialogue: [{ text: { zh: "你選擇不去打擾死者。心中的某種壓力似乎減輕了。" } }],
                        options: [{ label: "繼續探索", action: "advance_chain" }]
                    } 
                }
            ]
        },
        {
            type: 'event_explore', id: 'adventure_explore_trap',
            dialogue: [
                { text: { zh: "你正{atom_time}走在狹窄的通道中，腳下的地磚突然下陷！" } },
                { text: { zh: "「喀嚓」一聲，機關被觸發了。兩側的牆壁開始噴射出毒箭。" } },
                { text: { zh: "這是一個致命的陷阱！" } }
            ],
            options: [
                { 
                    label: "靠反應閃避 (AGI檢定)", check: { stat: 'AGI', val: 5 }, action: "node_next", 
                    nextScene: { 
                        dialogue: [{ text: { zh: "你的身體比意識更快做出了反應！你在箭雨中穿梭，毫髮無傷地落在了安全區。" } }],
                        options: [{ label: "好險...", action: "advance_chain" }]
                    }, 
                    failScene: { 
                        dialogue: [{ text: { zh: "你盡力躲避了，但一支毒箭還是擦傷了你的手臂。傷口傳來了一陣麻痺感。" } }],
                        rewards: { varOps: [{key:'energy', val:30, op:'-'}] },
                        options: [{ label: "忍痛前進", action: "advance_chain" }]
                    } 
                }
            ]
        },
        {
            type: 'boss', id: 'adventure_boss_dragon',
            reqTags: ['struct_adventure'], // 🌟 確保只在冒險劇本觸發
            dialogue: [
                { text: { zh: "大地的震動越來越劇烈。在{noun_location_building}的最深處，一雙巨大的眼睛睜開了。" } },
                { text: { zh: "那是傳說中的災厄——{noun_monster}（變異體）！" } },
                { text: { zh: "對方{atom_manner}地發出了震耳欲聾的咆哮，強大的風壓幾乎讓你站立不穩。" } },
                { text: { zh: "這就是旅途的終點嗎？還是成為傳說的起點？" } }
            ],
            options: [
                { 
                    label: "拔劍，正面硬剛！(戰士檢定)", condition: { tags: ['class_warrior'] }, style: "danger", check: { stat: 'STR', val: 8 }, action: "node_next", 
                    nextScene: { 
                        dialogue: [
                            { text: { zh: "你燃燒了最後的生命力，將劍送入了怪物的心臟。你的名字將被吟遊詩人永遠傳唱。" } },
                            { text: { zh: "【結局：屠龍英雄】" } }
                        ],
                        rewards: { gold: 200, title: "傳說勇者" },
                        options: [{ label: "結算", action: "finish_chain" }]
                    }, 
                    failScene: { 
                        dialogue: [
                            { text: { zh: "實力的差距是絕望的。你的武器折斷了，視野逐漸被黑暗吞沒..." } },
                            { text: { zh: "【結局：無名的屍骸】" } }
                        ],
                        rewards: { gold: 50 },
                        options: [{ label: "結算", action: "finish_chain" }]
                    } 
                },
                { 
                    label: "釋放禁咒天雷！(法師檢定)", condition: { tags: ['class_mage'] }, style: "danger", check: { stat: 'INT', val: 8 }, action: "node_next", 
                    nextScene: { 
                        dialogue: [
                            { text: { zh: "毀滅的雷霆貫穿了怪物的身軀！焦黑的巨獸倒下，而你成為了魔法史上的傳奇。" } },
                            { text: { zh: "【結局：大魔導師】" } }
                        ],
                        rewards: { gold: 200, title: "傳奇魔導" },
                        options: [{ label: "結算", action: "finish_chain" }]
                    }, 
                    failScene: { 
                        dialogue: [
                            { text: { zh: "咒語在最後一刻被打斷，狂暴的魔力將你與怪物一同吞噬..." } },
                            { text: { zh: "【結局：魔力反噬】" } }
                        ],
                        rewards: { gold: 50 },
                        options: [{ label: "結算", action: "finish_chain" }]
                    } 
                },
                { 
                    label: "鎖定死角，致命一擊！(刺客檢定)", condition: { tags: ['class_rogue'] }, style: "danger", check: { stat: 'AGI', val: 8 }, action: "node_next", 
                    nextScene: { 
                        dialogue: [
                            { text: { zh: "你化作一道殘影，在怪物咆哮的瞬間，精準地切斷了它的咽喉。" } },
                            { text: { zh: "【結局：暗影之王】" } }
                        ],
                        rewards: { gold: 200, title: "暗影刺客" },
                        options: [{ label: "結算", action: "finish_chain" }]
                    }, 
                    failScene: { 
                        dialogue: [
                            { text: { zh: "你的速度稍微慢了一拍，怪物的尾巴將你狠狠掃飛，劇痛奪走了你的意識..." } },
                            { text: { zh: "【結局：喋血陰影】" } }
                        ],
                        rewards: { gold: 50 },
                        options: [{ label: "結算", action: "finish_chain" }]
                    } 
                },
                // 🛡️ 補上沒有職業時的保底結局選項 (只要沒有這三個職業標籤就會觸發)
                { 
                    label: "絕望地閉上眼睛... (無職業結局)", 
                    excludeTags: ['class_warrior', 'class_mage', 'class_rogue'], // 🌟 V84 陣列排除法
                    action: "node_next", 
                    nextScene: { 
                        dialogue: [
                            { text: { zh: "沒有職業與力量的你，在龍威之下連站立都做不到，瞬間化為灰燼..." } },
                            { text: { zh: "【結局：螻蟻的悲歌】" } }
                        ],
                        rewards: { gold: 10 },
                        options: [{ label: "結束", action: "finish_chain" }]
                    } 
                }
            ]
        },
        {
            type: 'boss', 
            id: 'fallback_adventure_boss',
            dialogue: [
                { text: { zh: "龐大的陰影籠罩了你。這就是這片區域的霸主。" } },
                { text: { zh: "牠發出一聲震耳欲聾的咆哮，戰鬥一觸即發！" } }
            ],
            options: [
                { 
                    label: "全力迎戰！(STR檢定)", 
                    check: { stat: 'STR', val: 8 }, 
                    action: "node_next",
                    nextScene: { 
                        dialogue: [{ text: { zh: "你發出怒吼，武器精準地擊中了牠的要害！你贏得了輝煌的勝利！" } }],
                        options: [{ label: "領取戰利品", action: "finish_chain", rewards: { gold: 20, varOps: [{key:'gold', val:150, op:'+'}] } }]
                    },
                    failScene: {
                        dialogue: [{ text: { zh: "你拼盡全力，但對方實在太強大了... 你只能狼狽撤退。" } }],
                        options: [{ label: "逃跑保命", action: "finish_chain", rewards: { gold: 20 } }]
                    }
                }
            ]
        }
    );

    console.log("⚔️ 冒險劇本已載入");
})();