/* js/story_data/story_adventure.js */
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
        // [BLOCK C] ⚔️ 異世界戰記 (adventure Chronicles)
        // ============================================================
        {
            type: 'setup', id: 'adventure_start_class',
            text: { zh: [ "強烈的暈眩感退去後，你發現自己身處於一片{adj_env_vibe}{noun_location_building}之中。", "天空中懸掛著破碎的月亮，遠處傳來了{noun_role_monster}的嘶吼聲。", "你低頭看了看自己的雙手，意識到自己必須依靠手中的武器活下去。" ]},
            slots: ['adj_env_vibe', 'noun_location_building', 'noun_role_monster'],
            options: [
                { label: "握緊重劍 (戰士路線)", action: "advance_chain", rewards: { tags: ['class_warrior'], varOps: [{key:'hp', val:120, op:'set'}, {key:'str', val:10, op:'set'}] }, nextScene: { text: "沉重的劍身給了你安全感。無論前方有什麼，你都將一刀兩斷。" } },
                { label: "詠唱咒文 (法師路線)", action: "advance_chain", rewards: { tags: ['class_mage'], varOps: [{key:'mp', val:100, op:'set'}, {key:'int', val:10, op:'set'}] }, nextScene: { text: "元素在你指尖跳動。知識就是力量，而你掌握著毀滅的知識。" } },
                { label: "檢查短刀 (刺客路線)", action: "advance_chain", rewards: { tags: ['class_rogue'], varOps: [{key:'agi', val:10, op:'set'}] }, nextScene: { text: "你壓低了身形，與陰影融為一體。在被發現之前，敵人就已經死了。" } }
            ]
        },
        {
            type: 'event_battle', id: 'adventure_battle_ambush',
            text: { zh: [ "草叢中傳來了急促的沙沙聲。你{adv_manner}轉過身，正好迎面撞上了一隻{noun_role_monster}！", "它{adv_manner}張開了利爪，眼裡閃爍著{adj_npc_trait}紅光，顯然已經飢餓難耐。", "避無可避，唯有死戰。" ]},
            slots: ['adv_manner', 'noun_role_monster', 'adj_npc_trait'],
            options: [
                { label: "正面迎擊 (STR檢定)", check: { stat: 'STR', val: 5 }, action: "advance_chain", nextScene: { text: "你發出怒吼，武器帶著破風聲重重擊中了它！怪物發出哀嚎，倒在地上抽搐著。" }, failScene: { text: "你的力量輸給了它的野性。它將你撲倒在地，利爪在你身上留下了深可見骨的傷痕。", rewards: { energy: -20 } } },
                { label: "尋找破綻 (INT檢定)", check: { stat: 'INT', val: 5 }, action: "advance_chain", nextScene: { text: "你冷靜地觀察它的動作，在它撲過來的瞬間側身閃過，並精準地刺入了它的要害。" }, failScene: { text: "它的動作比你預想的更快！你判斷失誤，只能狼狽地在地上打滾躲避攻擊。", rewards: { energy: -15 } } }
            ]
        },
        {
            type: 'event_battle', id: 'adventure_battle_magic', reqTag: 'class_mage', 
            text: { zh: [ "前方的道路被一群{noun_role_monster}擋住了。牠們似乎對魔法波動非常敏感。", "你感覺到周圍的元素正在躁動，這是一個釋放大型魔法的絕佳機會。" ]},
            slots: ['noun_role_monster'],
            options: [{ label: "詠唱「爆裂火球」！", action: "advance_chain", rewards: { varOps: [{key:'mp', val:20, op:'-'}] }, nextScene: { text: "巨大的火球在怪物群中炸裂！空氣中充滿了焦糊味，敵人瞬間化為了灰燼。" } }]
        },
        {
            type: 'event_explore', id: 'adventure_explore_ruin',
            text: { zh: [ "你發現了一座被藤蔓覆蓋的古代遺跡。這裡的空氣異常{adj_env_vibe}。", "在斷裂的石柱旁，躺著一具白骨，他的手裡還死死抓著一個{noun_item_common}。", "那是某種信物？還是帶來不幸的詛咒之物？" ]},
            slots: ['adj_env_vibe', 'noun_item_common'],
            options: [
                { label: "撿起物品", action: "advance_chain", rewards: { tags: ['item_found'], gold: 50 }, nextScene: { text: "你擦去了上面的灰塵。雖然年代久遠，但它依然散發著微弱的魔力波動。" } },
                { label: "雙手合十，轉身離開", action: "advance_chain", rewards: { varOps: [{key:'sanity', val:10, op:'+'}] } }
            ]
        },
        {
            type: 'event_explore', id: 'adventure_explore_trap',
            text: { zh: [ "你正{adv_manner}走在狹窄的通道中，腳下的地磚突然下陷！", "「喀嚓」一聲，機關被觸發了。兩側的牆壁開始噴射出毒箭。", "這是一個致命的陷阱！" ]},
            slots: ['adv_manner'],
            options: [{ label: "靠反應閃避 (AGI檢定)", check: { stat: 'AGI', val: 5 }, action: "advance_chain", nextScene: { text: "你的身體比意識更快做出了反應！你在箭雨中穿梭，毫髮無傷地落在了安全區。" }, failScene: { text: "你盡力躲避了，但一支毒箭還是擦傷了你的手臂。傷口傳來了一陣麻痺感。", rewards: { energy: -30 } } }]
        },
        {
            type: 'boss', id: 'adventure_boss_dragon',
            text: { zh: [ "大地的震動越來越劇烈。在{noun_location_building}的最深處，一雙巨大的眼睛睜開了。", "那是傳說中的災厄——{noun_role_monster}（變異體）！", "它{adv_manner}發出了震耳欲聾的咆哮，強大的風壓幾乎讓你站立不穩。", "這就是旅途的終點嗎？還是成為傳說的起點？" ]},
            slots: ['noun_location_building', 'noun_role_monster', 'adv_manner'],
            options: [{ label: "拔劍，決一死戰！", style: "danger", check: { stat: 'STR', val: 8 }, action: "finish_chain", nextScene: { text: "【結局：屠龍英雄】\n你燃燒了最後的生命力，將劍送入了怪物的心臟。你的名字將被吟遊詩人永遠傳唱。", rewards: { exp: 2000, title: "傳說勇者" } }, failScene: { text: "【結局：無名的屍骸】\n實力的差距是絕望的。你的武器折斷了，視野逐漸被黑暗吞沒...", rewards: { exp: 500 } } }]
        },
);

    console.log("🕵️‍♂️ 劇本已載入");
})();