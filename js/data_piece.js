/* js/data_piece.js - V83.3 (Logic Fixed: Removed Blocking Tags) */

window.FragmentDB = {
    fragments: {
    // ============================================================
    // [Layer 0] 基底元素 (Base Elements) - 最單純的名詞與形容詞
    // ============================================================
    
    // 0-1. 物品材質與狀態
    base_mat_metal: [ { val: "黃銅" }, { val: "白銀" }, { val: "生鏽的鐵" }, { val: "漆黑的鋼" } ],
    base_mat_organic: [ { val: "皮革" }, { val: "象牙" }, { val: "不知名的骨頭" }, { val: "染血的布料" } ],
    base_state_bad: [ { val: "破碎的" }, { val: "積滿灰塵的" }, { val: "變形的" }, { val: "散發惡臭的" } ],
    base_state_good: [ { val: "精緻的" }, { val: "散發微光的" }, { val: "鑲嵌寶石的" }, { val: "保存完好的" } ],

    // 0-2. 物品本體
    base_item_tool: [ { val: "懷錶" }, { val: "提燈" }, { val: "指南針" }, { val: "打火機" } ],
    base_item_doc: [ { val: "日記本" }, { val: "契約書" }, { val: "泛黃信紙" }, { val: "舊照片" } ],
    base_item_key: [ { val: "鑰匙" }, { val: "徽章" }, { val: "戒指" }, { val: "護身符" } ],
    base_item_weapon: [ { val: "匕首" }, { val: "手斧" }, { val: "拆信刀" } ],

    // 0-3. 環境細節
    base_env_light: [ { val: "微弱的燭光" }, { val: "刺眼的閃電" }, { val: "冷冽的月光" }, { val: "忽明忽暗的燈光" } ],
    base_env_sound: [ { val: "水滴聲" }, { val: "風聲" }, { val: "老鼠的吱吱聲" }, { val: "沈悶的腳步聲" } ],
    base_env_smell: [ { val: "霉味" }, { val: "鐵鏽味" }, { val: "燒焦味" }, { val: "淡淡的香水味" } ],

    // 0-4. 角色特徵
    base_npc_trait: [ { val: "眼神銳利的" }, { val: "神色慌張的" }, { val: "面無表情的" }, { val: "滿身酒氣的" } ],
    base_npc_id: [ { val: "老人" }, { val: "年輕女子" }, { val: "流浪漢" }, { val: "穿著制服的男人" } ],

    // ============================================================
    // [Layer 1] 組合層 (Composite Layers) - 使用 {} 進行嵌套
    // ============================================================

    // 1-1. 進化版物品 (取代原本的 noun_item_common)
    // 邏輯：材質 + 物品 OR 狀態 + 物品
    noun_item_common: [
        { val: "{base_mat_metal}製的{base_item_tool}" },    // -> 黃銅製的懷錶
        { val: "{base_state_bad}{base_item_tool}" },        // -> 破碎的懷錶
        { val: "{base_mat_organic}製成的{base_item_doc}" }, // -> 皮革製成的日記本
        { val: "{base_state_good}{base_item_key}" },        // -> 精緻的鑰匙
        { val: "刻有名字的{base_item_tool}" }
    ],
    
    noun_item_weapon: [
        { val: "{base_state_bad}{base_item_weapon}" },      // -> 生鏽的匕首
        { val: "{base_mat_metal}打造的{base_item_weapon}" }, // -> 白銀打造的手斧
        { val: "沾有血跡的{base_item_weapon}" }
    ],

    // 1-2. 進化版環境氛圍 (取代原本的 adj_env_vibe)
    // 邏輯：不再只是形容詞，而是「感官描寫」
    adj_env_vibe: [
        { val: "空氣中瀰漫著{base_env_smell}" },            // -> 空氣中瀰漫著霉味
        { val: "遠處不時傳來{base_env_sound}" },            // -> 遠處不時傳來水滴聲
        { val: "在{base_env_light}的照耀下顯得格外詭異" },   // -> 在冷冽的月光的照耀下顯得格外詭異
        { val: "安靜得令人窒息" }
    ],

    // 1-3. 進化版 NPC (取代 noun_npc_generic)
    noun_npc_generic: [
        { val: "一位{base_npc_trait}{base_npc_id}" },       // -> 一位眼神銳利的老人
        { val: "躲在陰影中的{base_npc_id}" },
        { val: "似乎受了傷的{base_npc_id}" }
    ],

    // ============================================================
    // [Layer 2] 句型層 (Sentence Patterns) - 這是新功能！
    // ============================================================
    // 這些是讓你的 Templates 變得極度簡潔的關鍵

    // 描述「發現東西」的句型
    pattern_found_item: [
        { val: "你發現了{noun_item_common}。" },
        { val: "在角落裡，你撿到了一個{noun_item_common}。" },
        { val: "你的腳邊踢到了什麼，仔細一看，是{noun_item_common}。" },
        { val: "{noun_item_common}！它就這樣被隨意丟棄在這裡。" }
    ],

    // 描述「觀察環境」的句型
    pattern_look_around: [
        { val: "你環顧四周，{adj_env_vibe}。" },
        { val: "這裡{adj_env_vibe}，讓你本能地感到不安。" },
        { val: "四周一片死寂，只有{base_env_sound}迴盪在耳邊。" }
    ],

    // 描述「遭遇敵人」的句型
    pattern_enemy_appear: [
        { val: "突然，一隻{noun_role_monster}從陰影中竄了出來！" },
        { val: "你感覺到背後有動靜，猛然回頭，發現了{noun_role_monster}。" },
        { val: "{noun_role_monster}擋住了你的去路，它發出了低沈的嘶吼。" }
    ],

    // ============================================================
    // [Layer 3] 保留區 (Legacy Support) - 為了相容骨架與特定邏輯
    // ============================================================
    // 這些必須保留，因為你的 Skeletons (actors) 和其他邏輯會直接呼叫它們

    // [D] 角色 (保留原本的結構，但可以用嵌套優化內容)
    noun_role_job: [ { val: "私家偵探" }, { val: "刑警隊長" }, { val: "探險家" } ],
    noun_role_monster: [ { val: "變異野狼" }, { val: "古代守衛" }, { val: "失控的機械人偶" }, { val: "嗜血蝙蝠" } ],
    
    noun_location_room: [ { val: "大廳" }, { val: "地下室" }, { val: "圖書館" }, { val: "手術室" } ],
    noun_location_building: [ { val: "深山別墅" }, { val: "廢棄醫院" }, { val: "豪華郵輪" }, { val: "古老教堂" } ],
    noun_env_feature: [ { val: "角落的陰影" }, { val: "地面的塵埃" }, { val: "破碎的窗戶" } ],
    
    // [A] 動作與副詞 (保留常用詞)
    adv_manner: [ { val: "小心翼翼地" }, { val: "猶豫不決地" }, { val: "大膽地" }, { val: "顫抖著" } ],
    adv_time: [ { val: "突然" }, { val: "隱約" }, { val: "毫無預警地" } ],
    verb_contact: [ { val: "觸碰" }, { val: "拾起" }, { val: "檢查" } ],
    verb_detect: [ { val: "聽見" }, { val: "嗅到" }, { val: "感覺到" } ],

    // [E] 骨架專用 (這些是關鍵變數，保留)
    detective: [ { val: "私家偵探" }, { val: "刑警" } ],
    victim: [ { val: "珠寶大亨" }, { val: "年輕寡婦" }, { val: "銀行家" } ],
    suspect_A: [ { val: "女僕" }, { val: "園丁" } ], 
    suspect_B: [ { val: "管家" }, { val: "姪子" } ],
    survivor: [ { val: "愛麗絲" }, { val: "里昂" } ],
    lover: [ { val: "青梅竹馬" }, { val: "神秘轉學生" } ], 
    rival: [ { val: "學生會長" }, { val: "高傲的貴族" } ],
    trainee: [ { val: "孤兒少女" }, { val: "新人歌手" }, { val: "受傷的幼龍" } ],
	adj_npc_trait: [ { val: "{base_npc_trait}" } ],
    adj_item_look: [{ val: "{base_state_bad}" },{ val: "{base_state_good}" }],
    noun_item_record: [ { val: "{base_item_doc}" } ],
    verb_move_univ: [{ val: "緩慢爬行" },{ val: "瘋狂逼近" },{ val: "在陰影中蠕動" },{ val: "悄悄靠近" }]
},

    // ============================================================
    // 2. 劇本模板庫 (Templates)
    // ============================================================
    templates: [
        // [通用碎片] Universal Fillers - 句型化升級版
        // 1. 環境描寫 - 一般情況
        // 說明：最單純的環境渲染，呼叫 Phase 1 的 pattern_look_around
        { 
            type: 'univ_filler', 
            id: 'uni_env_normal',
            // 新增權重 (尚未實裝權重邏輯，但建議先寫上，未來可擴充)
            weight: 10,
            text: { zh: ["{pattern_look_around}"] }, 
            options: [
                { label: "保持警惕，繼續前進", action: "advance_chain" },
                { label: "仔細觀察周圍 (INT檢定)", check: { stat: 'INT', val: 5 }, action: "advance_chain", rewards: { tags: ['observed'] } }
            ] 
        },

        // 2. 環境描寫 - 危險/高壓狀態 (Conditional)
        // 說明：只有在「高風險」或「恐怖」狀態下才會觸發
        { 
            type: 'univ_filler', 
            id: 'uni_env_danger',
            // 條件：只有帶有 risk_high 標籤時才會抽到這個
            conditions: { "risk_high": true },
            text: { zh: [
                "你的心跳聲在{base_env_sound}中顯得格外刺耳。",
                "光線在{base_env_light}中扭曲，你總覺得角落裡有東西在看著你。",
                "{pattern_enemy_appear} 不... 仔細一看，那只是{noun_env_feature}投下的陰影。" // 虛驚一場
            ] }, 
            options: [
                { label: "握緊武器", action: "advance_chain", rewards: { varOps: [{key:'stress', val:5, op:'+'}] } },
                { label: "深呼吸平復心情", action: "advance_chain", rewards: { varOps: [{key:'stress', val:5, op:'-'}] } }
            ] 
        },

        // 3. 物品發現 (Looting)
        // 說明：呼叫 pattern_found_item，自動生成各種發現物品的情境
        { 
            type: 'univ_filler', 
            id: 'uni_item_discovery',
            text: { zh: ["{pattern_found_item}"] }, 
            // 這裡我們用一個小技巧：讓 text 裡的 {noun_item_common} 自動存入 memory
            // 但目前的簡單引擎可能做不到「反向存取」，所以我們在這裡手動給獎勵
            rewards: { tags: ['found_something'] },
            options: [
                { label: "撿起來看看", action: "advance_chain", rewards: { tags: ['item_checked'] } },
                { label: "不要亂碰比較好", action: "advance_chain" }
            ] 
        },

        // 4. 感官敘事 (Sensory) - 混合寫法
        // 說明：展示如何混合「固定語句」與「巢狀變數」
        {
            type: 'univ_filler', 
            id: 'uni_sense_mix',
            text: { zh: [
                "{adv_time}，一股{base_env_smell}飄了過來，讓你皺起了眉頭。",
                "你停下腳步。{base_env_sound}... 聲音似乎是從{noun_location_room}深處傳來的。",
                "一陣寒意{adv_time}爬上了你的脊椎。這裡肯定發生過什麼。"
            ] },
            options: [{ label: "循著感覺探索", action: "advance_chain" }]
        },

        // 5. 休息片段 (Pacing)
        // 說明：調整節奏用
        {
            type: 'univ_filler', 
            id: 'uni_rest_moment',
            text: { zh: [
                "連續的探索讓你感到有些疲憊。這裡暫時看起來是安全的。",
                "你靠在{noun_env_feature}旁，稍微整理了一下思緒。",
                "雖然{adj_env_vibe}，但你必須讓自己冷靜下來。"
            ] },
            options: [
                { label: "原地休息片刻 (HP+10)", action: "advance_chain", rewards: { varOps: [{key:'hp', val:10, op:'+'}] } },
                { label: "檢查裝備", action: "advance_chain" }
            ]
        },
        // ==========================================
        // [BLOCK A] 🕵️‍♂️ 懸疑偵探流 (Mystery)
        // ==========================================
        {
            type: 'setup', id: 'mys_start_route_A',
            text: { zh: [ "雷雨交加的夜晚，{noun_location_building}被封鎖了。{victim}倒在{noun_location_room}中央。", "在場只有兩個人有嫌疑：{adj_npc_trait}{suspect_A}，以及{adj_npc_trait}{suspect_B}。", "雖然表面平靜，但你注意到{suspect_A}的眼神有些閃爍，似乎在隱藏什麼。" ]},
            slots: ['noun_location_building', 'noun_location_room', 'victim', 'suspect_A', 'suspect_B', 'adj_npc_trait'],
            options: [{ label: "封鎖現場，開始調查", action: "advance_chain", rewards: { tags: ['truth_A', 'case_started'] } }]
        },
        {
            type: 'setup', id: 'mys_start_route_B',
            text: { zh: [ "雷雨交加的夜晚，{noun_location_building}被封鎖了。{victim}倒在{noun_location_room}中央。", "在場只有兩個人有嫌疑：{adj_npc_trait}{suspect_A}，以及{adj_npc_trait}{suspect_B}。", "雖然表面平靜，但你注意到{suspect_B}的手在微微顫抖，似乎非常緊張。" ]},
            slots: ['noun_location_building', 'noun_location_room', 'victim', 'suspect_A', 'suspect_B', 'adj_npc_trait'],
            options: [{ label: "封鎖現場，開始調查", action: "advance_chain", rewards: { tags: ['truth_B', 'case_started'] } }]
        },
        {
            type: 'investigate', id: 'mys_clue_for_A', reqTag: 'truth_A', 
            text: { zh: [ "你來到{noun_location_room}的角落，{verb_contact}了一個被藏起來的{noun_item_common}。", "仔細檢查後，你發現上面刻著{suspect_A}的名字，而且還沾著些許{adj_item_look}痕跡！", "這無疑是{suspect_A}犯案的關鍵證據。" ]},
            slots: ['noun_location_room', 'verb_contact', 'noun_item_common', 'suspect_A', 'adj_item_look'],
            options: [{ label: "收好這份關鍵證據", action: "advance_chain", rewards: { tags: ['evidence_got_A'], varOps: [{key:'clue', val:1, op:'+'}] } }]
        },
        {
            type: 'investigate', id: 'mys_clue_for_B', reqTag: 'truth_B', 
            text: { zh: [ "你在沙發縫隙中{verb_detect}一股異味，隨後找到了一把{noun_item_weapon}。", "這東西屬於{suspect_B}，且表面{adj_item_look}。為什麼它會出現在這裡？", "所有的線索都指向了{suspect_B}。" ]},
            slots: ['verb_detect', 'noun_item_weapon', 'suspect_B', 'adj_item_look'],
            options: [{ label: "這就是鐵證", action: "advance_chain", rewards: { tags: ['evidence_got_B'], varOps: [{key:'clue', val:1, op:'+'}] } }]
        },
        {
            type: 'twist', id: 'mys_twist_event',
            text: { zh: [ "就在調查進行到一半時，{noun_location_building}的燈光{adv_time}熄滅了！", "黑暗中傳來了玻璃破碎的聲音和{noun_npc_generic}的尖叫聲。", "當燈光再次亮起，你發現現場被破壞了，有人試圖掩蓋真相。" ]},
            slots: ['noun_location_building', 'adv_time', 'noun_npc_generic'],
            options: [{ label: "鎮定眾人，準備推理", action: "advance_chain" }]
        },
        {
            type: 'deduction', id: 'mys_final_logic',
            text: { zh: [ "所有的碎片都已經拼湊完成。面對在場的眾人，你{adv_manner}走到了大廳中央。", "現在，是時候指出那個隱藏在幕後的真兇了。" ]},
            slots: ['adv_manner'],
            options: [
                { label: "兇手是 {suspect_A}！", condition: { tags: ['truth_A', 'evidence_got_A'] }, action: "finish_chain", nextScene: { text: "「不...怎麼可能被發現...」{suspect_A}崩潰地跪倒在地，承認了罪行。\n你成功還原了真相。", rewards: { exp: 500, title: "名偵探" } } },
                { label: "兇手是 {suspect_B}！", condition: { tags: ['truth_B', 'evidence_got_B'] }, action: "finish_chain", nextScene: { text: "{suspect_B}冷笑了一聲，試圖反駁，但在你的鐵證面前，他無話可說。\n正義得到了伸張。", rewards: { exp: 500, title: "名偵探" } } },
                { label: "我...還不確定...", action: "finish_chain", nextScene: { text: "你猶豫了。就在這瞬間，真兇抓住了機會製造混亂逃跑了。\n雖然無人再受傷，但真相永遠石沈大海。", rewards: { exp: 50 } } }
            ]
        },

        // ============================================================
        // [BLOCK B] 👻 現代心理恐怖流 (Asian Psychological Horror)
        // ============================================================
        {
            type: 'setup_omen', id: 'hor_psych_setup',
            text: { zh: [ "這裡本該是你熟悉的{noun_location_room}，但此刻看起來卻異常陌生。", "空氣中瀰漫著一股{adj_env_vibe}濕氣，牆角的陰影似乎比平常更深、更濃。", "你{adv_manner}停下腳步，總覺得有某種視線正在從{noun_env_feature}的縫隙中窺視著你。" ]},
            slots: ['noun_location_room', 'adj_env_vibe', 'adv_manner', 'noun_env_feature'],
            dialogue: [{ speaker: "旁白", text: { zh: "（耳邊傳來一陣若有似無的竊笑聲，聽起來既像老人，又像嬰兒...）" } }],
            options: [
                { label: "強裝鎮定，忽視它", action: "advance_chain", rewards: { tags: ['horror_started'], varOps: [{ key: 'sanity', val: 90, op: 'set' }] } },
                { label: "檢查聲音的來源", action: "advance_chain", rewards: { tags: ['horror_started', 'marked_by_curse'], varOps: [{ key: 'sanity', val: 80, op: 'set' }] }, nextScene: { text: "你湊近一看，那裡什麼都沒有，只有一團糾結的黑色髮絲，散發著腥臭味。" } }
            ]
        },
        {
            type: 'encounter_stalk', id: 'hor_psych_stalk',
            // [Fix] 移除 reqTag: 'horror_started' 以防止標籤延遲導致的找不到劇本
            // 因為骨架已經限制了流程，所以這裡不需要嚴格檢查
            text: { zh: [ "你試圖離開，但走廊彷彿沒有盡頭。身後傳來了「啪嗒、啪嗒」的濕黏腳步聲。", "那聲音極不規律，就像是某種肢體扭曲的東西，正手腳並用在地上{adv_manner}爬行。", "它正在{verb_move_univ}，而且它知道你在哪裡。" ]},
            slots: ['adv_manner', 'verb_move_univ'],
            dialogue: [{ speaker: "？？？", text: { zh: "嘻嘻... 找到... 你了..." } }],
            options: [
                { label: "屏住呼吸，躲進死角", style: "primary", check: { stat: 'INT', val: 5 }, action: "advance_chain", nextScene: { text: "你摀住口鼻，心臟劇烈跳動。那東西停在你的藏身處外，發出了指甲刮擦地板的聲音... 然後慢慢離開了。" }, failScene: { text: "恐懼讓你發出了喘息聲。那腳步聲立刻停了下來，然後猛地轉向你！", rewards: { varOps: [{key:'sanity', val:20, op:'-'}] }, nextTags:['danger_high'] } },
                { label: "不要回頭，狂奔！", action: "advance_chain", nextTags: ['risk_high'], nextScene: { text: "你{adv_manner}向前衝刺，感覺冰冷的手指擦過了你的後頸..." } }
            ]
        },
        {
            type: 'encounter_climax', id: 'hor_psych_look',
            // [Fix] 移除 reqTag: 'danger_high'，確保就算玩家玩得很好（沒觸發危險）也能進入高潮劇情
            text: { zh: [ "無路可退了。那個{noun_role_monster}（或者說是曾經是人的東西）就懸掛在天花板上。", "它的頭顱以詭異的角度轉了180度，死白色的眼珠正死死盯著你。", "所有的本能都在尖叫：**絕對不能和它對視**。" ]},
            slots: ['noun_role_monster'],
            options: [
                { label: "緊閉雙眼，唸誦祈禱", action: "advance_chain", check: { stat: 'LUCK', val: 5 }, nextScene: { text: "你感到一股冰冷的氣息貼著臉頰滑過，耳邊是骨骼摩擦的脆響... 但最終，它似乎對靜止的獵物失去了興趣。" }, failScene: { text: "你忍不住睜開了一條縫... 一張布滿血絲的臉正貼在你的鼻尖前，露出了裂到耳根的笑容。", rewards: { varOps: [{key:'sanity', val:50, op:'-'}] } } },
                { label: "用手電筒強光照射它！", style: "danger", action: "finish_chain", nextScene: { text: "光線照亮了它的全貌——那景象超越了人類理智的極限。你的意識在尖叫中斷線了。\n【結局：精神崩潰】" } }
            ]
        },
        {
            type: 'final_survival', id: 'hor_psych_end',
            text: { zh: [ "不知道過了多久，周圍終於恢復了死寂。你{adv_manner}推開門，衝進了外面的陽光中。", "人群的喧囂聲讓你感到一陣恍惚。你以為你逃掉了。", "但當你低頭看時，發現自己的腳踝上，多了一個青紫色的手印，而且...還在發燙。" ]},
            slots: ['adv_manner'], 
            options: [{ label: "這只是一個開始...", action: "finish_chain", rewards: { removeTags: ['horror_started', 'danger_high'], title: "倖存者(？)", exp: 300 } }]
        },

        // ============================================================
        // [BLOCK C] ⚔️ 異世界戰記 (Isekai Chronicles)
        // ============================================================
        {
            type: 'setup', id: 'isekai_start_class',
            text: { zh: [ "強烈的暈眩感退去後，你發現自己身處於一片{adj_env_vibe}{noun_location_building}之中。", "天空中懸掛著破碎的月亮，遠處傳來了{noun_role_monster}的嘶吼聲。", "你低頭看了看自己的雙手，意識到自己必須依靠手中的武器活下去。" ]},
            slots: ['adj_env_vibe', 'noun_location_building', 'noun_role_monster'],
            options: [
                { label: "握緊重劍 (戰士路線)", action: "advance_chain", rewards: { tags: ['class_warrior'], varOps: [{key:'hp', val:120, op:'set'}, {key:'str', val:10, op:'set'}] }, nextScene: { text: "沉重的劍身給了你安全感。無論前方有什麼，你都將一刀兩斷。" } },
                { label: "詠唱咒文 (法師路線)", action: "advance_chain", rewards: { tags: ['class_mage'], varOps: [{key:'mp', val:100, op:'set'}, {key:'int', val:10, op:'set'}] }, nextScene: { text: "元素在你指尖跳動。知識就是力量，而你掌握著毀滅的知識。" } },
                { label: "檢查短刀 (刺客路線)", action: "advance_chain", rewards: { tags: ['class_rogue'], varOps: [{key:'agi', val:10, op:'set'}] }, nextScene: { text: "你壓低了身形，與陰影融為一體。在被發現之前，敵人就已經死了。" } }
            ]
        },
        {
            type: 'event_battle', id: 'isekai_battle_ambush',
            text: { zh: [ "草叢中傳來了急促的沙沙聲。你{adv_manner}轉過身，正好迎面撞上了一隻{noun_role_monster}！", "它{adv_manner}張開了利爪，眼裡閃爍著{adj_npc_trait}紅光，顯然已經飢餓難耐。", "避無可避，唯有死戰。" ]},
            slots: ['adv_manner', 'noun_role_monster', 'adj_npc_trait'],
            options: [
                { label: "正面迎擊 (STR檢定)", check: { stat: 'STR', val: 5 }, action: "advance_chain", nextScene: { text: "你發出怒吼，武器帶著破風聲重重擊中了它！怪物發出哀嚎，倒在地上抽搐著。" }, failScene: { text: "你的力量輸給了它的野性。它將你撲倒在地，利爪在你身上留下了深可見骨的傷痕。", rewards: { energy: -20 } } },
                { label: "尋找破綻 (INT檢定)", check: { stat: 'INT', val: 5 }, action: "advance_chain", nextScene: { text: "你冷靜地觀察它的動作，在它撲過來的瞬間側身閃過，並精準地刺入了它的要害。" }, failScene: { text: "它的動作比你預想的更快！你判斷失誤，只能狼狽地在地上打滾躲避攻擊。", rewards: { energy: -15 } } }
            ]
        },
        {
            type: 'event_battle', id: 'isekai_battle_magic', reqTag: 'class_mage', 
            text: { zh: [ "前方的道路被一群{noun_role_monster}擋住了。牠們似乎對魔法波動非常敏感。", "你感覺到周圍的元素正在躁動，這是一個釋放大型魔法的絕佳機會。" ]},
            slots: ['noun_role_monster'],
            options: [{ label: "詠唱「爆裂火球」！", action: "advance_chain", rewards: { varOps: [{key:'mp', val:20, op:'-'}] }, nextScene: { text: "巨大的火球在怪物群中炸裂！空氣中充滿了焦糊味，敵人瞬間化為了灰燼。" } }]
        },
        {
            type: 'event_explore', id: 'isekai_explore_ruin',
            text: { zh: [ "你發現了一座被藤蔓覆蓋的古代遺跡。這裡的空氣異常{adj_env_vibe}。", "在斷裂的石柱旁，躺著一具白骨，他的手裡還死死抓著一個{noun_item_common}。", "那是某種信物？還是帶來不幸的詛咒之物？" ]},
            slots: ['adj_env_vibe', 'noun_item_common'],
            options: [
                { label: "撿起物品", action: "advance_chain", rewards: { tags: ['item_found'], gold: 50 }, nextScene: { text: "你擦去了上面的灰塵。雖然年代久遠，但它依然散發著微弱的魔力波動。" } },
                { label: "雙手合十，轉身離開", action: "advance_chain", rewards: { varOps: [{key:'sanity', val:10, op:'+'}] } }
            ]
        },
        {
            type: 'event_explore', id: 'isekai_explore_trap',
            text: { zh: [ "你正{adv_manner}走在狹窄的通道中，腳下的地磚突然下陷！", "「喀嚓」一聲，機關被觸發了。兩側的牆壁開始噴射出毒箭。", "這是一個致命的陷阱！" ]},
            slots: ['adv_manner'],
            options: [{ label: "靠反應閃避 (AGI檢定)", check: { stat: 'AGI', val: 5 }, action: "advance_chain", nextScene: { text: "你的身體比意識更快做出了反應！你在箭雨中穿梭，毫髮無傷地落在了安全區。" }, failScene: { text: "你盡力躲避了，但一支毒箭還是擦傷了你的手臂。傷口傳來了一陣麻痺感。", rewards: { energy: -30 } } }]
        },
        {
            type: 'boss', id: 'isekai_boss_dragon',
            text: { zh: [ "大地的震動越來越劇烈。在{noun_location_building}的最深處，一雙巨大的眼睛睜開了。", "那是傳說中的災厄——{noun_role_monster}（變異體）！", "它{adv_manner}發出了震耳欲聾的咆哮，強大的風壓幾乎讓你站立不穩。", "這就是旅途的終點嗎？還是成為傳說的起點？" ]},
            slots: ['noun_location_building', 'noun_role_monster', 'adv_manner'],
            options: [{ label: "拔劍，決一死戰！", style: "danger", check: { stat: 'STR', val: 8 }, action: "finish_chain", nextScene: { text: "【結局：屠龍英雄】\n你燃燒了最後的生命力，將劍送入了怪物的心臟。你的名字將被吟遊詩人永遠傳唱。", rewards: { exp: 2000, title: "傳說勇者" } }, failScene: { text: "【結局：無名的屍骸】\n實力的差距是絕望的。你的武器折斷了，視野逐漸被黑暗吞沒...", rewards: { exp: 500 } } }]
        },

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
		
		// ============================================================
        // [Safety Net] 全域通用備案 (Generic Fallbacks)
        // ============================================================
        // 這些劇本沒有 conditions，權重最低，保證永遠有東西可以顯示

        // 1. 通用戰鬥備案 (當特定戰鬥條件不符時)
        {
            type: 'event_battle',
            id: 'fallback_battle',
            text: { zh: ["路邊突然衝出了一隻{noun_role_monster}！", "它似乎飢餓難耐，直接向你發動了攻擊。", "避無可避，唯有戰鬥。"] },
            slots: ['noun_role_monster'],
            options: [
                { label: "正面迎擊", check: { stat: 'STR', val: 5 }, action: "advance_chain", nextScene: { text: "你費盡九牛二虎之力擊退了它。" }, failScene: { text: "你受了點傷才勉強趕跑它。", rewards: { varOps: [{key:'hp', val:10, op:'-'}] } } },
                { label: "嘗試逃跑", check: { stat: 'AGI', val: 5 }, action: "advance_chain", nextScene: { text: "你像風一樣消失在牠的視野中。" } }
            ]
        },

        // 2. 通用高潮備案 (當特定 Boss 條件不符時)
        {
            type: 'climax', // 同時涵蓋 boss, raise_climax 等 (需視你的 type 定義而定)
            id: 'fallback_climax',
            text: { zh: ["終於來到了旅途的終點。", "強大的氣息從前方傳來，你知道，最後的試煉就在眼前。", "無論勝敗，這都將是決定性的一戰。"] },
            options: [
                { label: "放手一搏！", style: "danger", action: "finish_chain", nextScene: { text: "戰鬥結束了... 你的命運就此定格。" } }
            ]
        },

        // 3. 通用獎勵/休息備案
        {
            type: 'univ_filler',
            id: 'fallback_rest',
            text: { zh: ["四周暫時恢復了平靜。", "你利用這難得的機會整理裝備，並包紮傷口。"] },
            options: [{ label: "休息 (HP+10)", action: "advance_chain", rewards: { varOps: [{key:'hp', val:10, op:'+'}] } }]
        },
		{
            type: 'raise_climax', 
            id: 'raise_final_battle_low_fame',
            // 沒有 reqTag/conditions，作為預設值
            text: { zh: [
                "決戰之日來臨，雖然{trainee}的名氣還不足以撼動全場，但這是一次證明自己的機會。",
                "對手{rival}甚至沒有正眼看過來，這份輕視或許能成為反擊的動力。",
                "在此刻，你想對他說/牠最後一句話是..."
            ]},
            slots: ['trainee', 'rival'],
            options: [{ 
                label: "「輸贏不重要，只要發揮出你的全力！」", 
                action: "advance_chain", 
                rewards: { varOps: [{key:'stress', val:10, op:'-'}] }, // 減壓
                nextScene: { text: "{trainee}深吸了一口氣，點點頭。雖然沒有觀眾的歡呼，但他的眼神依然堅定。" } 
            }]
        },

        // 2. 針對 [love_bond] 的備案：還沒變情侶時的互動
        // 說明：當沒有 'romantic_vibe' 時觸發
        {
            type: 'love_bond', 
            id: 'rom_bond_normal',
            text: { zh: [
                "雖然你們還稱不上是親密夥伴，但{lover}似乎有話想對你說。",
                "他/她約你在{noun_location_room}見面，表情顯得有些嚴肅。",
                "「關於{rival}的事情... 我覺得你需要知道真相。」"
            ]},
            slots: ['lover', 'noun_location_room', 'rival'],
            options: [
                { 
                    label: "洗耳恭聽", 
                    action: "advance_chain", 
                    rewards: { varOps: [{key:'trust', val:5, op:'+'}] }, // 增加信任但沒增加愛意
                    nextScene: { text: "你們交換了情報。雖然氣氛有些公事公辦，但這也是一種進展。" } 
                }
            ]
        },
    ]
};