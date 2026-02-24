/* js/story_data/story_romance.js (V84 多路線共存版) */
(function() {
    const DB = window.FragmentDB;
    if (!DB) {
        console.error("❌ 錯誤：找不到 FragmentDB，請確認 story_data_core.js 已優先載入。");
        return;
    }

    DB.templates.push(

        // ============================================================
        // 💖 [路線 A] 經典浪漫 (Classic) - 權力與守護
        // ============================================================
        
        {
            type: 'love_meet', id: 'rom_meet_classic',
            text: { zh: [ "在{noun_location_building}的{noun_location_room}，你正專注於手中的事務。", "突然，一位{lover}因躲避人群而撞到了你懷裡，帶著一股淡淡的香氣。", "就在這時，遠處傳來了{rival}尖銳的聲音：「在那裡！別讓那個『小偷』跑了！」", "這似乎是一場誤會，但卻將你捲入了風暴中心。" ]},
            options: [
                { 
                    label: "挺身而出保護 (加好感)", action: "node_next", 
                    rewards: { tags: ['route_classic', 'tag_protector'], varOps: [{key:'love_meter', val:15, op:'set'}, {key:'trust', val:5, op:'set'}] }, 
                    nextScene: { text: "你冷靜地擋在{lover}身前，懾人的氣勢讓追兵猶豫了。{lover}抬頭看著你，眼中閃過一絲驚訝與感激。", options: [{label: "繼續", action: "advance_chain"}] } 
                },
                { 
                    label: "冷靜地協助解圍 (加信任)", action: "node_next", 
                    rewards: { tags: ['route_classic', 'tag_strategist'], varOps: [{key:'love_meter', val:5, op:'set'}, {key:'trust', val:15, op:'set'}] }, 
                    nextScene: { text: "你用幾句巧妙的謊言打發了追兵。{lover}鬆了一口氣，對你的機智印象深刻。", options: [{label: "繼續", action: "advance_chain"}] } 
                }
            ]
        },
        {
            type: 'love_bond', id: 'rom_bond_classic', reqTag: 'route_classic',
            text: { zh: [ "為了感謝你的幫助，{lover}約你在一個安靜的角落見面。", "這裡沒有{rival}的眼線。{lover}向你吐露了心聲，原來對方一直受到{rival}的打壓與排擠。", "你看著對方的側臉，心中產生了保護欲。" ]},
            options: [
                { 
                    label: "承諾成為同盟", condition: { tags: ['tag_protector'] }, action: "node_next", 
                    rewards: { varOps: [{key:'love_meter', val:15, op:'+'}, {key:'trust', val:10, op:'+'}] }, 
                    nextScene: { text: "你們的手指不經意間碰在了一起。從今天起，你們是共犯，也是彼此的依靠。", options: [{label: "繼續", action: "advance_chain"}] } 
                },
                { 
                    label: "提供戰術建議", condition: { tags: ['tag_strategist'] }, action: "node_next", 
                    rewards: { varOps: [{key:'trust', val:20, op:'+'}, {key:'love_meter', val:5, op:'+'}] },
                    nextScene: { text: "你精準地分析了局勢，{lover}聽得入神，眼神中充滿了無條件的信任。", options: [{label: "繼續", action: "advance_chain"}] } 
                }
            ]
        },
        {
            type: 'love_date', id: 'rom_date_classic', reqTag: 'route_classic',
            text: { zh: [ "結盟後的日子裡，你們有了更多獨處的機會。", "今天，{lover}帶著你來到了一處秘密的{noun_location_room}，那是對方放鬆心情的避風港。", "陽光灑在兩人身上，氣氛變得有些曖昧..." ]},
            options: [
                { 
                    label: "談論彼此的過去", action: "node_next", rewards: { varOps: [{key:'trust', val:15, op:'+'}] }, 
                    nextScene: { text: "你們分享了彼此不為人知的過去。兩顆心靠得更近了。", options: [{label: "繼續", action: "advance_chain"}] } 
                }
            ]
        },
        {
            type: 'love_scheme', id: 'rom_scheme_classic', reqTag: 'route_classic',
            text: { zh: [ "平靜的日子被打破了。{noun_location_building}裡開始流傳關於你的惡毒謠言。", "謠言的源頭直指{rival}。更糟糕的是，{rival}拿著一份偽造的{noun_item_record}找到了{lover}，試圖證明你接近他是別有用心。" ]},
            dialogue: [{ speaker: "{rival}", text: { zh: "看清楚了吧？這個人只是在利用你！只有我才是真正為你好。" } }],
            options: [
                { 
                    label: "暗中調查，尋找破綻", action: "node_next", rewards: { tags: ['counter_ready'] }, 
                    nextScene: { text: "你強忍怒火，按兵不動，終於在{rival}的心腹那裡找到了偽造證據的線索。", options: [{label: "繼續", action: "advance_chain"}] } 
                }
            ]
        },
        {
            type: 'love_crisis', id: 'rom_crisis_classic', reqTag: 'route_classic',
            text: { zh: [ "謠言發酵後，你終於見到了{lover}。", "對方的神情顯得疲憊且掙扎，手中緊緊握著那份偽造的{noun_item_record}。", "「告訴我... 那些流言都不是真的，對吧？」" ]},
            options: [
                { 
                    label: "出示調查到的線索", condition: { tags: ['counter_ready'] }, action: "node_next", rewards: { varOps: [{key:'trust', val:10, op:'+'}] },
                    nextScene: { text: "你冷靜地展示了{rival}偽造證據的線索。{lover}恍然大悟，對{rival}的行為感到憤怒。", options: [{label: "繼續", action: "advance_chain"}] } 
                },
                { 
                    label: "「難道你不相信我嗎？」", condition: { vars: [{key:'trust', val:25, op:'>='}] }, action: "node_next", 
                    nextScene: { text: "{lover}深吸了一口氣，將紀錄撕成碎片。「我相信你，一直都相信。」", options: [{label: "繼續", action: "advance_chain"}] } 
                }
            ]
        },
        {
            type: 'love_counter', id: 'rom_counter_classic', reqTag: 'route_classic',
            text: { zh: [ "這是一場盛大的聚會，所有人都在場。", "{rival}正得意洋洋地高談闊論，準備將你徹底逐出社交圈。", "這是最後的機會，你要如何挽回局面？" ]},
            options: [
                { 
                    label: "當眾揭穿陰謀 (需反擊標籤)", condition: { tags: ['counter_ready'] }, style: "primary", action: "node_next", rewards: { varOps: [{key:'love_meter', val:20, op:'+'}] }, 
                    nextScene: { text: "你拿出了決定性的證據，駁斥了所有謊言。{rival}臉色慘白，狼狽逃離。", options: [{label: "繼續", action: "advance_chain"}] } 
                }
            ]
        },
        {
            type: 'love_confession', id: 'rom_end_classic', reqTag: 'route_classic',
            text: { zh: [ "風波終於平息。在月光下，你和{lover}再次來到了初遇的地方。", "經歷了這一切，你們之間的羈絆已經面臨最終的考驗。", "{lover}靜靜地看著你，等待著你的回應。" ]},
            options: [
                { 
                    label: "「我們是最佳拍檔，也是戀人。」", condition: { vars: [{key:'love_meter', val:40, op:'>='}] }, style: "primary", action: "finish_chain", 
                    nextScene: { text: "【True End: 權力與愛情】\n{lover}笑著吻了你。「沒錯，只要我們聯手，沒有人能將我們分開。」", rewards: { exp: 1200, title: "社交界霸主" } } 
                },
                { 
                    label: "默然離去", action: "finish_chain", 
                    nextScene: { text: "【Bad End: 錯過的緣分】\n先前的裂痕太深。你轉身離開，留下了一個孤獨的背影。" } 
                }
            ]
        },

        // ============================================================
        // 🍷 [路線 B] 危險糾纏 (Triangle) - 慾望與背德
        // ============================================================

        {
            type: 'love_meet', id: 'rom_meet_triangle',
            text: { zh: [ "在昏暗的{noun_location_room}，爵士樂慵懶地流淌。你正與{lover}低聲交談，氣氛微醺且曖昧。", "突然，一個帶著極強侵略性氣息的身影拉開了旁邊的椅子——是{rival}。", "「不介意我加入吧？」對方雖然笑著，眼神卻直勾勾地盯著你，讓{lover}的臉色瞬間沉了下來。" ]},
            dialogue: [{ speaker: "{lover}", text: { zh: "你怎麼會來這裡？我以為我們說清楚了。" } }],
            options: [
                { 
                    label: "冷漠拒絕對方 (專一)", action: "node_next", 
                    rewards: { tags: ['route_triangle'], varOps: [{key:'loyalty', val:20, op:'set'}, {key:'desire', val:0, op:'set'}] }, 
                    nextScene: { text: "你冷冷地看著{rival}。「抱歉，我們想要獨處。」{rival}挑了挑眉，似笑非笑地離開了。", options: [{label: "繼續", action: "advance_chain"}] } 
                },
                { 
                    label: "默許對方坐下 (曖昧)", action: "node_next", 
                    rewards: { tags: ['route_triangle'], varOps: [{key:'loyalty', val:0, op:'set'}, {key:'desire', val:20, op:'set'}, {key:'stress', val:10, op:'+'}] }, 
                    nextScene: { text: "你沒有說話。{rival}順勢坐下，膝蓋在桌下似有若無地碰觸著你。空氣中瀰漫著危險的拉扯感。", options: [{label: "繼續", action: "advance_chain"}] } 
                }
            ]
        },
        {
            type: 'love_bond', id: 'rom_bond_triangle', reqTag: 'route_triangle',
            text: { zh: [ "{atom_time}，{lover}暫時離開了座位去接電話。", "{rival}立刻湊近，指尖帶著微涼的溫度，輕輕劃過你的手背。", "「你真的甘心和那種無趣的人在一起嗎？」對方的聲音帶著致命的誘惑，空氣中瀰漫著{atom_smell}。" ]},
            options: [
                { 
                    label: "抽回手並警告對方 (忠誠)", action: "node_next", rewards: { varOps: [{key:'loyalty', val:15, op:'+'}] }, 
                    nextScene: { text: "「請你放尊重點。」你語氣堅定。{rival}收回手，眼底卻閃過一絲更深的佔有慾。", options: [{label: "繼續", action: "advance_chain"}] } 
                },
                { 
                    label: "沒有閃躲，迎上視線 (沉淪)", action: "node_next", rewards: { varOps: [{key:'desire', val:20, op:'+'}, {key:'guilt', val:15, op:'+'}] },
                    nextScene: { text: "你沒有推開。兩人的呼吸交錯，在{lover}轉身回來的前一秒，{rival}才滿意地退開。", options: [{label: "繼續", action: "advance_chain"}] } 
                }
            ]
        },
        {
            type: 'love_date', id: 'rom_date_triangle', reqTag: 'route_triangle',
            text: { zh: [ "幾天後的一個{atom_weather}，你在{noun_location_building}的屋簷下躲雨。", "一輛熟悉的車停在面前，車窗搖下，是{rival}那張帶著玩味笑容的臉。", "「上車嗎？還是你要在這裡打給正在忙的{lover}？」" ]},
            options: [
                { 
                    label: "堅持等{lover} (拒絕誘惑)", action: "node_next", rewards: { varOps: [{key:'loyalty', val:20, op:'+'}] }, 
                    nextScene: { text: "你看著車窗緩緩升起，心中的大石落下。不久後，{lover}撐著傘，氣喘吁吁地跑向了你。", options: [{label: "繼續", action: "advance_chain"}] } 
                },
                { 
                    label: "上了{rival}的車 (危險發展)", action: "node_next", rewards: { varOps: [{key:'desire', val:30, op:'+'}, {key:'guilt', val:25, op:'+'}] }, 
                    nextScene: { text: "車窗外的雨景變得模糊。密閉的空間裡，{rival}的香氣將你完全包裹。你知道自己越界了。", options: [{label: "繼續", action: "advance_chain"}] } 
                }
            ]
        },
        {
            type: 'love_scheme', id: 'rom_scheme_triangle', reqTag: 'route_triangle',
            text: { zh: [ "紙終究包不住火。在一次盛大的晚宴上，{lover}在你的手機裡看到了{rival}傳來的曖昧訊息。", "「你們到底是什麼關係？！」{lover}的聲音顫抖著，引來了周圍人的側目。", "而{rival}就站在不遠處，舉著酒杯，彷彿在看一場好戲。" ]},
            options: [
                { 
                    label: "立刻解釋，切斷與{rival}的聯繫", action: "node_next", rewards: { varOps: [{key:'loyalty', val:10, op:'+'}, {key:'guilt', val:10, op:'-'}] }, 
                    nextScene: { text: "你極力安撫{lover}的情緒，並當面封鎖了{rival}。遠處的{rival}臉色終於變了。", options: [{label: "繼續", action: "advance_chain"}] } 
                },
                { 
                    label: "沉默以對 (關係破裂)", action: "node_next", rewards: { tags: ['relationship_broken'], varOps: [{key:'loyalty', val:50, op:'-'}] }, 
                    nextScene: { text: "你的沉默成了最鋒利的刀。{lover}眼眶泛紅，轉身衝出了會場。", options: [{label: "繼續", action: "advance_chain"}] } 
                }
            ]
        },
        {
            type: 'love_crisis', id: 'rom_crisis_triangle', reqTag: 'route_triangle',
            text: { zh: [ "晚宴後的{noun_location_room}，氣氛降至冰點。你被{lover}逼到了牆角，對方眼中的愛意與嫉妒交織成瘋狂的佔有慾。", "「說你只屬於我，否則我不知道我會做出什麼事...」", "與此同時，門外傳來了{rival}漫不經心的敲門聲：「還好嗎？需要我『幫忙』嗎？」" ]},
            options: [
                { 
                    label: "抱緊{lover}安撫對方", condition: { vars: [{key:'loyalty', val:30, op:'>='}] }, action: "node_next", 
                    nextScene: { text: "你緊緊抱住對方，承諾不再動搖。門外的敲門聲停了，隨後是離去的腳步聲。", options: [{label: "繼續", action: "advance_chain"}] } 
                },
                { 
                    label: "推開{lover}，走向門外", condition: { vars: [{key:'desire', val:40, op:'>='}] }, action: "node_next", 
                    nextScene: { text: "你拉開門，撞進了{rival}的懷裡。身後傳來了{lover}心碎的聲音，但你已經無法回頭。", options: [{label: "繼續", action: "advance_chain"}] } 
                }
            ]
        },
        {
            type: 'love_counter', id: 'rom_counter_triangle', reqTag: 'route_triangle',
            text: { zh: [ "三個人的遊戲必須結束。你將{lover}與{rival}同時約到了初遇的那個{noun_location_room}。", "空氣中充滿了火藥味，兩人的目光都鎖定在你身上，等待著最終的判決。" ]},
            options: [
                { label: "深呼吸，做出決定", action: "advance_chain" }
            ]
        },
        {
            type: 'love_confession', id: 'rom_end_triangle', reqTag: 'route_triangle',
            text: { zh: [ "塵埃落定。這段充滿拉扯、試探與背德的關係，終於迎來了終局。" ]},
            options: [
                { 
                    label: "走向 {lover} (選擇正緣)", condition: { vars: [{key:'loyalty', val:40, op:'>='}] }, style: "primary", action: "finish_chain", 
                    nextScene: { text: "【結局：破鏡重圓】\n你最終斬斷了誘惑，選擇了最初的那個人。雖然有過裂痕，但你們決定重新開始。", rewards: { exp: 1000 } } 
                },
                { 
                    label: "走向 {rival} (選擇危險)", condition: { vars: [{key:'desire', val:40, op:'>='}] }, style: "danger", action: "finish_chain", 
                    nextScene: { text: "【結局：致命誘惑】\n你牽起了{rival}的手，將理智拋諸腦後。這是一段危險的關係，但你甘之如飴。", rewards: { exp: 1000, title: "背德者" } } 
                },
                { 
                    label: "「我全都要。」(修羅場)", condition: { vars: [{key:'desire', val:40, op:'>='}, {key:'guilt', val:20, op:'>='}] }, style: "danger", action: "finish_chain", 
                    nextScene: { text: "【結局：深淵之主】\n你笑著對兩人伸出手。令人驚訝的是，他們竟然都妥協了。你成為了這場瘋狂遊戲的最終贏家。", rewards: { exp: 2000, title: "修羅場之主" } } 
                },
                { 
                    label: "轉身離開 (一無所有)", action: "finish_chain", 
                    nextScene: { text: "【結局：孤獨的逃兵】\n這段糾纏讓你身心俱疲。你拒絕了所有人，獨自消失在茫茫人海中。", rewards: { exp: 300 } } 
                }
            ]
        }
    );

    console.log("💖 戀愛劇本(雙路線)已載入");
})();