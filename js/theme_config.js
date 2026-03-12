/* js/theme_config.js - V1.0
 * 主題配置中心 (Theme Configuration Center)
 * 所有主題的 Navbar Icons、Quick Icons、名稱、色票等集中在此管理
 * view.js / settings.js 均從此讀取，不再各自硬編碼
 */

window.SQ = window.SQ || {};

window.SQ.ThemeConfig = {

    // =========================================================
    // 1. 主題定義表
    //    key        : 對應 gs.settings.theme 與 body class
    //    type       : 'story' = 沉浸世界 | 'basic' = 基礎面板
    //    shopId     : 對應 settings.js shopItems 的 id
    // =========================================================
    themes: {

        // ── 沉浸世界 (theme_story) ────────────────────────────

        harem: {
            type:     'story',
            shopId:   'theme_harem',
            label:    '🪭 後宮模式',
            navbar: [
                { id: 'task', icon: '📋', label: '奏摺', action: 'goToTaskRoot' },
                { id: 'main', icon: '🏯', label: '宮廷', action: 'navigate', val: 'main' },
                { id: 'shop', icon: '🧧', label: '賞賜', action: 'navigate', val: 'shop' }
            ],
            quickIcons: [
                { icon: '📋', action: 'openquickModal' },
                { icon: '⏳', action: 'openTimer' },
                { icon: '👘', action: 'navigate', val: 'avatar' },
                { icon: '❓', action: 'showQA' }
            ]
        },

        tech: {
            type:     'story',
            shopId:   'theme_tech',
            label:    '💠 未來科技',
            navbar: [
                { id: 'task', icon: '📋', label: '任務', action: 'goToTaskRoot' },
                { id: 'main', icon: '🏢', label: '大廳', action: 'navigate', val: 'main' },
                { id: 'shop', icon: '🛒', label: '商店', action: 'navigate', val: 'shop' }
            ],
            quickIcons: [
                { icon: '🗂️', action: 'openquickModal' },
                { icon: '⏱️', action: 'openTimer' },
                { icon: '🦾', action: 'navigate', val: 'avatar' },
                { icon: '❓', action: 'showQA' }
            ]
        },

        wood: {
            type:     'story',
            shopId:   'theme_wood',
            label:    '🌑 魔法學院',
            navbar: [
                { id: 'task', icon: '📜', label: '任務', action: 'goToTaskRoot' },
                { id: 'main', icon: '🏰', label: '學院', action: 'navigate', val: 'main' },
                { id: 'shop', icon: '⚗️', label: '商店', action: 'navigate', val: 'shop' }
            ],
            quickIcons: [
                { icon: '📜', action: 'openquickModal' },
                { icon: '⌛', action: 'openTimer' },
                { icon: '🎓', action: 'navigate', val: 'avatar' },
                { icon: '❓', action: 'showQA' }
            ]
        },

        white: {
            type:     'story',
            shopId:   'theme_white',
            label:    '☀️ 晨曦物語',
            navbar: [
                { id: 'task', icon: '📋', label: '任務', action: 'goToTaskRoot' },
                { id: 'main', icon: '🏡', label: '大廳', action: 'navigate', val: 'main' },
                { id: 'shop', icon: '🌸', label: '商店', action: 'navigate', val: 'shop' }
            ],
            quickIcons: [
                { icon: '📝', action: 'openquickModal' },
                { icon: '🌅', action: 'openTimer' },
                { icon: '👒', action: 'navigate', val: 'avatar' },
                { icon: '❓', action: 'showQA' }
            ]
        },

        story: {
            type:     'story',
            shopId:   'theme_story',
            label:    '🌙 賽博都市',
            navbar: [
                { id: 'task', icon: '📡', label: '任務', action: 'goToTaskRoot' },
                { id: 'main', icon: '🏠', label: '大廳', action: 'navigate', val: 'main' },
                { id: 'shop', icon: '💾', label: '商店', action: 'navigate', val: 'shop' }
            ],
            quickIcons: [
                { icon: '📡', action: 'openquickModal' },
                { icon: '⏲️', action: 'openTimer' },
                { icon: '🥽', action: 'navigate', val: 'avatar' },
                { icon: '❓', action: 'showQA' }
            ]
        },

        // ── 基礎面板 (theme_basic) ────────────────────────────
        // 基礎面板不替換 navbar icon，全部使用預設

        'basic-harem': {
            type:     'basic',
            shopId:   'theme_basic_harem',
            label:    '🪭 宮廷朱色',
            navbar: null,    // null = 使用預設
            quickIcons: null // null = 使用預設
        },

        'basic-tech': {
            type:     'basic',
            shopId:   'theme_basic_tech',
            label:    '💠 科技藍調',
            navbar: null,
            quickIcons: null
        },

        'basic-wood': {
            type:     'basic',
            shopId:   'theme_basic_wood',
            label:    '🌑 沉靜學院',
            navbar: null,
            quickIcons: null
        },

        'basic-white': {
            type:     'basic',
            shopId:   'theme_basic_white',
            label:    '☀️ 明亮清晨',
            navbar: null,
            quickIcons: null
        },

        'basic-story': {
            type:     'basic',
            shopId:   'theme_basic_story',
            label:    '🌙 霓光暗夜',
            navbar: null,
            quickIcons: null
        },

        // ── 人魚系列 (Mermaid Series) ────────────────────────

        siren: {
            type:     'story',
            shopId:   'theme_siren',
            label:    '🧜 深海賽壬',
            navbar: [
                { id: 'task', icon: '🔱', label: '使命', action: 'goToTaskRoot' },
                { id: 'main', icon: '🌊', label: '深海', action: 'navigate', val: 'main' },
                { id: 'shop', icon: '🐡', label: '寶庫', action: 'navigate', val: 'shop' }
            ],
            quickIcons: [
                { icon: '📜', action: 'openquickModal' },
                { icon: '⏳', action: 'openTimer' },
                { icon: '🧜', action: 'navigate', val: 'avatar' },
                { icon: '❓', action: 'showQA' }
            ]
        },

        mermaid: {
            type:     'story',
            shopId:   'theme_mermaid',
            label:    '🐚 夢幻人魚',
            navbar: [
                { id: 'task', icon: '🐚', label: '心願', action: 'goToTaskRoot' },
                { id: 'main', icon: '🏝️', label: '海灣', action: 'navigate', val: 'main' },
                { id: 'shop', icon: '💎', label: '珍寶', action: 'navigate', val: 'shop' }
            ],
            quickIcons: [
                { icon: '📝', action: 'openquickModal' },
                { icon: '🌅', action: 'openTimer' },
                { icon: '🐠', action: 'navigate', val: 'avatar' },
                { icon: '❓', action: 'showQA' }
            ]
        },

        'basic-siren': {
            type:     'basic',
            shopId:   'theme_basic_siren',
            label:    '🧜 深海藍黑',
            navbar: null,
            quickIcons: null
        },

        'basic-mermaid': {
            type:     'basic',
            shopId:   'theme_basic_mermaid',
            label:    '🐚 珍珠粉藍',
            navbar: null,
            quickIcons: null
        }
    },

    // =========================================================
    // 2. 預設 (無主題 / adventurer 模式)
    // =========================================================
    defaults: {
        navbar: [
            { id: 'task', icon: '📋', label: '任務', action: 'goToTaskRoot' },
            { id: 'main', icon: '🏠', label: '大廳', action: 'navigate', val: 'main' },
            { id: 'shop', icon: '🛒', label: '商店', action: 'navigate', val: 'shop' }
        ],
        quickIcons: [
            { icon: '📜', action: 'openquickModal' },
            { icon: '🍅', action: 'openTimer' },
            { icon: '👗', action: 'navigate', val: 'avatar' },
            { icon: '❓', action: 'showQA' }
        ]
    },

    // =========================================================
    // 3. Helper：取得當前主題的 navbar / quickIcons
    // =========================================================
    getNavbar: function() {
        const theme = window.SQ.State?.settings?.theme || 'default';
        const cfg = this.themes[theme];
        if (cfg && cfg.navbar) return cfg.navbar;
        return this.defaults.navbar;
    },

    getQuickIcons: function(isBasic) {
        const theme = window.SQ.State?.settings?.theme || 'default';
        const cfg = this.themes[theme];

        // basic 模式隱藏換裝與 QA
        if (isBasic) {
            return [
                { icon: '📜', action: 'openquickModal' },
                { icon: '🍅', action: 'openTimer' }
            ];
        }

        if (cfg && cfg.quickIcons) return cfg.quickIcons;
        return this.defaults.quickIcons;
    },

    getThemeCfg: function(themeKey) {
        return this.themes[themeKey] || null;
    }
};

console.log("🎨 [ThemeConfig] 主題配置中心就緒，共", Object.keys(window.SQ.ThemeConfig.themes).length, "個主題");