/* www/js/modules/audio.js - V2.0 */
window.SQ = window.SQ || {};
window.SQ.Audio = {

    _ctx: null,
    _masterGain: null,
    _musicGain: null,
    _enabled: true,
    _musicEnabled: false,
    _volume: 0.7,
    _musicVolume: 0.5,

    init: function() {
        const s = window.SQ.State?.settings || {};
        this._enabled      = s.soundEnabled      ?? true;
        this._musicEnabled = s.musicEnabled      ?? false;
        this._volume       = s.volume            ?? 0.7;
        this._musicVolume  = s.musicVolume       ?? 0.5;

        const initCtx = () => {
            if (this._ctx) return;
            try {
                this._ctx = new (window.AudioContext || window.webkitAudioContext)();
                this._masterGain = this._ctx.createGain();
                this._masterGain.gain.value = this._volume;
                this._masterGain.connect(this._ctx.destination);

                this._musicGain = this._ctx.createGain();
                this._musicGain.gain.value = this._musicVolume;
                this._musicGain.connect(this._ctx.destination);

                console.log('✅ Audio V2.0 初始化完成');
            } catch(e) {
                console.warn('[Audio] 無法建立 AudioContext:', e);
            }
        };
        document.addEventListener('click',    initCtx, { once: true });
        document.addEventListener('touchend', initCtx, { once: true });
    },

    play: function(type) {
        if (!this._enabled || !this._ctx) return;

        const sounds = {
            taskComplete: { type:'sine',     freq:[440,660],        dur:0.15, vol:0.4 },
            taskUndo:     { type:'sine',     freq:[330,220],        dur:0.12, vol:0.25 },
            levelUp:      { type:'triangle', freq:[440,550,660],    dur:0.2,  vol:0.5 },
            goldGain:     { type:'sine',     freq:[880],            dur:0.08, vol:0.3 },
            purchase:     { type:'sine',     freq:[550,660],        dur:0.12, vol:0.35 },
            error:        { type:'sine',     freq:[330,220],        dur:0.12, vol:0.25 },
            toast:        { type:'sine',     freq:[660],            dur:0.1,  vol:0.2 },
            click:        { type:'sine',     freq:[440],            dur:0.05, vol:0.15 },
            achievement:  { type:'triangle', freq:[440,550,660,880],dur:0.18, vol:0.5 },
            open:         { type:'sine',     freq:[520,620],        dur:0.1,  vol:0.2 },
            close:        { type:'sine',     freq:[400,320],        dur:0.1,  vol:0.2 },
            toggle_on:    { type:'sine',     freq:[480,600],        dur:0.1,  vol:0.25 },
            toggle_off:   { type:'sine',     freq:[400,320],        dur:0.1,  vol:0.2 },
            navigate:     { type:'sine',     freq:[500],            dur:0.07, vol:0.15 },
            save:         { type:'triangle', freq:[550,660],        dur:0.15, vol:0.3 },
            delete:       { type:'sine',     freq:[330,220],        dur:0.12, vol:0.25 },
        };

        const s = sounds[type];
        if (!s) return;
        try {
            const freqs = Array.isArray(s.freq) ? s.freq : [s.freq];
            freqs.forEach((freq, i) => {
                setTimeout(() => {
                    if (!this._ctx) return;
                    const osc  = this._ctx.createOscillator();
                    const gain = this._ctx.createGain();
                    osc.connect(gain);
                    gain.connect(this._masterGain);
                    osc.type = s.type;
                    osc.frequency.value = freq;
                    const now = this._ctx.currentTime;
                    gain.gain.setValueAtTime(s.vol, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + s.dur);
                    osc.start(now);
                    osc.stop(now + s.dur);
                }, i * (s.dur * 1000 * 0.8));
            });
        } catch(e) { console.warn('[Audio] play 失敗:', e); }
    },

    vibrate: function(type) {
        if (!window.SQ.State?.settings?.vibrationEnabled) return;
        if (!navigator.vibrate) return;
        const patterns = {
            taskComplete: [50],
            levelUp:      [100,50,100],
            achievement:  [100,50,200],
            error:        [200],
            click:        [15],
            toggle_on:    [30],
            toggle_off:   [20],
        };
        navigator.vibrate(patterns[type] || [30]);
    },

    feedback: function(type) {
        this.play(type);
        this.vibrate(type);
    },

    setEnabled:     function(v) { this._enabled = v; },
    setMusicEnabled:function(v) { this._musicEnabled = v; },

    setVolume: function(volume) {
        this._volume = volume;
        if (this._masterGain) this._masterGain.gain.value = volume;
    },

    setMusicVolume: function(volume) {
        this._musicVolume = volume;
        if (this._musicGain) this._musicGain.gain.value = volume;
    }
};