/* js/story_data/story_adventure.js (V8 雙模式終極版：地城探索箱庭 + 經典史詩線性) */
(function() {
    const DB = window.FragmentDB;
    if (!DB) {
        console.error("❌ 錯誤：找不到 FragmentDB，請確認 story_data_core.js 已優先載入。");
        return;
    }
    
    // ==========================================
    // 🚪 1. 冒險箱庭共用選項 (地城探索與時間消耗)
    // ==========================================
    const advHubOptions = [
        { 
            label: "🔍 仔細搜刮當前房間 (耗時 1)", 
            action: "advance_chain", 
            rewards: { varOps: [{key: 'time_left', val: 1, op: '-'}] } 
        },
        { 
            label: "🗺️ 推開未知的門深入地城 (耗時 1)", 
            action: "map_explore_new", 
            rewards: { varOps: [{key: 'time_left', val: 1, op: '-'}] } 
        }
    ];

    DB.templates = DB.templates || [];
    DB.templates.push(
        // ========================================================================
        // 🟥 【模式 A】地城探索箱庭模式 (Hub Mode) - 尋找弱點與神器
        // ========================================================================
        
        // --- 🎬 箱庭開場與職業選擇 ---
        {
            type: 'start', id: 'adv_hub_start_class',
            reqTags: ['adventure', 'is_hub_mode'], 
            onEnter: { 
                varOps: [
                    {key: 'tension', val: 0, op: 'set', msg: "🛡️ 探索開始"}, 
                    {key: 'time_left', val: 4, op: 'set', msg: "⏳ 距離【{boss}】甦醒還有 4 小時"}
                ] 
            },
            dialogue: [
                { text: { zh: "【地城探索箱庭模式】你踏入了這座{env_adj}的{env_building}。" } },
                { text: { zh: "沉睡在最深處的【{boss}】將在 4 小時後甦醒。你必須在這段時間內盡可能搜刮物資、尋找對方的弱點，或是找出傳說中的武器。" } },
                { text: { zh: "出發前，你決定依靠什麼力量戰鬥？" } }
            ],
            options: [
                { 
                    label: "握緊重劍 (戰士)", action: "node_next", 
                    rewards: { tags: ['class_warrior'], varOps: [{key:'str', val:10, op:'+'}] }, 
                    nextScene: { dialogue: [{ text: { zh: "沉重的劍身給了你安全感。你準備好深入地城了。" } }], options: advHubOptions } 
                },
                { 
                    label: "詠唱咒文 (法師)", action: "node_next", 
                    rewards: { tags: ['class_mage'], varOps: [{key:'int', val:10, op:'+'}] }, 
                    nextScene: { dialogue: [{ text: { zh: "元素在你指尖跳動。你準備好深入地城了。" } }], options: advHubOptions } 
                },
                { 
                    label: "隱入黑暗 (刺客)", action: "node_next", 
                    rewards: { tags: ['class_rogue'], varOps: [{key:'agi', val:10, op:'+'}] }, 
                    nextScene: { dialogue: [{ text: { zh: "你與陰影融為一體。你準備好深入地城了。" } }], options: advHubOptions } 
                }
            ]
        },

        // --- 💥 危險爆炸攔截 (Risk High) - 張力破 80 自動觸發！ ---
        {
            type: 'middle', id: 'adv_hub_danger_explode',
            reqTags: ['adventure', 'is_hub_mode', 'risk_high'], 
            onEnter: { varOps: [{key: 'tension', val: 50, op: '-', msg: "📉 危險級別重置"}, {key: 'hp', val: 20, op: '-', msg: "🩸 受到重創"}] },
            dialogue: [
                { text: { zh: "【高危警告：引來守衛】" } },
                { text: { zh: "你弄出的動靜太大了！過高的危險級別引來了一隻狂暴的地城守衛。" } },
                { text: { zh: "你在狹窄的通道裡被對方狠狠伏擊，受了重傷才勉強將其擊殺。" } }
            ],
            options: [
                {
                    label: "包紮傷口，繼續前進", action: "node_next",
                    nextScene: { dialogue: [{ text: { zh: "白白浪費了寶貴的時間與體力... 請決定下一步：" } }], options: advHubOptions }
                }
            ]
        },

        // --- 🔍 箱庭 Middle：找到首領弱點 ---
        {
            type: 'middle', id: 'adv_hub_find_weakness',
            reqTags: ['adventure', 'is_hub_mode'], excludeTags: ['boss_weakness'],
            dialogue: [
                { text: { zh: "你在{env_feature}發現了一具冒險者的遺骸。他的手裡死死攥著一本筆記。" } },
                { text: { zh: "你翻開筆記，上面詳細記錄了【{boss}】的攻擊模式與致命弱點！" } }
            ],
            options: [
                { 
                    label: "收下筆記 (獲得情報)", action: "node_next", 
                    rewards: { tags: ['boss_weakness'], varOps: [{key: 'exp', val: 20, op: '+'}] },
                    nextScene: { dialogue: [{ text: { zh: "這份情報絕對能在決戰中派上用場！" } }], options: advHubOptions }
                }
            ]
        },

        // --- 🔍 箱庭 Middle：獲得傳說神器 ---
        {
            type: 'middle', id: 'adv_hub_find_relic',
            reqTags: ['adventure', 'is_hub_mode'], excludeTags: ['legendary_weapon'],
            dialogue: [
                { text: { zh: "你解開了一個複雜的機關，牆壁緩緩打開，露出了一個散發著神聖光芒的祭壇。" } },
                { text: { zh: "祭壇中央插著一把【{bonus_legendary}武器】。這股力量足以撼動天地！" } }
            ],
            options: [
                { 
                    label: "拔出武器！(力量暴增)", action: "node_next", 
                    rewards: { tags: ['legendary_weapon'], varOps: [{key: 'str', val: 15, op: '+'}] },
                    nextScene: { dialogue: [{ text: { zh: "強大的魔力湧入你的體內！你感覺自己無所不能。" } }], options: advHubOptions }
                }
            ]
        },

        // --- 🔍 箱庭 Middle：遭遇陷阱 (加危險度) ---
        {
            type: 'middle', id: 'adv_hub_trap',
            reqTags: ['adventure', 'is_hub_mode'],
            dialogue: [
                { text: { zh: "你正走在狹窄的通道中，腳下的地磚突然下陷！" } },
                { text: { zh: "「喀嚓」一聲，隱藏在{env_feature}的機關被觸發了！" } }
            ],
            options: [
                { 
                    label: "翻滾閃避 (AGI檢定)", check: { stat: 'AGI', val: 6 }, action: "node_next", 
                    nextScene: { dialogue: [{ text: { zh: "你有驚無險地躲過了毒箭，但弄出了不小的聲響。" } }], rewards: { varOps: [{key:'tension', val:15, op:'+'}] }, options: advHubOptions },
                    failScene: { dialogue: [{ text: { zh: "你被毒箭擦傷了，不僅損血，還引發了地城的警報！" } }], rewards: { varOps: [{key:'hp', val:10, op:'-'}, {key:'tension', val:25, op:'+'}] }, options: advHubOptions }
                }
            ]
        },

        // --- 👑 箱庭高潮：首領決戰 (Climax) ---
        {
            type: 'climax', id: 'adv_hub_climax_boss',
            reqTags: ['adventure', 'is_hub_mode'],
            onEnter: { varOps: [{key: 'time_left', val: 0, op: 'set', msg: "🚨 時間歸零！首領甦醒！"}] },
            dialogue: [
                { text: { zh: "時間到了。大地的震動越來越劇烈，【{boss}】徹底甦醒，擋住了你的去路！" } },
                { text: { zh: "對方發出了一聲震耳欲聾的咆哮，強大的風壓幾乎讓你站立不穩。" } },
                { text: { zh: "檢驗你探索成果的時刻到了！" } }
            ],
            options: [
                {
                    label: "針對弱點致命一擊！(需弱點情報)", condition: { tags: ['boss_weakness'] }, 
                    action: "node_next", rewards: { tags: ['hub_win'] },
                    nextScene: { dialogue: [{ text: { zh: "你精準地看穿了對方的破綻！一擊命中要害，不可一世的巨獸轟然倒下！" } }], options: [{ label: "迎向結局", action: "advance_chain" }] }
                },
                {
                    label: "解放神器之力！(需傳說武器)", condition: { tags: ['legendary_weapon'] }, 
                    action: "node_next", rewards: { tags: ['hub_win'] },
                    nextScene: { dialogue: [{ text: { zh: "你高舉神器，毀滅性的光芒瞬間吞噬了首領！連同整個房間都被夷為平地！" } }], options: [{ label: "迎向結局", action: "advance_chain" }] }
                },
                {
                    label: "沒有底牌，只能硬剛！(高難度STR檢定)", excludeTags: ['boss_weakness', 'legendary_weapon'], 
                    style: "danger", check: { stat: 'STR', val: 15 }, action: "node_next",
                    nextScene: { dialogue: [{ text: { zh: "憑藉著超越極限的意志與運氣，你在血泊中奇蹟般地戰勝了對方！" } }], rewards: { tags: ['hub_win'] }, options: [{ label: "迎向結局", action: "advance_chain" }] },
                    failScene: { dialogue: [{ text: { zh: "準備不足的你，在絕對的力量面前宛如螻蟻。你的視野逐漸被黑暗吞沒...\n【結局：無名的屍骸】" } }], options: [{ label: "結束", action: "finish_chain" }] }
                }
            ]
        },

        // --- 🎬 箱庭尾聲 (End) ---
        {
            type: 'end', id: 'adv_hub_end_victory', 
            reqTags: ['adventure', 'is_hub_mode', 'hub_win'],
            dialogue: [
                { text: { zh: "看著倒下的【{boss}】，你長長地吐出了一口氣。" } },
                { text: { zh: "你收集了傳說中的戰利品，踏出了這座壓抑的建築。外面的陽光格外刺眼。" } },
                { text: { zh: "【結局：地城征服者】" } }
            ],
            options: [{ label: "滿載而歸", action: "finish_chain", rewards: { title: "地城征服者", gold: 1000 } }]
        },


        // ========================================================================
        // 🟦 【模式 B】史詩線性模式 (Linear Mode) - 經典職業推進
        // ========================================================================

        // --- 🎬 線性開場 ---
        {
            type: 'start', id: 'adv_lin_start_class',
            reqTags: ['adventure', 'is_linear_mode'], 
            onEnter: { varOps: [{key: 'tension', val: 10, op: 'set'}] },
            dialogue: [
                { text: { zh: "【線性史詩模式】強烈的暈眩感退去後，你發現自己身處於一座{env_adj}的{env_building}之中。" } },
                { text: { zh: "天空中懸掛著破碎的月亮，遠處傳來了怪物的嘶吼聲。你必須依靠力量活下去。" } }
            ],
            options: [
                { label: "握緊重劍 (戰士)", action: "advance_chain", rewards: { tags: ['class_warrior'], varOps: [{key:'str', val:10, op:'+'}] } },
                { label: "詠唱咒文 (法師)", action: "advance_chain", rewards: { tags: ['class_mage'], varOps: [{key:'int', val:10, op:'+'}] } },
                { label: "隱入黑暗 (刺客)", action: "advance_chain", rewards: { tags: ['class_rogue'], varOps: [{key:'agi', val:10, op:'+'}] } }
            ]
        },

        // --- 🛡️ 線性 Middle：遭遇戰與補給 ---
        {
            type: 'middle', id: 'adv_lin_mid_ambush',
            reqTags: ['adventure', 'is_linear_mode'],
            dialogue: [
                { text: { zh: "草叢中傳來了急促的沙沙聲。你猛然回頭，正好迎面撞上了一隻【{monster}】！" } }
            ],
            options: [
                { 
                    label: "正面迎擊 (STR檢定)", check: { stat: 'STR', val: 5 }, action: "advance_chain", 
                    rewards: { varOps: [{key:'tension', val:10, op:'+'}] }
                }
            ]
        },
        {
            type: 'middle', id: 'adv_lin_mid_camp',
            reqTags: ['adventure', 'is_linear_mode'],
            dialogue: [
                { text: { zh: "在連續的跋涉後，你找到了一處隱蔽的{env_room}，有冒險者留下的營火痕跡。" } }
            ],
            options: [
                { label: "點燃營火休息 (恢復精力)", action: "advance_chain", rewards: { varOps: [{key:'energy', val:20, op:'+'}, {key:'tension', val:10, op:'-'}] } },
                { label: "搜刮物資離開 (恢復HP與金幣)", action: "advance_chain", rewards: { gold: 30, varOps: [{key:'hp', val:10, op:'+'}] } }
            ]
        },

        // --- 👑 線性 Climax：首領決戰 ---
        {
            type: 'climax', id: 'adv_lin_climax_boss',
            reqTags: ['adventure', 'is_linear_mode'], 
            dialogue: [
                { text: { zh: "大地的震動越來越劇烈。在最深處，龐大的陰影籠罩了你。" } },
                { text: { zh: "那是這片區域的霸主——【{boss}】！" } }
            ],
            options: [
                { 
                    label: "拔劍，正面硬剛！(戰士)", condition: { tags: ['class_warrior'] }, style: "danger", check: { stat: 'STR', val: 8 }, action: "node_next", 
                    nextScene: { dialogue: [{ text: { zh: "你燃燒了生命力，將劍送入了怪物的心臟！" } }], options: [{ label: "走向勝利", action: "advance_chain" }] }, 
                    failScene: { dialogue: [{ text: { zh: "實力差距絕望。你的武器折斷了...\n【結局：無名的屍骸】" } }], options: [{ label: "黯然倒下", action: "finish_chain" }] } 
                },
                { 
                    label: "釋放禁咒天雷！(法師)", condition: { tags: ['class_mage'] }, style: "danger", check: { stat: 'INT', val: 8 }, action: "node_next", 
                    nextScene: { dialogue: [{ text: { zh: "毀滅的雷霆貫穿了怪物的身軀！" } }], options: [{ label: "走向勝利", action: "advance_chain" }] }, 
                    failScene: { dialogue: [{ text: { zh: "咒語被打斷，魔力將你吞噬...\n【結局：魔力反噬】" } }], options: [{ label: "黯然倒下", action: "finish_chain" }] } 
                },
                { 
                    label: "死角暗殺！(刺客)", condition: { tags: ['class_rogue'] }, style: "danger", check: { stat: 'AGI', val: 8 }, action: "node_next", 
                    nextScene: { dialogue: [{ text: { zh: "你化作殘影，精準切斷了它的咽喉。" } }], options: [{ label: "走向勝利", action: "advance_chain" }] }, 
                    failScene: { dialogue: [{ text: { zh: "怪物的尾巴將你狠狠掃飛...\n【結局：喋血陰影】" } }], options: [{ label: "黯然倒下", action: "finish_chain" }] } 
                }
            ]
        },

        // --- 🎬 線性尾聲 (End) ---
        {
            type: 'end', id: 'adv_lin_end_victory',
            reqTags: ['adventure', 'is_linear_mode'],
            dialogue: [
                { text: { zh: "看著倒下的【{boss}】，你長長地吐出了一口氣。你的名字將被吟遊詩人永遠傳唱。" } }
            ],
            options: [{ label: "滿載而歸", action: "finish_chain", rewards: { title: "傳奇英雄", gold: 500 } }]
        }

    );

    console.log("⚔️ 冒險劇本已載入 (V8 雙模式終極版：地城箱庭 + 史詩線性)");
})();