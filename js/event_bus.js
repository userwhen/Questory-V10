// 2. 事件總線 (Event Bus)
window.SQ = window.SQ || {}; window.SQ.EventBus = {
    listeners: {},

    on: function(event, callback) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    },

    off: function(event, callback) {
        if (!this.listeners[event]) return;
        this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    },

    emit: function(event, data) {
        if (!this.listeners[event]) return;
        this.listeners[event].forEach(callback => {
            try {
                callback(data);
            } catch (e) {
                console.error(`❌ [EventBus] 執行監聽者錯誤 (${event}):`, e);
            }
        });
    }
};
window.SQ.EventBus = window.SQ.EventBus;
console.log("🧠 EventBus (神經網絡) 就緒");