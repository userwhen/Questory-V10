   /* js/data_piece.js - V82.0 (Fully Atomic & Integrated) */

window.FragmentDB = {
    fragments: {
        // ============================================================
        // [A] 動作與狀態 (Actions & States)
        // ============================================================
        
        // 1. 副詞 (Adverbs) - 動作的質感
        adv_manner: [ 
            { val: { zh: "小心翼翼地" } }, { val: { zh: "猶豫不決地" } }, { val: { zh: "大膽地" } }, { val: { zh: "不由自主地" } },
            { val: { zh: "顫抖著" } }, { val: { zh: "屏住呼吸地" } }, { val: { zh: "瘋狂地" } }, { val: { zh: "緩慢地" } }
        ],
        adv_time: [ 
            { val: { zh: "突然" } }, { val: { zh: "頃刻間" } }, { val: { zh: "隱約" } }, { val: { zh: "毫無預警地" } }
        ],

        // 2. 動詞 (Verbs) - 互動
        verb_contact: [ // 接觸類
            { val: { zh: "觸碰" } }, { val: { zh: "拾起" } }, { val: { zh: "緊握" } }, { val: { zh: "擦拭" } }, { val: { zh: "撫摸" } }
        ],
        verb_observe: [ // 觀察類
            { val: { zh: "凝視" } }, { val: { zh: "瞥見" } }, { val: { zh: "檢查" } }, { val: { zh: "窺視" } }
        ],
        verb_detect: [ // 感知類
            { val: { zh: "聽見" } }, { val: { zh: "嗅到" } }, { val: { zh: "感覺到" } }, { val: { zh: "意識到" } }
        ],

        // ============================================================
        // [B] 形容詞 (Adjectives) - 描述一切的源頭
        // ============================================================

        // 1. 環境氛圍 (Atmosphere) - 視覺與聽覺
        adj_env_vibe: [ 
            { val: { zh: "令人窒息的" } }, { val: { zh: "異常寂靜的" } }, { val: { zh: "瀰漫著霧氣的" } }, { val: { zh: "伸手不見五指的" } },
            { val: { zh: "迴盪著回音的" } }, { val: { zh: "透著詭異微光的" } }, { val: { zh: "充滿霉味的" } }, { val: { zh: "空氣凝重的" } }
        ],
        adj_env_weather: [ // 天氣/外部狀況 (源自舊版 location)
            { val: { zh: "被暴風雪封鎖的" } }, { val: { zh: "午夜時分的" } }, { val: { zh: "剛發生過火災的" } }, { val: { zh: "雷雨交加的" } }
        ],

        // 2. 物品狀態 (Item State)
        adj_item_look: [ 
            { val: { zh: "沾滿乾涸血跡的" }, tags: ['scary'] }, 
            { val: { zh: "積滿厚重灰塵的" }, tags: ['old'] }, 
            { val: { zh: "布滿裂痕的" }, tags: ['broken'] }, 
            { val: { zh: "生鏽的" }, tags: ['old'] },
            { val: { zh: "鑲嵌著寶石的" }, tags: ['luxury'] }, 
            { val: { zh: "散發著柔和光芒的" }, tags: ['magic'] }, 
            { val: { zh: "精緻的" }, tags: ['luxury'] },
            { val: { zh: "被撕去幾頁的" }, tags: ['clue'] } // 源自舊版日記
        ],
        
        // 3. 角色特質 (Personality/Appearance)
        adj_npc_trait: [ 
            { val: { zh: "眼神銳利的" } }, { val: { zh: "神色慌張的" } }, { val: { zh: "沈默寡言的" } }, { val: { zh: "野心勃勃的" } },
            { val: { zh: "性格溫柔的" } }, { val: { zh: "全身纏滿繃帶的" } }, { val: { zh: "雙眼散發紅光的" } }, { val: { zh: "總是少根筋的" } }
        ],
        
        // 4. 情緒 (Emotion) - 主角當下感受
        adj_feeling: [
            { val: { zh: "不安" } }, { val: { zh: "好奇" } }, { val: { zh: "疲憊" } }, { val: { zh: "恐懼" } }, { val: { zh: "興奮" } }
        ],

        // ============================================================
        // [C] 名詞 (Nouns) - 實體
        // ============================================================

        // 1. 物品 (Items)
        noun_item_common: [ // 通用
            { val: { zh: "懷錶" } }, { val: { zh: "黃銅鑰匙" } }, { val: { zh: "舊照片" } }, { val: { zh: "泛黃信紙" } }, { val: { zh: "提燈" } }
        ],
        noun_item_weapon: [ // 武器/兇器 (源自舊版 item)
            { val: { zh: "匕首" } }, { val: { zh: "銀質拆信刀" } }, { val: { zh: "生鏽巨斧" } }, { val: { zh: "絲質手帕" } } // 手帕是毒殺武器
        ],
        noun_item_record: [ // 紀錄/線索
            { val: { zh: "皮革日記" } }, { val: { zh: "舊式錄音帶" } }, { val: { zh: "繼承文件" } }, { val: { zh: "契約書" } }
        ],

        // 2. 地點 (Locations)
        noun_location_room: [ // 室內
            { val: { zh: "大廳" } }, { val: { zh: "地下室" } }, { val: { zh: "圖書館" } }, { val: { zh: "病房" } }, { val: { zh: "宴會廳" } }
        ],
        noun_location_building: [ // 建築/大區域 (源自舊版 location)
            { val: { zh: "深山別墅" } }, { val: { zh: "綜合醫院" } }, { val: { zh: "豪華郵輪" } }, { val: { zh: "百年古堡" } }, { val: { zh: "地下水道" } }
        ],

        // 3. 環境特徵 (Environment Details)
        noun_env_feature: [
            { val: { zh: "角落的陰影" } }, { val: { zh: "地面的塵埃" } }, { val: { zh: "牆上的畫像" } }, { val: { zh: "破碎的窗戶" } }
        ],

        // 4. 角色 (Characters)
        // 注意：為了相容性，保留具體角色 Slot，但內容已經原子化整合
        noun_role_job: [ 
            { val: { zh: "私家偵探" } }, { val: { zh: "刑警隊長" } }, { val: { zh: "小說家" } }, { val: { zh: "管家" } }, { val: { zh: "法醫" } }
        ],
        noun_role_rel: [ // 關係人
            { val: { zh: "兼職女僕" } }, { val: { zh: "園丁" } }, { val: { zh: "遠房姪子" } }, { val: { zh: "生意合夥人" } }, { val: { zh: "青梅竹馬" } }
        ],
        noun_role_monster: [ // 怪物/敵人 (源自舊版 enemy)
            { val: { zh: "處刑者" } }, { val: { zh: "變異野狼" } }, { val: { zh: "古代守衛" } }, { val: { zh: "機械人偶" } }, { val: { zh: "紅衣女鬼" } }
        ],

        // ============================================================
        // [D] 舊版相容與特殊記憶槽 (Legacy & Memory Slots)
        // 這些 Slot 名稱 (key) 必須保留，因為舊的模板 (Templates) 可能還在引用它們
        // 我們將它們指向新的原子庫，或者保留為特定用途
        // ============================================================
        
        // 為了讓舊劇本運作，我們可以用「組合」的方式定義，或者直接引用上面的詞
        // 但為了簡單起見，這裡做「別名映射 (Alias Mapping)」的概念
        
        detective: [ { val: { zh: "私家偵探" } }, { val: { zh: "刑警" } } ], // 簡化版
        killer: [ { val: { zh: "管家" } }, { val: { zh: "助手" } } ],
        
        // 這些特定 Slot 在養成或戀愛劇本中有特殊邏輯，暫時保留完整性
        lover: [ { val: { zh: "命定之人" } } ], 
        daughter: [ { val: { zh: "這孩子" } }, { val: { zh: "少女" } } ],
		trainee: [
    { val: { zh: "眼神倔強的孤兒少女" } }, 
    { val: { zh: "天賦異稟的新人歌手" } },
    { val: { zh: "受傷的幼龍" } }, 
    { val: { zh: "流浪的魔法學徒" } },
    { val: { zh: "被遺棄的機械人偶" } }
]
        
        // 養成專用詞彙 (Raising Specific)
        r_hobby: [ { val: { zh: "繪畫修復" } }, { val: { zh: "劍術訓練" } }, { val: { zh: "魔法理論" } } ],
        r_job: [ { val: { zh: "圖書館員" } }, { val: { zh: "農夫" } }, { val: { zh: "家庭教師" } } ],
        r_dream: [ { val: { zh: "女王" } }, { val: { zh: "勇者" } }, { val: { zh: "富商" } } ]
    },

    // ============================================================
    // 2. 劇本模板 (Templates)
    // ============================================================
    templates: [
	//通用碎片劇本庫 (Universal Fillers) - V82.0
    // --- [類別 A：環境氛圍 (Atmosphere)] ---
    {
        type: 'univ_filler', id: 'uni_env_01',
        text: { zh: [
            "這裡的空氣顯得格外{adj_env_vibe}。你{adv_manner}停下了腳步，仔細聆聽周圍的動靜。",
            "除了{noun_env_feature}發出的細微聲響外，四周一片死寂，讓你感到有些{adj_feeling}。"
        ]},
        slots: ['adj_env_vibe', 'adv_manner', 'noun_env_feature', 'adj_feeling'],
        options: [{ label: "調整呼吸，繼續前進", action: "advance_chain" }]
    },
    {
        type: 'univ_filler', id: 'uni_env_02',
        text: { zh: [
            "光線似乎在{noun_env_feature}投下了詭異的陰影。你{verb_observe}著前方，總覺得哪裡不太對勁。",
            "那種{adj_env_vibe}感覺揮之不去，彷彿有什麼東西正在暗處{verb_observe}著你。"
        ]},
        slots: ['noun_env_feature', 'verb_observe', 'adj_env_vibe'],
        options: [{ label: "保持警惕", action: "advance_chain" }]
    },
    {
        type: 'univ_filler', id: 'uni_env_03',
        text: { zh: [
            "一陣風不知從何處吹來，捲起了地面的塵埃。你{adv_time}打了個寒顫。",
            "這地方{adj_env_vibe}，連時間的流動似乎都變得緩慢了下來。"
        ]},
        slots: ['adv_time', 'adj_env_vibe'],
        options: [{ label: "拉緊衣領", action: "advance_chain" }]
    },
    {
        type: 'univ_filler', id: 'uni_env_04',
        text: { zh: [
            "你路過了一處{noun_location_room}，裡面堆滿了{adj_item_look}雜物。",
            "雖然好奇心驅使你想要進去看看，但理智告訴你現在不是時候。"
        ]},
        slots: ['noun_location_room', 'adj_item_look'],
        options: [{ label: "無視它", action: "advance_chain" }]
    },
    {
        type: 'univ_filler', id: 'uni_env_05',
        text: { zh: [
            "周圍的景象開始變得模糊，{adj_env_vibe}霧氣逐漸籠罩了視野。",
            "你只能憑藉著直覺，{adv_manner}摸索著前進，祈禱不要迷失方向。"
        ]},
        slots: ['adj_env_vibe', 'adv_manner'],
        options: [{ label: "小心腳下", action: "advance_chain" }]
    },

    // --- [類別 B：感官細節 (Sensory)] ---
    {
        type: 'univ_filler', id: 'uni_sense_01',
        text: { zh: [
            "你{adv_time}{verb_detect}一股奇怪的氣味，那是某種{adj_item_look}味道。",
            "這氣味讓你感到一陣{adj_feeling}，你下意識地掩住了口鼻。"
        ]},
        slots: ['adv_time', 'verb_detect', 'adj_item_look', 'adj_feeling'],
        options: [{ label: "盡快離開這區域", action: "advance_chain" }]
    },
    {
        type: 'univ_filler', id: 'uni_sense_02',
        text: { zh: [
            "「滴答、滴答...」遠處傳來了規律的水滴聲，在{adj_env_vibe}空間中迴盪。",
            "這單調的聲音聽久了讓人感到{adj_feeling}，你加快了腳步想要遠離聲源。"
        ]},
        slots: ['adj_env_vibe', 'adj_feeling'],
        options: [{ label: "摀住耳朵", action: "advance_chain" }]
    },
    {
        type: 'univ_filler', id: 'uni_sense_03',
        text: { zh: [
            "你的指尖無意間觸碰到牆壁，那觸感{adj_item_look}，讓你瞬間縮回了手。",
            "這裡的一切都透著古怪，你{adv_manner}擦了擦手，試圖撫平心中的不安。"
        ]},
        slots: ['adj_item_look', 'adv_manner'],
        options: [{ label: "真噁心...", action: "advance_chain" }]
    },
    {
        type: 'univ_filler', id: 'uni_sense_04',
        text: { zh: [
            "一瞬間，你似乎{verb_detect}背後有輕微的腳步聲。你猛地回頭，卻什麼也沒看見。",
            "只有{noun_env_feature}靜靜地在那裡，彷彿剛才的一切都只是你的錯覺。"
        ]},
        slots: ['verb_detect', 'noun_env_feature'],
        options: [{ label: "是太累了嗎？", action: "advance_chain" }]
    },
    {
        type: 'univ_filler', id: 'uni_sense_05',
        text: { zh: [
            "視野的角落閃過一道光影。你{adv_time}轉過頭去，試圖捕捉那個源頭。",
            "但那裡只有一片漆黑，那種{adj_env_vibe}感覺再次襲上心頭。"
        ]},
        slots: ['adv_time', 'adj_env_vibe'],
        options: [{ label: "別自己嚇自己", action: "advance_chain" }]
    },

    // --- [類別 C：內心獨白 (Internal)] ---
    {
        type: 'univ_filler', id: 'uni_mind_01',
        text: { zh: [
            "長時間的探索讓你感到有些{adj_feeling}。你靠在牆邊，閉上眼睛稍作休息。",
            "腦海中浮現出許多紛亂的思緒，你開始懷疑自己是否能順利抵達終點。"
        ]},
        slots: ['adj_feeling'],
        options: [{ label: "拍拍臉頰振作起來", action: "advance_chain" }]
    },
    {
        type: 'univ_filler', id: 'uni_mind_02',
        text: { zh: [
            "這條路彷彿沒有盡頭。你{adv_manner}嘆了一口氣，調整了一下身上的裝備。",
            "「一定還有別的出路。」你這樣告訴自己，試圖驅散心中的{adj_feeling}。"
        ]},
        slots: ['adv_manner', 'adj_feeling'],
        options: [{ label: "堅定信念", action: "advance_chain" }]
    },
    {
        type: 'univ_filler', id: 'uni_mind_03',
        text: { zh: [
            "你回想起出發前的那一刻，當時的心情與現在截然不同。",
            "看著眼前{adj_env_vibe}景象，你不得不承認，這場旅程比預想中更加艱難。"
        ]},
        slots: ['adj_env_vibe'],
        options: [{ label: "既來之則安之", action: "advance_chain" }]
    },
    {
        type: 'univ_filler', id: 'uni_mind_04',
        text: { zh: [
            "一種莫名的直覺讓你停了下來。你{verb_observe}著前方的黑暗，心中權衡著利弊。",
            "是該冒險前進，還是{adv_manner}尋找其他的路徑？"
        ]},
        slots: ['verb_observe', 'adv_manner'],
        options: [{ label: "相信直覺", action: "advance_chain" }]
    },
    {
        type: 'univ_filler', id: 'uni_mind_05',
        text: { zh: [
            "孤獨感在這一刻變得格外強烈。你環顧四周，渴望能看到熟悉的身影。",
            "但回應你的只有死一般的寂靜，你只能{adv_manner}握緊拳頭，給自己打氣。"
        ]},
        slots: ['adv_manner'],
        options: [{ label: "我能行", action: "advance_chain" }]
    },

    // --- [類別 D：動作行進 (Action/Movement)] ---
    {
        type: 'univ_filler', id: 'uni_move_01',
        text: { zh: [
            "道路變得越來越難走。你{adv_manner}跨過地上的障礙物，盡量不發出聲響。",
            "每一步都必須格外小心，因為你不知道{noun_env_feature}後面隱藏著什麼。"
        ]},
        slots: ['adv_manner', 'noun_env_feature'],
        options: [{ label: "穩步前進", action: "advance_chain" }]
    },
    {
        type: 'univ_filler', id: 'uni_move_02',
        text: { zh: [
            "你{adv_time}發現了一條隱蔽的小徑，看起來似乎通往某個{noun_location_room}。",
            "猶豫了片刻後，你決定還是沿著原路前進，以免節外生枝。"
        ]},
        slots: ['adv_time', 'noun_location_room'],
        options: [{ label: "不要分心", action: "advance_chain" }]
    },
    {
        type: 'univ_filler', id: 'uni_move_03',
        text: { zh: [
            "前方出現了一道緊閉的門。你{adv_manner}試著推了一下，紋絲不動。",
            "看來需要特殊的手段才能打開，你只好失望地選擇繞道而行。"
        ]},
        slots: ['adv_manner'],
        options: [{ label: "尋找其他路口", action: "advance_chain" }]
    },
    {
        type: 'univ_filler', id: 'uni_move_04',
        text: { zh: [
            "你穿過了一條狹長的通道，兩側的牆壁給人一種{adj_env_vibe}壓迫感。",
            "終於走出來時，你大口呼吸著新鮮空氣，才發現自己剛才一直屏住呼吸。"
        ]},
        slots: ['adj_env_vibe'],
        options: [{ label: "深呼吸", action: "advance_chain" }]
    },
    {
        type: 'univ_filler', id: 'uni_move_05',
        text: { zh: [
            "腳下的地板發出了「嘎吱」的聲響，在安靜的空間裡顯得格外刺耳。",
            "你{adv_time}停下動作，直到確定沒有引來不必要的麻煩後，才敢繼續移動。"
        ]},
        slots: ['adv_time'],
        options: [{ label: "輕手輕腳", action: "advance_chain" }]
    },

    // --- [類別 E：物品觀察 (Object Interaction)] ---
    // 這些模板只觀察「通用」物品，絕不觀察關鍵道具
    {
        type: 'univ_filler', id: 'uni_obj_01',
        text: { zh: [
            "在雜亂的角落裡，你發現了一個{noun_item_common}。它看起來已經被遺棄很久了。",
            "表面{adj_item_look}，似乎見證了這裡曾經發生的故事。"
        ]},
        slots: ['noun_item_common', 'adj_item_look'],
        options: [{ label: "放回原處", action: "advance_chain" }]
    },
    {
        type: 'univ_filler', id: 'uni_obj_02',
        text: { zh: [
            "你撿起地上的一張碎片，那似乎是某個{adj_item_look}文件的一部分。",
            "上面的字跡模糊不清，無法辨識內容，你隨手將它丟在了一旁。"
        ]},
        slots: ['adj_item_look'],
        options: [{ label: "無用的垃圾", action: "advance_chain" }]
    },
    {
        type: 'univ_filler', id: 'uni_obj_03',
        text: { zh: [
            "你注意到牆上掛著一幅畫，畫框已經{adj_item_look}。",
            "畫中的內容模糊難辨，但盯著它看久了，竟然讓你感到一陣{adj_feeling}。"
        ]},
        slots: ['adj_item_look', 'adj_feeling'],
        options: [{ label: "移開視線", action: "advance_chain" }]
    },
    {
        type: 'univ_filler', id: 'uni_obj_04',
        text: { zh: [
            "桌子上擺放著一些雜物，其中一個{noun_item_common}引起了你的注意。",
            "你{adv_manner}拿起來端詳了一番，並沒有發現什麼特別之處。"
        ]},
        slots: ['noun_item_common', 'adv_manner'],
        options: [{ label: "放下它", action: "advance_chain" }]
    },
    {
        type: 'univ_filler', id: 'uni_obj_05',
        text: { zh: [
            "你的腳踢到了什麼東西。低頭一看，原來是一個{adj_item_look}盒子。",
            "盒子是空的，裡面只有一些灰塵，看來並不是什麼寶藏。"
        ]},
        slots: ['adj_item_look'],
        options: [{ label: "空歡喜一場", action: "advance_chain" }]
    },
    
    // --- [類別 F：休息與狀態 (Rest)] ---
    {
        type: 'univ_filler', id: 'uni_rest_01',
        text: { zh: [
            "連續的奔波讓你的體力逐漸流失。你找了一個相對乾淨的角落坐下。",
            "這裡暫時看起來很安全，你決定利用這短暫的時間調整一下狀態。"
        ]},
        options: [{ label: "休息片刻 (精力+5)", action: "advance_chain", rewards: { energy: 5 } }]
    },
    {
        type: 'univ_filler', id: 'uni_rest_02',
        text: { zh: [
            "你感到口乾舌燥，從背包裡拿出水壺喝了一小口。",
            "清涼的液體順著喉嚨滑下，讓你{adj_feeling}精神稍微振奮了一些。"
        ]},
        slots: ['adj_feeling'],
        options: [{ label: "整理裝備", action: "advance_chain" }]
    },
    {
        type: 'univ_filler', id: 'uni_rest_03',
        text: { zh: [
            "你靠著牆壁，感受著那冰冷的溫度，讓發熱的頭腦冷靜下來。",
            "這片刻的寧靜是如此珍貴，你{adv_manner}閉目養神了一會兒。"
        ]},
        slots: ['adv_manner'],
        options: [{ label: "準備再次出發", action: "advance_chain" }]
    },
    {
        type: 'univ_filler', id: 'uni_rest_04',
        text: { zh: [
            "你停下來檢查了一下身上的傷勢（或裝備）。幸好並無大礙。",
            "在這個{adj_env_vibe}地方，保持最佳狀態是生存下去的關鍵。"
        ]},
        slots: ['adj_env_vibe'],
        options: [{ label: "確認無誤", action: "advance_chain" }]
    },
    {
        type: 'univ_filler', id: 'uni_rest_05',
        text: { zh: [
            "這裡的視野不錯，可以俯瞰到下方的{noun_location_room}。",
            "你看著遠處的景象發了一會兒呆，思緒不知不覺飄到了遠方。"
        ]},
        slots: ['noun_location_room'],
        options: [{ label: "收回思緒", action: "advance_chain" }]
    },
        
        // ==========================================
        // [BLOCK A] 🕵️‍♂️ 懸疑偵探流 (Mystery)
        // ==========================================
        
// --- [階段 1: 開局 (Setup) - 決定命運] ---
// 這裡有兩個看起來很像的開頭，但會導向不同的真兇路線

{
    type: 'setup', id: 'mys_start_route_A',
    // 劇本 A：真兇是 Suspect A
    text: { zh: [
        "雷雨交加的夜晚，{noun_location_building}被封鎖了。{victim}倒在{noun_location_room}中央。",
        "在場只有兩個人有嫌疑：{adj_npc_trait}{suspect_A}，以及{adj_npc_trait}{suspect_B}。",
        "雖然表面平靜，但你注意到{suspect_A}的眼神有些閃爍，似乎在隱藏什麼。" // 暗示 A
    ]},
    slots: ['noun_location_building', 'noun_location_room', 'victim', 'suspect_A', 'suspect_B', 'adj_npc_trait'],
    // 關鍵：打上 truth_A 標籤，鎖定本局兇手為 A
    options: [{ label: "封鎖現場，開始調查", action: "advance_chain", rewards: { tags: ['truth_A', 'case_started'] } }]
},
{
    type: 'setup', id: 'mys_start_route_B',
    // 劇本 B：真兇是 Suspect B
    text: { zh: [
        "雷雨交加的夜晚，{noun_location_building}被封鎖了。{victim}倒在{noun_location_room}中央。",
        "在場只有兩個人有嫌疑：{adj_npc_trait}{suspect_A}，以及{adj_npc_trait}{suspect_B}。",
        "雖然表面平靜，但你注意到{suspect_B}的手在微微顫抖，似乎非常緊張。" // 暗示 B
    ]},
    slots: ['noun_location_building', 'noun_location_room', 'victim', 'suspect_A', 'suspect_B', 'adj_npc_trait'],
    // 關鍵：打上 truth_B 標籤，鎖定本局兇手為 B
    options: [{ label: "封鎖現場，開始調查", action: "advance_chain", rewards: { tags: ['truth_B', 'case_started'] } }]
},

// --- [階段 2: 搜證 (Investigate) - 尋找關鍵證據] ---
// 根據 truth 標籤，系統會自動過濾出正確的證據模板

{
    type: 'investigate', id: 'mys_clue_for_A',
    reqTag: 'truth_A', // 只有在兇手是 A 時才會出現
    text: { zh: [
        "你來到{noun_location_room}的角落，{verb_contact}了一個被藏起來的{noun_item_common}。",
        "仔細檢查後，你發現上面刻著{suspect_A}的名字，而且還沾著些許{adj_item_look}痕跡！",
        "這無疑是{suspect_A}犯案的關鍵證據。"
    ]},
    slots: ['noun_location_room', 'verb_contact', 'noun_item_common', 'suspect_A', 'adj_item_look'],
    options: [
        { 
            label: "收好這份關鍵證據", 
            action: "advance_chain", 
            rewards: { tags: ['evidence_got_A'], varOps: [{key:'clue', val:1, op:'+'}] } 
        }
    ]
},
{
    type: 'investigate', id: 'mys_clue_for_B',
    reqTag: 'truth_B', // 只有在兇手是 B 時才會出現
    text: { zh: [
        "你在沙發縫隙中{verb_detect}一股異味，隨後找到了一把{noun_item_weapon}。",
        "這東西屬於{suspect_B}，且表面{adj_item_look}。為什麼它會出現在這裡？",
        "所有的線索都指向了{suspect_B}。"
    ]},
    slots: ['verb_detect', 'noun_item_weapon', 'suspect_B', 'adj_item_look'],
    options: [
        { 
            label: "這就是鐵證", 
            action: "advance_chain", 
            rewards: { tags: ['evidence_got_B'], varOps: [{key:'clue', val:1, op:'+'}] } 
        }
    ]
},

// --- [階段 3: 轉折 (Twist) - 突發狀況] ---
// 通用模板，增加緊張感，不涉及誰是兇手

{
    type: 'twist', id: 'mys_twist_event',
    text: { zh: [
        "就在調查進行到一半時，{noun_location_building}的燈光{adv_time}熄滅了！",
        "黑暗中傳來了玻璃破碎的聲音和{noun_npc_generic}的尖叫聲。",
        "當燈光再次亮起，你發現現場被破壞了，有人試圖掩蓋真相。"
    ]},
    slots: ['noun_location_building', 'adv_time', 'noun_npc_generic'],
    options: [
        { label: "鎮定眾人，準備推理", action: "advance_chain" }
    ]
},

// --- [階段 4: 推理與指認 (Deduction) - 結局判定] ---
// 根據你是否持有 evidence 標籤來決定選項

{
    type: 'deduction', id: 'mys_final_logic',
    text: { zh: [
        "所有的碎片都已經拼湊完成。面對在場的眾人，你{adv_manner}走到了大廳中央。",
        "現在，是時候指出那個隱藏在幕後的真兇了。"
    ]},
    slots: ['adv_manner'],
    options: [
        // 選項 1：指控 A (正確條件：必須是路線 A 且拿到證據 A)
        { 
            label: "兇手是 {suspect_A}！", 
            condition: { tags: ['truth_A', 'evidence_got_A'] }, // 完美推理
            action: "finish_chain",
            nextScene: { 
                text: "「不...怎麼可能被發現...」{suspect_A}崩潰地跪倒在地，承認了罪行。\n你成功還原了真相。",
                rewards: { exp: 500, title: "名偵探" }
            }
        },
        // 選項 2：指控 B (正確條件：必須是路線 B 且拿到證據 B)
        { 
            label: "兇手是 {suspect_B}！", 
            condition: { tags: ['truth_B', 'evidence_got_B'] }, // 完美推理
            action: "finish_chain",
            nextScene: { 
                text: "{suspect_B}冷笑了一聲，試圖反駁，但在你的鐵證面前，他無話可說。\n正義得到了伸張。",
                rewards: { exp: 500, title: "名偵探" }
            }
        },
        // 選項 3：錯誤指控 (Fallback) - 如果你亂猜，或者劇情還沒走到拿到證據
        // 這裡做一個簡單處理：如果沒有上述 tag，就會進入錯誤結局
        { 
            label: "我...還不確定...", 
            action: "finish_chain",
            nextScene: { 
                text: "你猶豫了。就在這瞬間，真兇抓住了機會製造混亂逃跑了。\n雖然無人再受傷，但真相永遠石沈大海。",
                rewards: { exp: 50 }
            }
        }
    ]
},
       /* ============================================================
   [BLOCK B] 👻 現代心理恐怖流 (Asian Psychological Horror)
   特色：強調氛圍、壓抑、違和感與不可名狀的恐懼。
   ============================================================ */

{
    type: 'setup_omen', id: 'hor_psych_setup',
    // 階段一：日常的崩壞 (The Distortion)
    text: { zh: [
        "這裡本該是你熟悉的{noun_location_room}，但此刻看起來卻異常陌生。",
        "空氣中瀰漫著一股{adj_env_vibe}濕氣，牆角的陰影似乎比平常更深、更濃。",
        "你{adv_manner}停下腳步，總覺得有某種視線正在從{noun_env_feature}的縫隙中窺視著你。"
    ]},
    slots: ['noun_location_room', 'adj_env_vibe', 'adv_manner', 'noun_env_feature'],
    dialogue: [
        { speaker: "旁白", text: { zh: "（耳邊傳來一陣若有似無的竊笑聲，聽起來既像老人，又像嬰兒...）" } }
    ],
    options: [
        { 
            label: "強裝鎮定，忽視它", 
            action: "advance_chain", 
            rewards: { tags: ['horror_started'], varOps: [{ key: 'sanity', val: 90, op: 'set' }] } 
        },
        { 
            label: "檢查聲音的來源", 
            action: "advance_chain", 
            rewards: { tags: ['horror_started', 'marked_by_curse'], varOps: [{ key: 'sanity', val: 80, op: 'set' }] },
            nextScene: { text: "你湊近一看，那裡什麼都沒有，只有一團糾結的黑色髮絲，散發著腥臭味。" }
        }
    ]
},

{
    type: 'encounter_stalk', id: 'hor_psych_stalk',
    reqTag: 'horror_started',
    // 階段二：無形的逼近 (The Stalking)
    text: { zh: [
        "你試圖離開，但走廊彷彿沒有盡頭。身後傳來了「啪嗒、啪嗒」的濕黏腳步聲。",
        "那聲音極不規律，就像是某種肢體扭曲的東西，正手腳並用在地上{adv_manner}爬行。",
        "它正在{verb_move_univ}，而且它知道你在哪裡。"
    ]},
    slots: ['adv_manner', 'verb_move_univ'],
    dialogue: [
        { speaker: "？？？", text: { zh: "嘻嘻... 找到... 你了..." } } // 不寫死名字，用???增加未知感
    ],
    options: [
        { 
            label: "屏住呼吸，躲進死角", 
            style: "primary", // 重點選項
            check: { stat: 'INT', val: 5 }, // 智力檢定：能否保持冷靜
            action: "advance_chain", 
            nextScene: { text: "你摀住口鼻，心臟劇烈跳動。那東西停在你的藏身處外，發出了指甲刮擦地板的聲音... 然後慢慢離開了。" },
            failScene: { text: "恐懼讓你發出了喘息聲。那腳步聲立刻停了下來，然後猛地轉向你！", rewards: { varOps: [{key:'sanity', val:20, op:'-'}] }, nextTags:['danger_high'] }
        },
        { 
            label: "不要回頭，狂奔！", 
            action: "advance_chain", 
            nextTags: ['risk_high'],
            nextScene: { text: "你{adv_manner}向前衝刺，感覺冰冷的手指擦過了你的後頸..." }
        }
    ]
},

{
    type: 'encounter_climax', id: 'hor_psych_look',
    reqTag: 'danger_high', // 只有在上一階段失敗或作死時觸發
    // 階段三：直面恐懼 (Don't Look) - 亞洲恐怖經典橋段
    text: { zh: [
        "無路可退了。那個{noun_role_monster}（或者說是曾經是人的東西）就懸掛在天花板上。",
        "它的頭顱以詭異的角度轉了180度，死白色的眼珠正死死盯著你。",
        "所有的本能都在尖叫：**絕對不能和它對視**。"
    ]},
    slots: ['noun_role_monster'],
    options: [
        { 
            label: "緊閉雙眼，唸誦祈禱", 
            action: "advance_chain", 
            check: { stat: 'LUCK', val: 5 }, // 運氣檢定
            nextScene: { text: "你感到一股冰冷的氣息貼著臉頰滑過，耳邊是骨骼摩擦的脆響... 但最終，它似乎對靜止的獵物失去了興趣。" },
            failScene: { text: "你忍不住睜開了一條縫... 一張布滿血絲的臉正貼在你的鼻尖前，露出了裂到耳根的笑容。", rewards: { varOps: [{key:'sanity', val:50, op:'-'}] } }
        },
        { 
            label: "用手電筒強光照射它！", 
            style: "danger",
            action: "finish_chain",
            nextScene: { text: "光線照亮了它的全貌——那景象超越了人類理智的極限。你的意識在尖叫中斷線了。\n【結局：精神崩潰】" }
        }
    ]
},

{
    type: 'final_survival', id: 'hor_psych_end',
    // 階段四：餘悸 (The Lingering Curse) - 開放式恐怖結局
    text: { zh: [
        "不知道過了多久，周圍終於恢復了死寂。你{adv_manner}推開門，衝進了外面的陽光中。",
        "人群的喧囂聲讓你感到一陣恍惚。你以為你逃掉了。",
        "但當你低頭看時，發現自己的腳踝上，多了一個青紫色的手印，而且...還在發燙。"
    ]},
    slots: ['adv_manner'], 
    options: [
        { 
            label: "這只是一個開始...", 
            action: "finish_chain", 
            rewards: { 
                removeTags: ['horror_started', 'danger_high'], 
                title: "倖存者(？)",
                exp: 300
            } 
        }
    ]
},

        /* ============================================================
   [BLOCK C] ⚔️ 異世界戰記 (Isekai Chronicles) - V82.0
   特色：職業分歧、動態戰鬥描述、遺跡探索。
   ============================================================ */

// --- [階段 1: 覺醒與職業選擇 (Setup)] ---
{
    type: 'setup', id: 'isekai_start_class',
    text: { zh: [
        "強烈的暈眩感退去後，你發現自己身處於一片{adj_env_vibe}{noun_location_building}之中。",
        "天空中懸掛著破碎的月亮，遠處傳來了{noun_role_monster}的嘶吼聲。",
        "你低頭看了看自己的雙手，意識到自己必須依靠手中的武器活下去。"
    ]},
    slots: ['adj_env_vibe', 'noun_location_building', 'noun_role_monster'],
    options: [
        { 
            label: "握緊重劍 (戰士路線)", 
            action: "advance_chain", 
            rewards: { tags: ['class_warrior'], varOps: [{key:'hp', val:120, op:'set'}, {key:'str', val:10, op:'set'}] },
            nextScene: { text: "沉重的劍身給了你安全感。無論前方有什麼，你都將一刀兩斷。" }
        },
        { 
            label: "詠唱咒文 (法師路線)", 
            action: "advance_chain", 
            rewards: { tags: ['class_mage'], varOps: [{key:'mp', val:100, op:'set'}, {key:'int', val:10, op:'set'}] },
            nextScene: { text: "元素在你指尖跳動。知識就是力量，而你掌握著毀滅的知識。" }
        },
        { 
            label: "檢查短刀 (刺客路線)", 
            action: "advance_chain", 
            rewards: { tags: ['class_rogue'], varOps: [{key:'agi', val:10, op:'set'}] },
            nextScene: { text: "你壓低了身形，與陰影融為一體。在被發現之前，敵人就已經死了。" }
        }
    ]
},

// --- [階段 2: 遭遇戰 (Event - Battle)] ---
// 利用副詞和動詞，讓戰鬥更有畫面感
{
    type: 'event_battle', id: 'isekai_battle_ambush',
    text: { zh: [
        "草叢中傳來了急促的沙沙聲。你{adv_manner}轉過身，正好迎面撞上了一隻{noun_role_monster}！",
        "它{adv_manner}張開了利爪，眼裡閃爍著{adj_npc_trait}紅光，顯然已經飢餓難耐。",
        "避無可避，唯有死戰。"
    ]},
    slots: ['adv_manner', 'noun_role_monster', 'adj_npc_trait'],
    options: [
        { 
            label: "正面迎擊 (STR檢定)", 
            check: { stat: 'STR', val: 5 }, 
            action: "advance_chain", 
            nextScene: { text: "你發出怒吼，武器帶著破風聲重重擊中了它！怪物發出哀嚎，倒在地上抽搐著。" }, 
            failScene: { text: "你的力量輸給了它的野性。它將你撲倒在地，利爪在你身上留下了深可見骨的傷痕。", rewards: { energy: -20 } } 
        },
        { 
            label: "尋找破綻 (INT檢定)", 
            check: { stat: 'INT', val: 5 }, 
            action: "advance_chain", 
            nextScene: { text: "你冷靜地觀察它的動作，在它撲過來的瞬間側身閃過，並精準地刺入了它的要害。" },
            failScene: { text: "它的動作比你預想的更快！你判斷失誤，只能狼狽地在地上打滾躲避攻擊。", rewards: { energy: -15 } } 
        }
    ]
},
{
    type: 'event_battle', id: 'isekai_battle_magic',
    reqTag: 'class_mage', // 法師專屬劇情
    text: { zh: [
        "前方的道路被一群{noun_role_monster}擋住了。牠們似乎對魔法波動非常敏感。",
        "你感覺到周圍的元素正在躁動，這是一個釋放大型魔法的絕佳機會。"
    ]},
    slots: ['noun_role_monster'],
    options: [
        { 
            label: "詠唱「爆裂火球」！", 
            action: "advance_chain", 
            rewards: { varOps: [{key:'mp', val:20, op:'-'}] }, // 扣魔力
            nextScene: { text: "巨大的火球在怪物群中炸裂！空氣中充滿了焦糊味，敵人瞬間化為了灰燼。" }
        }
    ]
},

// --- [階段 3: 探索與奇遇 (Event - Explore)] ---
// 強調環境氛圍與物品獲取
{
    type: 'event_explore', id: 'isekai_explore_ruin',
    text: { zh: [
        "你發現了一座被藤蔓覆蓋的古代遺跡。這裡的空氣異常{adj_env_vibe}。",
        "在斷裂的石柱旁，躺著一具白骨，他的手裡還死死抓著一個{noun_item_common}。",
        "那是某種信物？還是帶來不幸的詛咒之物？"
    ]},
    slots: ['adj_env_vibe', 'noun_item_common'],
    options: [
        { 
            label: "撿起物品", 
            action: "advance_chain", 
            rewards: { tags: ['item_found'], gold: 50 },
            nextScene: { text: "你擦去了上面的灰塵。雖然年代久遠，但它依然散發著微弱的魔力波動。" }
        },
        { 
            label: "雙手合十，轉身離開", 
            action: "advance_chain",
            rewards: { varOps: [{key:'sanity', val:10, op:'+'}] } // 回復理智
        }
    ]
},
{
    type: 'event_explore', id: 'isekai_explore_trap',
    text: { zh: [
        "你正{adv_manner}走在狹窄的通道中，腳下的地磚突然下陷！",
        "「喀嚓」一聲，機關被觸發了。兩側的牆壁開始噴射出毒箭。",
        "這是一個致命的陷阱！"
    ]},
    slots: ['adv_manner'],
    options: [
        { 
            label: "靠反應閃避 (AGI檢定)", 
            check: { stat: 'AGI', val: 5 }, 
            action: "advance_chain", 
            nextScene: { text: "你的身體比意識更快做出了反應！你在箭雨中穿梭，毫髮無傷地落在了安全區。" },
            failScene: { text: "你盡力躲避了，但一支毒箭還是擦傷了你的手臂。傷口傳來了一陣麻痺感。", rewards: { energy: -30 } } 
        }
    ]
},

// --- [階段 4: 頭目戰 (Boss)] ---
// 史詩感的戰鬥
{
    type: 'boss', id: 'isekai_boss_dragon',
    text: { zh: [
        "大地的震動越來越劇烈。在{noun_location_building}的最深處，一雙巨大的眼睛睜開了。",
        "那是傳說中的災厄——{noun_role_monster}（變異體）！",
        "它{adv_manner}發出了震耳欲聾的咆哮，強大的風壓幾乎讓你站立不穩。",
        "這就是旅途的終點嗎？還是成為傳說的起點？"
    ]},
    slots: ['noun_location_building', 'noun_role_monster', 'adv_manner'],
    options: [
        { 
            label: "拔劍，決一死戰！", 
            style: "danger",
            check: { stat: 'STR', val: 8 }, 
            action: "finish_chain",
            nextScene: { 
                text: "【結局：屠龍英雄】\n你燃燒了最後的生命力，將劍送入了怪物的心臟。你的名字將被吟遊詩人永遠傳唱。",
                rewards: { exp: 2000, title: "傳說勇者" }
            },
            failScene: {
                text: "【結局：無名的屍骸】\n實力的差距是絕望的。你的武器折斷了，視野逐漸被黑暗吞沒...",
                rewards: { exp: 500 }
            }
        }
    ]
},

    /* ============================================================
   [BLOCK D] 💕 戀愛博弈流 (Romance Strategy) - V82.0
   特色：社交陷害、情敵對決、信任危機、高張力告白。
   ============================================================ */

// --- [階段 1: 命運的相遇 (Meet)] ---
{
    type: 'love_meet', id: 'rom_meet_drama',
    text: { zh: [
        "在{noun_location_building}的{noun_location_room}，你正專注於手中的事務。",
        "突然，一位{adj_npc_trait}{lover}因躲避人群而撞到了你懷裡，帶著一股淡淡的香氣。",
        "就在這時，遠處傳來了{rival}尖銳的聲音：「在那裡！別讓那個『小偷』跑了！」",
        "這似乎是一場誤會，但卻將你捲入了風暴中心。"
    ]},
    slots: ['noun_location_building', 'noun_location_room', 'lover', 'rival', 'adj_npc_trait'],
    options: [
        { 
            label: "挺身而出保護他/她", 
            action: "advance_chain", 
            rewards: { tags: ['romantic_vibe'], varOps: [{key:'love_meter', val:15, op:'set'}, {key:'trust', val:10, op:'set'}] },
            nextScene: { text: "你冷靜地擋在{lover}身前，懾人的氣勢讓追兵猶豫了。{lover}抬頭看著你，眼中閃過一絲驚訝與感激。" }
        },
        { 
            label: "冷靜地協助解圍", 
            action: "advance_chain",
            rewards: { varOps: [{key:'love_meter', val:5, op:'set'}, {key:'trust', val:20, op:'set'}] },
            nextScene: { text: "你用幾句巧妙的謊言打發了追兵。{lover}鬆了一口氣，對你的機智印象深刻。" }
        }
    ]
},

// --- [階段 2: 建立羈絆 (Bond)] ---
{
    type: 'love_bond', id: 'rom_bond_secret',
    reqTag: 'romantic_vibe',
    text: { zh: [
        "為了感謝你的幫助，{lover}約你在一個{adj_env_vibe}角落見面。",
        "這裡沒有{rival}的眼線。{lover}向你吐露了心聲，原來他/她一直受到{rival}的打壓與排擠。",
        "你看著對方{adj_npc_trait}側臉，心中產生了保護欲。"
    ]},
    slots: ['adj_env_vibe', 'lover', 'rival', 'adj_npc_trait'],
    options: [
        { 
            label: "承諾成為同盟", 
            action: "advance_chain", 
            rewards: { varOps: [{key:'love_meter', val:10, op:'+'}, {key:'trust', val:10, op:'+'}] },
            nextScene: { text: "你們的手指不經意間碰在了一起。從今天起，你們是共犯，也是彼此的依靠。" }
        },
        { 
            label: "提供戰術建議 (INT檢定)", 
            check: { stat: 'INT', val: 5 }, 
            action: "advance_chain", 
            nextScene: { text: "你精準地分析了局勢，{lover}聽得入神，眼神中充滿了崇拜。" }
        }
    ]
},

// --- [階段 3: 社交陷害 (Scheme)] ---
// 這是高潮的前奏，情敵發動攻擊
{
    type: 'love_scheme', id: 'rom_scheme_rumor',
    text: { zh: [
        "平靜的日子被打破了。{noun_location_building}裡開始流傳關於你的惡毒謠言。",
        "人們對你指指點點，謠言的源頭直指{rival}。",
        "更糟糕的是，{rival}拿著一份偽造的{noun_item_record}找到了{lover}，試圖證明你接近他是別有用心。"
    ]},
    slots: ['noun_location_building', 'rival', 'noun_item_record', 'lover'],
    dialogue: [
        { speaker: "{rival}", text: { zh: "看清楚了吧？這個人只是在利用你！只有我才是真正為你好。" } }
    ],
    options: [
        { 
            label: "立刻衝去解釋", 
            action: "advance_chain", 
            rewards: { varOps: [{key:'trust', val:10, op:'-'}] }, // 衝動會扣信任
            nextScene: { text: "你的焦急反而顯得心虛。{lover}雖然沒有完全相信，但眼中多了一絲疑慮。" }
        },
        { 
            label: "蒐集證據，準備反擊", 
            action: "advance_chain",
            rewards: { tags: ['counter_ready'] }, // 獲得反擊標籤
            nextScene: { text: "你按兵不動，{adv_manner}調查了謠言的來源，終於抓到了{rival}的把柄。" }
        }
    ]
},

// --- [階段 4: 絕地反擊 (Counter)] ---
// 爽文情節：當眾打臉
{
    type: 'love_counter', id: 'rom_counter_slap',
    text: { zh: [
        "這是一場盛大的{noun_location_room}聚會，所有人都在場。",
        "{rival}正得意洋洋地高談闊論，準備將你徹底逐出社交圈。",
        "這是最後的機會，你要如何挽回局面？"
    ]},
    slots: ['noun_location_room', 'rival'],
    options: [
        { 
            label: "當眾揭穿陰謀 (需反擊標籤)", 
            condition: { tags: ['counter_ready'] },
            style: "primary",
            action: "advance_chain",
            rewards: { varOps: [{key:'love_meter', val:30, op:'+'}, {key:'fame', val:50, op:'+'}] },
            nextScene: { text: "你拿出了證據，條理清晰地駁斥了所有謊言。{rival}臉色慘白，在眾人的嘲笑聲中狼狽逃離。\n{lover}感動地看著你，眼裡只有你一人。" }
        },
        { 
            label: "深情告白感動全場", 
            check: { stat: 'CHR', val: 8 }, // 高魅力檢定
            action: "advance_chain",
            nextScene: { text: "你無視了所有指控，只是堅定地說出了對{lover}的心意。真誠打動了所有人，{rival}的謠言不攻自破。" },
            failScene: { text: "你的聲音在顫抖，大家似乎並不買帳。局面變得更加尷尬了。", rewards: { varOps: [{key:'love_meter', val:20, op:'-'}] } }
        }
    ]
},

// --- [階段 5: 告白結局 (Confession)] ---
{
    type: 'love_confession', id: 'rom_end_victory',
    text: { zh: [
        "風波終於平息。在{adj_env_vibe}月光下，你和{lover}再次來到了初遇的地方。",
        "經歷了背叛與考驗，你們之間的羈絆已經堅不可摧。",
        "{lover}主動牽起了你的手，等待著你的回應。"
    ]},
    slots: ['adj_env_vibe', 'lover'],
    options: [
        { 
            label: "「我們是最佳拍檔，也是戀人。」", 
            condition: { var: { key: 'love_meter', val: 50, op: '>=' } },
            style: "primary",
            action: "finish_chain", 
            nextScene: { 
                text: "【True End: 權力與愛情】\n{lover}笑著吻了你。「沒錯，只要我們聯手，沒有人能將我們分開。」\n你們不僅收穫了愛情，更成為了令人敬畏的傳奇伴侶。",
                rewards: { exp: 1200, title: "社交界霸主" }
            }
        },
        { 
            label: "「我累了，只想過平靜的生活。」", 
            action: "finish_chain", 
            nextScene: { 
                text: "【Normal End: 遠離塵囂】\n你拒絕了權力的遊戲，帶著{lover}遠走高飛。雖然失去了地位，但至少你們擁有了彼此的寧靜。",
                rewards: { exp: 500 }
            }
        },
        {
            label: "默然離去 (好感不足)",
            condition: { var: { key: 'love_meter', val: 50, op: '<' } },
            action: "finish_chain",
            nextScene: { text: "【Bad End: 錯過的緣分】\n儘管誤會解開，但你們之間的傷痕太深。你轉身離開，留下了一個孤獨的背影。" }
        }
    ]
},

        /* ============================================================
   [BLOCK E] 🌱 明星推手/養成流 (The Mentor) - V82.0
   特色：通用養成（人/獸/靈），強調導師的抉擇與培育。
   ============================================================ */

// --- [階段 1: 命運的相遇 (Meet)] ---
{
    type: 'raise_meet', id: 'raise_start_select',
    text: { zh: [
        "這是一個{adj_env_vibe}日子，你在{noun_location_building}的角落發現了那個獨特的存在。",
        "那是一位{adj_npc_trait}{trainee}，雖然現在還很弱小，但你從對方的眼神中看到了無限的潛力。",
        "命運將你們聯繫在了一起，你決定成為對方的..."
    ]},
    slots: ['adj_env_vibe', 'noun_location_building', 'adj_npc_trait', 'trainee'],
    options: [
        { 
            label: "嚴厲的導師 (注重實力)", 
            action: "advance_chain", 
            rewards: { tags: ['style_power'], varOps: [{key:'str', val:30, op:'set'}, {key:'chr', val:10, op:'set'}] },
            nextScene: { text: "你走上前去，伸出了手。「想變強嗎？那就跟著我。」對方猶豫片刻後，緊緊握住了你的手。" }
        },
        { 
            label: "溫柔的守護者 (注重魅力)", 
            action: "advance_chain", 
            rewards: { tags: ['style_charm'], varOps: [{key:'str', val:10, op:'set'}, {key:'chr', val:30, op:'set'}] },
            nextScene: { text: "你溫柔地笑了笑，給予了對方最需要的溫暖。從那一刻起，你成為了對方最依賴的港灣。" }
        }
    ]
},

// --- [階段 2: 成長與訓練 (Train)] ---
{
    type: 'raise_train', id: 'raise_train_day',
    text: { zh: [
        "時光飛逝，{trainee}在你的指導下飛速成長。",
        "今天是一個關鍵的訓練日，你看著對方{adv_manner}練習著。",
        "現在正是突破瓶頸的好機會，你決定安排..."
    ]},
    slots: ['trainee', 'adv_manner'],
    options: [
        { 
            label: "魔鬼特訓 (體能/戰鬥)", 
            action: "advance_chain", 
            rewards: { varOps: [{key:'str', val:20, op:'+'}, {key:'stress', val:15, op:'+'}] },
            nextScene: { text: "汗水（或血汗）揮灑在訓練場上。雖然過程痛苦，但對方的眼神越來越銳利，實力大幅提升。" }
        },
        { 
            label: "藝術薰陶 (表演/靈性)", 
            action: "advance_chain", 
            rewards: { varOps: [{key:'chr', val:20, op:'+'}, {key:'gold', val:-50, op:'+'}] }, // 花錢上課
            nextScene: { text: "優雅的舉止與氣質逐漸成形。對方的一舉一動都開始散發著迷人的魅力，吸引了周圍的目光。" }
        },
        { 
            label: "放鬆休息 (消除壓力)", 
            action: "advance_chain",
            rewards: { varOps: [{key:'stress', val:30, op:'-'}] },
            nextScene: { text: "勞逸結合是必要的。看著{trainee}開心的睡臉（或笑臉），你感到一陣欣慰。" }
        }
    ]
},

// --- [階段 3: 初次登台/試煉 (Debut)] ---
{
    type: 'raise_debut', id: 'raise_event_show',
    text: { zh: [
        "{trainee}迎來了第一次公開展示的機會——在{noun_location_room}舉行的選拔賽。",
        "台下（或場邊）坐滿了挑剔的觀眾和評審。你的勁敵{rival}也帶著他培育的精英出現了。",
        "{rival}冷笑著說：「這種水準也敢出來丟人現眼？」"
    ]},
    slots: ['trainee', 'noun_location_room', 'rival'],
    options: [
        { 
            label: "展示華麗的技巧 (檢定魅力)", 
            check: { stat: 'CHR', val: 50 }, 
            action: "advance_chain", 
            nextScene: { text: "全場都被那驚人的美感征服了！掌聲雷動，{rival}的臉色變得鐵青。", rewards: { gold: 300, tags: ['fame_mid'] } },
            failScene: { text: "或許是太緊張了，表演中出現了一個小失誤。雖然觀眾給予了鼓勵，但離完美還差一點。", rewards: { varOps: [{key:'stress', val:10, op:'+'}] } }
        },
        { 
            label: "展示壓倒性的力量 (檢定實力)", 
            check: { stat: 'STR', val: 50 }, 
            action: "advance_chain", 
            nextScene: { text: "轟！震撼的實力展示讓全場鴉雀無聲，隨後爆發出驚嘆的歡呼。這是強者的證明！", rewards: { gold: 300, tags: ['fame_mid'] } }
        }
    ]
},

// --- [階段 4: 最終決戰/進化 (Climax)] ---
{
    type: 'raise_climax', id: 'raise_final_battle',
    reqTag: 'fame_mid', // 需要有一定名氣才能進決賽
    text: { zh: [
        "決戰之日終於來臨。這不僅是{trainee}的舞台，也是檢驗你教育成果的時刻。",
        "站在巔峰的對手強大得令人窒息，但你的{trainee}已經不再是當初那個弱小的存在了。",
        "在此刻，你想對他說/牠最後一句話是..."
    ]},
    slots: ['trainee'],
    options: [
        { 
            label: "「去吧，讓世界看到你的光芒！」", 
            action: "advance_chain", 
            rewards: { varOps: [{key:'chr', val:10, op:'+'}, {key:'str', val:10, op:'+'}] },
            nextScene: { text: "{trainee}回頭看了你一眼，眼神中充滿了信任。然後，毅然決然地踏上了決戰的舞台。" }
        }
    ]
},

// --- [階段 5: 傳說結局 (Ending)] ---
{
    type: 'raise_ending', id: 'raise_end_result',
    text: { zh: [
        "塵埃落定。傳說已經誕生。",
        "你看著眼前這個光芒萬丈的存在，回想起最初在{noun_location_building}相遇的那一刻。",
        "這段旅程，終於畫上了句點。"
    ]},
    slots: ['noun_location_building'],
    options: [
        { 
            label: "見證：至高偶像/女神 (CHR > 100)", 
            condition: { vars: [{key:'chr', val:100, op:'>='}] },
            style: "primary",
            action: "finish_chain", 
            nextScene: { 
                text: "【結局：世界的寵兒】\n{trainee}成為了被世人傳頌的偶像（或神獸）。無論走到哪裡，都伴隨著鮮花與掌聲。\n而你，是造就這奇蹟的傳奇導師。",
                rewards: { exp: 2000, title: "金牌製作人" }
            }
        },
        { 
            label: "見證：最強戰神/獸王 (STR > 100)", 
            condition: { vars: [{key:'str', val:100, op:'>='}] },
            style: "danger",
            action: "finish_chain", 
            nextScene: { 
                text: "【結局：頂點的霸者】\n以絕對的力量君臨天下！{trainee}的名字成為了力量的代名詞。\n這份榮耀，有一半屬於在背後默默支持的你。",
                rewards: { exp: 2000, title: "王者之師" }
            }
        },
        { 
            label: "回歸平凡的幸福", 
            action: "finish_chain", 
            nextScene: { 
                text: "【結局：相伴的旅途】\n雖然沒有成為傳說，但你們收穫了彼此的信任。你們決定離開聚光燈，去尋找屬於自己的平靜生活。",
                rewards: { exp: 800 }
            }
        }
    ]
},

        // ==========================================
        // [BLOCK D] 🧩 萬用填充區 (Universal Filler)
        // ==========================================
        {
            type: 'event', id: 'filler_rest',
            text: { zh: [
                "經歷了剛才的波折，你感到身心俱疲。你找到了一個相對乾燥且隱蔽的角落，決定稍作休息。",
                "這裡暫時沒有危險的氣息，只有遠處偶爾傳來的風聲，正好可以整理一下思緒。"
            ]},
            options: [{ label: "閉目養神，恢復體力 (精力+5)", action: "advance_chain", rewards: { energy: 5 } }]
        },
        {
            type: 'event', id: 'filler_noise',
            text: { zh: [
                "突然，一陣奇怪的聲響讓你立刻停下了腳步。你屏住呼吸，死死盯著黑暗的深處。",
                "手心捏了一把冷汗，心臟劇烈跳動。幾秒鐘後，一隻肥碩的老鼠從角落竄出，原來只是虛驚一場。"
            ]},
            options: [{ label: "鬆了一口氣，繼續前進", action: "advance_chain" }]
        },
        {
            type: 'event', id: 'univ_merchant',
            text: { zh: [
                "在轉角的陰影中，你遇到了一位戴著烏鴉面具的神秘商人。他身邊堆滿了各種奇奇怪怪的道具。",
                "這看起來像是一個移動的雜貨舖，不知道他為什麼會出現在這種危險的地方。"
            ]},
            dialogue: [{ speaker: "商人", text: { zh: "嘿嘿... 旅行者，需要點好東西來保命嗎？只要你有足夠的金幣。" } }],
            options: [
                { 
                    label: "購買關鍵情報 (金幣-50)", 
                    condition: { var: { key: 'gold', val: 50, op: '>=' } },
                    action: "advance_chain", 
                    rewards: { gold: -50, tags: ['clue_found', 'motive_confirmed'] } 
                },
                { label: "搖搖頭離開", action: "advance_chain" }
            ]
        },
        {
            type: 'event', id: 'univ_lucky_chest',
            text: { zh: [
                "在廢墟的瓦礫堆中，你發現了一個散發著微弱金光的寶箱。箱子上沒有鎖，上面刻著一行古老的文字。",
                "『獻給有緣人』。這是命運的餽贈？還是一個致命的陷阱？"
            ]},
            options: [
                { 
                    label: "賭一把打開它 (LUCK檢定)", 
                    check: { stat: 'LUCK', val: 1 }, 
                    action: "advance_chain",
                    nextScene: { text: "哇！裡面裝滿了古代金幣和寶石！運氣太好了！", rewards: { gold: 100, tags: ['lucky_buff'] } },
                    failScene: { text: "是寶箱怪！它狠狠咬了你的手一口，你痛得甩開了它。", rewards: { energy: -10 } }
                },
                { label: "太可疑了，無視", action: "advance_chain" }
            ]
        },
		{
            type: 'boss', id: 'univ_boss_shadow',
            // 注意：這裡不設 reqTag，確保任何人都能抽到
            text: { zh: [
                "冒險的終點，一股強大的惡意擋住了去路。",
                "那是一個模糊的{enemy}，它似乎是由你一路上所有的恐懼凝聚而成的。",
                "避無可避，只能背水一戰！"
            ]},
            slots: ['enemy'], // 會自動從名詞庫隨機抽一個敵人
            dialogue: [
                { speaker: "旁白", text: { zh: "它發出了震耳欲聾的咆哮，準備發動最後的攻擊！" } }
            ],
            options: [
                { 
                    label: "正面迎擊！(STR檢定)", 
                    check: { stat: 'STR', val: 5 }, 
                    action: "finish_chain",
                    nextScene: { text: "你用盡全力擊倒了它！勝利屬於你！", rewards: { exp: 500, gold: 100 } },
                    failScene: { text: "你雖然擊退了它，但也受了重傷...", rewards: { exp: 200, energy: -20 } }
                },
                { 
                    label: "尋找弱點突襲 (INT檢定)", 
                    check: { stat: 'INT', val: 5 }, 
                    action: "finish_chain",
                    nextScene: { text: "你發現了它的破綻，一擊必殺！", rewards: { exp: 600, gold: 150 } },
                    failScene: { text: "你判斷失誤，險些喪命...", rewards: { exp: 200, energy: -20 } }
                }
            ]
        },
		{
            type: 'setup', id: 'univ_setup_tavern',
            text: { zh: [
                "你推開了酒館沈重的橡木門，喧鬧的聲音撲面而來。",
                "冒險者們在此交換著情報與故事，而你正在尋找下一個委託。",
                "酒保擦著杯子，眼神示意牆角有一個神祕的人在等你。"
            ]},
            slots: ['location_base'], 
            options: [
                { 
                    label: "走向角落的神祕人 (進入懸疑線)", 
                    action: "advance_chain", 
                    rewards: { tags: ['case_started'] } // 雖然是通用開頭，但也可以引導去懸疑線
                },
                { 
                    label: "向酒保打聽消息 (進入冒險線)", 
                    action: "advance_chain",
                    rewards: { tags: ['style_selected'] }
                }
            ]
        },
        {
            type: 'setup', id: 'univ_setup_crossroad',
            text: { zh: [
                "你站在命運的十字路口，濃霧遮蔽了前方的道路。",
                "路標上的字跡已經模糊不清，但你必須做出選擇。",
                "左邊傳來了野獸的低吼，右邊則瀰漫著一股詭異的花香。"
            ]},
            options: [
                { 
                    label: "往左邊走 (戰鬥)", 
                    action: "advance_chain", 
                    rewards: { tags: ['style_combat'], varOps: [{key:'hp', val:100, op:'set'}] } 
                },
                { 
                    label: "往右邊走 (探索)", 
                    action: "advance_chain", 
                    rewards: { tags: ['clue_found'] }
                }
            ]
        },
    ]
};