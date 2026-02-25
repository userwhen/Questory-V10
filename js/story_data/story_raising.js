/* js/story_data/story_raising.js */
(function() {
    // 1. 取得核心活頁簿
    const DB = window.FragmentDB;
    if (!DB) {
        console.error("❌ 錯誤：找不到 FragmentDB，請確認 story_data_core.js 已優先載入。");
        return;
    }

    // 2. 追加劇本 (Templates)
    DB.templates.push(
	// ============================================================
        // [BLOCK E] 🌱 明星推手/養成流 (The Mentor)
        // ============================================================
        {
            type: 'raise_meet', id: 'raise_start_select',
            text: { zh: [ "這是一個{adj_env_vibe}日子，你在{combo_building}的角落發現了那個獨特的存在。", "那是一位{atom_status}{trainee}，雖然現在還很弱小，但你從對方的眼神中看到了無限的潛力。", "命運將你們聯繫在了一起，你決定成為對方的..." ]},
            options: [
                { 
                    label: "嚴厲的導師 (注重實力)", action: "advance_chain", 
                    rewards: { tags: ['style_power'], varOps: [{key:'str', val:30, op:'set'}, {key:'stress', val:0, op:'set'}] }, 
                    nextScene: { text: "你走上前去，伸出了手。「想變強嗎？那就跟著我。」對方猶豫片刻後，緊緊握住了你的手。" } 
                },
                { 
                    label: "溫柔的守護者 (注重魅力)", action: "advance_chain", 
                    rewards: { tags: ['style_charm'], varOps: [{key:'chr', val:30, op:'set'}, {key:'stress', val:0, op:'set'}] }, 
                    nextScene: { text: "你溫柔地笑了笑，給予了對方最需要的溫暖。從那一刻起，你成為了對方最依賴的港灣。" } 
                }
            ]
        },
        {
            type: 'raise_train', id: 'raise_train_day',
            text: { zh: [ "時光飛逝，{trainee}在你的指導下飛速成長。", "今天是一個關鍵的訓練日，你看著對方{atom_manner}練習著。", "現在正是突破瓶頸的好機會，你決定安排..." ]},
            options: [
                { 
                    label: "魔鬼特訓 (大幅增加壓力)", action: "advance_chain", 
                    // 獲得實力TAG，但壓力大增
                    rewards: { tags: ['tag_strength'], varOps: [{key:'stress', val:40, op:'+'}] }, 
                    nextScene: { text: "汗水揮灑在訓練場上。雖然過程痛苦，但對方的眼神越來越銳利，實力大幅提升！" } 
                },
                { 
                    label: "藝術薰陶 (增加壓力)", action: "advance_chain", 
                    // 獲得名氣TAG，壓力微增
                    rewards: { tags: ['tag_fame'], varOps: [{key:'stress', val:20, op:'+'}, {key:'gold', val:-50, op:'+'}] }, 
                    nextScene: { text: "優雅的舉止與氣質逐漸成形。對方的一舉一動都開始散發著迷人的魅力。" } 
                },
                { 
                    label: "放鬆休息 (扣除壓力/提升幸福)", action: "advance_chain", 
                    // 扣除壓力，獲得幸福感變數
                    rewards: { varOps: [{key:'stress', val:30, op:'-'}, {key:'happiness', val:20, op:'+'}] }, 
                    nextScene: { text: "勞逸結合是必要的。看著{trainee}開心的睡臉，你感到一陣欣慰，壓力一掃而空。" } 
                }
            ]
        },
        {
            type: 'raise_debut', id: 'raise_event_show',
            text: { zh: [ "{trainee}迎來了第一次公開展示的機會——在{noun_location_room}舉行的選拔賽。", "然而，在上場前的後台..." ]},
            options: [
                // 🛑 【壓力崩潰分支】當 stress >= 60 時，只有這個選項會出現，強制結束遊戲
                { 
                    label: "狀況不對勁...", condition: { vars: [{key:'stress', val:60, op:'>='}] }, 
                    style: "danger", action: "finish_chain", 
                    nextScene: { text: "【結局：不堪重負】\n{trainee}全身發抖，終究承受不住你給予的巨大壓力。\n「對不起...我真的做不到...」留下這句話後，對方逃離了會場，從此一蹶不振。" } 
                },
                // ✅ 【正常推進分支】當 stress < 60 時，才能正常進行挑戰
                { 
                    label: "展示華麗的技巧 (需名氣TAG)", condition: { tags: ['tag_fame'], vars: [{key:'stress', val:60, op:'<'}] }, 
                    action: "advance_chain", 
                    nextScene: { text: "全場都被那驚人的美感征服了！掌聲雷動！", rewards: { gold: 300, tags: ['fame_mid'] } } 
                },
                { 
                    label: "展示壓倒性的力量 (需實力TAG)", condition: { tags: ['tag_strength'], vars: [{key:'stress', val:60, op:'<'}] }, 
                    action: "advance_chain", 
                    nextScene: { text: "轟！震撼的實力展示讓全場鴉雀無聲，隨後爆發出驚嘆的歡呼！", rewards: { gold: 300, tags: ['fame_mid'] } } 
                }
            ]
        },
        {
            type: 'raise_climax', id: 'raise_final_battle', reqTag: 'fame_mid', 
            text: { zh: [ "決戰之日終於來臨。站在巔峰的對手強大得令人窒息。", "在此刻，你想向對方說最後一句話是..." ]},
            
            options: [
                { 
                    label: "「去吧，讓世界看到你的光芒！」", action: "advance_chain", 
                    // 根據之前的幸福感給予最後的數值衝刺
                    rewards: { varOps: [{key:'chr', val:10, op:'+'}, {key:'str', val:10, op:'+'}] }, 
                    nextScene: { text: "{trainee}回頭看了你一眼，眼神中充滿了信任。然後，毅然決然地踏上了決戰的舞台。" } 
                }
            ]
        },
        {
            type: 'raise_ending', id: 'raise_end_result',
            text: { zh: [ "塵埃落定。你看著眼前這個光芒萬丈的存在，回想起最初相遇的那一刻。", "這段旅程，終於畫上了句點。" ]},
            options: [
                // 🏆 結局判定改為檢查 TAG
                { 
                    label: "見證：至高明日之星", condition: { tags: ['tag_fame'] }, // 檢查名氣 TAG
                    style: "primary", action: "finish_chain", 
                    nextScene: { text: "【結局：世界的寵兒】\n{trainee}成為了被世人傳頌的偶像。而你，是造就這奇蹟的傳奇導師。", rewards: { exp: 2000, title: "金牌製作人" } } 
                },
                { 
                    label: "見證：最強鬥士", condition: { tags: ['tag_strength'] }, // 檢查實力 TAG
                    style: "danger", action: "finish_chain", 
                    nextScene: { text: "【結局：頂點的霸者】\n以絕對的力量君臨天下！這份榮耀，有一半屬於在背後默默支持的你。", rewards: { exp: 2000, title: "王者之師" } } 
                },
                // 如果都沒有達標（防呆機制）
                { 
                    label: "回歸平凡的幸福", action: "finish_chain", 
                    nextScene: { text: "【結局：相伴的旅途】\n雖然沒有成為傳說，但你們收穫了彼此的信任。你們決定離開聚光燈，去尋找屬於自己的平靜生活。", rewards: { exp: 800 } } 
                }
            ]
        },
		{
    type: 'raise_meet', id: 'raise_meet_normal',
    text: { zh: [
        "這是一個命運般的相遇。",
        "你在人群中一眼就看到了{trainee}。雖然現在還默默無聞，但你從那雙眼睛裡看到了潛力。",
        "「你是說... 你能讓我成為最強的？」{trainee}懷疑地看著你。"
    ]},
    
    options: [
        { 
            label: "展現你的專業 (CHR檢定/注重專業)", 
            check: { stat: 'CHR', val: 5 }, 
            action: "advance_chain", 
            // 成功：獲得專業TAG，初始化壓力
            rewards: { tags: ['tag_pro'], varOps: [{key:'stress', val:0, op:'set'}] },
            nextScene: { text: "你的一番話打動了對方。\n「好吧，教練，請多指教！」" },
            // 失敗：勉強答應，但起始壓力較高
            failScene: { text: "對方似乎不太信任你，但還是勉強答應試試看。", rewards: { varOps: [{key:'stress', val:10, op:'set'}] } } 
        },
        { 
            label: "用熱情感染對方 (注重羈絆)", 
            action: "advance_chain", 
            // 獲得羈絆TAG，初始化壓力
            rewards: { tags: ['tag_bond'], varOps: [{key:'stress', val:0, op:'set'}] },
            nextScene: { text: "你的熱情讓{trainee}放下了戒心。「那就讓我們一起努力吧！」" }
        }
    ]
},

// 2. 訓練日常 (raise_train)
{
    type: 'raise_train', id: 'raise_train_hard',
    text: { zh: [
        "今天的訓練清單非常魔鬼。",
        "{trainee}已經累得氣喘吁吁，汗水浸濕了衣背。",
        "「教練... 我真的不行了...」"
    ]},
    
    options: [
        { 
            label: "嚴厲斥責：堅持下去！(大幅增加壓力)", 
            action: "advance_chain", 
            // 獲得實力TAG，壓力暴增
            rewards: { tags: ['tag_strength'], varOps: [{key:'stress', val:25, op:'+'}] }, 
            nextScene: { text: "{trainee}咬著牙站了起來，突破了極限！(獲得實力)", onEnter: { exp: 50 } } 
        },
        { 
            label: "改變方針：進行舞台訓練 (微幅增加壓力)", 
            action: "advance_chain", 
            // 獲得名氣TAG，壓力微增
            rewards: { tags: ['tag_fame'], varOps: [{key:'stress', val:10, op:'+'}] }, 
            nextScene: { text: "你將體能訓練改為台風與魅力訓練。{trainee}漸入佳境。(獲得名氣)" } 
        },
        { 
            label: "溫柔鼓勵：休息一下吧 (扣除壓力)", 
            action: "advance_chain", 
            // 扣除壓力
            rewards: { varOps: [{key:'stress', val:15, op:'-'}] }, 
            nextScene: { text: "{trainee}感激地看著你。雖然進度慢了點，但身心壓力大幅緩解了。" } 
        }
    ]
},

// 3. 初次登台/出道 (raise_debut)
{
    type: 'raise_debut', id: 'raise_debut_show',
    text: { zh: [
        "終於到了檢驗成果的時候。",
        "舞台下的觀眾並不多，但這是{trainee}的第一次正式亮相。",
        "你站在後台，看著即將上場的{trainee}..."
    ]},
    
    options: [
        // 🛑 【壓力崩潰攔截】壓力 >= 30 時強制觸發
        { 
            label: "狀況極度不佳...", 
            condition: { vars: [{key:'stress', val:30, op:'>='}] }, 
            style: "danger", action: "finish_chain", 
            nextScene: { text: "【結局：怯場逃避】\n過度的壓力在這一刻爆發，{trainee}在登台前一刻崩潰大哭，衝出了會場...\n這場出道秀成了永遠的遺憾。" } 
        },
        // ✅ 【正常路線】壓力 < 30 時才能選擇
        { 
            label: "展現爆發力 (需實力TAG)", 
            condition: { tags: ['tag_strength'], vars: [{key:'stress', val:30, op:'<'}] }, 
            action: "advance_chain", 
            nextScene: { text: "演出充滿了爆發力！雖然青澀，但強大的氣場震懾了全場，這是一個好的開始！", rewards: { tags: ['tag_debut_success'] } }
        },
        { 
            label: "應變突發狀況 (需名氣TAG)", 
            condition: { tags: ['tag_fame'], vars: [{key:'stress', val:30, op:'<'}] }, 
            action: "advance_chain", 
            nextScene: { text: "你及時化解了一個舞台事故，並引導{trainee}展現魅力，演出完美落幕！", rewards: { tags: ['tag_debut_success'] } }
        },
        // ⚠️ 防呆：如果壓力及格，但前面都在休息沒拿到TAG
        { 
            label: "硬著頭皮上場", 
            condition: { vars: [{key:'stress', val:30, op:'<'}] }, 
            action: "advance_chain", 
            nextScene: { text: "演出中規中矩，沒有太多亮點，但至少平安完成了初登場。" }
        }
    ]
},
{
            type: 'raise_climax', id: 'raise_climax_final', 
            text: { zh: [ "時光飛逝，經歷了出道的洗禮，{trainee}終於站上了全國大賽的決賽舞台。", "對手是業界公認的霸主。在上場前的最後一刻，你想說..." ]},
            
            options: [
                { 
                    label: "「去吧，讓世界看到你的光芒！」", action: "advance_chain", 
                    rewards: { varOps: [{key:'chr', val:10, op:'+'}, {key:'str', val:10, op:'+'}] }, 
                    nextScene: { text: "{trainee}回頭看了你一眼，眼神中充滿了信任。然後毅然決然地踏上了決戰的舞台。" } 
                }
            ]
        },

// 4. 結局 (raise_ending)
{
    type: 'raise_ending', id: 'raise_ending_success',
    text: { zh: [
        "經過這段時間的努力，初次登台的結果已經決定了未來的走向。",
        "看著那自信的身影，你知道你的任務已經告一段落。",
        "這段旅程，將會走向何方？"
    ]},
    
    options: [
        { 
            label: "見證：傳奇巨星誕生", 
            // 條件：出道成功 + 專業路線
            condition: { tags: ['tag_debut_success', 'tag_pro'] }, 
            style: "primary", action: "finish_chain", 
            nextScene: { text: "「謝謝你，教練！我永遠不會忘記你！」\n憑藉著紮實的基礎與成功的出道秀，{trainee}迅速竄紅。\n\n【養成結局：星光大道】", rewards: { title: "金牌教練", exp: 1000 } } 
        },
        { 
            label: "攜手：最佳搭檔", 
            // 條件：出道成功 + 羈絆路線
            condition: { tags: ['tag_debut_success', 'tag_bond'] }, 
            style: "primary", action: "finish_chain", 
            nextScene: { text: "「未來的路，我們還要一起走喔！」\n你們的搭檔關係還會繼續下去，挑戰更高的巔峰！\n\n【養成結局：最佳拍檔】", rewards: { gold: 500, exp: 800 } } 
        },
        { 
            // 條件：都沒有達標的普通結局
            label: "平凡的落幕", 
            action: "finish_chain", 
            nextScene: { text: "雖然沒有成為大紅大紫的明星，但這段共同奮鬥的日子，成為了你們彼此珍貴的回憶。\n\n【養成結局：平淡的幸福】", rewards: { exp: 300 } } 
        }
    ]
},
{
            type: 'raise_ending', 
            id: 'fallback_raising_end',
            dialogue: [
                { text: { zh: "時光飛逝，培育的旅程來到了終點。" } },
                { text: { zh: "看著{trainee}如今自信的模樣，你露出了欣慰的笑容。" } },
                { text: { zh: "無論未來的路有多長，這段時光都將成為最寶貴的財富。" } }
            ],
            options: [{ label: "迎接結局", action: "finish_chain", rewards: { exp: 100 } }]
        },
    );

    console.log("🕵️‍♂️ 劇本已載入");
})();