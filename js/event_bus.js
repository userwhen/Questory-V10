// 2. 事件總線 (Event Bus)
window.EventBus = {
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
        // console.log(`📡 [EventBus] 廣播: ${event}`, data || ''); 
        this.listeners[event].forEach(callback => {
            try {
                callback(data);
            } catch (e) {
                console.error(`❌ [EventBus] 執行監聽者錯誤 (${event}):`, e);
            }
        });
    }
};

console.log("🧠 EventBus (神經網絡) 就緒");