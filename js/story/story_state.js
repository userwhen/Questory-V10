/* js/modules/story_state.js - V79.0 (獨立模組)
 * 職責：數值與狀態層（條件檢定、獎勵派發、屬性計算、場景工具函式）
 * 依賴：story_core.js (主物件必須已存在)
 * 載入順序：story_core → story_state → story_flow
 */
window.SQ = window.SQ || {};
window.SQ.Engine = window.SQ.Engine || {};
window.SQ.Engine.Story = window.SQ.Engine.Story || {};

Object.assign(window.SQ.Engine.Story, {

    // ============================================================
    // 📊 [SECTION 3] STATE & LOGIC
    // ============================================================
    getPlayerStat: function(key) {
		const gs = window.SQ.State || window.GlobalState;
		const k = key.toUpperCase();
		const kLower = key.toLowerCase();
		
		// 1. 取得基礎屬性（從 attrs）
		let baseVal = 0;
		if (gs.attrs && gs.attrs[k] && gs.attrs[k].v !== undefined) {
			baseVal = gs.attrs[k].v;
		}
		
		// 2. 取得劇本區域加成（從 story.vars）
		let bonusVal = 0;
		if (gs.story && gs.story.vars && gs.story.vars[kLower] !== undefined) {
			bonusVal = gs.story.vars[kLower];
		}
		
		// 3. 疊加回傳（基礎 + 劇本加成）
		return baseVal + bonusVal;
	},

    calculateMaxEnergy: function() {
        const lv = window.SQ.State.lv || 1;
        return Math.min(100, this.CONSTANTS.BASE_ENERGY_MAX + (lv - 1) * 2);
    },

    _checkCondition: function(cond) {
        if (!cond) return true;

        const gs      = window.SQ.State;
        const myTags  = (gs.story && gs.story.tags)  ? gs.story.tags  : [];
        const myVars  = (gs.story && gs.story.vars)  ? gs.story.vars  : {};
        const chainMem = (gs.story && gs.story.chain && gs.story.chain.memory)
            ? gs.story.chain.memory : {};

        // 1. Tag 檢查
        if (cond.hasTag && !myTags.includes(cond.hasTag)) return false;
        if (cond.noTag  &&  myTags.includes(cond.noTag))  return false;
		if (cond.tags && Array.isArray(cond.tags)) {
			for (let i = 0; i < cond.tags.length; i++) {
				let requiredTag = cond.tags[i];
				// 假設 myTags 是當前玩家擁有的標籤陣列
				if (!myTags.includes(requiredTag)) {
					return false; // 只要有一個標籤沒有，就判定失敗
				}
			}
		}

        // 2. 屬性檢查
        if (cond.stat) {
            const val = this.getPlayerStat(cond.stat.key || cond.stat);
            if (val < (cond.val || 0)) return false;
        }

        // 3. 多重變數檢查
        let checks = Array.isArray(cond.vars) ? cond.vars : (cond.var ? [cond.var] : []);
        for (let check of checks) {
            let key        = check.key;
            let targetVal  = Number(check.val);
            let op         = check.op || '>=';
            let currentVal = 0;

            if      (key === 'gold')   currentVal = gs.gold || 0;
            else if (key === 'energy') currentVal = gs.story.energy || 0;
            else if (key === 'exp')    currentVal = gs.exp  || 0;
            else if (myVars[key] !== undefined)                          currentVal = Number(myVars[key]);
            else if (gs.story.flags && gs.story.flags[key] !== undefined) currentVal = Number(gs.story.flags[key]);
            else currentVal = 0;

            currentVal = Number(currentVal);
            targetVal  = Number(targetVal);

            if (op === '>'  && currentVal <= targetVal) return false;
            if (op === '>=' && currentVal <  targetVal) return false;
            if (op === '<'  && currentVal >= targetVal) return false;
            if (op === '<=' && currentVal >  targetVal) return false;
            if (op === '==' && currentVal !== targetVal) return false;
            if (op === '!=' && currentVal === targetVal) return false;
        }

        return true;
    },

    _distributeRewards: function(rewards) {
        const gs       = window.SQ.State;
        if (!gs.story.vars) gs.story.vars = {};
        let msgs       = [];
        const maxEnergy = this.calculateMaxEnergy ? this.calculateMaxEnergy() : 30;

        // --- 直接資源 ---
        if (rewards.gold) {
            if (window.SQ.EventBus && window.SQ.Events?.Stats?.ADD_GOLD) {
                window.SQ.EventBus.emit(window.SQ.Events.Stats.ADD_GOLD, rewards.gold);
            } else {
                gs.gold = (gs.gold || 0) + rewards.gold;
            }
            msgs.push(`💰 ${rewards.gold > 0 ? '+' : ''}${rewards.gold}`);
        }

        if (rewards.energy) {
            let oldE = gs.story.energy || 0;
            let newE = oldE + rewards.energy;
            gs.story.energy = rewards.energy > 0 ? Math.min(maxEnergy, newE) : Math.max(0, newE);
            if (gs.story.energy !== oldE) msgs.push(`⚡ ${rewards.energy > 0 ? '+' : ''}${rewards.energy}`);
        }

        if (rewards.exp) {
            if (window.SQ.EventBus && window.SQ.Events?.Stats?.ADD_EXP) {
                window.SQ.EventBus.emit(window.SQ.Events.Stats.ADD_EXP, rewards.exp);
            } else if (window.SQ.Engine.Stats && window.SQ.Engine.Stats.addPlayerExp) {
                window.SQ.Engine.Stats.addPlayerExp(rewards.exp);
            } else {
                gs.exp = (gs.exp || 0) + rewards.exp;
            }
            msgs.push(`✨ ${rewards.exp > 0 ? '+' : ''}${rewards.exp}`);
        }

        if (rewards.tags) {
            rewards.tags.forEach(tag => {
                const finalTag = this._resolveDynamicText(tag);
                if (!gs.story.tags.includes(finalTag)) gs.story.tags.push(finalTag);
            });
        }

        if (rewards.removeTags) {
            rewards.removeTags.forEach(tag => {
                const idx = gs.story.tags.indexOf(tag);
                if (idx > -1) gs.story.tags.splice(idx, 1);
            });
        }

        // --- VarOps ---
        if (rewards.varOps) {
            rewards.varOps.forEach(op => {
                const k = op.key;
                const v = Number(op.val) || 0;

                if (k === 'gold') {
                    let diff = 0;
                    let cur  = gs.gold || 0;
                    if (op.op === '+' || op.op === 'add') diff = v;
                    else if (op.op === '-' || op.op === 'sub') diff = -v;
                    else if (op.op === '=' || op.op === 'set') diff = v - cur;
                    if (diff !== 0) {
                        if (window.SQ.EventBus && window.SQ.Events?.Stats?.ADD_GOLD)
                            window.SQ.EventBus.emit(window.SQ.Events.Stats.ADD_GOLD, diff);
                        else gs.gold = Math.max(0, cur + diff);
                        msgs.push(`💰 金幣: ${diff > 0 ? '+' : ''}${diff}`);
                    }
                }
                else if (k === 'energy') {
                    let oldE = gs.story.energy || 0;
                    let targetE = oldE;
                    if (op.op === '+' || op.op === 'add') targetE += v;
                    else if (op.op === '-' || op.op === 'sub') targetE -= v;
                    else if (op.op === '=' || op.op === 'set') targetE = v;
                    gs.story.energy = targetE > oldE ? Math.min(maxEnergy, targetE) : Math.max(0, targetE);
                    let diff = gs.story.energy - oldE;
                    if (diff !== 0) msgs.push(`⚡ 精力: ${diff > 0 ? '+' : ''}${diff}`);
                }
                else if (k.startsWith("g_")) {
                    const realKey = k.substring(2);
                    if (!gs.story.flags) gs.story.flags = {};
                    let cur = Number(gs.story.flags[realKey]) || 0;
                    if (op.op === '+' || op.op === 'add') gs.story.flags[realKey] = cur + v;
                    else if (op.op === '-' || op.op === 'sub') gs.story.flags[realKey] = cur - v;
                    else if (op.op === '=' || op.op === 'set') gs.story.flags[realKey] = v;
                    msgs.push(`🌍 ${realKey}: ${gs.story.flags[realKey]}`);
                }
                else {
                    // 區域變數
                    let cur = Number(gs.story.vars[k]) || 0;
                    let next = cur;
                    if (op.op === '+' || op.op === 'add') next = cur + v;
                    else if (op.op === '-' || op.op === 'sub') next = cur - v;
                    else if (op.op === '=' || op.op === 'set') next = v;
                    gs.story.vars[k] = next;

                    const label = (window.t_tag && window.t_tag(k)) || k;
                    const diff  = next - cur;
                    if (diff !== 0) msgs.push(`📊 ${label}: ${diff > 0 ? '+' : ''}${diff} → ${next}`);
                }
            });
        }

        // Toast
        if (msgs.length > 0 && window.SQ.Actions && window.SQ.Actions.toast) {
            window.SQ.Actions.toast(msgs.join('　'));
        }

        // View 更新
        if (window.SQ.View.Story && window.SQ.View.Story.updateTopBar) {
            window.SQ.View.Story.updateTopBar();
        }
    },

    // ============================================================
    // 🔧 HELPERS & UTILITIES
    // ============================================================
    _deepClone: function(obj) {
        if (!obj) return obj;
        if (typeof structuredClone === 'function') {
            try { return structuredClone(obj); } catch (e) { /* fallback */ }
        }
        return JSON.parse(JSON.stringify(obj));
    },

    _sanitizeNodeForSave: function(node) {
        const safe = { 
            id: node.id, 
            type: node.type, 
            text: node.text, 
            dialogue: node.dialogue, // ✅ 補上這行！確保對話陣列有被存檔
            briefText: node.briefText, 
            isHub: node.isHub, 
            noDefaultExit: node.noDefaultExit, 
            onEnter: node.onEnter, 
            rewards: node.rewards 
        };
        if (node.options) {
            safe.options = node.options.map(opt => {
                const safeOpt = { ...opt };
                if (safeOpt.nextScene) {
                    if (window._SCENE_POOL && window._SCENE_POOL[safeOpt.nextScene.id]) delete safeOpt.nextScene;
                }
                if (safeOpt.failScene) {
                    if (window._SCENE_POOL && window._SCENE_POOL[safeOpt.failScene.id]) delete safeOpt.failScene;
                }
                return safeOpt;
            });
        }
        return safe;
    },

    _registerSubScene: function(subNode) {
        if (!subNode) return;
        if (!window.StoryData) window.StoryData = {};
        if (!window.StoryData.sceneMap) window.StoryData.sceneMap = {};
 
        // 沒有 id 就先給一個
        if (!subNode.id) {
            subNode.id = `sub_${Date.now()}_${Math.floor(Math.random() * 999)}`;
        }
        window.StoryData.sceneMap[subNode.id] = subNode;
    },

    _shuffle: function(arr) {
        let currentIndex = arr.length, randomIndex;
        while (currentIndex > 0) {
            randomIndex = Math.floor(Math.random() * currentIndex);
            currentIndex--;
            [arr[currentIndex], arr[randomIndex]] = [arr[randomIndex], arr[currentIndex]];
        }
        return arr;
    },

    findSceneById: function(id) {
        if (!window.StoryData.sceneMap) this.loadDatabase();
        return window.StoryData.sceneMap[id] || null;
    },

    _renderSimple: function(textArr, options) {
        console.log("TEXT:", textArr.join("\n"));
        console.log("OPTS:", options);
    },
});
