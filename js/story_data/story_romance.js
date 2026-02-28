/* js/story_data/story_romance.js (V5 語法與不倫戀擴充版) */
(function() {
    const DB = window.FragmentDB;
    if (!DB) {
        console.error("❌ 錯誤：找不到 FragmentDB，請確認 story_data_core.js 已優先載入。");
        return;
    }

    DB.templates = DB.templates || [];

    DB.templates.push(

        // ============================================================
        // 💖 [路線 A] 經典浪漫 (Classic) - 權力與守護
        // ============================================================
        
        {
            type: 'romance_start', id: 'rom_meet_classic',
            reqTags: ['struct_romance'],
            dialogue: [ 
                { text: { zh: "在{env_building}的{env_room}裡，你正專注於手中的事務。" } },
                { text: { zh: "突然，一名{identity_modifier}{actor_lover}因躲避人群而撞到了你懷裡，帶著一股淡淡的香氣。" } },
                { speaker: "{actor_rival}", text: { zh: "在那裡！別讓那個傢伙跑了！" } },
                { text: { zh: "這似乎是一場誤會，但遠處傳來{actor_rival}尖銳的聲音，將你捲入了風暴中心。" } }
            ],
            options: [
                { 
                    label: "挺身而出保護 (加好感)", action: "node_next", 
                    rewards: { tags: ['route_classic', 'tag_protector'], varOps: [{key:'love_meter', val:15, op:'set'}, {key:'trust', val:5, op:'set'}] }, 
                    nextScene: { dialogue: [{ text: { zh: "你冷靜地擋在{actor_lover}身前，懾人的氣勢讓追兵猶豫了。對方抬頭看著你，眼中閃過一絲驚訝與感激。" } }], options: [{label: "繼續", action: "advance_chain"}] } 
                },
                { 
                    label: "冷靜地協助解圍 (加信任)", action: "node_next", 
                    rewards: { tags: ['route_classic', 'tag_strategist'], varOps: [{key:'love_meter', val:5, op:'set'}, {key:'trust', val:15, op:'set'}] }, 
                    nextScene: { dialogue: [{ text: { zh: "你用幾句巧妙的謊言打發了追兵。{actor_lover}鬆了一口氣，對你的機智印象深刻。" } }], options: [{label: "繼續", action: "advance_chain"}] } 
                }
            ]
        },
        {
            type: 'romance_mid', id: 'rom_bond_classic', reqTags: ['route_classic'],
            dialogue: [ 
                { text: { zh: "為了感謝你的幫助，{actor_lover}約你在一個安靜的角落見面。" } },
                { text: { zh: "這裡沒有{actor_rival}的眼線。對方逐漸向你吐露了心聲，原來一直受到{actor_rival}的打壓與排擠。" } },
                { text: { zh: "你看著對方的側臉，心中產生了強烈的保護欲。" } }
            ],
            options: [
                { 
                    label: "承諾成為同盟", condition: { tags: ['tag_protector'] }, action: "node_next", 
                    rewards: { varOps: [{key:'love_meter', val:15, op:'+'}, {key:'trust', val:10, op:'+'}] }, 
                    nextScene: { dialogue: [{ text: { zh: "你們的手指不經意間碰在了一起。從今天起，你們是共犯，也是彼此的依靠。" } }], options: [{label: "繼續", action: "advance_chain"}] } 
                },
                { 
                    label: "提供戰術建議", condition: { tags: ['tag_strategist'] }, action: "node_next", 
                    rewards: { varOps: [{key:'trust', val:20, op:'+'}, {key:'love_meter', val:5, op:'+'}] },
                    nextScene: { dialogue: [{ text: { zh: "你精準地分析了局勢，{actor_lover}聽得入神，眼神中充滿了無條件的信任。" } }], options: [{label: "繼續", action: "advance_chain"}] } 
                }
            ]
        },
        {
            type: 'romance_adv', id: 'rom_date_classic', reqTags: ['route_classic'],
            dialogue: [ 
                { text: { zh: "結盟後的日子裡，你們有了更多獨處的機會。" } },
                { text: { zh: "今天，{actor_lover}帶著你來到了一處秘密的{env_feature}，那是對方放鬆心情的避風港。" } },
                { text: { zh: "{env_light}灑在兩人身上，氣氛變得有些曖昧..." } }
            ],
            options: [
                { 
                    label: "談論彼此的過去", action: "node_next", rewards: { varOps: [{key:'trust', val:15, op:'+'}] }, 
                    nextScene: { dialogue: [{ text: { zh: "你們分享了彼此不為人知的過去。兩顆心靠得更近了。" } }], options: [{label: "繼續", action: "advance_chain"}] } 
                }
            ]
        },
        {
            type: 'romance_climax', id: 'rom_crisis_classic', reqTags: ['route_classic'],
            dialogue: [ 
                { text: { zh: "平靜的日子被打破了。這座{env_building}裡開始流傳關於你的惡毒謠言。" } },
                { text: { zh: "更糟糕的是，{actor_rival}拿著一份偽造的{combo_item_simple}找到了{actor_lover}，試圖證明你接近對方是別有用心。" } },
                { speaker: "{actor_rival}", text: { zh: "看清楚了吧？這個人只是在利用你！只有我才是真正為你好。" } }
            ],
            options: [
                { 
                    label: "暗中調查，尋找破綻", action: "node_next", rewards: { tags: ['counter_ready'] }, 
                    nextScene: { dialogue: [{ text: { zh: "你強忍怒火，按兵不動，終於在{actor_rival}的心腹那裡找到了偽造證據的線索。" } }], options: [{label: "繼續", action: "advance_chain"}] } 
                },
                { 
                    label: "當面質問對方", action: "node_next", rewards: { varOps: [{key:'trust', val:10, op:'-'}] }, 
                    nextScene: { dialogue: [{ text: { zh: "你的衝動讓局勢變得更加混亂，{actor_lover}的眼神閃過一絲懷疑。" } }], options: [{label: "繼續", action: "advance_chain"}] } 
                }
            ]
        },
        {
            type: 'romance_end', id: 'rom_end_classic', reqTags: ['route_classic'],
            dialogue: [ 
                { text: { zh: "風波終於平息。在月光下，你和{actor_lover}再次來到了初遇的地方。" } },
                { text: { zh: "經歷了這一切，你們之間的羈絆已經面臨最終的考驗。" } },
                { text: { zh: "{actor_lover}靜靜地看著你，等待著你的回應。" } }
            ],
            options: [
                { 
                    label: "「我們是最佳拍檔，也是戀人。」", condition: { tags: ['counter_ready'], vars: [{key:'trust', val:30, op:'>='}] }, style: "primary", action: "finish_chain", 
                    nextScene: { dialogue: [{ text: { zh: "【True End: 權力與愛情】\n你拿出了反擊的證據徹底擊垮了對手。{actor_lover}笑著吻了你。「沒錯，只要我們聯手，沒有人能將我們分開。」" } }], rewards: { gold: 1200, title: "社交界霸主" } } 
                },
                { 
                    label: "默然離去", action: "finish_chain", 
                    nextScene: { dialogue: [{ text: { zh: "【Bad End: 錯過的緣分】\n先前的裂痕太深。你轉身離開，留下了一個孤獨的背影。" } }] } 
                }
            ]
        },

        // ============================================================
        // 🍷 [路線 B] 危險糾纏 (Triangle) - 慾望與背德
        // ============================================================

        {
            type: 'romance_start', id: 'rom_meet_triangle',
            reqTags: ['struct_romance'],
            dialogue: [
                { text: { zh: "在昏暗的{env_room}，你正與{actor_lover}低聲交談，氣氛微醺且曖昧。" } },
                { text: { zh: "突然，一個帶著極強侵略性氣息的身影拉開了旁邊的椅子——是{actor_rival}。" } }, 
                { text: { zh: "「不介意我加入吧？」對方雖然笑著，眼神卻直勾勾地盯著你，讓{actor_lover}的臉色瞬間沉了下來。" } }, 
                { speaker: "{actor_lover}", text: { zh: "你怎麼會來這裡？我以為我們說清楚了。" } }
            ],
            options: [
                { 
                    label: "冷漠拒絕對方 (專一)", action: "node_next", 
                    rewards: { tags: ['route_triangle'], varOps: [{key:'loyalty', val:20, op:'set'}, {key:'desire', val:0, op:'set'}] }, 
                    nextScene: { dialogue: [{ text: { zh: "你冷冷地看著{actor_rival}。「抱歉，我們想要獨處。」對方挑了挑眉，似笑非笑地離開了。" } }], options: [{label: "繼續", action: "advance_chain"}] } 
                },
                { 
                    label: "默許對方坐下 (曖昧)", action: "node_next", 
                    rewards: { tags: ['route_triangle'], varOps: [{key:'loyalty', val:0, op:'set'}, {key:'desire', val:20, op:'set'}, {key:'stress', val:10, op:'+'}] }, 
                    nextScene: { dialogue: [{ text: { zh: "你沒有說話。{actor_rival}順勢坐下，膝蓋在桌下似有若無地碰觸著你。空氣中瀰漫著危險的拉扯感。" } }], options: [{label: "繼續", action: "advance_chain"}] } 
                }
            ]
        },
        {
            type: 'romance_mid', id: 'rom_bond_triangle', reqTags: ['route_triangle'],
            dialogue: [ 
                { text: { zh: "{atom_time}，{actor_lover}暫時離開了座位去接電話。" } },
                { text: { zh: "{actor_rival}立刻湊近，指尖帶著微涼的溫度，輕輕劃過你的手背。" } },
                { text: { zh: "「你真的甘心和那種無趣的人在一起嗎？」對方的聲音帶著致命的誘惑，空氣中瀰漫著{env_smell}。" } }
            ],
            options: [
                { 
                    label: "抽回手並警告對方 (忠誠)", action: "node_next", rewards: { varOps: [{key:'loyalty', val:15, op:'+'}] }, 
                    nextScene: { dialogue: [{ text: { zh: "「請你放尊重點。」你語氣堅定。{actor_rival}收回手，眼底卻閃過一絲更深的佔有慾。" } }], options: [{label: "繼續", action: "advance_chain"}] } 
                },
                { 
                    label: "沒有閃躲，迎上視線 (沉淪)", action: "node_next", rewards: { varOps: [{key:'desire', val:20, op:'+'}, {key:'guilt', val:15, op:'+'}] },
                    nextScene: { dialogue: [{ text: { zh: "你沒有推開。兩人的呼吸交錯，在{actor_lover}轉身回來的前一秒，{actor_rival}才滿意地退開。" } }], options: [{label: "繼續", action: "advance_chain"}] } 
                }
            ]
        },
        {
            type: 'romance_end', id: 'rom_end_triangle', reqTags: ['route_triangle'],
            dialogue: [ 
                { text: { zh: "塵埃落定。這段充滿拉扯、試探與背德的三人關係，終於迎來了終局。" } },
                { text: { zh: "你將兩人約到了初遇的那個{env_room}，準備做出最終的選擇。" } }
            ],
            options: [
                { 
                    label: "走向 {actor_lover} (選擇正緣)", condition: { vars: [{key:'loyalty', val:30, op:'>='}] }, style: "primary", action: "finish_chain", 
                    nextScene: { dialogue: [{ text: { zh: "【結局：破鏡重圓】\n你最終斬斷了誘惑，選擇了最初的那個人。雖然有過裂痕，但你們決定重新開始。" } }], rewards: { gold: 1000 } } 
                },
                { 
                    label: "走向 {actor_rival} (選擇危險)", condition: { vars: [{key:'desire', val:30, op:'>='}] }, style: "danger", action: "finish_chain", 
                    nextScene: { dialogue: [{ text: { zh: "【結局：致命誘惑】\n你牽起了{actor_rival}的手，將理智拋諸腦後。這是一段危險的關係，但你甘之如飴。" } }], rewards: { gold: 1000, title: "背德者" } } 
                },
                { 
                    label: "「我全都要。」(修羅場)", condition: { vars: [{key:'desire', val:40, op:'>='}, {key:'guilt', val:20, op:'>='}] }, style: "danger", action: "finish_chain", 
                    nextScene: { dialogue: [{ text: { zh: "【結局：深淵之主】\n你笑著對兩人伸出手。令人驚訝的是，他們竟然都妥協了。你成了這場瘋狂遊戲的贏家。" } }], rewards: { gold: 2000, title: "修羅場之主" } } 
                },
                { 
                    label: "轉身離開 (一無所有)", action: "finish_chain", 
                    nextScene: { dialogue: [{ text: { zh: "【結局：孤獨的逃兵】\n這段糾纏讓你身心俱疲。你拒絕了所有人，獨自消失在茫茫人海中。" } }], rewards: { gold: 300 } } 
                }
            ]
        },

        // ============================================================
        // 🥀 [路線 C] 我把我的青春給你 (Illicit) - 犧牲與不倫之戀
        // ============================================================

        {
            type: 'romance_start', id: 'rom_meet_illicit',
            reqTags: ['struct_romance'],
            dialogue: [
                { text: { zh: "在{env_room}的落地窗前，你看著玻璃中倒影的自己。幾年了？你已經記不清了。" } },
                { text: { zh: "那名{identity_modifier}{actor_lover}從背後輕輕環抱住你，空氣中瀰漫著熟悉的{env_smell}。" } },
                { text: { zh: "這是一段見不得光的關係。你把最美好的青春給了對方，換來的卻只有無盡的等待與承諾。" } },
                { speaker: "{actor_lover}", text: { zh: "再給我一點時間，我一定會把家裡的事處理好，給你一個名份..." } }
            ],
            options: [
                { 
                    label: "忍受委屈，回抱對方", action: "node_next", 
                    rewards: { tags: ['route_illicit'], varOps: [{key:'youth_given', val:20, op:'set'}, {key:'dignity', val:0, op:'set'}] }, 
                    nextScene: { dialogue: [{ text: { zh: "你像過去無數次一樣妥協了。你閉上眼，貪婪地汲取著對方給予的短暫溫暖。" } }], options: [{label: "繼續沉淪", action: "advance_chain"}] } 
                },
                { 
                    label: "輕輕推開對方 (覺醒的開端)", action: "node_next", 
                    rewards: { tags: ['route_illicit'], varOps: [{key:'youth_given', val:10, op:'set'}, {key:'dignity', val:20, op:'set'}] }, 
                    nextScene: { dialogue: [{ text: { zh: "你的動作讓對方愣住了。你看著對方的眼睛，第一次沒有給出那句「沒關係」。" } }], options: [{label: "保持距離", action: "advance_chain"}] } 
                }
            ]
        },
        {
            type: 'romance_mid', id: 'rom_bond_illicit', reqTags: ['route_illicit'],
            dialogue: [
                { text: { zh: "為了彌補昨晚的失約，{actor_lover}送了你一個昂貴的{combo_item_simple}作為補償。" } },
                { text: { zh: "看著這份精美的禮物，你卻感覺它像是一副無形的枷鎖，將你牢牢鎖在這個見不得光的身份裡。" } },
                { speaker: "{actor_lover}", text: { zh: "別生氣了，這是我特地為你挑的。你知道我的心一直在你這裡。" } }
            ],
            options: [
                { 
                    label: "收下禮物並勉強微笑", action: "node_next", rewards: { varOps: [{key:'youth_given', val:15, op:'+'}] }, 
                    nextScene: { dialogue: [{ text: { zh: "你將禮物收下，對方的表情放鬆了下來。但你的心卻越發空洞。" } }], options: [{label: "繼續等待", action: "advance_chain"}] } 
                },
                { 
                    label: "「我不要禮物，我要一個答案。」", action: "node_next", rewards: { varOps: [{key:'dignity', val:15, op:'+'}] }, 
                    nextScene: { dialogue: [{ text: { zh: "對方的臉色沉了下來，語氣中帶著一絲不耐煩：「你以前不是這樣的，別無理取鬧好嗎？」" } }], options: [{label: "強忍淚水", action: "advance_chain"}] } 
                }
            ]
        },
        {
            type: 'romance_adv', id: 'rom_date_illicit', reqTags: ['route_illicit'],
            dialogue: [
                { text: { zh: "難得的{env_weather}，你們冒著風險在偏僻的{env_building}秘密約會。" } },
                { text: { zh: "氣氛剛要升溫，{actor_lover}的手機突然響了。你看見螢幕上閃爍著{actor_rival}（正牌伴侶）的名字。" } },
                { text: { zh: "對方的臉色瞬間變了，立刻接起電話，語氣變得無比溫柔。掛斷後，對方抓起外套準備離開。" } },
                { speaker: "{actor_lover}", text: { zh: "對不起，家裡出了點急事，我必須馬上回去。下次再補償你。" } }
            ],
            options: [
                { 
                    label: "默默目送對方離開", action: "node_next", rewards: { varOps: [{key:'youth_given', val:20, op:'+'}, {key:'stress', val:20, op:'+'}] }, 
                    nextScene: { dialogue: [{ text: { zh: "你點點頭，獨自留在空蕩蕩的房間裡。這就是作為「影子」的宿命。" } }], options: [{label: "陷入絕望", action: "advance_chain"}] } 
                },
                { 
                    label: "拉住對方的手：「今天別走好嗎？」", action: "node_next", rewards: { varOps: [{key:'dignity', val:10, op:'-'}, {key:'stress', val:10, op:'+'}] }, 
                    nextScene: { dialogue: [{ text: { zh: "對方用力甩開了你的手。「別鬧了！如果被發現，我們就全毀了！」門被重重關上。" } }], options: [{label: "跌坐在地", action: "advance_chain"}] } 
                }
            ]
        },
        {
            type: 'romance_climax', id: 'rom_crisis_illicit', reqTags: ['route_illicit'],
            dialogue: [
                { text: { zh: "長久以來壓抑的情緒終於來到了爆發的臨界點。" } },
                { text: { zh: "「我把我的青春都給了你！而你除了這些空頭支票，到底給過我什麼？」你聲嘶力竭地喊道。" } },
                { text: { zh: "{actor_lover}看著你，眼神複雜。就在這時，門外傳來了高跟鞋的聲音——{actor_rival}居然找上門來了！" } }
            ],
            options: [
                { 
                    label: "「帶我走，現在就走！」", condition: { vars: [{key:'youth_given', val:40, op:'>='}] }, action: "node_next", 
                    nextScene: { dialogue: [{ text: { zh: "你做出了最後的賭注。但對方只是慌亂地將你推進了衣櫃。「噓！躲好，別出聲！」" } }], options: [{label: "心如死灰", action: "advance_chain"}] } 
                },
                { 
                    label: "主動打開門迎接{actor_rival}", condition: { vars: [{key:'dignity', val:30, op:'>='}] }, action: "node_next", 
                    nextScene: { dialogue: [{ text: { zh: "你不想再躲了。你一把推開房門，直視著門外的{actor_rival}。{actor_lover}在一旁嚇得面如死灰。" } }], options: [{label: "攤牌", action: "advance_chain"}] } 
                }
            ]
        },
        {
            type: 'romance_end', id: 'rom_end_illicit', reqTags: ['route_illicit'],
            dialogue: [
                { text: { zh: "青春是一場無法回頭的豪賭。多年的糾纏，見不得光的委屈，終於到了清算的時候。" } },
                { text: { zh: "你要如何為這段關係畫下句點？" } }
            ],
            options: [
                { 
                    label: "徹底斬斷孽緣 (覺醒結局)", condition: { vars: [{key:'dignity', val:30, op:'>='}] }, style: "primary", action: "finish_chain", 
                    nextScene: { 
                        dialogue: [
                            { text: { zh: "你把那些昂貴的禮物全部退還，頭也不回地離開了這座城市。" } },
                            { text: { zh: "雖然失去了最美好的幾年，但你終於找回了自己。" } },
                            { text: { zh: "【結局：遲來的黎明】" } }
                        ], 
                        rewards: { gold: 500, title: "自由之鳥" } 
                    } 
                },
                { 
                    label: "甘願做一隻金絲雀 (沉淪結局)", condition: { vars: [{key:'youth_given', val:50, op:'>='}] }, style: "danger", action: "finish_chain", 
                    nextScene: { 
                        dialogue: [
                            { text: { zh: "你終究還是離不開對方。你收下了那棟別墅的鑰匙，接受了自己永遠只能活在陰影中的事實。" } },
                            { text: { zh: "青春已經燃盡，剩下的只有華麗的牢籠。" } },
                            { text: { zh: "【結局：折翼的金絲雀】" } }
                        ], 
                        rewards: { gold: 3000, title: "見不得光的愛" } 
                    } 
                },
                { 
                    label: "無聲的毀滅 (同歸於盡)", action: "finish_chain", 
                    nextScene: { 
                        dialogue: [
                            { text: { zh: "得不到的，那就一起毀滅吧。你將所有的證據公諸於世，讓對方身敗名裂。" } },
                            { text: { zh: "看著對方崩潰的模樣，你笑著流下了眼淚。" } },
                            { text: { zh: "【結局：燃燒的青春】" } }
                        ], 
                        rewards: { gold: 0 } 
                    } 
                }
            ]
        }

    );

    console.log("💖 戀愛劇本 (V5 多路線共存與不倫戀擴充版) 已載入");
})();