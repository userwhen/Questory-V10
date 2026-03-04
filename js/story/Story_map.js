/* js/modules/story_map.js - V79.0 (獨立模組)
 * 職責：地圖空間系統 (Map Manager)
 * 依賴：window.SQ.Temp, window.SQ.State, window.SQ.Engine.Generator (generateRoom 時)
 * 被依賴：story_flow.js, story_core.js
 */
window.SQ = window.SQ || {};
window.SQ.Engine = window.SQ.Engine || {};

window.SQ.Engine.Map = {
    map: [],
    currentRoom: null,
    building: "未知建築",

    init: function(buildingName, startRoomName) {
        this.map = [];
        this.building = buildingName || "未知區域";
        let startRoom = this.generateRoom(startRoomName);
        this.map.push(startRoom);
        this.currentRoom = startRoom;
        this.updateLocationString();
    },

    clear: function() {
        this.map = [];
        this.currentRoom = null;
        this.building = "未知建築";
        window.SQ.Temp.storyLocation = "未知區域";
    },

    generateRoom: function(forceName = null) {
        let roomName = forceName;
        if (!roomName && window.FragmentDB && window.SQ.Engine.Generator) {
            roomName = window.SQ.Engine.Generator._expandGrammar("{env_adj}的{env_room}", window.FragmentDB, {});
        } else if (!roomName) {
            roomName = "未知房間";
        }
        let uuid = typeof crypto !== 'undefined' && crypto.randomUUID
            ? crypto.randomUUID()
            : 'room_' + Date.now() + '_' + Math.floor(Math.random() * 100000);
        return { id: uuid, name: roomName };
    },

    injectMapOptions: function(baseOptions) {
        let newOptions = [...baseOptions];

        let actionLabel = "探索未知";
        let actionIcon = "🚪";

        const currentTheme = window.SQ.State && window.SQ.State.story && window.SQ.State.story.chain
            ? window.SQ.State.story.chain.theme : null;

        if (currentTheme === 'mystery')   { actionLabel = "前往下一個地點"; actionIcon = "🔎"; }
        else if (currentTheme === 'horror')    { actionLabel = "推開未知的門";   actionIcon = "🚪"; }
        else if (currentTheme === 'adventure') { actionLabel = "深入未知區域";   actionIcon = "⚔️"; }
        else if (currentTheme === 'romance')   { actionLabel = "轉換場景";       actionIcon = "☕"; }
        else if (currentTheme === 'raising')   { actionLabel = "推進排程";       actionIcon = "📅"; }

        newOptions.push({ label: `${actionIcon} ${actionLabel}`, action: "map_explore_new", style: "primary" });

        this.map.forEach(room => {
            if (room.id !== this.currentRoom.id) {
                newOptions.push({ label: `🔙 退回 [${room.name}]`, action: "map_move_to", targetId: room.id });
            }
        });
        return newOptions;
    },

    handleMapAction: function(action, targetId) {
        if (action === "map_explore_new") {
            let newRoom = this.generateRoom();
            this.map.push(newRoom);
            this.currentRoom = newRoom;
            this.updateLocationString();
            return `你推開了一扇沉重的木門，來到了 **[${newRoom.name}]**。`;
        } else if (action === "map_move_to") {
            let targetRoom = this.map.find(r => r.id === targetId);
            if (targetRoom) {
                this.currentRoom = targetRoom;
                this.updateLocationString();
                return `你決定原路折返，退回到了 **[${targetRoom.name}]**。`;
            }
        }
        return "";
    },

    updateLocationString: function() {
        let room = this.currentRoom ? this.currentRoom.name : "未知房間";
        window.SQ.Temp.storyLocation = `${this.building} - ${room}`;
    },
};

window.StoryMap = window.SQ.Engine.Map; // 向下相容別名