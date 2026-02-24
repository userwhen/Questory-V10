/* js/story_data/story_horror.js */
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
        // [BLOCK B] 👻 現代心理恐怖流 (Asian Psychological Horror)
        // ============================================================
        {
            type: 'setup_omen', id: 'hor_psych_setup',
            // [修正] 改用 {sentence_env_vibe} 確保文法通順
            text: { zh: [ "這裡本該是你熟悉的{noun_location_room}，但此刻看起來卻異常陌生。", "{sentence_env_vibe}，牆角的陰影似乎比平常更深、更濃。", "你{atom_manner}停下腳步，總覺得有某種視線正在從{noun_env_feature}的縫隙中窺視著你。" ]},
            dialogue: [{ speaker: "旁白", text: { zh: "（耳邊傳來一陣若有似無的竊笑聲，聽起來既像老人，又像嬰兒...）" } }],
            options: [
                { label: "強裝鎮定，忽視對方", action: "advance_chain", rewards: { tags: ['horror_started'], varOps: [{ key: 'sanity', val: 90, op: 'set' }] } },
                { label: "檢查聲音的來源", action: "advance_chain", rewards: { tags: ['horror_started', 'marked_by_curse'], varOps: [{ key: 'sanity', val: 80, op: 'set' }] }, nextScene: { text: "你湊近一看，那裡什麼都沒有，只有一團糾結的黑色髮絲，散發著腥臭味。" } }
            ]
        },
        {
            type: 'encounter_stalk', id: 'hor_psych_stalk',
            // [修正] 移除未定義的 verb_move_univ
            text: { zh: [ "你試圖離開，但走廊彷彿沒有盡頭。身後傳來了「啪嗒、啪嗒」的濕黏腳步聲。", "那聲音極不規律，就像是某種肢體扭曲的東西，正手腳並用在地上{atom_manner}爬行。", "對方正在逼近，而且對方知道你在哪裡。" ]},
            dialogue: [{ speaker: "？？？", text: { zh: "嘻嘻... 找到... 你了..." } }],
            options: [
                // [修正] 將 nextTags 改為標準的 rewards: { tags: [...] }
                { label: "屏住呼吸，躲進死角", style: "primary", check: { stat: 'INT', val: 5 }, action: "advance_chain", nextScene: { text: "你摀住口鼻，心臟劇烈跳動。那東西停在你的藏身處外，發出了指甲刮擦地板的聲音... 然後慢慢離開了。" }, failScene: { text: "恐懼讓你發出了喘息聲。那腳步聲立刻停了下來，然後猛地轉向你！", rewards: { tags: ['danger_high'], varOps: [{key:'sanity', val:20, op:'-'}] } } },
                { label: "不要回頭，狂奔！", action: "advance_chain", rewards: { tags: ['risk_high'] }, nextScene: { text: "你{atom_manner}向前衝刺，感覺冰冷的手指擦過了你的後頸..." } }
            ]
        },
        {
            type: 'encounter_climax', id: 'hor_psych_look',
            // [修正] 將 noun_role_monster 對齊核心庫的 noun_monster
            text: { zh: [ "無路可退了。那個{noun_monster}（或者說是曾經是人的東西）就懸掛在天花板上。", "對方的頭顱以詭異的角度轉了180度，死白色的眼珠正死死盯著你。", "所有的本能都在尖叫：絕對不能和對方對視。" ]},
            options: [
                { label: "緊閉雙眼，唸誦祈禱", action: "advance_chain", check: { stat: 'LUK', val: 5 }, nextScene: { text: "你感到一股冰冷的氣息貼著臉頰滑過，耳邊是骨骼摩擦的脆響... 但最終，對方似乎對靜止的獵物失去了興趣。" }, failScene: { text: "你忍不住睜開了一條縫... 一張布滿血絲的臉正貼在你的鼻尖前，露出了裂到耳根的笑容。", rewards: { varOps: [{key:'sanity', val:50, op:'-'}] } } },
                { label: "用手電筒強光照射對方！", style: "danger", action: "finish_chain", nextScene: { text: "光線照亮了對方的全貌——那景象超越了人類理智的極限。你的意識在尖叫中斷線了。\n【結局：精神崩潰】" } }
            ]
        },
        {
            type: 'final_survival', id: 'hor_psych_end',
            text: { zh: [ "不知道過了多久，周圍終於恢復了死寂。你{atom_manner}推開門，衝進了外面的陽光中。", "人群的喧囂聲讓你感到一陣恍惚。你以為你逃掉了。", "但當你低頭看時，發現自己的腳踝上，多了一個青紫色的手印，而且...還在發燙。" ]},
            options: [{ label: "這只是一個開始...", action: "finish_chain", rewards: { removeTags: ['horror_started', 'danger_high'], title: "倖存者(？)", exp: 300 } }]
        },
        
        // ============================================================
        // [通用擴充] 其他懸疑/恐怖開場
        // ============================================================
        {
            type: 'setup',
            id: 'mys_setup_letter',
            text: { zh: [
                "一切都始於那封奇怪的信。",
                "信上說，關於真相，就藏在這座莊園裡。",
                "外面的{atom_weather}讓這一切顯得更加詭異。"
            ]},
            options: [
                { label: "推開莊園大門", action: "advance_chain" }
            ]
        },
        {
            type: 'setup_omen', 
            id: 'hor_setup_omen',
            text: { zh: [
                "你不該來這裡的。",
                "{atom_weather}，你的車拋錨在了半路。",
                "遠處那棟廢棄的{combo_building}似乎是你唯一的避難所。"
            ]},
            options: [
                { label: "硬著頭皮進去", action: "advance_chain" }
            ]
        },
		// ==========================================
        // 第一階：開局 (隨機抽中，發放路線標籤)
        // ==========================================
        {
            type: 'setup_omen', 
            id: 'hor_cult_setup',
            // 這裡不寫 reqTag，讓系統在開局時有機會隨機抽到它
            text: { zh: [ 
                "你迷路了。眼前出現了一個與世隔絕的村落，村口立著一尊面目猙獰的詭異神像。",
                "村民們直勾勾地盯著你，嘴裡唸著你聽不懂的咒語。",
                "你感覺到一陣強烈的惡寒..." 
            ]},
            options: [
                { 
                    label: "硬著頭皮進村", 
                    action: "node_next", 
                    // 【關鍵1】發放路線標籤 (route_cult)，並初始化理智值
                    rewards: { tags: ['route_cult'], varOps: [{key:'sanity', val:100, op:'set'}] },
                    nextScene: { text: "你踏入了村莊，身後的霧氣瞬間合攏，退路消失了。", options: [{label: "繼續", action: "advance_chain"}] }
                }
            ]
        },

        // ==========================================
        // 第二階：探索 (使用 reqTag 鎖定路線)
        // ==========================================
        {
            type: 'encounter_stalk', 
            id: 'hor_cult_explore',
            // 【關鍵2】reqTag 確保只有身上有 'route_cult' 的玩家才會抽到這個場景
            reqTag: 'route_cult',
            text: { zh: [ 
                "你在村長的空屋裡搜查。屋內貼滿了黃色的符紙，神桌上放著一個木盒。",
                "突然，門外傳來了密集的腳步聲，村民們包圍了屋子！" 
            ]},
            options: [
                { 
                    label: "打開木盒看看", 
                    action: "node_next", 
                    // 玩家做對了選擇，獲得了隱藏道具 Tag：talisman (護身符)
                    rewards: { tags: ['talisman'] },
                    nextScene: { text: "盒子裡是一張畫著血色眼睛的護身符，你趕緊把它塞進口袋。", options: [{label: "準備突圍", action: "advance_chain"}] }
                },
                { 
                    label: "躲進床底", 
                    action: "node_next", 
                    // 玩家錯過了道具，且因為恐懼扣除理智值
                    rewards: { varOps: [{key:'sanity', val:40, op:'-'}] },
                    nextScene: { text: "你躲在床底，看著無數雙赤腳在房間裡走動，恐懼讓你的理智開始崩潰。", options: [{label: "尋找機會逃跑", action: "advance_chain"}] }
                }
            ]
        },

        // ==========================================
        // 第三階：高潮 (使用 condition 檢驗生死)
        // ==========================================
        {
            type: 'encounter_climax', 
            id: 'hor_cult_boss',
            reqTag: 'route_cult',
            text: { zh: [ 
                "你被村民逼到了祭壇前。那個面目猙獰的神像竟然活了過來，巨大的陰影將你籠罩。",
                "「留下來... 成為我們的一部分...」",
                "你的意識開始模糊，生死就在一線之間！" 
            ]},
            options: [
                // 【關鍵3 - 完美結局】
                // condition: 同時要求「擁有護身符 (tags)」且「理智值大於等於 60 (vars)」
                { 
                    label: "高舉護身符念出破除咒語！", 
                    condition: { tags: ['talisman'], vars: [{key:'sanity', val:60, op:'>='}] },
                    style: "primary", 
                    action: "finish_chain", 
                    nextScene: { text: "護身符爆發出刺眼的光芒，神像發出淒厲的慘叫並崩解！你趁亂逃出了村莊。\n【True End: 破除邪祟】" }
                },

                // 【關鍵4 - 慘勝結局】
                // condition: 有護身符，但理智值已經太低 (<60)
                { 
                    label: "胡亂揮舞護身符求生", 
                    condition: { tags: ['talisman'], vars: [{key:'sanity', val:60, op:'<'}] },
                    action: "finish_chain", 
                    nextScene: { text: "護身符雖然逼退了村民，但你的精神已經受到不可逆的重創。\n【Normal End: 瘋狂的倖存者】" }
                },

                // 【關鍵5 - 保底壞結局 (防呆設計)】
                // 注意這裡不寫 condition，代表只要前面兩個選項不符合，玩家就只能被迫按這個按鈕
                { 
                    label: "無路可逃，絕望閉上眼睛", 
                    style: "danger", 
                    action: "finish_chain", 
                    nextScene: { text: "你連抵抗的力氣都沒有了。黑暗徹底吞噬了你，你成為了村莊的新祭品。\n【Bad End: 永遠的村民】" }
                }
            ]
        },
		
    );

    console.log("🕵️‍♂️ 恐怖劇本已載入");
})();