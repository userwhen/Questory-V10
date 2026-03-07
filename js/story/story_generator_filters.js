/* js/modules/story_generator_filters.js - V85.0
 * 修正重點（相較 V84）：
 *   1. _filterByStats 同時支援 t.condition 與 t.conditions（原本只有後者）
 *   2. 結局節點（type: 'end'）加入專屬的 condition 篩選
 *      → 優先選符合 condition 的結局，找不到才 fallback 到無條件結局
 *   3. generateOptions 的 condition 同步支援 vars 的 '<=' 比較
 *      （原本只有 '>' 和 '<'，結局的 credibility <= 39 這類條件需要它）
 *
 * 其他邏輯完全不變，向下相容 V84。
 */
window.SQ = window.SQ || {};
window.SQ.Engine = window.SQ.Engine || {};
window.SQ.Engine.Generator = window.SQ.Engine.Generator || {};

Object.assign(window.SQ.Engine.Generator, {

    // ============================================================
    // 7. 模板挑選（pickTemplate）— 過濾流水線
    // ============================================================
    pickTemplate: function(type, currentTags, history, currentStats = {}, chain) {
        const db = window.FragmentDB;

        const isDangerState = currentTags.includes('risk_high') ||
            (currentStats.tension !== undefined && currentStats.tension >= 80) ||
            (currentStats.curse_val !== undefined && currentStats.curse_val >= 80); // 🌟 支援作祟值

        const isCritical = type.includes('setup') || type.includes('climax') ||
            type.includes('end') || type.includes('start');

        let candidates = db.templates.filter(t => t.type === type);
		candidates = candidates.filter(t => {
            if (!t.reqTags || t.reqTags.length === 0) return true;
            return t.reqTags.every(tag => currentTags.includes(tag));
        });
        candidates = this._filterByTheme(candidates, chain);
        candidates = this._filterByTags(candidates, currentTags, isDangerState);
        candidates = this._filterByStats(candidates, currentStats, currentTags); // 🌟 傳入 currentTags
        candidates = this._applyDangerOverride(candidates, db, isDangerState, isCritical);

        // 🌟 結局節點專屬篩選：優先選符合 condition 的，再 fallback
        if (type === 'end') {
            return this._pickEndNode(candidates, currentTags, currentStats, history);
        }

        let finalPool = this._filterByHistory(candidates, history, isCritical);

        if (finalPool.length === 0) {
            return this._getFallbackTemplate(db, type, isCritical, history, candidates);
        }

        return finalPool[Math.floor(Math.random() * finalPool.length)];
    },

    // ============================================================
    // 🌟 [新增] 結局節點專屬選擇器
    //    邏輯：
    //      1. 找所有有 condition 且條件符合的結局（精確命中）
    //      2. 找不到的話，退而求其次找「沒有 condition」的通用結局
    //      3. 再找不到，才從所有候選中隨機選
    // ============================================================
    _pickEndNode: function(candidates, currentTags, currentStats, history) {
        // Step 1: 精確命中（有 condition 且全部符合）
        const matched = candidates.filter(t => {
            if (!t.condition) return false;
            return this._checkCondition(t.condition, currentTags, currentStats);
        });

        // 排除最近出現過的，但結局不夠多的話就不排除
        let pool = matched.filter(t => !t.id || !history.includes(t.id));
        if (pool.length === 0) pool = matched;
        if (pool.length > 0) {
            console.log(`🏁 結局命中：[${pool.map(t => t.id).join(', ')}]`);
            return pool[Math.floor(Math.random() * pool.length)];
        }

        // Step 2: 通用結局（沒有 condition）
        const generic = candidates.filter(t => !t.condition);
        if (generic.length > 0) {
            console.log("🏁 結局 fallback：通用結局");
            return generic[Math.floor(Math.random() * generic.length)];
        }

        // Step 3: 從所有候選中隨機
        console.warn("⚠️ 結局：找不到符合條件的節點，使用任意結局");
        return candidates.length > 0
            ? candidates[Math.floor(Math.random() * candidates.length)]
            : null;
    },

    // ============================================================
    // 🌟 [新增] 通用條件檢查函數
    //    供 _pickEndNode 與 generateOptions 共用
    //    支援：
    //      condition.tags        → 玩家需要有這些 tag
    //      condition.excludeTags → 玩家不能有這些 tag
    //      condition.vars        → 數值比較（>=, <=, >, <, ==）
    // ============================================================
    _checkCondition: function(condition, currentTags, currentStats) {
        if (!condition) return true;

        // Tag 條件
        if (condition.tags) {
            for (let tag of condition.tags) {
                if (!currentTags.includes(tag)) return false;
            }
        }

        // excludeTags 條件
        if (condition.excludeTags) {
            for (let tag of condition.excludeTags) {
                if (currentTags.includes(tag)) return false;
            }
        }

        // 數值條件
        if (condition.vars) {
            for (let varCond of condition.vars) {
                const userVal = currentStats[varCond.key] !== undefined ? currentStats[varCond.key] : 0;
                const threshold = varCond.val;
                const op = varCond.op || '>=';

                if (op === '>='  && !(userVal >= threshold)) return false;
                if (op === '<='  && !(userVal <= threshold)) return false;
                if (op === '>'   && !(userVal >  threshold)) return false;
                if (op === '<'   && !(userVal <  threshold)) return false;
                if (op === '=='  && !(userVal === threshold)) return false;
                if (op === '!='  && !(userVal !== threshold)) return false;
            }
        }

        // stats 條件（舊格式相容）
        if (condition.stats) {
            for (let [key, val] of Object.entries(condition.stats)) {
                let userVal = currentStats[key] || 0;
                if (typeof val === 'string') {
                    let num = parseFloat(val.substring(1));
                    if (val.startsWith('>=') && !(userVal >= num)) return false;
                    if (val.startsWith('<=') && !(userVal <= num)) return false;
                    if (val.startsWith('>')  && !(userVal >  num)) return false;
                    if (val.startsWith('<')  && !(userVal <  num)) return false;
                } else {
                    if (userVal < val) return false;
                }
            }
        }

        return true;
    },

    // ============================================================
    // 過濾器群 (Filters)
    // ============================================================
    _filterByTheme: function(candidates, chain) {
        const coreThemes = ['mystery', 'horror', 'adventure', 'romance', 'raising'];

        return candidates.filter(t => {
            if (t.type === 'univ_filler') return true;
            if (!chain || !chain.theme) return true;

            if (t.reqTags && Array.isArray(t.reqTags)) {
                const cardThemes = t.reqTags.filter(tag => coreThemes.includes(tag));
                if (cardThemes.length > 0) return cardThemes.includes(chain.theme);
            }

            if (t.theme) {
                if (Array.isArray(t.theme)) return t.theme.includes(chain.theme);
                return t.theme === chain.theme;
            }

            return true;
        });
    },

    _filterByTags: function(candidates, currentTags, isDangerState) {
        return candidates.filter(t => {
            if (t.excludeTags && Array.isArray(t.excludeTags)) {
                if (t.excludeTags.some(tag => currentTags.includes(tag))) return false;
            }
            if (t.reqTags && Array.isArray(t.reqTags)) {
                let tempTags = isDangerState ? [...currentTags, 'risk_high'] : currentTags;
                if (!t.reqTags.some(tag => tempTags.includes(tag))) return false;
            }
            return true;
        });
    },

    // 🌟 修正：同時支援 t.condition 與 t.conditions（原本只有後者）
    _filterByStats: function(candidates, currentStats, currentTags = []) {
        return candidates.filter(t => {

            // 新格式：t.condition（單數，用於結局節點的 reqTags 以外的過濾）
            // 注意：結局節點的 condition 由 _pickEndNode 專門處理
            // 這裡的 condition 過濾只用於「節點能否出現」的前置條件
            // 例如：某個 middle 節點要求玩家必須先有某個 tag 才能出現

            // 舊格式：t.conditions（複數，key-value 數值門檻）
            if (t.conditions) {
                for (let [key, val] of Object.entries(t.conditions)) {
                    let userVal = currentStats[key] || 0;
                    if (typeof val === 'string') {
                        let num = parseFloat(val.substring(1));
                        if (val.startsWith('>=') && !(userVal >= num)) return false;
                        if (val.startsWith('<=') && !(userVal <= num)) return false;
                        if (val.startsWith('>')  && !(userVal >  num)) return false;
                        if (val.startsWith('<')  && !(userVal <  num)) return false;
                    } else {
                        if (userVal < val) return false;
                    }
                }
            }

            return true;
        });
    },

    _applyDangerOverride: function(candidates, db, isDangerState, isCritical) {
        if (isDangerState && !isCritical) {
            let dangerOnly = candidates.filter(t => t.reqTags && t.reqTags.includes('risk_high'));
            if (dangerOnly.length === 0) {
                dangerOnly = db.templates.filter(t =>
                    t.type === 'univ_filler' && t.reqTags && t.reqTags.includes('risk_high'));
            }
            if (dangerOnly.length > 0) {
                console.log("🚨 玩家狀態不穩，強制鎖定 [高危牌庫]！");
                return dangerOnly;
            }
        } else if (!isCritical) {
            return candidates.filter(t => !(t.reqTags && t.reqTags.includes('risk_high')));
        }
        return candidates;
    },

    _filterByHistory: function(candidates, history, isCritical) {
        let filtered = candidates.filter(t => !t.id || !history.includes(t.id));
        return filtered.length > 0 ? filtered : (isCritical ? candidates : []);
    },

    _getFallbackTemplate: function(db, type, isCritical, history, originalCandidates) {
        console.warn(`⚠️ [${type}] 無可用劇本，啟動備案...`);
        if (isCritical && originalCandidates.length > 0) return originalCandidates[0];

        let safeFillers = db.templates.filter(t =>
            t.type === 'univ_filler' &&
            !history.includes(t.id) &&
            !(t.reqTags && t.reqTags.includes('risk_high'))
        );
        if (safeFillers.length > 0) return safeFillers[Math.floor(Math.random() * safeFillers.length)];

        return db.templates.find(t => t.type === 'univ_filler');
    },

    // ============================================================
    // 8. 選項生成（generateOptions）
    // ============================================================
    generateOptions: function(tmpl, fragments, lang, type, currentTags = [], currentStats = {}) {
        let opts = [];

        if (tmpl.options && tmpl.options.length > 0) {
            let validOpts = tmpl.options.filter(o => {
                if (!o.condition) return true;
                // 🌟 改用通用 _checkCondition，支援 tags / excludeTags / vars（含 <=）
                return this._checkCondition(o.condition, currentTags, currentStats);
            });

            opts = validOpts.map(o => {
                let newRew = o.rewards ? JSON.parse(JSON.stringify(o.rewards)) : undefined;
                let defaultAction = (o.nextScene || o.nextSceneId) ? 'node_next' : 'advance_chain';
                return { ...o, action: o.action || defaultAction, rewards: newRew };
            });
        }

        // 自動選項（Boss/Ending）
        if (opts.length === 0) {
            if (type.includes('climax') || type.includes('adventure_climax')) {
                opts.push({ label: "決一死戰！", style: "danger", action: "finish_chain" });
            } else if (type.includes('ending')) {
                opts.push({ label: "結束冒險", action: "finish_chain" });
            } else {
                opts.push({ label: "繼續...", action: "advance_chain" });
            }
        }

        return opts;
    },
});