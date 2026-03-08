/* js/story_data/data_dictionary.js
 * 職責：查找表（不會隨劇本擴充，只負責「給定key → 回傳翻譯/設定」）
 * 包含：I18N多國翻譯、TAG字典、HUB工廠函數
 * 載入順序：最先載入，其他所有檔案都可能依賴它
 */
(function() {
    window.FragmentDB = window.FragmentDB || { fragments: {}, templates: [] };
    const DB = window.FragmentDB;

    // ============================================================
    // 1. 全域多國語言字典 (i18n)
    //    用途：TAG名稱、屬性名稱顯示在UI上的翻譯
    //    新增翻譯：在這裡加一行，全遊戲自動更新
    // ============================================================
    window.I18N_DICT = {
        // 系統狀態標籤 (Tags)
        'observed':         { zh: '已觀察',   en: 'Observed',      ko: '관찰됨',    jp: '観察済み' },
        'item_found':       { zh: '發現物品', en: 'Item Found',     ko: '아이템 발견', jp: 'アイテム発見' },
        'risk_high':        { zh: '高風險',   en: 'High Risk',      ko: '고위험',    jp: '高リスク' },
        'cursed':           { zh: '受詛咒',   en: 'Cursed',         ko: '저주받은',  jp: '呪われた' },
        'knowledge_found':  { zh: '獲得知識', en: 'Knowledge',      ko: '지식 획득', jp: '知識獲得' },
        'cautious':         { zh: '保持警戒', en: 'Cautious',       ko: '경계',      jp: '警戒中' },
        'injured':          { zh: '重傷',     en: 'Injured',        ko: '중상',      jp: '重傷' },
        'panic':            { zh: '恐慌',     en: 'Panic',          ko: '패닉',      jp: 'パニック' },
        'lucky':            { zh: '幸運',     en: 'Lucky',          ko: '행운',      jp: '幸運' },

        // 懸疑 & 恐怖劇本
        'found_risk_item':          { zh: '高危道具',   en: 'Risk Item',         ko: '위험 아이템',  jp: '危険アイテム' },
        'done_mixed_interrogation': { zh: '完成審問',   en: 'Interrogated',      ko: '심문 완료',    jp: '尋問完了' },
        'has_true_evidence':        { zh: '鐵證如山',   en: 'True Evidence',     ko: '확실한 증거',  jp: '確たる証拠' },
        'chose_to_stay':            { zh: '選擇留下',   en: 'Stayed',            ko: '남기로 선택함', jp: '残ることを選んだ' },

        // 冒險劇本
        'puzzle_solved':  { zh: '解開謎題', en: 'Puzzle Solved', ko: '퍼즐 해결', jp: '謎解き成功' },
        'boss_weakness':  { zh: '洞悉弱點', en: 'Weakness Known', ko: '약점 파악', jp: '弱点看破' },
        'fled_boss':      { zh: '撤退存活', en: 'Fled',           ko: '후퇴 생존', jp: '撤退生存' },

        // 養成劇本
        'has_ally':             { zh: '獲得盟友', en: 'Has Ally',      ko: '동맹 획득', jp: '味方獲得' },
        'won_promotion_backed': { zh: '破格晉升', en: 'Promoted',      ko: '특별 승진', jp: '特別昇進' },

        // 屬性與變數 (Vars) - 顯示在狀態列
        'sanity':       { zh: '理智',     en: 'SAN',        ko: '이성',      jp: '正気度' },
        'energy':       { zh: '精力',     en: 'Energy',     ko: '에너지',    jp: 'スタミナ' },
        'time_left':    { zh: '剩餘時間', en: 'Time Left',  ko: '남은 시간', jp: '残り時間' },
        'stress':       { zh: '壓力',     en: 'Stress',     ko: '스트레스',  jp: 'ストレス' },
        'trust':        { zh: '信任度',   en: 'Trust',      ko: '신뢰',      jp: '信頼度' },
        'favor':        { zh: '好感度',   en: 'Favor',      ko: '호감도',    jp: '好感度' },
        'hp':           { zh: '生命值',   en: 'HP',         ko: 'HP',        jp: 'HP' },
        'exp':          { zh: '經驗值',   en: 'EXP',        ko: 'EXP',       jp: 'EXP' },
        'gold':         { zh: '金幣',     en: 'Gold',       ko: '골드',      jp: 'ゴールド' },
        'youth_given':  { zh: '奉獻的青春', en: 'Youth Given', ko: '바친 청춘', jp: '捧げた青春' },
        'dignity':      { zh: '尊嚴',     en: 'Dignity',    ko: '존엄',      jp: '尊厳' },
        'route_illicit':{ zh: '禁忌路線', en: 'Illicit Route', ko: '금지된 경로', jp: '禁忌ルート' },

        // 劇本 vars 屬性（狀態列顯示用）
        'tension':       { zh: '緊張度',   en: 'Tension',      ko: '긴장도',      jp: '緊張度' },
        'skill_points':  { zh: '技能點',   en: 'Skill',        ko: '스킬 포인트', jp: 'スキルPt' },
        'credibility':   { zh: '公信度',   en: 'Credibility',  ko: '신뢰도',      jp: '信頼性' },
        'evidence_count':{ zh: '線索數',   en: 'Evidence',     ko: '증거 수',     jp: '証拠数' },
        'aff_lover':     { zh: '好感♥',    en: 'Affection♥',   ko: '호감♥',       jp: '好感♥' },
        'aff_rival':     { zh: '對手好感', en: 'Rival Aff.',   ko: '라이벌 호감', jp: 'ライバル好感' },
        'aff_mentor':    { zh: '師徒情誼', en: 'Mentor Bond',  ko: '사제 유대',   jp: '師弟愛' },
        'affection':     { zh: '好感度',   en: 'Affection',    ko: '호감도',      jp: '好感度' },
        'rank_points':   { zh: '排名分',   en: 'Rank',         ko: '랭크 포인트', jp: 'ランク点' },
        'puzzle_count':  { zh: '謎題數',   en: 'Puzzles',      ko: '퍼즐 수',     jp: 'パズル数' },
        'pressure':      { zh: '壓力',     en: 'Pressure',     ko: '압박감',      jp: 'プレッシャー' },
        'knowledge':     { zh: '知識',     en: 'Knowledge',    ko: '지식',        jp: '知識' },
        'curse_val':     { zh: '作祟值',   en: 'Curse',        ko: '저주치',      jp: '祟り値' },
        'free_time':     { zh: '自由時間', en: 'Free Time',    ko: '자유 시간',   jp: '自由時間' },
        'search_count':  { zh: '搜查次數', en: 'Searches',     ko: '수색 횟수',   jp: '調査回数' },
        'daily_moments': { zh: '日常點滴', en: 'Moments',      ko: '일상의 순간', jp: '日常の瞬間' },
        'time_together': { zh: '相處時光', en: 'Time Together', ko: '함께한 시간', jp: '共有時間' }
    };

    // ============================================================
    // 2. TAG翻譯查找函數
    //    用法：t_tag('injured') → '重傷'（依當前語言設定）
    // ============================================================
    window.t_tag = function(key) {
        if (!key) return "";
        let lang = (window.GlobalState && window.GlobalState.settings && window.GlobalState.settings.targetLang)
                   ? window.GlobalState.settings.targetLang
                   : 'zh';

        // 防呆：mix模式或字典裡沒有該語言 → 強制用中文
        if (lang === 'mix' || (window.I18N_DICT[key] && !window.I18N_DICT[key][lang])) {
            lang = 'zh';
        }

        if (window.I18N_DICT[key] && window.I18N_DICT[key][lang]) return window.I18N_DICT[key][lang];
        return key;
    };

    // ============================================================
    // 3. HUB 工廠函數
    //    用途：各劇本開局HUB節點的選項與模板生成
    //    新增劇本主題：在 getHubOptions 的 if/else 裡加一個分支
    // ============================================================
    DB.getHubOptions = function(theme) {
        let opt1 = "🔍 仔細搜查當前房間 (耗時 1)";
        let opt2 = "🗺️ 推開未知的門 (耗時 1)";

        if (theme === 'adventure') {
            opt1 = "🔍 仔細搜刮當前房間 (耗時 1)";
            opt2 = "🗺️ 推開未知的門深入地城 (耗時 1)";
        } else if (theme === 'horror') {
            opt2 = "🏃 趕快離開，推開新門 (耗時 1)";
        }

        return [
            {
                label: opt1,
                action: "advance_chain",
                rewards: { varOps: [{ key: 'time_left', val: 1, op: '-' }] }
            },
            {
                label: opt2,
                action: "map_explore_new",
                rewards: { varOps: [{ key: 'time_left', val: 1, op: '-' }] }
            }
        ];
    };

    DB.createHubTemplate = function(theme, time = 5, custom = {}) {
        const defaultText  = `{env_weather}的時刻，你身處於{env_building}之中。{env_pack_visual}`;
        const defaultBrief = `📍 ${theme.toUpperCase()} HUB — 剩餘時間：{time_left}　狀態：{#tags}`;

        return {
            id: `hub_${theme}_generic`,
            type: 'start',
            isHub: true,
            reqTags: [theme],
            dialogue:  custom.dialogue  || [{ text: { zh: custom.text || defaultText } }],
            briefText: custom.briefText || defaultBrief,
            onEnter:   custom.onEnter   || { varOps: [{ key: 'time_left', val: time, op: 'set' }] },
            options:   custom.options   || DB.getHubOptions(theme)
        };
    };

    // ============================================================
    // 4. TAG 顯示字典（tagDict）
    //    用途：updateDrawer 顯示玩家已獲得的標籤
    //    type: 'info'(綠)  'warn'(紅)  'status'(藍)  'loc'(金)
    //    隱藏規則（hiddenPrefixes）：struct_ / route_ / env_ / learning / risk_high 開頭不顯示
    // ============================================================
    DB.tagDict = {
        // ── 通用狀態 ─────────────────────────────────────────────
        'item_found':            { zh: '發現道具',     jp: 'アイテム発見',      kr: '아이템 발견',    type: 'info' },
        'cautious':              { zh: '保持警戒',     jp: '警戒中',            kr: '경계',           type: 'status' },
        'observed':              { zh: '已觀察',       jp: '観察済み',          kr: '관찰됨',         type: 'info' },
        'knowledge_found':       { zh: '獲得知識',     jp: '知識獲得',          kr: '지식 획득',      type: 'info' },
        'has_rested_recently':   { zh: '已休息',       jp: '休息済み',          kr: '휴식함',         type: 'status' },
        'looted_supply':         { zh: '獲得補給',     jp: '補給確保',          kr: '보급 획득',      type: 'info' },
        'met_benefactor':        { zh: '遇到好心人',   jp: '善人と出会う',      kr: '은인 만남',      type: 'info' },
        'met_merchant':          { zh: '遇到商人',     jp: '商人と出会う',      kr: '상인 만남',      type: 'info' },
        'had_lucky_break':       { zh: '幸運降臨',     jp: '幸運が訪れた',      kr: '행운 발생',      type: 'info' },
        'helped_npc':            { zh: '協助他人',     jp: 'NPCを助けた',       kr: 'NPC 도움',       type: 'info' },
        'npc_trust':             { zh: '獲得信任',     jp: '信頼獲得',          kr: '신뢰 획득',      type: 'status' },
        'found_hidden_cache':    { zh: '發現隱藏物',   jp: '隠しアイテム発見',  kr: '숨겨진 물건',    type: 'info' },
        'received_npc_help':     { zh: '獲得援助',     jp: 'NPCに助けられた',   kr: 'NPC 지원',       type: 'info' },

        // ── 危險／負面狀態 ────────────────────────────────────────
        'injured':               { zh: '重傷',         jp: '重傷',              kr: '중상',           type: 'warn' },
        'panic':                 { zh: '恐慌',         jp: 'パニック',          kr: '패닉',           type: 'warn' },
        'poisoned':              { zh: '中毒',         jp: '毒状態',            kr: '중독',           type: 'warn' },
        'cursed':                { zh: '受詛咒',       jp: '呪われた',          kr: '저주받은',       type: 'warn' },
        'found_risk_item':       { zh: '持有危險道具', jp: '危険アイテム所持',  kr: '위험 아이템',    type: 'warn' },
        'blew_cover':            { zh: '暴露身份',     jp: '正体バレ',          kr: '신분 노출',      type: 'warn' },
        'took_suspicious_gold':  { zh: '收了可疑的錢', jp: '怪しい金を受け取る', kr: '의심스런 돈',  type: 'warn' },
        'found_warning':         { zh: '發現警告',     jp: '警告を発見',        kr: '경고 발견',      type: 'warn' },
        'forced_final':          { zh: '強制結局觸發', jp: '強制エンド',        kr: '강제 엔딩',      type: 'warn' },

        // ── 懸疑劇本 ─────────────────────────────────────────────
        'has_true_evidence':         { zh: '持有鐵證',   jp: '確たる証拠あり',  kr: '결정적 증거',    type: 'info' },
        'has_fake_clue':             { zh: '持有假線索', jp: '偽の手がかり所持', kr: '가짜 단서',     type: 'warn' },
        'has_item_clue':             { zh: '獲得物證',   jp: '物証あり',        kr: '물증 확보',      type: 'info' },
        'has_testimony':             { zh: '獲得證詞',   jp: '証言あり',        kr: '증언 확보',      type: 'info' },
        'found_fake_clue':           { zh: '發現假線索', jp: '偽の手がかり発見', kr: '가짜 단서 발견', type: 'status' },
        'found_secret_room':         { zh: '發現密室',   jp: '密室発見',        kr: '비밀방 발견',    type: 'info' },
        'found_msg_evidence':        { zh: '獲得訊息證據', jp: 'メッセージ証拠', kr: '메시지 증거',   type: 'info' },
        'info_will_location':        { zh: '得知遺囑位置', jp: '遺書の場所判明', kr: '유서 위치 파악', type: 'info' },
        'interrogated_witness':      { zh: '審問目擊者', jp: '目撃者を尋問',    kr: '목격자 심문',    type: 'status' },
        'done_mixed_interrogation':  { zh: '完成審問',   jp: '尋問完了',        kr: '심문 완료',      type: 'status' },
        'witnessed_culprit':         { zh: '目擊真兇',   jp: '犯人を目撃',      kr: '범인 목격',      type: 'info' },
        'presented_true_evidence':   { zh: '出示鐵證',   jp: '証拠を提示',      kr: '증거 제시',      type: 'info' },
        'presented_fake_clue':       { zh: '出示假線索', jp: '偽証拠を提示',    kr: '가짜 증거 제시', type: 'warn' },
        'searched_documents':        { zh: '搜查文件',   jp: '文書を調査',      kr: '문서 수색',      type: 'status' },
        'searched_scene':            { zh: '搜查現場',   jp: '現場を調査',      kr: '현장 수색',      type: 'status' },
        'searched_corner':           { zh: '搜查角落',   jp: '隅を調査',        kr: '구석 수색',      type: 'status' },
        'gathered_intel':            { zh: '蒐集情報',   jp: '情報収集',        kr: '정보 수집',      type: 'status' },
        'campus_clue_branch':        { zh: '院校分支線索', jp: 'キャンパス手がかり', kr: '캠퍼스 단서', type: 'info' },
        'campus_clue_diary':         { zh: '日記線索',   jp: '日記の手がかり',  kr: '일기 단서',      type: 'info' },
        'campus_has_id':             { zh: '獲得身份證明', jp: 'ID取得',         kr: 'ID 획득',       type: 'info' },
        'campus_info_a':             { zh: '情報A',      jp: '情報A',           kr: '정보 A',         type: 'status' },
        'campus_info_b':             { zh: '情報B',      jp: '情報B',           kr: '정보 B',         type: 'status' },
        'campus_info_c':             { zh: '情報C',      jp: '情報C',           kr: '정보 C',         type: 'status' },
        'asked_mutual_friend':       { zh: '透過共同友人', jp: '共通の友人経由', kr: '공통 친구 통해', type: 'status' },

        // ── 恐怖劇本 ─────────────────────────────────────────────
        'chose_to_stay':     { zh: '選擇留下',   jp: '残ることを選んだ', kr: '남기로 선택함',  type: 'status' },
        'attempted_escape':  { zh: '嘗試逃跑',   jp: '脱出を試みた',     kr: '탈출 시도',      type: 'status' },
        'found_exit':        { zh: '找到出口',   jp: '出口発見',         kr: '출구 발견',      type: 'info' },
        'found_curse_records':{ zh: '發現詛咒紀錄', jp: '呪いの記録発見', kr: '저주 기록 발견', type: 'warn' },
        'met_survivor':      { zh: '遇到倖存者', jp: '生存者と出会う',   kr: '생존자 만남',    type: 'info' },
        'survivor_helped':   { zh: '協助倖存者', jp: '生存者を助けた',   kr: '생존자 도움',    type: 'info' },
        'witnessed_omen':    { zh: '目擊凶兆',   jp: '凶兆を目撃',       kr: '흉조 목격',      type: 'warn' },
        'evaded_monster':    { zh: '躲過怪物',   jp: 'モンスター回避',   kr: '괴물 회피',      type: 'status' },
        'survived_chase':    { zh: '逃脫追殺',   jp: '追跡から生還',     kr: '추격 탈출',      type: 'status' },
        'called_for_help':   { zh: '呼救',       jp: '助けを呼んだ',     kr: '도움 요청',      type: 'status' },
        'sensed_room':       { zh: '感應到異常', jp: '部屋の異常を感知', kr: '방 이상 감지',   type: 'status' },
        'used_ritual':       { zh: '進行儀式',   jp: '儀式を行った',     kr: '의식 수행',      type: 'warn' },
        'sealed_core':       { zh: '封印核心',   jp: 'コアを封印',       kr: '핵심 봉인',      type: 'info' },
        'destroyed_core':    { zh: '摧毀核心',   jp: 'コアを破壊',       kr: '핵심 파괴',      type: 'info' },
        'read_signals':      { zh: '解讀信號',   jp: '信号を解読',       kr: '신호 해독',      type: 'info' },
        'read_inscription':  { zh: '解讀銘文',   jp: '碑文を解読',       kr: '비문 해독',      type: 'info' },

        // ── 冒險劇本 ─────────────────────────────────────────────
        'puzzle_solved':          { zh: '解開謎題',     jp: '謎解き成功',       kr: '퍼즐 해결',      type: 'info' },
        'solved_main_puzzle':     { zh: '解開主謎題',   jp: 'メイン謎解き',     kr: '메인 퍼즐 해결', type: 'info' },
        'solved_final_puzzle':    { zh: '解開最終謎題', jp: '最終謎解き',       kr: '최종 퍼즐 해결', type: 'info' },
        'solved_env_puzzle':      { zh: '解開環境謎題', jp: '環境パズル解決',   kr: '환경 퍼즐 해결', type: 'info' },
        'boss_weakness':          { zh: '洞悉弱點',     jp: '弱点看破',         kr: '약점 파악',      type: 'info' },
        'knows_weakness':         { zh: '知道弱點',     jp: '弱点を知る',       kr: '약점 앎',        type: 'info' },
        'knows_weapon_power':     { zh: '掌握武器力量', jp: '武器の力を把握',   kr: '무기 파악',      type: 'info' },
        'fled_boss':              { zh: '撤退存活',     jp: '撤退生存',         kr: '후퇴 생존',      type: 'status' },
        'fought_boss':            { zh: '挑戰首領',     jp: 'ボスと戦った',     kr: '보스 도전',      type: 'status' },
        'fought_monster':         { zh: '擊退怪物',     jp: 'モンスター撃退',   kr: '괴물 격퇴',      type: 'status' },
        'fought_elite':           { zh: '擊敗精英',     jp: 'エリート撃破',     kr: '정예 처치',      type: 'info' },
        'found_legendary_weapon': { zh: '獲得傳說武器', jp: '伝説武器入手',     kr: '전설 무기 획득', type: 'info' },
        'used_legendary_weapon':  { zh: '使用傳說武器', jp: '伝説武器使用',     kr: '전설 무기 사용', type: 'info' },
        'has_key':                { zh: '獲得鑰匙',     jp: '鍵を持つ',         kr: '열쇠 획득',      type: 'info' },
        'has_key_item':           { zh: '持有關鍵物品', jp: '重要アイテム所持', kr: '핵심 아이템',    type: 'info' },
        'has_sacred_item':        { zh: '持有聖物',     jp: '聖なるアイテム',   kr: '성물 보유',      type: 'info' },
        'has_preparation':        { zh: '充分準備',     jp: '十分な準備',       kr: '충분한 준비',    type: 'status' },
        'received_chain_item':    { zh: '獲得連鎖道具', jp: '連鎖アイテム獲得', kr: '연쇄 아이템',    type: 'info' },
        'secret_passage':         { zh: '發現密道',     jp: '秘密通路発見',     kr: '비밀 통로',      type: 'info' },
        'took_left_path':         { zh: '走左路',       jp: '左の道を選んだ',   kr: '왼쪽 길 선택',   type: 'status' },
        'took_right_path':        { zh: '走右路',       jp: '右の道を選んだ',   kr: '오른쪽 길 선택', type: 'status' },
        'took_middle_path':       { zh: '走中間路',     jp: '中央の道を選んだ', kr: '중앙 길 선택',   type: 'status' },
        'did_backtrack':          { zh: '原路折返',     jp: '引き返した',       kr: '되돌아옴',       type: 'status' },
        'used_item_as_leverage':  { zh: '以物品談判',   jp: 'アイテムで交渉',   kr: '아이템으로 협상', type: 'status' },
        'attempted_destroy':      { zh: '嘗試摧毀',     jp: '破壊を試みた',     kr: '파괴 시도',      type: 'status' },
        'showcased':              { zh: '展示能力',     jp: '能力を披露',       kr: '능력 과시',      type: 'status' },
        'has_ally':               { zh: '獲得盟友',     jp: '味方獲得',         kr: '동맹 획득',      type: 'status' },

        // ── 戀愛劇本 ─────────────────────────────────────────────
        'had_date':               { zh: '成功約會',     jp: 'デート成功',       kr: '데이트 성공',    type: 'info' },
        'had_alone_lover':        { zh: '單獨相處',     jp: '二人きり',         kr: '단둘이',         type: 'info' },
        'had_deep_talk':          { zh: '深度交流',     jp: '深い対話',         kr: '깊은 대화',      type: 'info' },
        'had_honest_moment':      { zh: '坦誠一刻',     jp: '誠実な瞬間',       kr: '솔직한 순간',    type: 'info' },
        'had_key_moment':         { zh: '關鍵時刻',     jp: '重要な瞬間',       kr: '핵심 순간',      type: 'info' },
        'had_audience':           { zh: '接受接見',     jp: '謁見した',         kr: '알현함',         type: 'status' },
        'mutual_feeling':         { zh: '確認心意',     jp: '気持ち確認',       kr: '마음 확인',      type: 'info' },
        'confessed':              { zh: '告白',         jp: '告白した',         kr: '고백함',         type: 'info' },
        'confessed_hint':         { zh: '暗示心意',     jp: '気持ちをほのめかした', kr: '마음 암시',  type: 'status' },
        'said_feelings':          { zh: '說出心聲',     jp: '気持ちを言った',   kr: '감정 표현',      type: 'info' },
        'chose_lover':            { zh: '選擇戀人',     jp: '恋人を選んだ',     kr: '연인 선택',      type: 'status' },
        'chose_rival':            { zh: '選擇對手',     jp: 'ライバルを選んだ', kr: '라이벌 선택',    type: 'status' },
        'chose_mentor':           { zh: '選擇師長',     jp: '師を選んだ',       kr: '멘토 선택',      type: 'status' },
        'chose_none':             { zh: '選擇獨行',     jp: '一人を選んだ',     kr: '혼자 선택',      type: 'status' },
        'befriended_rival':       { zh: '與對手和好',   jp: 'ライバルと和解',   kr: '라이벌과 화해',  type: 'info' },
        'confronted_rival':       { zh: '正面交鋒',     jp: 'ライバルと対決',   kr: '라이벌과 대결',  type: 'status' },
        'handled_rival':          { zh: '處置對手',     jp: 'ライバルを対処',   kr: '라이벌 처리',    type: 'status' },
        'neutralized_rival':      { zh: '化解敵意',     jp: '敵意を中和',       kr: '적대감 해소',    type: 'info' },
        'knows_rival':            { zh: '了解對手',     jp: 'ライバルを知る',   kr: '라이벌 파악',    type: 'status' },
        'faced_rival_challenge':  { zh: '接受挑戰',     jp: '挑戦を受けた',     kr: '도전 받아들임',  type: 'status' },
        'resolved_misunderstanding':{ zh: '消除誤解',   jp: '誤解解消',         kr: '오해 해소',      type: 'info' },
        'resolved_triangle':      { zh: '解決三角關係', jp: '三角関係解決',     kr: '삼각관계 해결',  type: 'info' },
        'formed_bond':            { zh: '建立羈絆',     jp: '絆を結んだ',       kr: '유대 형성',      type: 'info' },
        'shared_activity':        { zh: '共同體驗',     jp: '共同体験',         kr: '공동 체험',      type: 'info' },
        'showed_care':            { zh: '表達關心',     jp: '気遣いを示した',   kr: '배려 표현',      type: 'info' },
        'showed_evidence':        { zh: '出示關係證明', jp: '証拠を見せた',     kr: '증거 제시',      type: 'status' },
        'heir_approved':          { zh: '獲得認可',     jp: '認可を得た',       kr: '인정 받음',      type: 'info' },
        'waited_consort':         { zh: '等待結果',     jp: '結果を待った',     kr: '결과 기다림',    type: 'status' },
        'won_consort':            { zh: '競選成功',     jp: '選考通過',         kr: '선발 성공',      type: 'info' },
        'asked_out':              { zh: '主動邀約',     jp: 'デートに誘った',   kr: '데이트 신청',    type: 'status' },
        'asked_directly':         { zh: '直接表白',     jp: '直接告白',         kr: '직접 고백',      type: 'status' },
        'mentor_confidant':       { zh: '成為師長知己', jp: '師の信頼を得た',   kr: '멘토의 심복',    type: 'info' },
        'handled_interference':   { zh: '排除干擾',     jp: '妨害を排除',       kr: '방해 제거',      type: 'status' },

        // ── 養成劇本 ─────────────────────────────────────────────
        'won_promotion':          { zh: '獲得晉升',     jp: '昇進を得た',       kr: '승진 획득',      type: 'info' },
        'won_promotion_backed':   { zh: '破格晉升',     jp: '特別昇進',         kr: '특별 승진',      type: 'info' },
        'attempted_promotion':    { zh: '嘗試晉升',     jp: '昇進を試みた',     kr: '승진 시도',      type: 'status' },
        'attempted_test':         { zh: '參加考核',     jp: '試験を受けた',     kr: '시험 응시',      type: 'status' },
        'passed_test_high':       { zh: '優秀通過',     jp: '優秀合格',         kr: '우수 합격',      type: 'info' },
        'passed_test_mid':        { zh: '勉強通過',     jp: 'ギリギリ合格',     kr: '간신히 합격',    type: 'status' },
        'completed_task':         { zh: '完成任務',     jp: 'タスク完了',       kr: '임무 완료',      type: 'info' },
        'done_intensive':         { zh: '完成強化訓練', jp: '集中訓練完了',     kr: '집중 훈련 완료', type: 'info' },
        'studied_theory':         { zh: '學習理論',     jp: '理論を学んだ',     kr: '이론 학습',      type: 'status' },
        'trained_here':           { zh: '在此訓練過',   jp: 'ここで訓練した',   kr: '이곳에서 훈련',  type: 'status' },
        'has_mentor_push':        { zh: '師長推薦',     jp: '師匠の推薦あり',   kr: '멘토 추천',      type: 'info' },
        'key_achievement':        { zh: '關鍵成就',     jp: '重要な功績',       kr: '핵심 성취',      type: 'info' },
    };

    console.log("✅ data_dictionary.js 已載入");
})();