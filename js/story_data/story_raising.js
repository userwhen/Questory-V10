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
            text: { zh: [ "這是一個{adj_env_vibe}日子，你在{noun_location_building}的角落發現了那個獨特的存在。", "那是一位{adj_npc_trait}{trainee}，雖然現在還很弱小，但你從對方的眼神中看到了無限的潛力。", "命運將你們聯繫在了一起，你決定成為對方的..." ]},
            slots: ['adj_env_vibe', 'noun_location_building', 'adj_npc_trait', 'trainee'],
            options: [
                { label: "嚴厲的導師 (注重實力)", action: "advance_chain", rewards: { tags: ['style_power'], varOps: [{key:'str', val:30, op:'set'}, {key:'chr', val:10, op:'set'}] }, nextScene: { text: "你走上前去，伸出了手。「想變強嗎？那就跟著我。」對方猶豫片刻後，緊緊握住了你的手。" } },
                { label: "溫柔的守護者 (注重魅力)", action: "advance_chain", rewards: { tags: ['style_charm'], varOps: [{key:'str', val:10, op:'set'}, {key:'chr', val:30, op:'set'}] }, nextScene: { text: "你溫柔地笑了笑，給予了對方最需要的溫暖。從那一刻起，你成為了對方最依賴的港灣。" } }
            ]
        },
        {
            type: 'raise_train', id: 'raise_train_day',
            text: { zh: [ "時光飛逝，{trainee}在你的指導下飛速成長。", "今天是一個關鍵的訓練日，你看著對方{adv_manner}練習著。", "現在正是突破瓶頸的好機會，你決定安排..." ]},
            slots: ['trainee', 'adv_manner'],
            options: [
                { label: "魔鬼特訓 (體能/戰鬥)", action: "advance_chain", rewards: { varOps: [{key:'str', val:20, op:'+'}, {key:'stress', val:15, op:'+'}] }, nextScene: { text: "汗水（或血汗）揮灑在訓練場上。雖然過程痛苦，但對方的眼神越來越銳利，實力大幅提升。" } },
                { label: "藝術薰陶 (表演/靈性)", action: "advance_chain", rewards: { varOps: [{key:'chr', val:20, op:'+'}, {key:'gold', val:-50, op:'+'}] }, nextScene: { text: "優雅的舉止與氣質逐漸成形。對方的一舉一動都開始散發著迷人的魅力，吸引了周圍的目光。" } },
                { label: "放鬆休息 (消除壓力)", action: "advance_chain", rewards: { varOps: [{key:'stress', val:30, op:'-'}] }, nextScene: { text: "勞逸結合是必要的。看著{trainee}開心的睡臉（或笑臉），你感到一陣欣慰。" } }
            ]
        },
        {
            type: 'raise_debut', id: 'raise_event_show',
            text: { zh: [ "{trainee}迎來了第一次公開展示的機會——在{noun_location_room}舉行的選拔賽。", "台下（或場邊）坐滿了挑剔的觀眾和評審。你的勁敵{rival}也帶著他培育的精英出現了。", "{rival}冷笑著說：「這種水準也敢出來丟人現眼？」" ]},
            slots: ['trainee', 'noun_location_room', 'rival'],
            options: [
                { label: "展示華麗的技巧 (檢定魅力)", check: { stat: 'CHR', val: 50 }, action: "advance_chain", nextScene: { text: "全場都被那驚人的美感征服了！掌聲雷動，{rival}的臉色變得鐵青。", rewards: { gold: 300, tags: ['fame_mid'] } }, failScene: { text: "或許是太緊張了，表演中出現了一個小失誤。雖然觀眾給予了鼓勵，但離完美還差一點。", rewards: { varOps: [{key:'stress', val:10, op:'+'}] } } },
                { label: "展示壓倒性的力量 (檢定實力)", check: { stat: 'STR', val: 50 }, action: "advance_chain", nextScene: { text: "轟！震撼的實力展示讓全場鴉雀無聲，隨後爆發出驚嘆的歡呼。這是強者的證明！", rewards: { gold: 300, tags: ['fame_mid'] } } }
            ]
        },
        {
            type: 'raise_climax', id: 'raise_final_battle', reqTag: 'fame_mid', 
            text: { zh: [ "決戰之日終於來臨。這不僅是{trainee}的舞台，也是檢驗你教育成果的時刻。", "站在巔峰的對手強大得令人窒息，但你的{trainee}已經不再是當初那個弱小的存在了。", "在此刻，你想對他說/牠最後一句話是..." ]},
            slots: ['trainee'],
            options: [{ label: "「去吧，讓世界看到你的光芒！」", action: "advance_chain", rewards: { varOps: [{key:'chr', val:10, op:'+'}, {key:'str', val:10, op:'+'}] }, nextScene: { text: "{trainee}回頭看了你一眼，眼神中充滿了信任。然後，毅然決然地踏上了決戰的舞台。" } }]
        },
        {
            type: 'raise_ending', id: 'raise_end_result',
            text: { zh: [ "塵埃落定。傳說已經誕生。", "你看著眼前這個光芒萬丈的存在，回想起最初在{noun_location_building}相遇的那一刻。", "這段旅程，終於畫上了句點。" ]},
            slots: ['noun_location_building'],
            options: [
                { label: "見證：至高偶像/女神 (CHR > 100)", condition: { vars: [{key:'chr', val:100, op:'>='}] }, style: "primary", action: "finish_chain", nextScene: { text: "【結局：世界的寵兒】\n{trainee}成為了被世人傳頌的偶像（或神獸）。無論走到哪裡，都伴隨著鮮花與掌聲。\n而你，是造就這奇蹟的傳奇導師。", rewards: { exp: 2000, title: "金牌製作人" } } },
                { label: "見證：最強戰神/獸王 (STR > 100)", condition: { vars: [{key:'str', val:100, op:'>='}] }, style: "danger", action: "finish_chain", nextScene: { text: "【結局：頂點的霸者】\n以絕對的力量君臨天下！{trainee}的名字成為了力量的代名詞。\n這份榮耀，有一半屬於在背後默默支持的你。", rewards: { exp: 2000, title: "王者之師" } } },
                { label: "回歸平凡的幸福", action: "finish_chain", nextScene: { text: "【結局：相伴的旅途】\n雖然沒有成為傳說，但你們收穫了彼此的信任。你們決定離開聚光燈，去尋找屬於自己的平靜生活。", rewards: { exp: 800 } } }
            ]
        },
    );

    console.log("🕵️‍♂️ 劇本已載入");
})();