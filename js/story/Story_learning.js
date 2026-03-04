/* js/modules/story_learning.js - V79.0 (獨立模組)
 * 職責：螺旋式語言學習（韓/日）
 * 依賴：story_core.js (主物件必須已存在), window.LearningDB
 * 狀態：目前為預備模組，等 LearningDB 資料建立後自動啟動
 * 載入順序：story_state → story_learning → story_flow
 */
window.SQ = window.SQ || {};
window.SQ.Engine = window.SQ.Engine || {};
window.SQ.Engine.Story = window.SQ.Engine.Story || {};

Object.assign(window.SQ.Engine.Story, {

    // 從 LearningDB 抽取單字（支援難度加權）
    pickSpiralWord: function() {
        if (!window.LearningDB || !window.LearningDB.words) return null;
        const gs    = window.SQ.State;
        const words = window.LearningDB.words;
        const learning = gs.story.learning || {};

        // 優先選「不熟悉」的字（錯誤次數 > 正確次數）
        let unfamiliar = words.filter(w => {
            const rec = learning[w.id];
            if (!rec) return true; // 從未看過 → 優先
            return rec.wrong > rec.correct;
        });

        const pool = unfamiliar.length > 0 ? unfamiliar : words;
        return pool[Math.floor(Math.random() * pool.length)];
    },

    pickWrongOptions: function(correctId, count) {
        if (!window.LearningDB || !window.LearningDB.words) return [];
        const words = window.LearningDB.words.filter(w => w.id !== correctId);
        return this._shuffle(words).slice(0, count);
    },

    handleQuizResult: function(wordId, isCorrect) {
        const gs = window.SQ.State;
        if (!gs.story.learning[wordId]) gs.story.learning[wordId] = { correct: 0, wrong: 0 };

        if (isCorrect) {
            gs.story.learning[wordId].correct++;
            if (window.SQ.Actions) window.SQ.Actions.toast("✅ 回答正確！記憶加深。");
            this._distributeRewards({ exp: 10, gold: 5 });
        } else {
            gs.story.learning[wordId].wrong++;
            if (window.SQ.Actions) window.SQ.Actions.toast("❌ 答錯了... 請再接再厲。");
        }
    },
});