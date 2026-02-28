/* js/story_data/story_horror.js (V5 完美恐怖化升級版) */
(function() {
    const DB = window.FragmentDB;
    if (!DB) {
        console.error("❌ 錯誤：找不到 FragmentDB，請確認 story_data_core.js 已優先載入。");
        return;
    }

    DB.templates = DB.templates || [];

    DB.templates.push(
        // ============================================================
        // 🚪 【恐怖開局】 (Setup Omen)
        // ============================================================
        {
            type: 'horror_start', id: 'hor_psych_setup',
            dialogue: [
                { text: { zh: "這裡本該是你熟悉的{env_room}，但此刻看起來卻異常陌生。" } },
                { text: { zh: "{env_pack_visual}，牆角的陰影似乎比平常更深、更濃。" } },
                { text: { zh: "你停下腳步，總覺得有某種視線正在從{env_feature}的縫隙中窺視著你。" } },
                { speaker: "旁白", text: { zh: "（耳邊傳來一陣若有似無的竊笑聲，聽起來既像老人，又像嬰兒...）" } }
            ],
            options: [
                { label: "強裝鎮定，忽視對方", action: "advance_chain", rewards: { tags: ['horror_started'], varOps: [{ key: 'sanity', val: 90, op: 'set' }] } },
                { 
                    label: "檢查聲音的來源", action: "node_next", 
                    rewards: { tags: ['horror_started', 'marked_by_curse'], varOps: [{ key: 'sanity', val: 80, op: 'set' }] }, 
                    nextScene: { 
                        dialogue: [{ text: { zh: "你湊近一看，那裡什麼都沒有，只有一團糾結的黑色髮絲，散發著令人作嘔的{env_smell}。" } }],
                        options: [{ label: "繼續前進", action: "advance_chain" }]
                    } 
                }
            ]
        },
        {
            type: 'horror_start', id: 'hor_horror_start',
            dialogue: [
                { text: { zh: "你不該來這裡的。" } },
                { text: { zh: "在{env_weather}的夜晚，你的車拋錨在了半路。" } },
                { text: { zh: "遠處那棟廢棄的{env_building}似乎是你唯一的避難所，但它看起來就像一頭張開巨口的野獸。" } }
            ],
            options: [{ label: "硬著頭皮進去", action: "advance_chain" }]
        },

        // ============================================================
        // 👁️ 【壓迫與追跡】 (Encounter Stalk - 包含新加的海龜湯與無形威脅)
        // ============================================================

        // 🌟 [新增] 海龜湯：數樓層的殺手
        {
            type: 'horror_mid', id: 'hor_stalk_floor_killer',
            weight: 20,
            dialogue: [
                { text: { zh: "你透過{env_room}的窗戶往下看，街燈下有一個身穿雨衣的{actor_monster}，正用一把{item_physical_state}的斧頭狂砍著地上一團模糊的血肉。" } },
                { text: { zh: "突然，對方停下了動作，緩緩抬起頭，精準無比地與你對上了視線。" } },
                { text: { zh: "對方露出詭異的微笑，舉起沾血的手指指了指你，然後轉身走進了這棟建築的一樓大門。" } },
                { text: { zh: "一樓樓梯間的感應燈亮起... 幾秒後熄滅，接著二樓的燈亮了... 對方正在數著樓層上來找你！" } }
            ],
            options: [
                { 
                    label: "立刻鎖死房門並躲進衣櫃！ (AGI檢定)", check: { stat: 'AGI', val: 6 }, action: "node_next", 
                    nextScene: { 
                        dialogue: [
                            { text: { zh: "你剛躲進去，門外就傳來了沉重的腳步聲。「叩、叩、叩...」斧頭在門上刮擦著。" } },
                            { text: { zh: "幾分鐘後，腳步聲終於遠去，你撿回了一命。" } }
                        ],
                        options: [{ label: "趁機溜出去", action: "advance_chain" }]
                    }, 
                    failScene: { 
                        dialogue: [{ text: { zh: "你手忙腳亂地反鎖房門，但就在你轉身的瞬間，「砰！」的一聲巨響，門板被斧頭劈開了一個大洞！一隻滿佈血絲的眼睛從洞口探了進來！" } }],
                        rewards: { tags: ['danger_high'], varOps: [{key:'sanity', val:20, op:'-'}] },
                        options: [{ label: "破窗逃跑！", action: "advance_chain" }]
                    } 
                },
                { 
                    label: "抄起武器，在門後埋伏", style: "danger", check: { stat: 'STR', val: 7 }, action: "node_next",
                    nextScene: { dialogue: [{ text: { zh: "門被推開的瞬間你狠狠砸了下去！對方發出悶哼摔下樓梯，你趁機狂奔逃離。" } }], options: [{ label: "逃脫", action: "advance_chain" }] },
                    failScene: { dialogue: [{ text: { zh: "你沒能一擊打倒對方，反被對方一腳踹飛，斧頭高高舉起..." } }], rewards: { varOps: [{key:'hp', val:20, op:'-'}] }, options: [{ label: "死命掙扎", action: "advance_chain" }] }
                }
            ]
        },

        // 🌟 [新增] 無形的威脅
        {
            type: 'horror_mid', id: 'hor_stalk_invisible',
            dialogue: [
                { text: { zh: "{env_pack_sensory}" } },
                { text: { zh: "你什麼都沒看見，但你的脖子突然感受到了一陣冰冷刺骨的吐息。" } },
                { text: { zh: "某個看不見的東西，正緊緊貼在你的背後，跟著你的腳步移動。" } },
                { text: { zh: "你甚至能感覺到有幾縷冰冷的頭髮，正垂在你的肩膀上。" } }
            ],
            options: [
                { 
                    label: "裝作沒發現，繼續往前走 (MND檢定)", check: { stat: 'MND', val: 6 }, action: "node_next", 
                    nextScene: { 
                        dialogue: [{ text: { zh: "你強忍著極度的恐懼，一步一步勻速前進。過了一陣子，背後的重量消失了，那東西放過了你。" } }],
                        rewards: { varOps: [{key:'sanity', val:5, op:'+'}] },
                        options: [{ label: "全身虛脫", action: "advance_chain" }]
                    }, 
                    failScene: { 
                        dialogue: [{ text: { zh: "恐懼讓你崩潰，你忍不住發出尖叫並瘋狂拍打自己的背！但你什麼也摸不到，只有那刺骨的寒意鑽進了你的骨髓！" } }],
                        rewards: { varOps: [{key:'sanity', val:25, op:'-'}, {key:'hp', val:10, op:'-'}] },
                        options: [{ label: "陷入恐慌", action: "advance_chain" }]
                    } 
                },
                { label: "猛然回頭！", action: "advance_chain", rewards: { varOps: [{key:'sanity', val:15, op:'-'}] } }
            ]
        },

        // 原本的追跡劇情 (已替換為 V5 語法)
        {
            type: 'horror_mid', id: 'hor_psych_stalk',
            dialogue: [
                { text: { zh: "你試圖離開，但走廊彷彿沒有盡頭。身後傳來了急促的{env_sound}。" } },
                { text: { zh: "那聲音極不規律，就像是某種肢體扭曲的怪物，正手腳並用在地上爬行。" } },
                { speaker: "？？？", text: { zh: "嘻嘻... 找到... 你了..." } }
            ],
            options: [
                { label: "屏住呼吸，躲進死角", style: "primary", check: { stat: 'INT', val: 5 }, action: "advance_chain" },
                { label: "不要回頭，狂奔！", action: "advance_chain", rewards: { varOps: [{key:'energy', val:10, op:'-'}] } }
            ]
        },
        {
            type: 'horror_mid', id: 'hor_stalk_camera',
            dialogue: [
                { text: { zh: "周圍的燈光突然全部熄滅，你陷入了伸手不見五指的黑暗。" } },
                { text: { zh: "你掏出手機開啟相機的閃光燈，試圖照亮前方的路。" } },
                { text: { zh: "螢幕上顯示著前方的空蕩走廊，但當你把鏡頭稍微偏轉時——" } },
                { text: { zh: "手機螢幕裡，一個高瘦蒼白的人影，就筆直地站在你左肩的正後方！但你的肉眼明明什麼都沒看見！" } }
            ],
            options: [
                { label: "不回頭，直接轉身揮拳！(STR)", style: "danger", check: { stat: 'STR', val: 6 }, action: "advance_chain" },
                { label: "死盯著螢幕，倒退著走", action: "advance_chain", rewards: { tags: ['risk_high'] } }
            ]
        },

        // ============================================================
        // 🩸 【舊事件的恐怖變體】 (從原版探索與社交改編)
        // ============================================================
        {
            type: 'horror_adv', id: 'hor_event_bloody_locker',
            dialogue: [
                { text: { zh: "你原本想在{env_feature}尋找物資或急救包。" } },
                { text: { zh: "當你拉開門的瞬間，一具被折斷四肢、塞成球狀的屍體滾了出來，砸在你的腳邊！" } },
                { text: { zh: "最可怕的是，屍體的眼睛還在死死盯著你，嘴唇微微抽動。" } }
            ],
            options: [
                { label: "強忍嘔吐感搜身 (LUK)", check: { stat: 'LUK', val: 6 }, action: "advance_chain", rewards: { gold: 30, varOps: [{key:'sanity', val:10, op:'-'}] } },
                { label: "嚇得跌坐在地連連後退", action: "advance_chain", rewards: { varOps: [{key:'sanity', val:15, op:'-'}] } }
            ]
        },
        {
            type: 'horror_adv', id: 'hor_event_mad_survivor',
            dialogue: [
                { text: { zh: "你在{env_room}遇到了一名{actor_survivor}。對方緊緊抱著頭，渾身發抖。" } },
                { text: { zh: "你試圖搭話，對方卻猛然抬頭，用佈滿血絲的眼睛瞪著你。" } },
                { speaker: "倖存者", text: { zh: "別看牆壁... 牆壁裡有眼睛... 它們會鑽進你的腦子裡！" } },
                { text: { zh: "對方語無倫次地尖叫著，突然拿起一把碎玻璃，開始狂抓自己的臉。" } }
            ],
            options: [
                { label: "試圖制止對方 (STR)", check: { stat: 'STR', val: 6 }, action: "advance_chain" },
                { label: "對方沒救了，轉身離開", action: "advance_chain", rewards: { varOps: [{key:'sanity', val:10, op:'-'}] } }
            ]
        },

        // ============================================================
        // 💀 【高潮與結局】 (Encounter Climax & Final Survival)
        // ============================================================
        {
            type: 'horror_climax', id: 'hor_psych_look',
            dialogue: [
                { text: { zh: "無路可退了。那個{actor_monster}就懸掛在天花板上。" } },
                { text: { zh: "對方的頭顱以詭異的角度轉了180度，死白色的眼珠正死死盯著你。" } },
                { text: { zh: "所有的本能都在尖叫：絕對不能和對方對視。" } }
            ],
            options: [
                { 
                    label: "緊閉雙眼，不停祈禱 (LUK)", action: "node_next", check: { stat: 'LUK', val: 5 }, 
                    nextScene: { 
                        dialogue: [{ text: { zh: "你感到一股冰冷的氣息貼著臉頰滑過... 但最終，對方似乎對靜止的獵物失去了興趣。" } }],
                        options: [{ label: "撐過去了", action: "advance_chain" }]
                    }, 
                    failScene: { 
                        dialogue: [{ text: { zh: "你忍不住睜開了一條縫... 一張布滿血絲的臉正貼在你的鼻尖前，露出了裂到耳根的笑容。" } }],
                        rewards: { varOps: [{key:'sanity', val:50, op:'-'}] },
                        options: [{ label: "慘叫", action: "advance_chain" }]
                    } 
                },
                { 
                    label: "用手電筒強光照射對方！", style: "danger", action: "node_next", 
                    nextScene: { 
                        dialogue: [
                            { text: { zh: "光線照亮了對方的全貌——那景象超越了人類理智的極限。" } },
                            { text: { zh: "你的意識在尖叫中斷線了。\n【結局：精神崩潰】" } }
                        ],
                        options: [{ label: "陷入瘋狂", action: "finish_chain" }] 
                    } 
                }
            ]
        },
        {
            type: 'horror_climax', id: 'hor_cult_boss',
            reqTags: ['route_cult'], 
            dialogue: [ 
                { text: { zh: "你被村民逼到了祭壇前。那個面目猙獰的神像竟然活了過來，巨大的陰影將你籠罩。" } },
                { text: { zh: "「留下來... 成為我們的一部分...」" } },
                { text: { zh: "你的意識開始模糊，生死就在一線之間！" } } 
            ],
            options: [
                { 
                    label: "高舉護身符念出破除咒語！", 
                    condition: { tags: ['talisman'], vars: [{key:'sanity', val:60, op:'>='}] },
                    style: "primary", action: "node_next", 
                    nextScene: { 
                        dialogue: [
                            { text: { zh: "護身符爆發出刺眼的光芒，神像發出淒厲的慘叫並崩解！你趁亂逃出了村莊。" } },
                            { text: { zh: "【True End: 破除邪祟】" } }
                        ],
                        options: [{ label: "逃出生天", action: "finish_chain" }] 
                    }
                },
                { 
                    label: "無路可逃，絕望閉上眼睛", 
                    style: "danger", action: "node_next", 
                    nextScene: { 
                        dialogue: [
                            { text: { zh: "你連抵抗的力氣都沒有了。黑暗徹底吞噬了你，你成為了村莊的新祭品。" } },
                            { text: { zh: "【Bad End: 永遠的村民】" } }
                        ],
                        options: [{ label: "結束", action: "finish_chain" }] 
                    }
                }
            ]
        },
		{ 
		type: 'horror_climax',  // 👈 這是劇本鏈的尾端，預兆爆發時會強制走到這！
		id: 'boss_haunt_awakens', 
		// 【不被過濾】Boss 戰絕對不能被歷史紀錄濾掉
		dialogue: [
			{ text: { zh: "整棟建築的{env_sound}瞬間消失，取而代之的是令人窒息的壓迫感。" } },
			{ text: { zh: "一陣陰風吹過，{horror_chase_start}" } }, // 動態生成怪物登場
			{ text: { zh: "作祟正式開始了！你必須活下去！" } }
		], 
		options: [
			{ 
				label: "死戰到底！(STR檢定)", 
				check: { stat: 'STR', val: 8 }, 
				action: "node_next", 
				rewards: { exp: 100, gold: 50 },
				nextScene: { 
					dialogue: [{ text: { zh: "你拼盡全力擊退了怪物，成功逃出了這棟可怕的建築！" } }], 
					options: [{ label: "結束這場惡夢", action: "finish_chain" }] 
				},
				failScene: { 
					dialogue: [{ text: { zh: "你敵不過它... 你的意識逐漸模糊..." } }], 
					rewards: { varOps: [{key:'hp', val:50, op:'-'}] }, 
					options: [{ label: "眼前一黑", action: "finish_chain" }] 
				}
			},
			{ 
				// 💡 動態標籤注入魔法：如果剛好身上有神聖物品標籤，可以秒殺！
				label: "使用神聖力量驅逐！", 
				condition: { tags: ['bonus_holy'] }, 
				action: "finish_chain", 
				rewards: { exp: 200 } 
			}
		] 
		},
        {
            type: 'horror_end', id: 'hor_psych_end',
            dialogue: [
                { text: { zh: "不知道過了多久，周圍終於恢復了死寂。你推開大門，衝進了外面的陽光中。" } },
                { text: { zh: "人群的喧囂聲讓你感到一陣恍惚。你以為你逃掉了。" } },
                { text: { zh: "但當你低頭看時，發現自己的腳踝上，多了一個青紫色的手印，而且...還在發燙。" } }
            ],
            options: [{ label: "這只是一個開始...", action: "finish_chain", rewards: { title: "倖存者", gold: 30 } }]
        }
    );

    console.log("🕵️‍♂️ 恐怖劇本已載入 (V5 重構與海龜湯擴充版)");
})();