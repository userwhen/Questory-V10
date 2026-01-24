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
        const gs = window.GlobalState;
        if (!gs) return ''; 
        
        const gender = gs.avatar?.gender || 'm';
        const path = this.getAvatarPath(gs.settings.mode, gender);
        const fallbackEmoji = (gender === 'f') ? '👩' : '🧑';
        
        // [修正點] 在 style='...' 這裡加上了單引號，避免 style 內容包含分號時造成語法錯誤
        return `<img src="${path}" class="${className}" style="${style}" onerror="this.outerHTML='<span class=\\'${className}\\' style=\\'${style} font-size:80px; display:flex; justify-content:center; align-items:center;\\'>${fallbackEmoji}</span>'">`;
    }
};