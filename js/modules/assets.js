/* js/modules/assets.js - V5.9.1 Fixed */
window.Assets = window.Assets || {
    getConf: function() {
        return (window.GameConfig && window.GameConfig.Assets) ? window.GameConfig.Assets : {
            basePath: 'img/', defExt: '.png', avatars: { adventurer: {m:'adventurer_m', f:'adventurer_f'} }
        };
    },
    
    getAvatarPath: function(mode, gender) {
        const conf = this.getConf();
        const m = mode || 'adventurer';
        const g = (gender === 'f' || gender === '👩') ? 'f' : 'm';
        const modeMap = (conf.avatars && conf.avatars[m]) ? conf.avatars[m] : conf.avatars['adventurer'];
        return `${conf.basePath}${modeMap ? modeMap[g] : 'adventurer_m'}${conf.defExt}`;
    },

    getCharImgTag: function(className='', style='') {
        const gs = window.SQ.State;
        if (!gs) return ''; 
        
        // ✅ [核心衝突修復] 讓大廳與 HUD 真正讀取「更衣室正在穿的服裝」
        const currentSuitId = (gs.avatar && gs.avatar.wearing && gs.avatar.wearing.suit) 
                               ? gs.avatar.wearing.suit 
                               : 'adventurer_m'; // 預設防呆
        
        const conf = this.getConf();
        const path = `${conf.basePath}${currentSuitId}${conf.defExt}`;
        
        return `<img src="${path}" class="${className}" style="${style}" onerror="this.outerHTML='<span class=\\'${className}\\' style=\\'${style} font-size:80px; display:flex; justify-content:center; align-items:center;\\'>🧍</span>'">`;
    }
};