/* js/modules/shop.js - V34.Final (Logic Engine) */
window.ShopEngine = {
    init: function() {
        const gs = window.GlobalState;
        if (!gs) return;
        
        if (!gs.shop) gs.shop = { npc: [], user: [] };
        if (!gs.bag) gs.bag = [];
        
        // 預設 NPC 商品
        if (gs.shop.npc.length === 0) {
            gs.shop.npc = [
                { id: 'item_potion_s', name: '小傷藥', category: '健康', price: 50, qty: 99, maxQty: 99, desc: '恢復 20 HP', icon: '💊', currency: 'gold' },
                { id: 'item_sword_1', name: '鐵劍', category: '裝備', price: 500, qty: 1, maxQty: 1, desc: '攻擊力 +5', icon: '⚔️', currency: 'gold' },
                { id: 'item_ticket', name: '抽獎券', category: '道具', price: 100, qty: 10, maxQty: 99, desc: '可用於轉蛋', icon: '🎟️', currency: 'gold' }
            ];
        }
    },

    getCategoryIcon: function(cat) {
        switch (cat) {
            case '熱量': return '🔥';
            case '時間': return '⏳';
            case '金錢': return '💰';
            case '裝備': return '⚔️';
            case '健康': return '💊';
            default: return '📦';
        }
    },

    getShopItems: function(filterCat) {
        const gs = window.GlobalState;
        let items = [...(gs.shop.npc || []), ...(gs.shop.user || [])];
        if (filterCat && filterCat !== '全部') {
            items = items.filter(i => i.category === filterCat);
        }
        return items;
    },

    getStackedBag: function(filterCat) {
        const stackedMap = new Map();
        (window.GlobalState.bag || []).forEach(item => {
            if (filterCat && filterCat !== '全部' && item.category !== filterCat) return;
            // 堆疊 Key: ID
            const key = item.id; 
            if (stackedMap.has(key)) {
                stackedMap.get(key).count++;
            } else {
                stackedMap.set(key, { ...item, count: 1 });
            }
        });
        return Array.from(stackedMap.values());
    },

    // 購買邏輯
    buyItem: function(itemId, qty) {
        const gs = window.GlobalState;
        const allItems = [...gs.shop.npc, ...gs.shop.user];
        const item = allItems.find(i => i.id === itemId);
        
        if (!item) return;
        if (item.qty < qty) {
            EventBus.emit(EVENTS.System.TOAST, "❌ 庫存不足");
            return;
        }

        const totalCost = item.price * qty;
        
        // 貨幣扣款邏輯
        if (item.currency === 'gem') {
            const totalGem = (gs.freeGem || 0) + (gs.paidGem || 0);
            if (totalGem < totalCost) return EventBus.emit(EVENTS.System.TOAST, "💎 鑽石不足");
            
            let cost = totalCost;
            if ((gs.freeGem || 0) >= cost) {
                gs.freeGem -= cost;
            } else {
                cost -= (gs.freeGem || 0);
                gs.freeGem = 0;
                gs.paidGem = (gs.paidGem || 0) - cost;
            }
        } else {
            // 預設金幣
            if ((gs.gold || 0) < totalCost) return EventBus.emit(EVENTS.System.TOAST, "💰 金幣不足");
            gs.gold -= totalCost;
        }

        // 發貨
        for (let i = 0; i < qty; i++) {
            gs.bag.push({ ...item, uid: 'b_' + Date.now() + '_' + i });
        }

        // 扣庫存 (NPC 商品若 maxQty 999 視為無限)
        if (item.maxQty < 999) {
            item.qty -= qty;
        }

        if(window.App) App.saveData();
        
        EventBus.emit(EVENTS.Stats.UPDATED);
        EventBus.emit(EVENTS.Shop.UPDATED);
        EventBus.emit(EVENTS.Shop.BAG_UPDATED);
        EventBus.emit(EVENTS.System.MODAL_CLOSE, 'overlay');
        EventBus.emit(EVENTS.System.TOAST, `🎉 購買成功！ (-${totalCost})`);
    },

    // 使用物品
    useItem: function(itemId, qty, isDiscard = false) {
        const gs = window.GlobalState;
        let count = 0;
        
        gs.bag = gs.bag.filter(item => {
            if (item.id === itemId && count < qty) {
                count++;
                // [擴充點] 這裡可以加入物品效果邏輯 (如恢復HP)
                return false; 
            }
            return true;
        });

        if(window.App) App.saveData();
        EventBus.emit(EVENTS.Shop.BAG_UPDATED);
        EventBus.emit(EVENTS.System.MODAL_CLOSE, 'panel'); // 關閉詳情
        EventBus.emit(EVENTS.System.TOAST, isDiscard ? "🗑️ 已丟棄" : "✨ 使用成功");
    },

    // [New] 上架商品邏輯
    submitUpload: function(data) {
        const gs = window.GlobalState;
        if (!data.name) return EventBus.emit(EVENTS.System.TOAST, "❌ 請輸入名稱");

        const editId = window.TempState.uploadEditId;
        
        if (editId) {
            const item = gs.shop.user.find(i => i.id === editId);
            if (item) {
                Object.assign(item, data);
                item.icon = this.getCategoryIcon(data.category);
            }
        } else {
            const newItem = {
                ...data,
                id: 'usr_' + Date.now(),
                maxQty: data.qty,
                icon: this.getCategoryIcon(data.category),
                currency: 'gold'
            };
            gs.shop.user.push(newItem);
        }

        if(window.App) App.saveData();
        EventBus.emit(EVENTS.System.TOAST, "✅ 上架成功");
        EventBus.emit(EVENTS.System.MODAL_CLOSE, 'm-upload'); // 指定關閉上架窗
        EventBus.emit(EVENTS.Shop.UPDATED);
    },

    // [New] 下架商品
    deleteShopItem: function(id) {
        const gs = window.GlobalState;
        gs.shop.user = gs.shop.user.filter(i => i.id !== id);
        if(window.App) App.saveData();
        EventBus.emit(EVENTS.System.TOAST, "🗑️ 商品已下架");
        EventBus.emit(EVENTS.System.MODAL_CLOSE, 'm-upload');
        EventBus.emit(EVENTS.Shop.UPDATED);
    },

    // [New] 儲值邏輯
    submitPayment: function(amount) {
        const gs = window.GlobalState;
        gs.paidGem = (gs.paidGem || 0) + amount;
        
        if(window.App) App.saveData();
        EventBus.emit(EVENTS.System.TOAST, `💎 獲得 ${amount} 鑽石`);
        EventBus.emit(EVENTS.System.MODAL_CLOSE, 'overlay');
        EventBus.emit(EVENTS.Stats.UPDATED);
    },
	
	// [New] 購買精力 (Gem -> Energy)
    buyStamina: function(type) {
        const gs = window.GlobalState;
        const packs = {
            'small': { cost: 20, val: 20, name: '小瓶精力' },
            'medium': { cost: 50, val: 50, name: '中瓶精力' },
            'large': { cost: 100, val: 100, name: '大瓶精力' }
        };
        const p = packs[type];
        if(!p) return;

        // 檢查鑽石餘額
        const totalGem = (gs.freeGem || 0) + (gs.paidGem || 0);
        if (totalGem < p.cost) {
            EventBus.emit(window.EVENTS.System.TOAST, "💎 鑽石不足");
            return;
        }

        // 扣除鑽石 (優先扣免費)
        let cost = p.cost;
        if ((gs.freeGem || 0) >= cost) {
            gs.freeGem -= cost;
        } else {
            cost -= (gs.freeGem || 0);
            gs.freeGem = 0;
            gs.paidGem = (gs.paidGem || 0) - cost;
        }

        // 恢復精力
        if (!gs.story) gs.story = { energy: 0, maxEnergy: 30 };
        // 允許溢出 (Overfill)
        gs.story.energy += p.val;

        if(window.App) App.saveData();
        
        EventBus.emit(window.EVENTS.System.TOAST, `⚡ 成功恢復 ${p.val} 精力`);
        EventBus.emit(window.EVENTS.Story.UPDATED); // 通知 StoryView 更新 Header
        EventBus.emit(window.EVENTS.Stats.UPDATED); // 通知 HUD 更新鑽石
        EventBus.emit(window.EVENTS.System.MODAL_CLOSE, 'overlay');
    }
};