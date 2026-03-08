/* js/story_data/data_sentences.js
 * 職責：句子模板庫（含 {佔位符} 的組合句，供引擎展開後輸出成正式文本）
 * 包含：環境描述包、人物出場句、事件句、戰鬥過場、社交反應、各劇本專屬台詞
 * 載入順序：data_dictionary → data_words → data_sentences
 *
 * 新增句子：找到對應的 key，加一個 { val: "你的句子，可以含{佔位符}" }
 * 新增新 key：加在最底部，確保 data_words.js 裡有對應的佔位符 key
 */
(function() {
    window.FragmentDB = window.FragmentDB || { fragments: {}, templates: [] };
    const DB = window.FragmentDB;

    Object.assign(DB.fragments, {

    // ============================================================
    // 🏰 Layer 1 — 環境描述組合包（combo / pack）
    //    這些 key 是組合多個原子詞的「中間層」
    //    data_words 的詞 → 這裡的包 → 下方的 phrase 句型
    // ============================================================

        combo_location: [
            { val: "{env_adj}{env_building}的{env_room}" }, // 例：廢棄莊園的地下室
            { val: "{env_adj}{env_room}" }                  // 例：陰暗的走廊
        ],

        env_pack_visual: [
            { val: "在{env_light}的映照下，{env_feature}顯得格外詭異。" },
            { val: "{env_light}勉強照亮了四周，地上的影子隨著光線扭動。" },
            { val: "{env_feature}隱沒在黑暗中，讓人看不清虛實。" },
            { val: "周圍的{env_feature}給人一種莫名的壓迫感。" }
        ],

        env_pack_sensory: [
            // 負面嗅覺
            { val: "空氣中瀰漫著{env_smell}，{smell_reaction_bad}。" },
            { val: "一股{env_smell}撲鼻而來，{smell_reaction_bad}。" },
            // 正面嗅覺
            { val: "空氣中飄來{env_smell_pleasant}，{smell_reaction_good}。" },
            { val: "一絲{env_smell_pleasant}悄悄溜進鼻腔，{smell_reaction_good}。" },
            // 食物香氣
            { val: "不遠處傳來{env_smell_food}，{smell_reaction_food}。" },
            { val: "空氣裡瀰漫著{env_smell_food}，{smell_reaction_food}。" },
            // 聽覺
            { val: "四周死一般寂靜，只有{env_sound}在空間裡迴盪。" },
            { val: "遠處不時傳來{env_sound}，讓人毛骨悚然。" },
            // 視覺觸覺
            { val: "你隱約感覺到有一股視線從{env_feature}投射過來。" }
        ],

        // 物品組合
        combo_item_simple: [
            { val: "{item_physical_state}{item_core}" } // 例：生鏽的匕首
        ],
        combo_item_desc: [
            { val: "一個{item_physical_state}{item_core}，{item_power_clause}。" },
            { val: "一把{item_physical_state}{item_core}，拿在手上傳來異常的觸感。" },
            { val: "一個看似普通的{item_core}，但{item_power_clause}。" }
        ],

        // 人物外觀組合
        // ⚠️ 給「隨機通用事件」用的路人，主線角色請直接寫 {lover}、{detective} 等記憶變數
        combo_person_appearance: [
            { val: "一名{identity_modifier}{core_identity}" },
            { val: "一名{identity_modifier}{core_identity}，對方{state_modifier}。" },
            { val: "一名{core_identity}，對方{trait_clause}。" },
            { val: "一名{identity_modifier}{core_identity}，手中{verb_equip}一個{combo_item_simple}。" }
        ],

    // ============================================================
    // 🌟 Layer 2 — 基礎事件句型（各劇本通用）
    // ============================================================

        sentence_event_sudden: [
            { val: "{atom_time}，{env_sound}突然響起，打破了平靜！" },
            { val: "毫無預兆地，{env_light}猛然熄滅，周圍陷入一片黑暗。" },
            { val: "你的直覺瘋狂示警，{env_feature}傳來了不尋常的動靜。" }
        ],

        sentence_encounter: [
            { val: "一個黑影從{env_feature}竄了出來！仔細一看，是{combo_person_appearance}！" },
            { val: "你猛然回頭，赫然發現{combo_person_appearance}正盯著你。" },
            { val: "伴隨著一聲異響，{combo_person_appearance}擋住了你的去路！" }
        ],

        sentence_tension: [
            { val: "你的心臟在胸腔裡狂跳，冷汗順著額頭滑落。" },
            { val: "大腦一片空白，你必須立刻做出決定。" },
            { val: "理智告訴你應該逃跑，但雙腿卻像灌了鉛一樣沉重。" },
            { val: "空氣中瀰漫著危險又極具張力的氣息。" },
            { val: "你屏住呼吸，連大氣都不敢喘一聲。" }
        ],

        time_aware_desc: [
            { val: "這已經不是你第一次在這條走廊上徘徊了。" },
            { val: "你覺得時間越來越少，空氣變得稀薄。" },
            { val: "某種感覺告訴你，終點就在不遠處。" }
        ],

        env_full_desc: [
            { val: "{env_pack_visual}<br>{env_pack_sensory}<br>你停下腳步，感覺到{sentence_tension}" },
            { val: "在{env_weather}的氣氛下，{env_pack_visual}讓整個場景多了幾分{atmosphere}的色彩。" }
        ],

    // ============================================================
    // 🎬 Layer 3 — 動態過場句型（Phrase）
    //    這是「最終輸出」層，直接呈現給玩家的完整段落
    // ============================================================

        phrase_explore_start: [
            { val: "{atom_time}，你輕步走進了{combo_location}。" },
            { val: "推開沉重的門，映入眼簾的是{combo_location}。" },
            { val: "穿過漫長的通道，你終於來到了{combo_location}。" }
        ],

        phrase_explore_vibe: [
            { val: "{env_pack_visual}" },
            { val: "{env_pack_sensory}" },
            { val: "{env_pack_visual}{env_pack_sensory}" }
        ],

        phrase_danger_warn: [
            { val: "{sentence_event_sudden}" },
            { val: "{sentence_tension}{sentence_event_sudden}" },
            { val: "門把突然被緩緩轉動，有人正在外面...",           tag: ["mystery", "horror", "survivor"] },
            { val: "走廊上的腳步聲越來越近，然後停在了你的門前。", tag: ["mystery", "horror", "survivor"] },
            { val: "燈光突然熄滅，整個房間陷入黑暗。",             tag: ["mystery", "horror", "survivor"] },
            { val: "你的名字被某人以極低的聲音呼喚著。",           tag: ["mystery", "horror", "survivor"] },
            { val: "窗外映出一個黑影，緩慢地移動著。",             tag: ["mystery", "horror", "survivor"] }
        ],

        phrase_danger_appear: [
            { val: "{sentence_encounter}" },
            { val: "前方的陰影中，緩緩走出了一個身影... 是{combo_person_appearance}！" },
            { val: "你感覺到床底有某種東西正在蠕動。",                       tag: ["horror", "survivor"] },
            { val: "衣櫃的門從裡面被猛地推開，一個身影衝了出來！",           tag: ["horror", "mystery", "survivor"] },
            { val: "鏡子裡的倒影...與你的動作不同步。",                       tag: ["horror", "mystery"] },
            { val: "你轉身，那人已經站在你身後不到一步的距離，手中持著某物。", tag: ["horror", "mystery", "survivor"] }
        ],

        phrase_find_action: [
            { val: "你蹲下身，仔細檢查著{env_feature}。" },
            { val: "在{env_light}的映照下，某個反光的東西吸引了你的目光。" },
            { val: "你翻開了旁邊的雜物，赫然發現了什麼。" }
        ],

        phrase_find_result: [
            { val: "竟然是{combo_item_desc}" },
            { val: "你找到了一個{combo_item_simple}。這東西為什麼會出現在這裡？" },
            { val: "那是一個{combo_item_simple}，上面還殘留著使用過的痕跡。" }
        ],

        phrase_combat_start: [
            { val: "你拔出武器，死死盯著眼前的威脅。" },
            { val: "對方發出震耳欲聾的怒吼，朝你猛撲過來！" },
            { val: "沒有交涉的餘地，戰鬥一觸即發！" }
        ],

        phrase_social_action: [
            { val: "對方正用一種難以捉摸的眼神打量著你。" },
            { val: "對方{atom_manner}向前逼近了一步，帶來極大的壓迫感。" },
            { val: "這句話就像一顆炸彈，瞬間改變了周圍的空氣。" },
            { val: "對方輕輕嘆了口氣，語氣裡帶著不加掩飾的情緒。" },
            { val: "場面一度十分尷尬，沒有人敢率先打破沉默。" }
        ],

        phrase_social_react: [
            { val: "你下意識地握緊了拳頭，思考著對策。" },
            { val: "周圍彷彿安靜了下來，只剩下你們兩人的對峙。" },
            { val: "你感覺到背後冒出了一層冷汗。" }
        ],

    // ============================================================
    // 🔍 Layer 4 — 懸疑劇本專屬句型
    // ============================================================

        alibi_claim: [
            { val: "你胡說！案發當時我明明在{env_room}，{verb_equip}那個{item_core}！",      tag: ["mystery"] },
            { val: "這是誣陷！我一直待在{env_room}，根本沒有離開過！",                       tag: ["mystery"] },
            { val: "你有什麼證據！？那時候我正在{env_room}{verb_equip}東西，有人親眼看見！", tag: ["mystery"] },
            { val: "你不過是在猜測！我當時在{env_room}，而且我可以證明！",                   tag: ["mystery"] }
        ],

        culprit_exposed: [
            { val: "那...那個...！（{true_culprit}的眼神開始躲閃）" },
            { val: "不...不可能！這東西怎麼會在你手上！？" },
            { val: "（{true_culprit}臉色瞬間蒼白，嘴唇輕顫）...我...我可以解釋..." },
            { val: "住嘴！你...你根本不知道你在說什麼！" }
        ],

        culprit_counter: [
            { val: "就這個？哈。這只能說明你毫無頭緒。",                                   tag: ["mystery"] },
            { val: "{true_culprit}冷冷一笑：「{item_core}？這和我有什麼關係？」",           tag: ["mystery"] },
            { val: "你是在開玩笑嗎？這種程度的『證物』連警察都說服不了，更別說我了。",     tag: ["mystery"] }
        ],

        crowd_trust: [
            { val: "「確實...這說不過去。」有人低聲說道。" },
            { val: "周圍的人開始交頭接耳，氣氛明顯轉向。" },
            { val: "「你繼續說！」一個聲音從人群中喊出。" }
        ],

        crowd_doubt: [
            { val: "「這人是不是瘋了？」有人小聲嘀咕。" },
            { val: "周圍的人投來懷疑的眼神，氣氛越來越對你不利。" },
            { val: "「你才是兇手吧？」有人突然指向你。" }
        ],

        deduction_sentence: [
            { val: "根據{alibi_claim}，{suspect_A}的時間線對不上。" },
            { val: "如果{suspect_B}說的是真話，那{murder_weapon}就不可能在那個地方。" },
            { val: "只有知道暗道位置的人，才能做到這件事。" }
        ],

    // ============================================================
    // 👻 Layer 5 — 恐怖劇本專屬句型
    // ============================================================

        horror_chase_start: [
            { val: "你轉過身，看到那恐怖的身影正站在走廊盡頭。" },
            { val: "燈光閃爍了一下，對方突然出現在你面前！" },
            { val: "耳邊傳來急促的腳步聲，有什麼東西正在瘋狂地追逐你！" }
        ],

        survivor_hiding: [
            { val: "你屏住呼吸，蜷縮在{env_feature}後面，聽著外面的動靜。", tag: ["survivor", "horror"] },
            { val: "心跳聲大到你以為對方一定能聽見。腳步聲...停了。",       tag: ["survivor", "horror"] },
            { val: "你用雙手捂住嘴，防止自己因為恐懼而發出聲音。",         tag: ["survivor", "horror"] },
            { val: "幾秒鐘的沉默，比幾個小時還要漫長。",                   tag: ["survivor", "horror"] }
        ],

        survivor_witness: [
            { val: "從縫隙中，你看到那個自告奮勇的傢伙正在搜查什麼...", tag: ["survivor", "mystery"] },
            { val: "你沒有插手的能力，只能看著事情在你眼前發展。",     tag: ["survivor"] },
            { val: "他似乎找到了什麼——你看到他臉上露出了複雜的表情。", tag: ["survivor", "mystery"] }
        ],


    // ============================================================
    // 🔧 Layer 6 — data_piece.js 需要的句子（原缺漏）
    // ============================================================

        // 休息時做的事
        rest_activity: [
            { val: "你靠著冰涼的牆壁，慢慢調整著呼吸。" },
            { val: "你閉上眼睛，努力讓自己冷靜下來。" },
            { val: "你把背包放下，趁機整理了一下隨身物品。" },
            { val: "你蜷縮在角落，盡量讓自己不發出任何聲音。" },
            { val: "你小口喝了點水，補充流失的體力。" },
            { val: "你在黑暗中閉目，讓緊繃的神經稍微鬆弛。" }
        ],

        // 休息時浮現的回憶獨白
        memory_flashback: [
            { val: "腦海中浮現出出發前的那個夜晚。" },
            { val: "你想起了還沒有完成的事，心裡有種說不清楚的沉重。" },
            { val: "某個熟悉的聲音在耳邊一閃而過，隨即消散。" },
            { val: "你努力不去想那些事，但它們還是悄悄爬進來。" },
            { val: "片刻的安靜，反而讓一切顯得更加清晰。" },
            { val: "" } // 有時就是沉默，不需要回憶
        ],

        // 補給品描述句
        supply_flavor: [
            { val: "是幾罐壓扁但還沒過期的罐頭。意外地讓你放鬆了一口氣。" },
            { val: "半瓶水和幾塊乾糧。對現在的你來說，已經是難得的財富。" },
            { val: "一個急救包，雖然不完整，但裡面的繃帶完好無損。" },
            { val: "一些散落的硬幣，還有一張折疊的地圖殘片。" },
            { val: "某種你認不出來的乾燥食物。聞起來還行，你決定先不多想。" },
            { val: "幾根火柴和一截蠟燭。黑暗中，這比食物還要珍貴。" }
        ],

        // 隱密空間描述
        hidden_space_desc: [
            { val: "一個半人高的暗格，用舊木板偽裝得相當仔細" },
            { val: "夾牆之間的狹窄空隙，剛好能容下一個人側身通過" },
            { val: "地板下方的淺坑，用布料遮住了入口" },
            { val: "書架後方旋轉露出的小型儲藏空間" },
            { val: "壁爐底部往裡延伸的隱藏凹槽" },
            { val: "一扇偽裝成牆壁的低矮暗門" }
        ],

        // 機關預警句
        trap_warning: [
            { val: "地板上有細微的壓痕，排列得過於規律。" },
            { val: "門框旁有一根幾乎看不見的細線，連著什麼東西。" },
            { val: "入口附近散落著奇怪的粉末，不像是自然堆積的。" },
            { val: "你注意到天花板上有幾個不自然的小孔，正對著走道。" },
            { val: "空氣裡有一股微弱的金屬氣息，讓你的直覺發出警告。" },
            { val: "地上的灰塵被人為清掃過，範圍剛好是門口的一個弧形。" }
        ],

        // NPC給物品的理由
        npc_gift_reason: [
            { val: "「你看起來需要這個，比我更需要。」對方沒有解釋更多。" },
            { val: "「拿著。我不需要它了。」話裡有某種說不清楚的意味。" },
            { val: "「這是交易。你之前幫過我，雖然你不記得了。」" },
            { val: "對方什麼都沒說，只是把東西放在你面前，然後轉身離去。" },
            { val: "「前面不好走。這個或許能讓你走得遠一點。」" },
            { val: "「留著它。如果你到了那裡，你就會知道怎麼用。」" }
        ],

        // 物品使用後效果描述
        item_use_effect: [
            { val: "傷口的疼痛稍微緩和了些，你感覺自己能夠繼續走下去。" },
            { val: "一股溫熱從腹中散開，身體的疲憊感減輕了一些。" },
            { val: "你感到頭腦清醒了幾分，剛才混亂的思緒稍微理清了。" },
            { val: "效果比你預期的更好——或者，只是你太需要它了。" },
            { val: "說不上什麼感覺，但確實比剛才好一點了。" },
            { val: "你不確定它是否真的有用，但心裡踏實了一些。" }
        ],

    });

    console.log("✅ data_sentences.js 已載入");
})();