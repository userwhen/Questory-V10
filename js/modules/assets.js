/* js/modules/assets.js - V5.9.1 Fixed */
window.Assets = window.Assets || {
    getConf: function() {
        return (window.GameConfig && window.GameConfig.Assets) ? window.GameConfig.Assets : {
            basePath: 'img/', defExt: '.png', avatars: { adventurer: {m:'outfit_01', f:'outfit_02'} }
        };
    },
    
    getAvatarPath: function(mode, gender) {
        const conf = this.getConf();
        const m = mode || 'adventurer';
        const g = (gender === 'f' || gender === '👩') ? 'f' : 'm';
        const modeMap = (conf.avatars && conf.avatars[m]) ? conf.avatars[m] : conf.avatars['adventurer'];
        return `${conf.basePath}${modeMap ? modeMap[g] : 'outfit_01'}${conf.defExt}`;
    },

    getCharImgTag: function(className='', style='') {
        const gs = window.SQ.State;
        if (!gs) return ''; 
        
        const currentSuitId = (gs.avatar && gs.avatar.wearing && gs.avatar.wearing.suit) 
                               ? gs.avatar.wearing.suit 
                               : 'outfit_01'; // 預設防呆
        
        const conf = this.getConf();
        const path = `${conf.basePath}${currentSuitId}${conf.defExt}`;
        
        // ✅ [CSP 修復] 徹底移除 onerror，加入 data-fallback 交給 main.js 處理
        return `<img src="${path}" class="${className}" style="${style}" data-fallback="true">`;
    }
};