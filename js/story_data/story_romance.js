/* js/story_data/story_romance.js */
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
        // [BLOCK D] 💕 戀愛博弈流 (Romance Strategy)
        // ============================================================
        {
            type: 'love_meet', id: 'rom_meet_drama',
            text: { zh: [ "在{noun_location_building}的{noun_location_room}，你正專注於手中的事務。", "突然，一位{adj_npc_trait}{lover}因躲避人群而撞到了你懷裡，帶著一股淡淡的香氣。", "就在這時，遠處傳來了{rival}尖銳的聲音：「在那裡！別讓那個『小偷』跑了！」", "這似乎是一場誤會，但卻將你捲入了風暴中心。" ]},
            slots: ['noun_location_building', 'noun_location_room', 'lover', 'rival', 'adj_npc_trait'],
            options: [
                { label: "挺身而出保護他/她", action: "advance_chain", rewards: { tags: ['romantic_vibe'], varOps: [{key:'love_meter', val:15, op:'set'}, {key:'trust', val:10, op:'set'}] }, nextScene: { text: "你冷靜地擋在{lover}身前，懾人的氣勢讓追兵猶豫了。{lover}抬頭看著你，眼中閃過一絲驚訝與感激。" } },
                { label: "冷靜地協助解圍", action: "advance_chain", rewards: { varOps: [{key:'love_meter', val:5, op:'set'}, {key:'trust', val:20, op:'set'}] }, nextScene: { text: "你用幾句巧妙的謊言打發了追兵。{lover}鬆了一口氣，對你的機智印象深刻。" } }
            ]
        },
        {
            type: 'love_bond', id: 'rom_bond_secret', reqTag: 'romantic_vibe',
            text: { zh: [ "為了感謝你的幫助，{lover}約你在一個{adj_env_vibe}角落見面。", "這裡沒有{rival}的眼線。{lover}向你吐露了心聲，原來他/她一直受到{rival}的打壓與排擠。", "你看著對方{adj_npc_trait}側臉，心中產生了保護欲。" ]},
            slots: ['adj_env_vibe', 'lover', 'rival', 'adj_npc_trait'],
            options: [
                { label: "承諾成為同盟", action: "advance_chain", rewards: { varOps: [{key:'love_meter', val:10, op:'+'}, {key:'trust', val:10, op:'+'}] }, nextScene: { text: "你們的手指不經意間碰在了一起。從今天起，你們是共犯，也是彼此的依靠。" } },
                { label: "提供戰術建議 (INT檢定)", check: { stat: 'INT', val: 5 }, action: "advance_chain", nextScene: { text: "你精準地分析了局勢，{lover}聽得入神，眼神中充滿了崇拜。" } }
            ]
        },
        {
            type: 'love_scheme', id: 'rom_scheme_rumor',
            text: { zh: [ "平靜的日子被打破了。{noun_location_building}裡開始流傳關於你的惡毒謠言。", "人們對你指指點點，謠言的源頭直指{rival}。", "更糟糕的是，{rival}拿著一份偽造的{noun_item_record}找到了{lover}，試圖證明你接近他是別有用心。" ]},
            slots: ['noun_location_building', 'rival', 'noun_item_record', 'lover'],
            dialogue: [{ speaker: "{rival}", text: { zh: "看清楚了吧？這個人只是在利用你！只有我才是真正為你好。" } }],
            options: [
                { label: "立刻衝去解釋", action: "advance_chain", rewards: { varOps: [{key:'trust', val:10, op:'-'}] }, nextScene: { text: "你的焦急反而顯得心虛。{lover}雖然沒有完全相信，但眼中多了一絲疑慮。" } },
                { label: "蒐集證據，準備反擊", action: "advance_chain", rewards: { tags: ['counter_ready'] }, nextScene: { text: "你按兵不動，{adv_manner}調查了謠言的來源，終於抓到了{rival}的把柄。" } }
            ]
        },
        {
            type: 'love_counter', id: 'rom_counter_slap',
            text: { zh: [ "這是一場盛大的{noun_location_room}聚會，所有人都在場。", "{rival}正得意洋洋地高談闊論，準備將你徹底逐出社交圈。", "這是最後的機會，你要如何挽回局面？" ]},
            slots: ['noun_location_room', 'rival'],
            options: [
                { label: "當眾揭穿陰謀 (需反擊標籤)", condition: { tags: ['counter_ready'] }, style: "primary", action: "advance_chain", rewards: { varOps: [{key:'love_meter', val:30, op:'+'}, {key:'fame', val:50, op:'+'}] }, nextScene: { text: "你拿出了證據，條理清晰地駁斥了所有謊言。{rival}臉色慘白，在眾人的嘲笑聲中狼狽逃離。\n{lover}感動地看著你，眼裡只有你一人。" } },
                { label: "深情告白感動全場", check: { stat: 'CHR', val: 8 }, action: "advance_chain", nextScene: { text: "你無視了所有指控，只是堅定地說出了對{lover}的心意。真誠打動了所有人，{rival}的謠言不攻自破。" }, failScene: { text: "你的聲音在顫抖，大家似乎並不買帳。局面變得更加尷尬了。", rewards: { varOps: [{key:'love_meter', val:20, op:'-'}] } } }
            ]
        },
        {
            type: 'love_confession', id: 'rom_end_victory',
            text: { zh: [ "風波終於平息。在{adj_env_vibe}月光下，你和{lover}再次來到了初遇的地方。", "經歷了背叛與考驗，你們之間的羈絆已經堅不可摧。", "{lover}主動牽起了你的手，等待著你的回應。" ]},
            slots: ['adj_env_vibe', 'lover'],
            options: [
                { label: "「我們是最佳拍檔，也是戀人。」", condition: { var: { key: 'love_meter', val: 50, op: '>=' } }, style: "primary", action: "finish_chain", nextScene: { text: "【True End: 權力與愛情】\n{lover}笑著吻了你。「沒錯，只要我們聯手，沒有人能將我們分開。」\n你們不僅收穫了愛情，更成為了令人敬畏的傳奇伴侶。", rewards: { exp: 1200, title: "社交界霸主" } } },
                { label: "「我累了，只想過平靜的生活。」", action: "finish_chain", nextScene: { text: "【Normal End: 遠離塵囂】\n你拒絕了權力的遊戲，帶著{lover}遠走高飛。雖然失去了地位，但至少你們擁有了彼此的寧靜。", rewards: { exp: 500 } } },
                { label: "默然離去 (好感不足)", condition: { var: { key: 'love_meter', val: 50, op: '<' } }, action: "finish_chain", nextScene: { text: "【Bad End: 錯過的緣分】\n儘管誤會解開，但你們之間的傷痕太深。你轉身離開，留下了一個孤獨的背影。" } }
            ]
        },
    );

    console.log("🕵️‍♂️ 劇本已載入");
})();