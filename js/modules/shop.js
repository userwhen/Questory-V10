/* js/modules/shop.js - V35.8 (Daily Reset & Inventory Logic) */

window.ShopEngine = {
    init: function() {
		if (this._initialized) return;
        this._initialized = true;
        const gs = window.GlobalState;
        if (!gs) return;
        
        if (!gs.shop) gs.shop = { user: [] };
        if (!gs.bag) gs.bag = [];
        if (!gs.sysShop) gs.sysShop = {}; 

        // [修改] 為蘋果加入 val: 50 (卡路里數值)
        this.systemPrototypes = [
            { id: 'sys_apple', name: '蘋果', price: 10, currency: 'gold', maxQty: 99, category: '熱量', val: 50, icon: '🍎', desc: '回復少量熱量 (50kcal)', type: 'daily' },
            { id: 'sys_potion', name: '精力藥水', price: 50, currency: 'gem', maxQty: 10, category: '其他', icon: '🧪', desc: '回復精力 (需鑽石)', type: 'daily' },
            { id: 'sys_sword', name: '鐵劍', price: 500, currency: 'gold', maxQty: 1, category: '金錢', icon: '🗡️', desc: '新手冒險者的好夥伴', type: 'once' },
            { id: 'sys_clock', name: '懷錶', price: 200, currency: 'gold', maxQty: 5, category: '時間', icon: '⏱️', desc: '掌控時間的道具', type: 'daily' }
        ];

        // 🚨 [修復 C-7] 拔除手動檢查，改為監聽 Core 發出的換日廣播
        if (window.EventBus && window.EVENTS && window.EVENTS.System.DAILY_RESET) {
            window.EventBus.on(window.EVENTS.System.DAILY_RESET, () => {
                this.performDailyReset();
            });
        }
        
        console.log("🏪 ShopEngine V36.1 Initialized (Listening for Daily Reset)");
    },
	
	// 恢復精力邏輯 (防止溢出)
    recoverStamina: function(amount, cost) {
        const gs = window.GlobalState;
        const totalGem = (gs.freeGem || 0) + (gs.paidGem || 0);

        // 1. 檢查鑽石
        if (totalGem < cost) {
            return { success: false, msg: '💎 鑽石不足！' };
        }

        // 2. 扣除鑽石
        if (gs.freeGem >= cost) {
            gs.freeGem -= cost;
        } else {
            const remain = cost - gs.freeGem;
            gs.freeGem = 0;
            gs.paidGem -= remain;
        }

        // 3. 計算當前玩家的 "真實上限"
        // 呼叫 StoryEngine 的公式 (Lv1=30 ... Lv36=100)
        const currentMax = (window.StoryEngine && StoryEngine.calculateMaxEnergy) 
                           ? StoryEngine.calculateMaxEnergy() 
                           : 30; // 預設防呆
        
        if (!gs.story) gs.story = { energy: 0 };
        
        // 4. 恢復精力 (防止超出)
        let newEnergy = gs.story.energy + amount;
        
        // 如果超過 "當前等級上限"，就切齊上限
        if (newEnergy > currentMax) {
            newEnergy = currentMax;
        }

        gs.story.energy = newEnergy;

        if(window.App) App.saveData();
        return { success: true, current: newEnergy };
    },

    // [核心] 跨日重置邏輯
    performDailyReset: function() {
        const gs = window.GlobalState;
        
        // 安全檢查
        if (!gs || !gs.sysShop) return; 
        
        console.log("🌅 [Shop] Received Daily Reset! Restocking...");
        
        // 1. 系統商品的重置
        for (let id in gs.sysShop) {
            const itemState = gs.sysShop[id];
            const proto = this.systemPrototypes.find(p => p.id === id);
            
            if (proto && proto.type === 'daily') {
                delete gs.sysShop[id];
            } else if (proto && proto.type === 'once') {
                if (itemState.qty <= 0) {
                    itemState.removed = true; 
                }
            }
        }

        // 2. ✅ 玩家自訂商品的重置 (你原本的檔案漏了這一段！)
        if (gs.shop && gs.shop.user) {
            gs.shop.user = gs.shop.user.filter(item => {
                // 單次商品：賣光就淘汰
                if (item.type === 'once' && item.qty <= 0) {
                    return false; 
                }
                // 常駐商品：補滿庫存
                if (item.type === 'daily') {
                    item.qty = item.maxQty || 1;
                }
                return true; 
            });
        }
        
        if (window.App && window.App.saveData) App.saveData();
    },

    getShopItems: function(cat) {
        if (!this.systemPrototypes) this.init();
        const gs = window.GlobalState;
        
        // 1. 處理系統商品
        const sysItems = this.systemPrototypes.map(proto => {
            // 讀取存檔中的狀態 (庫存)
            const state = gs.sysShop[proto.id] || {};
            
            // 如果被標記為永久移除，則不回傳
            if (state.removed) return null;

            return {
                ...proto,
                // 如果存檔有紀錄 qty 就用存檔的，否則用預設 maxQty
                qty: (state.qty !== undefined) ? state.qty : proto.maxQty
            };
        }).filter(i => i !== null); // 過濾掉 null

        // 2. 合併用戶商品
        const all = [...sysItems, ...gs.shop.user];
        
        if (!cat || cat === '全部') return all;
        return all.filter(i => i.category === cat);
    },

    getStackedBag: function(cat) {
        const gs = window.GlobalState;
        let items = gs.bag || [];
        if (cat && cat !== '全部') items = items.filter(i => i.category === cat);
        return items;
    },

    buyItem: function(id, qty) {
        const gs = window.GlobalState;
        const items = this.getShopItems('全部');
        const item = items.find(i => i.id === id);
        
        if (!item) return { success: false, msg: '商品不存在' };
        if (item.qty < qty) return { success: false, msg: '庫存不足' };
		
		// [新增] 負債檢查：如果玩家已經負債，且商品需要金幣，則禁止購買
        if (item.currency === 'gold' && gs.gold < 0) {
            return { success: false, msg: '🚫 您的帳戶處於負債狀態，請先還清債務！' };
        }
        const totalCost = item.price * qty;
        
        // 扣款邏輯
        if (item.currency === 'gold') {
            if (gs.gold < totalCost) return { success: false, msg: '金幣不足' };
            gs.gold -= totalCost;
        } else {
            const totalGem = (gs.freeGem || 0) + (gs.paidGem || 0);
            if (totalGem < totalCost) return { success: false, msg: '鑽石不足' };
            if (gs.freeGem >= totalCost) gs.freeGem -= totalCost;
            else { 
                const remain = totalCost - gs.freeGem; 
                gs.freeGem = 0; 
                gs.paidGem -= remain; 
            }
        }

        // 扣庫存
        if (id.startsWith('sys_')) {
            if (!gs.sysShop[id]) gs.sysShop[id] = { qty: item.qty };
            gs.sysShop[id].qty -= qty;
        } else {
            const userItem = gs.shop.user.find(u => u.id === id);
            if (userItem) userItem.qty -= qty;
        }

        // 進背包
        const existing = gs.bag.find(b => b.id === id);
        if (existing) {
            existing.count += qty;
        } else {
            // 注意：這裡我們會把 item 的所有屬性 (包含 val) 都存進背包
            gs.bag.push({ ...item, count: qty });
        }

        if(window.App) App.saveData();
        return { success: true };
    },

    uploadItem: function(data) {
        const gs = window.GlobalState;
        if (data.id) {
            const idx = gs.shop.user.findIndex(i => i.id === data.id);
            if (idx >= 0) gs.shop.user[idx] = { ...gs.shop.user[idx], ...data };
        } else {
            gs.shop.user.push({ ...data, id: 'usr_' + Date.now(), currency: 'gold', icon: '📦' });
        }
        if (window.App) App.saveData(); return true;
    },
    deleteItem: function(id) { const gs = window.GlobalState; gs.shop.user = gs.shop.user.filter(i => i.id !== id); if (window.App) App.saveData(); },
    useItem: function(id) {
        const gs = window.GlobalState;
        const item = gs.bag.find(i => i.id === id);

        if (!item) return { success: false, msg: "背包中找不到物品" };

        let msg = "已使用";

        // 1. 卡路里物品處理 (類別為'熱量'，且有 val 數值)
        if (item.category === '熱量') {
            const calories = parseInt(item.val || 0);

            if (calories > 0) {
                // 初始化熱量紀錄
                if (!gs.cal) gs.cal = { today: 0, logs: [] };

                gs.cal.today += calories;

                // 寫入日誌
                const timeStr = new Date().toTimeString().substring(0, 5);
                gs.cal.logs.unshift(`${timeStr} ${item.name} +${calories}`);
                if (gs.cal.logs.length > 30) gs.cal.logs.pop();

                msg = `😋 攝取了 ${calories} Kcal`;
            }
        }

        // 2. 消耗物品
        this.discardItem(id, 1);
        
        // 3. 通知更新 (主要為了刷新 Stats View 的熱量表)
        if (window.EventBus) window.EventBus.emit(window.EVENTS.Stats.UPDATED);

        return { success: true, msg: msg };
    },
    discardItem: function(id, qty) {
        const gs = window.GlobalState; 
        const idx = gs.bag.findIndex(i => i.id === id);
        if (idx >= 0) { 
            gs.bag[idx].count -= qty; 
            if (gs.bag[idx].count <= 0) gs.bag.splice(idx, 1); 
            if(window.App) App.saveData(); 
        }
    },
    addGem: function(amount) { 
    const gs = window.GlobalState; 
    gs.paidGem = (gs.paidGem || 0) + amount; 
    if (window.App) App.saveData();  // ✅
	}
};