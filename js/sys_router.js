/* js/modules/sys_router.js - V2.0 Integrated Router */
/* 負責：頁面切換、全螢幕判斷、歷史堆疊、Navbar 狀態連動 */
window.SQ = window.SQ || {};
window.SQ.Router = {
    // [配置] 定義所有頁面的屬性
    // divId: HTML 中的 ID
    // navId: Navbar 按鈕的 ID (沒有則填 null)
    // fullscreen: 是否為全螢幕 (隱藏 Navbar, 顯示 layer-full)
    config: {
        // --- 主介面 ---
        'main':     { divId: 'page-main',     navId: 'nav-main', fullscreen: false },
        'task':     { divId: 'page-task',     navId: 'nav-task', fullscreen: false },
        'shop':     { divId: 'page-shop',     navId: 'nav-shop', fullscreen: false },
        'stats':    { divId: 'page-stats',    navId: 'nav-stats', fullscreen: false }, // 假設屬性頁有按鈕
        'settings': { divId: 'page-settings', navId: null,       fullscreen: false },
        
        // --- 子頁面 ---
        'history':   { divId: 'page-history',   navId: null, fullscreen: false },
        'milestone': { divId: 'page-milestone', navId: null, fullscreen: false },

        // --- 全螢幕層 (Story / Avatar) ---
        'story':  { divId: 'page-story',  navId: null, fullscreen: true },
        'avatar': { divId: 'page-avatar', navId: null, fullscreen: true }
    },

    stack: [], // 歷史紀錄

    init: function() {
        // 綁定原生返回鍵
        window.onpopstate = () => this.back();
        console.log("🚀 Router V2.0 Initialized");
    },

    // [核心] 跳轉邏輯 (取代原本 Core.js 的window.SQ.Actions.navigate)
    go: function(pageId) {
        // 1. 容錯處理 (加上前綴兼容舊寫法)
        const cleanId = pageId.replace('page-', '');
        
        // ✅ [Bug 5 修復] 將 Guard 移到最底層，這樣連 Router.back() 都能成功攔截
        if (
		window.SQ.State?.settings?.mode === 'basic' && 
		cleanId === 'main' && 
		this.stack[this.stack.length - 1] !== 'stats'
		) {
		console.log("🛡️ [Basic Mode] 攔截大廳導航，停留在 Stats");
		return this.go('stats');
		}
        const conf = this.config[cleanId];
        
        if (!conf) {
            console.error(`Router: Undefined page [${cleanId}]`);
            return;
        }

        console.log(`[Router] Go -> ${cleanId}`);
		window.SQ.Audio?.play('navigate');

        // 2. 處理頁面顯示/隱藏
        // 遍歷 Config 中所有定義的頁面 ID
        Object.values(this.config).forEach(p => {
            const el = document.getElementById(p.divId);
            if (el) {
                el.classList.remove('active');
                el.style.display = 'none'; // 強制隱藏
            }
        });

        // 顯示目標頁面
        const targetEl = document.getElementById(conf.divId);
        if (targetEl) {
            // 全螢幕模式通常用 flex 置中，一般模式用 block
            targetEl.style.display = conf.fullscreen ? 'flex' : 'block';
            // 微小延遲以觸發 CSS Transition (如果有的話)
            setTimeout(() => targetEl.classList.add('active'), 20);
        }

        // 3. 處理全螢幕層 (Layer-Full)
        // 舊版邏輯是判斷 DOM 包含關係，這裡直接用 Config 判斷更高效
        const layerFull = document.getElementById('layer-full');
        if (layerFull) {
            if (conf.fullscreen) {
                layerFull.style.display = 'block';
                layerFull.classList.add('active');
            } else {
                layerFull.style.display = 'none';
                layerFull.classList.remove('active');
            }
        }

        // 4. 處理 Navbar 顯示與高亮
        const navbar = document.getElementById('navbar');
        if (navbar) {
            if (conf.fullscreen) {
                navbar.style.display = 'none';
            } else {
                navbar.style.display = 'flex';
                // 移除所有高亮
                document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
                // 新增高亮
                if (conf.navId) {
                    const btn = document.getElementById(conf.navId);
                    if (btn) btn.classList.add('active');
                }
            }
        }

        // 5. 關閉干擾視窗 (Overlay / Modals)
        if (window.SQ.Actions.closeModal) {
            window.SQ.Actions.closeModal('overlay');
            window.SQ.Actions.closeModal('system');
        }

        // 6. 堆疊管理
        if (this.stack[this.stack.length - 1] !== cleanId) {
            this.stack.push(cleanId);
        }

        // 7. 更新全域狀態並發送事件
        if (window.SQ.Temp) window.SQ.Temp.currentView = cleanId;
        if (window.SQ.EventBus) window.SQ.EventBus.emit(window.SQ.Events.System.NAVIGATE, cleanId);
    },

    back: function() {
        if (this.stack.length <= 1) return;
        this.stack.pop(); // 移除當前
        const prev = this.stack[this.stack.length - 1]; // 取得上一個
        this.go(prev); // 重新導向
    }
};

window.SQ.Actions = window.SQ.Actions || {};
window.SQ.Actions.navigate = (id) => window.SQ.Router.go(id);
window.SQ.Actions.back = () => window.SQ.Router.back();
