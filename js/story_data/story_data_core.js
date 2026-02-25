/* js/story_data/story_data_core.js (V4 極致脫水與環境補完版) */
(function() {
    window.FragmentDB = window.FragmentDB || { fragments: {}, templates: [] };
    const DB = window.FragmentDB;

    Object.assign(DB.fragments, {
    // ============================================================
    // 🧱 [Layer 0] 原子詞彙 (Atomic Words) - 完全脫水，不帶「的」
    // ============================================================
    
    // 👤 人物/生物基礎
    atom_person: [ { val: "男子" }, { val: "女子" }, { val: "老人" }, { val: "小孩" }, { val: "人影" }, { val: "青年" }, { val: "少女" }, { val: "壯漢" }, { val: "婦人" }, { val: "旅人" }, { val: "路人" }, { val: "陌生人" }, { val: "流浪者" }, { val: "乞丐" }, { val: "村民" }, { val: "信使" }, { val: "僕從" }, { val: "傷者" }, { val: "倖存者" }, { val: "目擊者" }, { val: "訪客" }, { val: "囚犯" }, { val: "逃亡者" }, { val: "生還者" }, { val: "無名者" }, { val: "黑影" }, { val: "身影" } ],

atom_title: [ { val: "大亨" }, { val: "守衛" }, { val: "管家" }, { val: "寡婦" }, { val: "偵探" }, { val: "會長" }, { val: "貴族" }, { val: "騎士" }, { val: "王子" }, { val: "公主" }, { val: "領主" }, { val: "城主" }, { val: "祭司" }, { val: "主教" }, { val: "修女" }, { val: "刺客" }, { val: "傭兵" }, { val: "獵人" }, { val: "法師" }, { val: "術士" }, { val: "學者" }, { val: "教授" }, { val: "醫生" }, { val: "藥師" }, { val: "船長" }, { val: "提督" }, { val: "將軍" }, { val: "軍官" }, { val: "密探" }, { val: "間諜" }, { val: "叛徒" }, { val: "繼承人" }, { val: "監護人" }, { val: "代理人" }, { val: "審判官" }, { val: "典獄長" }, { val: "賢者" }, { val: "先知" }, { val: "占卜師" } ],

atom_monster: [ { val: "野狼" }, { val: "機械人偶" }, { val: "蝙蝠" }, { val: "史萊姆" }, { val: "怨靈" }, { val: "巨狼" }, { val: "魔狼" }, { val: "殭屍" }, { val: "骷髏" }, { val: "食屍鬼" }, { val: "幽靈" }, { val: "惡靈" }, { val: "鬼魂" }, { val: "妖怪" }, { val: "魔物" }, { val: "怪物" }, { val: "異形" }, { val: "變異體" }, { val: "寄生獸" }, { val: "觸手怪" }, { val: "巨蛛" }, { val: "魔像" }, { val: "石像鬼" }, { val: "人偶" }, { val: "詛咒人偶" }, { val: "傀儡" }, { val: "機械守衛" }, { val: "自動機兵" }, { val: "龍" }, { val: "幼龍" }, { val: "魔龍" }, { val: "飛龍" }, { val: "吸血鬼" }, { val: "狼人" }, { val: "夢魘" }, { val: "影魔" } ],
    
    // 🏷️ 人物/生物修飾 (脫水版)

atom_age: [ {val:""}, { val: "年輕" }, { val: "年邁" }, { val: "稚嫩" }, { val: "幼小" }, { val: "成熟" }, { val: "中年" }, { val: "蒼老" }, { val: "古老" }, { val: "不朽" }, { val: "永恆" }, { val: "新生" } ],

atom_status: [ {val:""}, { val: "制服" }, { val: "失控" }, { val: "神祕" }, { val: "古代" }, { val: "重傷" }, { val: "落魄" }, { val: "受傷" }, { val: "虛弱" }, { val: "疲憊" }, { val: "染血" }, { val: "破碎" }, { val: "腐敗" }, { val: "墮落" }, { val: "覺醒" }, { val: "沉睡" }, { val: "甦醒" }, { val: "隱藏" }, { val: "被遺忘" }, { val: "被詛咒" }, { val: "狂暴" }, { val: "異化" }, { val: "變異" }, { val: "侵蝕" }, { val: "封印" } ],

atom_domain: [ {val:""}, { val: "珠寶" }, { val: "石油" }, { val: "科技" }, { val: "魔法" }, { val: "地下" }, { val: "金融" }, { val: "軍事" }, { val: "醫療" }, { val: "學術" }, { val: "宗教" }, { val: "王室" }, { val: "黑市" }, { val: "犯罪" }, { val: "影子" }, { val: "深海" }, { val: "森林" }, { val: "沙漠" }, { val: "虛空" }, { val: "異界" }, { val: "夢境" }, { val: "機械" }, { val: "血族" }, { val: "亡靈" }, { val: "禁忌" } ],

atom_manner: [ {val:""}, { val: "驚恐" }, { val: "奮不顧身" }, { val: "張牙舞爪" }, { val: "冷靜" }, { val: "興奮" }, { val: "顫抖" }, { val: "絕望" }, { val: "麻木" }, { val: "狂笑" }, { val: "低語" }, { val: "咆哮" }, { val: "潛伏" }, { val: "徘徊" }, { val: "凝視" }, { val: "追逐" }, { val: "逃竄" }, { val: "掙扎" }, { val: "守望" }, { val: "盤踞" }, { val: "俯視" }, { val: "飢餓" }, { val: "渴望" }, { val: "敵視" }, { val: "警戒" } ],

    // ⚔️ 物品基礎 (脫水版)

atom_mat: [ {val:""}, { val: "黃銅" }, { val: "純銀" }, { val: "生鏽" }, { val: "皮革" }, { val: "骨製" }, { val: "鐵製" }, { val: "鋼製" }, { val: "木製" }, { val: "青銅" }, { val: "黑鐵" }, { val: "水晶" }, { val: "玻璃" }, { val: "玉石" }, { val: "黑曜石" }, { val: "象牙" }, { val: "石製" }, { val: "鍍金" }, { val: "秘銀" }, { val: "隕鐵" }, { val: "機械" }, { val: "齒輪" }, { val: "異界" }, { val: "不明材質" }, { val: "血肉" }, { val: "骸骨" } ],

atom_item_state: [ {val:""}, { val: "破碎" }, { val: "染血" }, { val: "精緻" }, { val: "發光" }, { val: "陳舊" }, { val: "完整" }, { val: "磨損" }, { val: "斑駁" }, { val: "腐蝕" }, { val: "裂開" }, { val: "扭曲" }, { val: "變形" }, { val: "燒焦" }, { val: "冰冷" }, { val: "溫熱" }, { val: "顫動" }, { val: "脈動" }, { val: "低鳴" }, { val: "封印" }, { val: "破封" }, { val: "被遺棄" }, { val: "遺失" }, { val: "詛咒" }, { val: "異化" }, { val: "不穩定" } ],

atom_item_name: [ { val: "懷錶" }, { val: "提燈" }, { val: "鑰匙" }, { val: "日記本" }, { val: "匕首" }, { val: "手斧" }, { val: "戒指" }, { val: "項鍊" }, { val: "護符" }, { val: "徽章" }, { val: "面具" }, { val: "斗篷" }, { val: "帽子" }, { val: "手套" }, { val: "靴子" }, { val: "卷軸" }, { val: "書籍" }, { val: "筆記" }, { val: "信件" }, { val: "地圖" }, { val: "羅盤" }, { val: "懷錶" }, { val: "懷鏡" }, { val: "鏡子" }, { val: "瓶子" }, { val: "藥瓶" }, { val: "寶石" }, { val: "箱子" }, { val: "盒子" }, { val: "鎖鏈" }, { val: "鈴鐺" }, { val: "人偶" }, { val: "雕像" }, { val: "頭骨" }, { val: "骨片" }, { val: "羽毛" }, { val: "硬幣" }, { val: "王冠" }, { val: "權杖" }, { val: "短劍" }, { val: "長劍" } ],
	
	// ⚔️ 物品進階分類 (脫水版)

atom_item_type: [ {val:""}, { val: "武器" }, { val: "工具" }, { val: "文件" }, { val: "書籍" }, { val: "飾品" }, { val: "容器" }, { val: "裝置" }, { val: "儀器" }, { val: "機械" }, { val: "零件" }, { val: "遺物" }, { val: "古物" }, { val: "信物" }, { val: "護符" }, { val: "媒介" }, { val: "祭品" }, { val: "收藏品" }, { val: "鑰物" }, { val: "證物" } ],

atom_item_origin: [ {val:""}, { val: "王室" }, { val: "貴族" }, { val: "教會" }, { val: "軍方" }, { val: "古代" }, { val: "遠古" }, { val: "失落文明" }, { val: "地下" }, { val: "黑市" }, { val: "異界" }, { val: "深海" }, { val: "森林" }, { val: "沙漠" }, { val: "遺跡" }, { val: "實驗室" }, { val: "工坊" }, { val: "戰場" }, { val: "墓地" }, { val: "禁忌儀式" }, { val: "不明來源" }, { val: "夢境" }, { val: "虛空" } ],

atom_item_power: [ {val:""}, { val: "封印靈魂" }, { val: "吸收生命" }, { val: "釋放能量" }, { val: "引導魔力" }, { val: "強化持有者" }, { val: "治癒傷口" }, { val: "帶來詛咒" }, { val: "引發幻覺" }, { val: "操控心智" }, { val: "召喚存在" }, { val: "驅散亡靈" }, { val: "開啟通道" }, { val: "預示未來" }, { val: "隱藏自身" }, { val: "改變形態" }, { val: "吞噬能量" }, { val: "連結意識" }, { val: "記錄記憶" }, { val: "回應呼喚" }, { val: "選擇持有者" } ],
	
    // ✋ 互動動詞

verb_equip: [ { val: "把玩著" }, { val: "緊握著" }, { val: "攜帶著" }, { val: "凝視著" }, { val: "隱藏著" }, { val: "握著" }, { val: "抓著" }, { val: "持有著" }, { val: "佩戴著" }, { val: "收藏著" }, { val: "守護著" }, { val: "檢查著" }, { val: "撫摸著" }, { val: "摩挲著" }, { val: "舉起" }, { val: "放下" }, { val: "收起" }, { val: "遺落" }, { val: "發現" }, { val: "拾起" } ],


// 🏰 地點與建築

atom_building: [ { val: "別墅" }, { val: "醫院" }, { val: "郵輪" }, { val: "教堂" }, { val: "學院" }, { val: "莊園" }, { val: "宅邸" }, { val: "公寓" }, { val: "孤兒院" }, { val: "療養院" }, { val: "監獄" }, { val: "燈塔" }, { val: "車站" }, { val: "旅館" }, { val: "酒吧" }, { val: "劇院" }, { val: "博物館" }, { val: "研究所" }, { val: "工廠" }, { val: "倉庫" }, { val: "神殿" }, { val: "堡壘" }, { val: "塔樓" } ],

atom_room: [ { val: "大廳" }, { val: "地下室" }, { val: "圖書館" }, { val: "手術室" }, { val: "宴會廳" }, { val: "走廊" }, { val: "房間" }, { val: "臥室" }, { val: "書房" }, { val: "辦公室" }, { val: "密室" }, { val: "儲藏室" }, { val: "牢房" }, { val: "閣樓" }, { val: "浴室" }, { val: "控制室" }, { val: "觀察室" }, { val: "祭壇室" }, { val: "實驗室" }, { val: "通道" } ],

atom_env_adj: [ {val:""}, { val: "廢棄" }, { val: "豪華" }, { val: "古老" }, { val: "陰暗" }, { val: "血跡斑斑" }, { val: "破敗" }, { val: "荒涼" }, { val: "寂靜" }, { val: "陰森" }, { val: "封閉" }, { val: "隱密" }, { val: "潮濕" }, { val: "腐朽" }, { val: "華麗" }, { val: "神祕" }, { val: "詭異" } ],


// 🌬️ 環境與感官

atom_light: [ { val: "燭光" }, { val: "閃電" }, { val: "月光" }, { val: "霓虹燈" }, { val: "火光" }, { val: "微光" }, { val: "昏暗燈光" }, { val: "冷光" }, { val: "白光" }, { val: "紅光" }, { val: "閃爍燈光" }, { val: "搖曳火光" }, { val: "殘光" }, { val: "陰影" } ],

atom_sound: [ { val: "水滴聲" }, { val: "急促的腳步聲" }, { val: "老鼠的吱吱聲" }, { val: "詭異的低語" }, { val: "敲擊聲" }, { val: "摩擦聲" }, { val: "金屬聲" }, { val: "喘息聲" }, { val: "哭聲" }, { val: "笑聲" }, { val: "尖叫聲" }, { val: "低沉聲音" }, { val: "風聲" }, { val: "心跳聲" }, { val: "鎖鏈聲" } ],

atom_smell: [ { val: "霉味" }, { val: "鐵鏽味" }, { val: "濃烈的血腥味" }, { val: "廉價香水味" }, { val: "腐臭味" }, { val: "焦味" }, { val: "煙味" }, { val: "藥味" }, { val: "潮濕氣味" }, { val: "腐爛氣味" }, { val: "灰塵味" }, { val: "燒焦氣味" }, { val: "油味" } ],

atom_feature: [ { val: "角落" }, { val: "天花板" }, { val: "地板縫隙" }, { val: "破碎的窗戶" }, { val: "帷幕後方" }, { val: "陰影中" }, { val: "牆壁上" }, { val: "門後" }, { val: "樓梯下方" }, { val: "桌面上" }, { val: "鏡子裡" }, { val: "黑暗中" }, { val: "深處" }, { val: "入口處" } ],


// ⏳ 時間感

atom_time: [ { val: "瞬間" }, { val: "緩慢" }, { val: "一時" }, { val: "片刻" }, { val: "漸漸" }, { val: "突然" }, { val: "不久" }, { val: "很快" }, { val: "隨後" }, { val: "當下" }, { val: "此刻" }, { val: "那一刻" }, { val: "同時" }, { val: "最終" } ],


// 🌧️ 天氣

atom_weather: [ { val: "狂風" }, { val: "暖風" }, { val: "豔陽" }, { val: "風雪" }, { val: "悶熱" }, { val: "暴雨" }, { val: "細雨" }, { val: "雷雨" }, { val: "濃霧" }, { val: "寒風" }, { val: "陰雨" }, { val: "暴風" }, { val: "霧氣" }, { val: "雷電" } ],
    // ============================================================
    // 🧬 [Layer 1] 分子組合層 (Composite Words) - 拼裝脫水詞彙
    // ============================================================

    // 🏰 組合地點

combo_building: [
{ val: "{atom_env_adj}{atom_building}" },
{ val: "{atom_weather}{atom_building}" },          // 暴雨教堂
{ val: "{atom_env_adj}{atom_weather}{atom_building}" }, // 廢棄暴雨醫院
{ val: "{atom_light}{atom_building}" },            // 月光莊園
{ val: "{atom_env_adj}{atom_light}{atom_building}" } // 陰森燭光教堂
],

combo_room: [
{ val: "{atom_env_adj}{atom_room}" },
{ val: "{atom_light}{atom_room}" },                // 燭光地下室
{ val: "{atom_env_adj}{atom_light}{atom_room}" },  // 陰暗月光走廊
{ val: "{atom_sound}{atom_room}" },                // 低語走廊
{ val: "{atom_env_adj}{atom_sound}{atom_room}" }   // 廢棄低語地下室
],

combo_feature: [
{ val: "{atom_env_adj}{atom_feature}" },
{ val: "{atom_light}{atom_feature}" },             // 月光窗戶
{ val: "{atom_env_adj}{atom_light}{atom_feature}" },
{ val: "{atom_sound}{atom_feature}" },             // 低語角落
{ val: "{atom_env_adj}{atom_sound}{atom_feature}" }
],


// 🌬️ 完整場景節點

combo_location: [

{ val: "{combo_building}" },

{ val: "{combo_building}{combo_room}" },

{ val: "{combo_building}{combo_room}{combo_feature}" },

{ val: "{combo_room}" },

{ val: "{combo_room}{combo_feature}" }

],


// 🌫️ 環境氣氛

combo_atmosphere: [

{ val: "{atom_smell}" },

{ val: "{atom_sound}" },

{ val: "{atom_light}" },

{ val: "{atom_weather}" },

{ val: "{atom_weather}{atom_building}" }

],

// ⚔️ 組合物品 (無「的」直連)

combo_item: [
    { val: "{atom_mat}{atom_item_name}" },
    { val: "{atom_item_state}{atom_item_name}" },

    { val: "{atom_item_origin}{atom_item_name}" },     // 王室戒指
    { val: "{atom_item_power}{atom_item_name}" },      // 封印靈魂戒指

    { val: "{atom_mat}{atom_item_state}{atom_item_name}" }, // 黃銅染血匕首
    { val: "{atom_item_state}{atom_mat}{atom_item_name}" }, // 染血純銀戒指

    { val: "{atom_item_origin}{atom_mat}{atom_item_name}" }, // 王室純銀項鍊
    { val: "{atom_item_power}{atom_mat}{atom_item_name}" },  // 吸收生命骨製匕首

    { val: "{atom_item_state}{atom_item_origin}{atom_item_name}" }, // 破碎古代雕像

    { val: "{atom_item_origin}{atom_item_power}{atom_item_name}" } // 異界封印靈魂護符
],


// 👤 基礎人物 / 怪物

combo_person_basic: [
    { val: "{atom_age}{atom_person}" },
    { val: "{atom_status}{atom_person}" },
    { val: "{atom_status}{atom_monster}" },

    { val: "{atom_age}{atom_status}{atom_person}" },       // 年輕重傷男子
    { val: "{atom_status}{atom_age}{atom_person}" },       // 重傷年輕男子

    { val: "{atom_domain}{atom_person}" },                 // 地下男子
    { val: "{atom_domain}{atom_monster}" },                // 深海狼人

    { val: "{atom_status}{atom_domain}{atom_person}" },    // 落魄地下男子
    { val: "{atom_status}{atom_domain}{atom_monster}" }    // 異化深海怪物
],


// 👑 有頭銜人物

combo_person_titled: [
    { val: "{atom_domain}{atom_title}" },
    { val: "{atom_status}{atom_title}" },

    { val: "{atom_age}{atom_title}" },                    // 年邁騎士
    { val: "{atom_status}{atom_domain}{atom_title}" },    // 墮落教會祭司

    { val: "{atom_domain}{atom_age}{atom_title}" },       // 王室年邁領主

    { val: "{atom_status}{atom_age}{atom_title}" },       // 重傷年邁騎士

    { val: "{atom_status}{atom_domain}{atom_age}{atom_title}" } // 墮落王室年邁祭司
],


// 👁️ 完整角色（最高敘事密度）

combo_person_full: [

    { val: "{atom_manner}{combo_person_basic}" },   // 驚恐制服男子

    { val: "{atom_manner}{combo_person_titled}" },  // 冷靜王室騎士

    { val: "{atom_status}{atom_manner}{atom_person}" }, // 重傷逃竄男子

    { val: "{atom_status}{atom_manner}{atom_monster}" }, // 狂暴咆哮狼人

    { val: "{atom_manner}{atom_domain}{atom_title}" }, // 潛伏地下刺客

    { val: "{atom_manner}{atom_status}{atom_title}" } // 低語墮落祭司
],


// 🐉 怪物強化專用

combo_monster_elite: [

    { val: "{atom_age}{atom_monster}" },           // 古老狼人

    { val: "{atom_domain}{atom_monster}" },        // 深海怪物

    { val: "{atom_status}{atom_monster}" },        // 異化怪物

    { val: "{atom_status}{atom_domain}{atom_monster}" }, // 墮落深海狼人

    { val: "{atom_manner}{atom_monster}" },        // 咆哮狼人

    { val: "{atom_manner}{atom_status}{atom_monster}" } // 狂笑異化怪物
],

    // ============================================================
// 🌟 [Layer 2] 複雜句型層 強化擴充版
// ============================================================


// 👤 持有物品的人物（核心角色模板）

combo_person_with_item: [

{ val: "{verb_equip}{combo_item}的{combo_person_basic}" },
{ val: "{verb_equip}{combo_item}的{combo_person_titled}" },

{ val: "{combo_person_basic}{verb_equip}{combo_item}" },
{ val: "{combo_person_titled}{verb_equip}{combo_item}" },

{ val: "{combo_person_basic}手中{verb_equip}{combo_item}" },
{ val: "{combo_person_titled}手中{verb_equip}{combo_item}" },

{ val: "{combo_person_basic}悄悄{verb_equip}{combo_item}" },

{ val: "{combo_person_basic}始終{verb_equip}{combo_item}" }

],


// 👑 具有身份的人物

combo_person_with_title: [

{ val: "身為{combo_person_titled}的{combo_person_basic}" },
{ val: "{combo_person_basic}" },

],


// 🏰 位於地點的人物

combo_person_in_location: [

{ val: "{combo_person_basic}站在{combo_location}" },

{ val: "{combo_person_basic}徘徊於{combo_location}" },

{ val: "{combo_person_basic}潛伏在{combo_location}" },

{ val: "{combo_person_basic}出現在{combo_location}" },

{ val: "{combo_person_basic}被困在{combo_location}" },

{ val: "{combo_person_with_item}站在{combo_location}" },

{ val: "{combo_person_with_item}潛伏於{combo_location}" }

],


// ⚔️ 人物 + 地點 + 物品（完整核心句）

combo_person_item_location: [

{ val: "{combo_person_with_item}站在{combo_location}" },

{ val: "{combo_person_with_item}徘徊於{combo_location}" },

{ val: "{combo_person_with_item}潛伏於{combo_location}" },

{ val: "{combo_person_basic}在{combo_location}{verb_equip}{combo_item}" },

{ val: "{combo_person_titled}在{combo_location}{verb_equip}{combo_item}" }

],


// 🌫️ 環境氣氛（強化版）

sentence_env_vibe: [

{ val: "空氣中瀰漫著{atom_smell}" },

{ val: "遠處不時傳來{atom_sound}" },

{ val: "{atom_light}照耀著四周" },

{ val: "{atom_light}下的影子不停晃動" },

{ val: "{atom_weather}拍打著建築外牆" },

{ val: "黑暗中傳來{atom_sound}" },

{ val: "{atom_feature}散發出{atom_smell}" },

{ val: "{atom_light}讓一切顯得格外詭異" },

{ val: "四周充滿{atom_smell}" },

{ val: "{atom_sound}在空間裡迴盪" }

],


// 🧠 感知句型（讓角色「活起來」）

sentence_perception: [

{ val: "{combo_person_basic}聽見{atom_sound}" },

{ val: "{combo_person_basic}聞到{atom_smell}" },

{ val: "{combo_person_basic}看見{combo_feature}" },

{ val: "{combo_person_basic}注意到{combo_item}" },

{ val: "{combo_person_with_item}察覺異樣" },

{ val: "{combo_person_basic}感受到不安" }

],


// ⚡ 事件觸發句型

sentence_event: [

{ val: "{atom_time}，{combo_person_basic}停止動作" },

{ val: "{atom_time}，{combo_person_basic}轉過頭" },

{ val: "{atom_time}，{atom_sound}突然響起" },

{ val: "{atom_time}，{combo_item}開始顫動" },

{ val: "{atom_time}，{atom_light}閃爍" },

{ val: "{atom_time}，一切陷入寂靜" }

],


// 🎬 完整場景句（電影級）

sentence_full_scene: [

{ val: "{combo_person_item_location}" },

{ val: "{combo_person_item_location}，{sentence_env_vibe}" },

{ val: "{combo_person_item_location}，{sentence_perception}" },

{ val: "{sentence_env_vibe}，{combo_person_item_location}" },

{ val: "{sentence_env_vibe}，{sentence_perception}" },

{ val: "{combo_person_item_location}，{sentence_event}" }

],

    // ============================================================
    // 📦 [Layer 3] 統整匯出池 (Global Pools)
    // ============================================================
    
    noun_npc: [
        { val: "{combo_person_basic}" },       // 年輕女子
        { val: "{combo_person_titled}" },      // 石油大亨
        { val: "{combo_person_with_item}" },   // 緊握著染血匕首的管家
        { val: "{combo_person_with_title}" }   // 身為古代貴族的失控男子
    ],

    noun_monster: [
        { val: "{combo_person_basic}" } 
    ],

    // ============================================================
    // 🔗 [Layer 4] 舊版劇本相容性轉接層 (Backward Compatibility)
    // ============================================================
    
    // 【人物轉接】
    base_npc_id: [ { val: "{noun_npc}" } ], 
    noun_npc_generic: [ { val: "{noun_npc}" } ],
    adj_npc_trait: [ { val: "看起來" }, { val: "神情緊張的" }, { val: "" } ],

    // 【場景與環境轉接】
    noun_location_building: [ { val: "{combo_building}" } ],
    noun_location_room: [ { val: "{combo_room}" } ],
    noun_env_feature: [ { val: "{combo_feature}" }, { val: "{atom_feature}" } ],
    
    // 【環境氛圍轉接】
    adj_env_vibe: [ 
        { val: "瀰漫著{atom_smell}的" }, 
        { val: "被{atom_light}籠罩的" },
        { val: "死寂得令人發毛的" }
    ],

    // 【物品轉接】
    noun_item_common: [ { val: "{combo_item}" } ],
    noun_item_weapon: [ { val: "{combo_item}" } ],
    noun_item_record: [ { val: "神秘日記本" }, { val: "染血合約" } ],
    adj_item_look: [ { val: "破舊的" }, { val: "詭異的" } ], // 舊版修飾語

    // 【感官轉接】
    base_env_sound: [ { val: "{atom_sound}" } ],
    base_env_light: [ { val: "{atom_light}" } ],
    pattern_look_around: [
        { val: "你環顧四周，這裡{sentence_env_vibe}。" },
        { val: "四周一片死寂，只有{atom_sound}迴盪著。" }
    ],
    pattern_enemy_appear: [
        { val: "突然，一隻{noun_monster}從{atom_feature}竄了出來！" }
    ],

    // 【演員記憶專用】
    detective: [ { val: "{noun_npc}" } ],
    victim: [ { val: "{noun_npc}" } ],
    suspect_A: [ { val: "{noun_npc}" } ], 
    suspect_B: [ { val: "{noun_npc}" } ],
    survivor: [ { val: "{noun_npc}" } ],
    lover: [ { val: "{noun_npc}" } ], 
    rival: [ { val: "{noun_npc}" } ],
    trainee: [ { val: "{noun_npc}" } ],
    
    }); 

    console.log("✅ 核心資料庫與基礎詞彙已啟動 (V4 極致脫水與環境補完版)");
})();