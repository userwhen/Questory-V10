/* js/story_data/story_raising.js */
(function() {
    // 1. 取得核心活頁簿
    const DB = window.FragmentDB;
    if (!DB) {
        console.error("❌ 錯誤：找不到 FragmentDB，請確認 story_data_core.js 已優先載入。");
        return;
    }

    // 🛡️ 防呆金牌
    DB.templates = DB.templates || [];

    // 2. 追加劇本 (Templates)
    DB.templates.push(
        // ============================================================
        // [BLOCK E] 🌱 明星推手/養成流 (The Mentor)
        // ============================================================
        
        // 1. 相遇 (raise_meet) - 分支 A
        {
            type: 'raise_meet', id: 'raise_start_select',
            dialogue: [
                { text: { zh: "這是一個{adj_env_vibe}日子，你在{combo_building}的角落發現了那個獨特的存在。" } },
                { text: { zh: "那是一位{atom_status}{trainee}，雖然現在還很弱小，但你從對方的眼神中看到了無限的潛力。" } },
                { text: { zh: "命運將你們聯繫在了一起，你決定成為對方的..." } }
            ],
            options: [
                { 
                    label: "嚴厲的導師 (注重實力)", action: "node_next", 
                    rewards: { tags: ['style_power'], varOps: [{key:'str', val:30, op:'set'}, {key:'stress', val:0, op:'set'}] }, 
                    nextScene: { 
                        dialogue: [{ text: { zh: "你走上前去，伸出了手。「想變強嗎？那就跟著我。」對方猶豫片刻後，緊緊握住了你的手。" } }],
                        options: [{ label: "開始培育", action: "advance_chain" }]
                    } 
                },
                { 
                    label: "溫柔的守護者 (注重魅力)", action: "node_next", 
                    rewards: { tags: ['style_charm'], varOps: [{key:'chr', val:30, op:'set'}, {key:'stress', val:0, op:'set'}] }, 
                    nextScene: { 
                        dialogue: [{ text: { zh: "你溫柔地笑了笑，給予了對方最需要的溫暖。從那一刻起，你成為了對方最依賴的港灣。" } }],
                        options: [{ label: "開始培育", action: "advance_chain" }]
                    } 
                }
            ]
        },
        {
            type: 'raise_meet', id: 'raise_meet_normal',
            dialogue: [
                { text: { zh: "這是一個命運般的相遇。" } },
                { text: { zh: "你在人群中一眼就看到了{trainee}。雖然現在還默默無聞，但你從那雙眼睛裡看到了潛力。" } },
                { text: { zh: "「你是說... 你能讓我成為最強的？」{trainee}懷疑地看著你。" } }
            ],
            options: [
                { 
                    label: "展現你的專業 (CHR檢定/注重專業)", check: { stat: 'CHR', val: 5 }, action: "node_next", 
                    rewards: { tags: ['tag_pro'], varOps: [{key:'stress', val:0, op:'set'}] },
                    nextScene: { 
                        dialogue: [{ text: { zh: "你的一番話打動了對方。\n「好吧，教練，請多指教！」" } }],
                        options: [{ label: "開始訓練", action: "advance_chain" }]
                    },
                    failScene: { 
                        dialogue: [{ text: { zh: "對方似乎不太信任你，但還是勉強答應試試看。" } }],
                        rewards: { varOps: [{key:'stress', val:10, op:'set'}] },
                        options: [{ label: "開始訓練", action: "advance_chain" }]
                    } 
                },
                { 
                    label: "用熱情感染對方 (注重羈絆)", action: "node_next", 
                    rewards: { tags: ['tag_bond'], varOps: [{key:'stress', val:0, op:'set'}] },
                    nextScene: { 
                        dialogue: [{ text: { zh: "你的熱情讓{trainee}放下了戒心。「那就讓我們一起努力吧！」" } }],
                        options: [{ label: "開始訓練", action: "advance_chain" }]
                    }
                }
            ]
        },

        // 2. 訓練日常 (raise_train) - 訓練 A
        {
            type: 'raise_train', id: 'raise_train_day',
            dialogue: [
                { text: { zh: "時光飛逝，{trainee}在你的指導下飛速成長。" } },
                { text: { zh: "今天是一個關鍵的訓練日，你看著對方{atom_manner}練習著。" } },
                { text: { zh: "現在正是突破瓶頸的好機會，你決定安排..." } }
            ],
            options: [
                { 
                    label: "魔鬼特訓 (大幅增加壓力)", action: "node_next", 
                    rewards: { tags: ['tag_strength'], varOps: [{key:'stress', val:40, op:'+'}] }, 
                    nextScene: { 
                        dialogue: [{ text: { zh: "汗水揮灑在訓練場上。雖然過程痛苦，但對方的眼神越來越銳利，實力大幅提升！" } }],
                        options: [{ label: "完成訓練", action: "advance_chain" }]
                    } 
                },
                { 
                    label: "藝術薰陶 (增加壓力)", action: "node_next", 
                    rewards: { tags: ['tag_fame'], varOps: [{key:'stress', val:20, op:'+'}, {key:'gold', val:-50, op:'+'}] }, 
                    nextScene: { 
                        dialogue: [{ text: { zh: "優雅的舉止與氣質逐漸成形。對方的一舉一動都開始散發著迷人的魅力。" } }],
                        options: [{ label: "完成訓練", action: "advance_chain" }]
                    } 
                },
                { 
                    label: "放鬆休息 (扣除壓力/提升幸福)", action: "node_next", 
                    rewards: { varOps: [{key:'stress', val:30, op:'-'}, {key:'happiness', val:20, op:'+'}] }, 
                    nextScene: { 
                        dialogue: [{ text: { zh: "勞逸結合是必要的。看著{trainee}開心的睡臉，你感到一陣欣慰，壓力一掃而空。" } }],
                        options: [{ label: "充分休息", action: "advance_chain" }]
                    } 
                }
            ]
        },
        {
            type: 'raise_train', id: 'raise_train_hard',
            dialogue: [
                { text: { zh: "今天的訓練清單非常魔鬼。" } },
                { text: { zh: "{trainee}已經累得氣喘吁吁，汗水浸濕了衣背。" } },
                { text: { zh: "「教練... 我真的不行了...」" } }
            ],
            options: [
                { 
                    label: "嚴厲斥責：堅持下去！(大幅增加壓力)", action: "node_next", 
                    rewards: { tags: ['tag_strength'], varOps: [{key:'stress', val:25, op:'+'}] }, 
                    nextScene: { 
                        dialogue: [{ text: { zh: "{trainee}咬著牙站了起來，突破了極限！(獲得實力)" } }], 
                        rewards: { gold: 50 },
                        options: [{ label: "完成訓練", action: "advance_chain" }]
                    } 
                },
                { 
                    label: "改變方針：進行舞台訓練 (微幅增加壓力)", action: "node_next", 
                    rewards: { tags: ['tag_fame'], varOps: [{key:'stress', val:10, op:'+'}] }, 
                    nextScene: { 
                        dialogue: [{ text: { zh: "你將體能訓練改為台風與魅力訓練。{trainee}漸入佳境。(獲得名氣)" } }],
                        options: [{ label: "完成訓練", action: "advance_chain" }]
                    } 
                },
                { 
                    label: "溫柔鼓勵：休息一下吧 (扣除壓力)", action: "node_next", 
                    rewards: { varOps: [{key:'stress', val:15, op:'-'}] }, 
                    nextScene: { 
                        dialogue: [{ text: { zh: "{trainee}感激地看著你。雖然進度慢了點，但身心壓力大幅緩解了。" } }],
                        options: [{ label: "充分休息", action: "advance_chain" }]
                    } 
                }
            ]
        },

        // 3. 初次登台/出道 (raise_debut) - 事件 A
        {
            type: 'raise_debut', id: 'raise_event_show',
            dialogue: [
                { text: { zh: "{trainee}迎來了第一次公開展示的機會——在{noun_location_room}舉行的選拔賽。" } },
                { text: { zh: "然而，在上場前的後台..." } }
            ],
            options: [
                // 🛑 【壓力崩潰分支】
                { 
                    label: "狀況不對勁...", condition: { vars: [{key:'stress', val:60, op:'>='}] }, 
                    style: "danger", action: "node_next", 
                    nextScene: { 
                        dialogue: [
                            { text: { zh: "{trainee}全身發抖，終究承受不住你給予的巨大壓力。" } },
                            { text: { zh: "「對不起...我真的做不到...」留下這句話後，對方逃離了會場，從此一蹶不振。" } },
                            { text: { zh: "【結局：不堪重負】" } }
                        ],
                        options: [{ label: "結束一切", action: "finish_chain" }]
                    } 
                },
                // ✅ 【正常推進分支】
                { 
                    label: "展示華麗的技巧 (需名氣TAG)", condition: { tags: ['tag_fame'], vars: [{key:'stress', val:60, op:'<'}] }, 
                    action: "node_next", 
                    nextScene: { 
                        dialogue: [{ text: { zh: "全場都被那驚人的美感征服了！掌聲雷動！" } }], 
                        rewards: { gold: 300, tags: ['fame_mid'] },
                        options: [{ label: "完美謝幕", action: "advance_chain" }]
                    } 
                },
                { 
                    label: "展示壓倒性的力量 (需實力TAG)", condition: { tags: ['tag_strength'], vars: [{key:'stress', val:60, op:'<'}] }, 
                    action: "node_next", 
                    nextScene: { 
                        dialogue: [{ text: { zh: "轟！震撼的實力展示讓全場鴉雀無聲，隨後爆發出驚嘆的歡呼！" } }], 
                        rewards: { gold: 300, tags: ['fame_mid'] },
                        options: [{ label: "完美謝幕", action: "advance_chain" }]
                    } 
                }
            ]
        },
        {
            type: 'raise_debut', id: 'raise_debut_show',
            dialogue: [
                { text: { zh: "終於到了檢驗成果的時候。" } },
                { text: { zh: "舞台下的觀眾並不多，但這是{trainee}的第一次正式亮相。" } },
                { text: { zh: "你站在後台，看著即將上場的{trainee}..." } }
            ],
            options: [
                // 🛑 【壓力崩潰攔截】
                { 
                    label: "狀況極度不佳...", condition: { vars: [{key:'stress', val:30, op:'>='}] }, 
                    style: "danger", action: "node_next", 
                    nextScene: { 
                        dialogue: [
                            { text: { zh: "過度的壓力在這一刻爆發，{trainee}在登台前一刻崩潰大哭，衝出了會場..." } },
                            { text: { zh: "這場出道秀成了永遠的遺憾。\n【結局：怯場逃避】" } }
                        ],
                        options: [{ label: "結束一切", action: "finish_chain" }]
                    } 
                },
                // ✅ 【正常路線】
                { 
                    label: "展現爆發力 (需實力TAG)", condition: { tags: ['tag_strength'], vars: [{key:'stress', val:30, op:'<'}] }, 
                    action: "node_next", 
                    nextScene: { 
                        dialogue: [{ text: { zh: "演出充滿了爆發力！雖然青澀，但強大的氣場震懾了全場，這是一個好的開始！" } }],
                        rewards: { tags: ['tag_debut_success'] },
                        options: [{ label: "順利下台", action: "advance_chain" }]
                    }
                },
                { 
                    label: "應變突發狀況 (需名氣TAG)", condition: { tags: ['tag_fame'], vars: [{key:'stress', val:30, op:'<'}] }, 
                    action: "node_next", 
                    nextScene: { 
                        dialogue: [{ text: { zh: "你及時化解了一個舞台事故，並引導{trainee}展現魅力，演出完美落幕！" } }],
                        rewards: { tags: ['tag_debut_success'] },
                        options: [{ label: "順利下台", action: "advance_chain" }]
                    }
                },
                // ⚠️ 防呆
                { 
                    label: "硬著頭皮上場", condition: { vars: [{key:'stress', val:30, op:'<'}] }, 
                    action: "node_next", 
                    nextScene: { 
                        dialogue: [{ text: { zh: "演出中規中矩，沒有太多亮點，但至少平安完成了初登場。" } }],
                        options: [{ label: "順利下台", action: "advance_chain" }]
                    }
                }
            ]
        },

        // 4. 高潮 (raise_climax)
        {
            type: 'raise_climax', id: 'raise_final_battle', 
            reqTags: ['fame_mid'], // 🌟 升級陣列格式
            dialogue: [
                { text: { zh: "決戰之日終於來臨。站在巔峰的對手強大得令人窒息。" } },
                { text: { zh: "在此刻，你想向對方說最後一句話是..." } }
            ],
            options: [
                { 
                    label: "「去吧，讓世界看到你的光芒！」", action: "node_next", 
                    rewards: { varOps: [{key:'chr', val:10, op:'+'}, {key:'str', val:10, op:'+'}] }, 
                    nextScene: { 
                        dialogue: [{ text: { zh: "{trainee}回頭看了你一眼，眼神中充滿了信任。然後，毅然決然地踏上了決戰的舞台。" } }],
                        options: [{ label: "靜靜觀看", action: "advance_chain" }]
                    } 
                }
            ]
        },
        {
            type: 'raise_climax', id: 'raise_climax_final', 
            dialogue: [ 
                { text: { zh: "時光飛逝，經歷了出道的洗禮，{trainee}終於站上了全國大賽的決賽舞台。" } },
                { text: { zh: "對手是業界公認的霸主。在上場前的最後一刻，你想說..." } }
            ],
            options: [
                { 
                    label: "「去吧，讓世界看到你的光芒！」", action: "node_next", 
                    rewards: { varOps: [{key:'chr', val:10, op:'+'}, {key:'str', val:10, op:'+'}] }, 
                    nextScene: { 
                        dialogue: [{ text: { zh: "{trainee}回頭看了你一眼，眼神中充滿了信任。然後毅然決然地踏上了決戰的舞台。" } }],
                        options: [{ label: "靜靜觀看", action: "advance_chain" }]
                    } 
                }
            ]
        },
		{
            type: 'raise_climax', 
            id: 'raise_final_battle_low_fame',
			excludeTag: ['theme_romance',],
            dialogue: [
                { text: { zh: "決戰之日來臨，雖然{trainee}的名氣還不足以撼動全場，但這是一次證明自己的機會。" } },
                { text: { zh: "對手{rival}甚至沒有正眼看過來，這份輕視或許能成為反擊的動力。" } },
                { text: { zh: "在此刻，你想向對方說最後一句話是..." } }
            ],
            options: [{ 
                label: "「輸贏不重要，只要發揮出你的全力！」", 
                action: "node_next", 
                rewards: { varOps: [{key:'stress', val:10, op:'-'}] }, 
                nextScene: { 
                    dialogue: [{ text: { zh: "{trainee}深吸了一口氣，點點頭。雖然沒有觀眾的歡呼，但他的眼神依然堅定。" } }],
                    options: [{ label: "迎戰", action: "advance_chain" }]
                } 
            }]
        },

        // 5. 結局 (raise_ending)
        {
            type: 'raise_ending', id: 'raise_end_result',
            dialogue: [
                { text: { zh: "塵埃落定。你看著眼前這個光芒萬丈的存在，回想起最初相遇的那一刻。" } },
                { text: { zh: "這段旅程，終於畫上了句點。" } }
            ],
            options: [
                { 
                    label: "見證：至高明日之星", condition: { tags: ['tag_fame'] }, 
                    style: "primary", action: "node_next", 
                    nextScene: { 
                        dialogue: [
                            { text: { zh: "{trainee}成為了被世人傳頌的偶像。而你，是造就這奇蹟的傳奇導師。" } },
                            { text: { zh: "【結局：世界的寵兒】" } }
                        ],
                        rewards: { gold: 200, title: "金牌製作人" },
                        options: [{ label: "領取獎勵", action: "finish_chain" }]
                    } 
                },
                { 
                    label: "見證：最強鬥士", condition: { tags: ['tag_strength'] }, 
                    style: "danger", action: "node_next", 
                    nextScene: { 
                        dialogue: [
                            { text: { zh: "以絕對的力量君臨天下！這份榮耀，有一半屬於在背後默默支持的你。" } },
                            { text: { zh: "【結局：頂點的霸者】" } }
                        ],
                        rewards: { gold: 200, title: "王者之師" },
                        options: [{ label: "領取獎勵", action: "finish_chain" }]
                    } 
                },
                { 
                    label: "回歸平凡的幸福", action: "node_next", 
                    nextScene: { 
                        dialogue: [
                            { text: { zh: "雖然沒有成為傳說，但你們收穫了彼此的信任。你們決定離開聚光燈，去尋找屬於自己的平靜生活。" } },
                            { text: { zh: "【結局：相伴的旅途】" } }
                        ],
                        rewards: { gold: 80 },
                        options: [{ label: "領取獎勵", action: "finish_chain" }]
                    } 
                }
            ]
        },
        {
            type: 'raise_ending', id: 'raise_ending_success',
            dialogue: [
                { text: { zh: "經過這段時間的努力，初次登台的結果已經決定了未來的走向。" } },
                { text: { zh: "看著那自信的身影，你知道你的任務已經告一段落。" } },
                { text: { zh: "這段旅程，將會走向何方？" } }
            ],
            options: [
                { 
                    label: "見證：傳奇巨星誕生", condition: { tags: ['tag_debut_success', 'tag_pro'] }, 
                    style: "primary", action: "node_next", 
                    nextScene: { 
                        dialogue: [
                            { speaker: "{trainee}", text: { zh: "「謝謝你，教練！我永遠不會忘記你！」" } },
                            { text: { zh: "憑藉著紮實的基礎與成功的出道秀，{trainee}迅速竄紅。" } },
                            { text: { zh: "【養成結局：星光大道】" } }
                        ],
                        rewards: { title: "金牌教練", gold: 100 },
                        options: [{ label: "結算", action: "finish_chain" }]
                    } 
                },
                { 
                    label: "攜手：最佳搭檔", condition: { tags: ['tag_debut_success', 'tag_bond'] }, 
                    style: "primary", action: "node_next", 
                    nextScene: { 
                        dialogue: [
                            { speaker: "{trainee}", text: { zh: "「未來的路，我們還要一起走喔！」" } },
                            { text: { zh: "你們的搭檔關係還會繼續下去，挑戰更高的巔峰！" } },
                            { text: { zh: "【養成結局：最佳拍檔】" } }
                        ],
                        rewards: { gold: 80 },
                        options: [{ label: "結算", action: "finish_chain" }]
                    } 
                },
                { 
                    label: "平凡的落幕", action: "node_next", 
                    nextScene: { 
                        dialogue: [
                            { text: { zh: "雖然沒有成為大紅大紫的明星，但這段共同奮鬥的日子，成為了你們彼此珍貴的回憶。" } },
                            { text: { zh: "【養成結局：平淡的幸福】" } }
                        ],
                        rewards: { gold: 30 },
                        options: [{ label: "結算", action: "finish_chain" }]
                    } 
                }
            ]
        },
        {
            type: 'raise_ending', id: 'fallback_raising_end',
            dialogue: [
                { text: { zh: "時光飛逝，培育的旅程來到了終點。" } },
                { text: { zh: "看著{trainee}如今自信的模樣，你露出了欣慰的笑容。" } },
                { text: { zh: "無論未來的路有多長，這段時光都將成為最寶貴的財富。" } }
            ],
            options: [{ label: "迎接結局", action: "finish_chain", rewards: { gold: 100 } }]
        }
    );

    console.log("🌱 養成劇本已載入");
})();