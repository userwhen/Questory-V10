/* js/story_data/story_romance.js (V8 雙模式終極版：不倫箱庭修羅場 + 經典多路線) */
(function() {
    const DB = window.FragmentDB;
    if (!DB) {
        console.error("❌ 錯誤：找不到 FragmentDB，請確認 story_data_core.js 已優先載入。");
        return;
    }

    // ==========================================
    // 🚪 1. 戀愛箱庭共用選項 (地點移動與時間消耗)
    // ==========================================
    const romanceHubOptions = [
        { 
            label: "🏢 冒險去對方公司探班 (耗時 1)", 
            action: "advance_chain", 
            rewards: { tags: ['visit_office'], varOps: [{key: 'time_left', val: 1, op: '-'}] } 
        },
        { 
            label: "☕ 獨自在咖啡廳等待 (耗時 1)", 
            action: "advance_chain", 
            rewards: { tags: ['visit_cafe'], varOps: [{key: 'time_left', val: 1, op: '-'}] } 
        }
    ];

    DB.templates = DB.templates || [];
    DB.templates.push(
        // ========================================================================
        // 🟥 【模式 A】不倫箱庭模式 (Hub Mode) - 地下情人的反擊 (時間倒數)
        // ========================================================================
        
        // --- 🎬 箱庭開場 ---
        {
            type: 'start', id: 'rom_hub_start', 
            reqTags: ['romance', 'is_hub_mode'],
            onEnter: { 
                varOps: [
                    {key: 'tension', val: 0, op: 'set', msg: "🤫 流言蜚語尚未傳開"}, 
                    {key: 'time_left', val: 3, op: 'set', msg: "⏳ 距離【正宮】回國還有 3 天"}
                ] 
            },
            dialogue: [
                { text: { zh: "你坐在空蕩蕩的{env_room}裡，看著手機上的日曆。" } },
                { text: { zh: "【{lover}】的正牌伴侶【{rival}】即將在 3 天後回國。" } },
                { text: { zh: "這 3 天，是你最後的機會。是要鞏固感情、蒐集對方的把柄，還是默默退出？" } } 
            ],
            options: DB.getHubOptions('romance')
        },

        // --- 🔍 箱庭事件 1：公司探班 (高風險高回報) ---
        {
            type: 'middle', id: 'rom_hub_office_visit', 
            reqTags: ['romance', 'is_hub_mode', 'visit_office'], // 必須點擊去公司才會抽到這張
            onEnter: { varOps: [{key: 'tension', val: 30, op: '+'}] }, // 去公司必加流言蜚語
            dialogue: [
                { text: { zh: "你提著便當來到了{lover}的公司。周圍同事的眼神都充滿了探究的意味。" } },
                { text: { zh: "{lover}看到你時，臉上閃過一絲慌亂，但隨即將你拉進了辦公室。" } },
                { speaker: "{lover}", text: { zh: "你怎麼來了？要是被【{rival}】的眼線看到就糟了！" } }
            ],
            options: [
                { 
                    label: "委屈地低下頭 (博取同情)", action: "node_next", 
                    rewards: { varOps: [{key: 'favor', val: 20, op: '+'}] }, 
                    nextScene: { dialogue: [{ text: { zh: "看著你委屈的樣子，對方心軟了，將你緊緊抱入懷中。" } }], options: DB.getHubOptions('romance') }
                },
                { 
                    label: "趁機翻看桌上的文件", action: "node_next", 
                    rewards: { tags: ['has_leverage'], varOps: [{key: 'tension', val: 20, op: '+'}] }, 
                    nextScene: { dialogue: [{ text: { zh: "你趁對方倒水時，偷偷拍下了對方的商業機密。這是一張危險的底牌。" } }], options: DB.getHubOptions('romance') }
                }
            ]
        },

        // --- 🔍 箱庭事件 2：孤獨的咖啡廳 (安全但容易錯失機會) ---
        {
            type: 'middle', id: 'rom_hub_cafe_wait', 
            reqTags: ['romance', 'is_hub_mode', 'visit_cafe'],
            dialogue: [
                { text: { zh: "你在常去的咖啡廳坐了一整個下午，點的咖啡已經涼透了。" } },
                { text: { zh: "你傳了訊息給{lover}，但對方一直沒有回覆。" } },
                { text: { zh: "你看著窗外來來往往的情侶，心中充滿了自我懷疑。" } }
            ],
            options: [
                {
                    label: "默默忍受這份孤獨", action: "node_next",
                    rewards: { varOps: [{key: 'dignity', val: 10, op: '+'}] }, // 找回一絲尊嚴
                    nextScene: { dialogue: [{ text: { zh: "你嘆了口氣，結帳離開。或許這就是見不得光的代價。" } }], options: DB.getHubOptions('romance') }
                }
            ]
        },

        // --- 🚨 箱庭高潮：正宮的審判 (Climax) ---
        {
            type: 'climax', id: 'rom_hub_climax', 
            reqTags: ['romance', 'is_hub_mode'],
            onEnter: { varOps: [{key: 'time_left', val: 0, op: 'set', msg: "🚨 時間到了！正宮已回國"}] },
            dialogue: [
                { text: { zh: "3 天的期限已到。【{rival}】提前回國，並且直接殺到了你的住處。" } },
                { text: { zh: "{lover}也匆忙趕到，三人就這樣在客廳裡對峙。" } },
                { speaker: "{rival}", text: { zh: "這場鬧劇該結束了。你以為你算什麼東西？" } }
            ],
            options: [
                {
                    label: "拿出商業機密威脅 (需要把柄)", 
                    condition: { tags: ['has_leverage'] }, 
                    action: "node_next",
                    rewards: { tags: ['hub_win_evil'] },
                    nextScene: { 
                        dialogue: [{ text: { zh: "你冷笑著拿出照片。只要你按下一鍵發送，【{lover}】就會身敗名裂。兩人看著你，瞬間噤若寒蟬。" } }], 
                        options: [{ label: "迎向結局", action: "advance_chain" }] 
                    }
                },
                {
                    label: "「我們是真愛！」 (需要高好感)", 
                    condition: { vars: [{key: 'favor', val: 20, op: '>='}] }, 
                    action: "node_next",
                    rewards: { tags: ['hub_win_love'] },
                    nextScene: { 
                        dialogue: [{ text: { zh: "你眼含淚水看向【{lover}】。對方咬了咬牙，竟然擋在你的身前，牽起了你的手。" } }], 
                        options: [{ label: "迎向結局", action: "advance_chain" }] 
                    }
                },
                {
                    label: "我...什麼都不是", 
                    action: "node_next",
                    nextScene: { 
                        dialogue: [{ text: { zh: "你沒有底牌，也沒有得到對方的聲援。你成了這場遊戲中徹頭徹尾的小丑。" } }], 
                        options: [{ label: "黯然退場", action: "advance_chain" }] 
                    }
                }
            ]
        },

        // --- 🎬 箱庭尾聲 (End) ---
        {
            type: 'end', id: 'rom_hub_end_evil', 
            reqTags: ['romance', 'is_hub_mode', 'hub_win_evil'],
            dialogue: [{ text: { zh: "【惡之花結局】你用把柄換來了財富與地位，雖然沒有愛，但你再也不用躲躲藏藏了。" } }],
            options: [{ label: "滿載而歸", action: "finish_chain" }]
        },
        {
            type: 'end', id: 'rom_hub_end_love', 
            reqTags: ['romance', 'is_hub_mode', 'hub_win_love'],
            dialogue: [{ text: { zh: "【上位成功結局】這段不倫之戀最終修成正果。但踏著別人的痛苦建立的幸福，能維持多久呢？" } }],
            options: [{ label: "完成劇本", action: "finish_chain" }]
        },


        // ========================================================================
        // 🟦 【模式 B】線性敘事模式 (Linear Mode) - 經典 3 大路線
        // ========================================================================
        
        // --- 🎬 線性開場 (三選一的相遇) ---
        {
            type: 'start', id: 'rom_lin_meet_classic',
            reqTags: ['romance', 'is_linear_mode'],
            onEnter: { varOps: [{key: 'tension', val: 5, op: 'set'}] },
            dialogue: [ 
                { text: { zh: "在{env_building}的{env_room}裡，你正專注於手中的事務。" } },
                { text: { zh: "突然，一名{identity_modifier}{lover}因躲避人群而撞到了你懷裡。" } },
                { speaker: "{rival}", text: { zh: "在那裡！別讓那個傢伙跑了！" } }
            ],
            options: [
                { label: "挺身而出保護 (加好感)", action: "advance_chain", rewards: { tags: ['route_classic'], varOps: [{key:'favor', val:15, op:'+'}] } },
                { label: "冷靜地協助解圍 (加信任)", action: "advance_chain", rewards: { tags: ['route_classic'], varOps: [{key:'trust', val:15, op:'+'}] } }
            ]
        },
        {
            type: 'start', id: 'rom_lin_meet_triangle',
            reqTags: ['romance', 'is_linear_mode'],
            onEnter: { varOps: [{key: 'tension', val: 10, op: 'set'}] },
            dialogue: [
                { text: { zh: "在昏暗的{env_room}，你正與{lover}低聲交談，氣氛微醺且曖昧。" } },
                { text: { zh: "突然，一個帶著極強侵略性氣息的身影拉開了旁邊的椅子——是{rival}。" } }, 
                { text: { zh: "「不介意我加入吧？」對方直勾勾地盯著你，讓{lover}的臉色瞬間沉了下來。" } }
            ],
            options: [
                { label: "冷漠拒絕對方 (專一)", action: "advance_chain", rewards: { tags: ['route_triangle'], varOps: [{key:'loyalty', val:20, op:'set'}] } },
                { label: "默許對方坐下 (曖昧)", action: "advance_chain", rewards: { tags: ['route_triangle'], varOps: [{key:'desire', val:20, op:'set'}] } }
            ]
        },

        // --- 💖 線性過程 (Classic 路線) ---
        {
            type: 'middle', id: 'rom_lin_bond_classic', reqTags: ['romance', 'is_linear_mode', 'route_classic'],
            dialogue: [ 
                { text: { zh: "為了感謝你的幫助，{lover}約你在一個安靜的角落見面。" } },
                { text: { zh: "對方逐漸向你吐露了心聲，原來一直受到{rival}的打壓與排擠。" } }
            ],
            options: [
                { label: "承諾成為同盟", action: "advance_chain", rewards: { varOps: [{key:'favor', val:15, op:'+'}] } }
            ]
        },
        // --- 🍷 線性過程 (Triangle 路線) ---
        {
            type: 'middle', id: 'rom_lin_bond_triangle', reqTags: ['romance', 'is_linear_mode', 'route_triangle'],
            dialogue: [ 
                { text: { zh: "{atom_time}，{lover}暫時離開了座位去接電話。" } },
                { text: { zh: "{rival}立刻湊近，指尖帶著微涼的溫度，輕輕劃過你的手背。「你真的甘心和那種無趣的人在一起嗎？」" } }
            ],
            options: [
                { label: "抽回手並警告對方 (忠誠)", action: "advance_chain", rewards: { varOps: [{key:'loyalty', val:15, op:'+'}] } },
                { label: "沒有閃躲，迎上視線 (沉淪)", action: "advance_chain", rewards: { varOps: [{key:'desire', val:20, op:'+'}] } }
            ]
        },

        // --- 🚨 線性高潮 (Climax 混合共用) ---
        {
            type: 'climax', id: 'rom_lin_climax_classic', reqTags: ['romance', 'is_linear_mode', 'route_classic'],
            dialogue: [ 
                { text: { zh: "平靜的日子被打破了。{rival}拿著一份偽造的{combo_item_simple}找到了{lover}，試圖證明你接近對方是別有用心。" } }
            ],
            options: [
                { label: "暗中調查，尋找破綻", action: "advance_chain", rewards: { tags: ['counter_ready'] } },
                { label: "當面質問對方", action: "advance_chain", rewards: { varOps: [{key:'trust', val:10, op:'-'}] } }
            ]
        },
        {
            type: 'climax', id: 'rom_lin_climax_triangle', reqTags: ['romance', 'is_linear_mode', 'route_triangle'],
            dialogue: [ 
                { text: { zh: "塵埃落定。這段充滿拉扯、試探與背德的三人關係，終於迎來了終局。" } }
            ],
            options: [
                { label: "準備做出最終選擇", action: "advance_chain" }
            ]
        },

        // ========================================================================
        // 🏁 【共用尾聲】 (End)
        // ========================================================================
        {
            type: 'end', id: 'rom_shared_end',
            reqTags: ['romance', 'is_linear_mode'],
            dialogue: [
                { text: { zh: "無論經歷了多少波折，這段感情最終還是畫下了句點。未來的路，還很長。" } }
            ],
            options: [{ label: "結束劇本", action: "finish_chain" }]
    }
); // 🌟 1. 關閉大陣列

DB.templates.push(DB.createHubTemplate('romance', 4));

    console.log("💖 戀愛劇本已載入...");
})();