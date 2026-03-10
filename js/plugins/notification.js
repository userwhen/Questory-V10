/* www/js/modules/notification.js - V1.0 Local Notification Manager */
/* 純本地排程通知，不需要 Firebase */
/* 未來升級 FCM 時，只需在 requestPermission() 後加入 FCM token 註冊 */

window.SQ = window.SQ || {};
window.SQ.Notification = {

    // =====================================================
    // 設定預設值
    // =====================================================
    DEFAULTS: {
        dailyHour: 9,        // 預設每日提醒：早上 9 點
        dailyMinute: 0,
        streakWarningHour: 21, // 預設連續天數警告：晚上 9 點
        streakWarningMinute: 0,
        enabled: false       // 預設關閉，等玩家主動開啟
    },

    // =====================================================
    // 初始化（在 main.js 的 App.init() 裡呼叫）
    // =====================================================
    init: async function() {
        // 確保 Capacitor 環境存在
        if (!window.Capacitor) {
            console.log('[Notification] 非 Capacitor 環境，略過');
            return;
        }

        try {
            const { LocalNotifications } = Capacitor.Plugins;
            if (!LocalNotifications) {
                console.warn('[Notification] LocalNotifications 插件未安裝');
                return;
            }

            // 檢查玩家是否已開啟通知設定
            const settings = window.SQ.State?.settings || {};
            if (!settings.notificationEnabled) return;

            // 重新排程（每次開 App 都要重設，確保排程存活）
            await this.scheduleAll();
            console.log('✅ Notification V1.0 初始化完成');
        } catch(e) {
            console.warn('[Notification] init 失敗:', e);
        }
    },

    // =====================================================
    // 申請通知權限（第一次開啟通知設定時呼叫）
    // =====================================================
    requestPermission: async function() {
        if (!window.Capacitor) {
            window.SQ.Actions.toast('⚠️ 通知功能需要安裝版 App');
            return false;
        }

        try {
            const { LocalNotifications } = Capacitor.Plugins;
            const result = await LocalNotifications.requestPermissions();

            if (result.display === 'granted') {
                window.SQ.Actions.toast('🔔 通知已開啟！');
                return true;
            } else {
                window.SQ.Actions.toast('❌ 通知權限被拒絕，請到手機設定中開啟');
                return false;
            }
        } catch(e) {
            console.warn('[Notification] requestPermission 失敗:', e);
            return false;
        }
    },

    // =====================================================
    // 排程全部通知（每次開 App 時重設）
    // =====================================================
    scheduleAll: async function() {
        if (!window.Capacitor) return;

        try {
            const { LocalNotifications } = Capacitor.Plugins;

            // 先清除所有舊排程
            await LocalNotifications.cancel({ notifications: [
                { id: 1001 }, // 每日任務提醒
                { id: 1002 }, // 連續天數警告
                ...Array.from({length: 50}, (_, i) => ({ id: 2000 + i })) // 截止日通知
            ]});

            const notifications = [];
            const settings = window.SQ.State?.settings || {};

            // --- 1. 每日任務提醒 ---
            if (settings.notificationEnabled) {
                const dailyTime = this._getNextTime(
                    settings.notifyDailyHour ?? this.DEFAULTS.dailyHour,
                    settings.notifyDailyMinute ?? this.DEFAULTS.dailyMinute
                );
                notifications.push({
                    id: 1001,
                    title: '⚔️ 今日任務等你完成！',
                    body: this._getDailyBody(),
                    schedule: {
                        at: dailyTime,
                        repeats: true,
                        every: 'day'
                    },
                    sound: 'default',
                    smallIcon: 'ic_notification',
                    channelId: 'quest-reminder'
                });
            }

            // --- 2. 連續天數警告 ---
            if (settings.notificationEnabled && settings.notifyStreakWarning !== false) {
                const streakTime = this._getNextTime(
                    settings.notifyStreakHour ?? this.DEFAULTS.streakWarningHour,
                    settings.notifyStreakMinute ?? this.DEFAULTS.streakWarningMinute
                );
                const streak = window.SQ.State?.loginStreak || 0;
                if (streak > 0) {
                    // 判斷今天是否已登入
                    const lastLogin = window.SQ.State?.lastLoginDate;
                    const today = new Date().toDateString();
                    if (lastLogin !== today) {
                        notifications.push({
                            id: 1002,
                            title: `🔥 連續 ${streak} 天！今天還沒回來`,
                            body: '再不登入，連續天數就要歸零了！',
                            schedule: { at: streakTime },
                            sound: 'default',
                            smallIcon: 'ic_notification',
                            channelId: 'quest-reminder'
                        });
                    }
                }
            }

            // --- 3. 任務截止日提醒（當天） ---
            if (settings.notificationEnabled && settings.notifyDeadline !== false) {
                const deadlineNotifs = this._buildDeadlineNotifications();
                notifications.push(...deadlineNotifs);
            }

            // 送出排程
            if (notifications.length > 0) {
                await LocalNotifications.schedule({ notifications });
                console.log(`[Notification] 已排程 ${notifications.length} 則通知`);
            }

        } catch(e) {
            console.warn('[Notification] scheduleAll 失敗:', e);
        }
    },

    // =====================================================
    // 建立截止日通知清單
    // =====================================================
    _buildDeadlineNotifications: function() {
        const tasks = window.SQ.State?.tasks || [];
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const notifications = [];
        let idCounter = 0;

        tasks.forEach(task => {
            if (!task.deadline || task.done) return;

            const deadline = new Date(task.deadline);
            deadline.setHours(0, 0, 0, 0);

            // 只處理今天截止的任務
            if (deadline.getTime() !== today.getTime()) return;

            // 當天早上 8 點提醒
            const notifyAt = new Date();
            notifyAt.setHours(8, 0, 0, 0);

            // 如果現在已經過了 8 點，設為 1 小時後
            if (notifyAt < new Date()) {
                notifyAt.setTime(new Date().getTime() + 60 * 60 * 1000);
            }

            notifications.push({
                id: 2000 + idCounter++,
                title: '⏰ 今日截止任務提醒',
                body: `「${task.title}」今天就是截止日！`,
                schedule: { at: notifyAt },
                sound: 'default',
                smallIcon: 'ic_notification',
                channelId: 'quest-deadline'
            });
        });

        return notifications;
    },

    // =====================================================
    // 工具函式
    // =====================================================

    // 取得「今天或明天」的指定時間
    _getNextTime: function(hour, minute) {
        const now = new Date();
        const target = new Date();
        target.setHours(hour, minute, 0, 0);

        // 如果今天這個時間已過，設為明天
        if (target <= now) {
            target.setDate(target.getDate() + 1);
        }
        return target;
    },

    // 根據目前完成狀況產生每日提醒文案
    _getDailyBody: function() {
        const tasks = window.SQ.State?.tasks || [];
        const todayTasks = tasks.filter(t => !t.done && (t.cat === '每日' || t.type === 'daily'));
        if (todayTasks.length === 0) return '今天的任務都完成了嗎？去看看有沒有新的！';
        if (todayTasks.length === 1) return `還有 1 個任務「${todayTasks[0].title}」等你完成！`;
        return `還有 ${todayTasks.length} 個任務等你完成，加油！`;
    },

    // 建立 Android 通知頻道（第一次安裝時呼叫）
    createChannels: async function() {
        if (!window.Capacitor) return;
        try {
            const { LocalNotifications } = Capacitor.Plugins;
            await LocalNotifications.createChannel({
                id: 'quest-reminder',
                name: '每日提醒',
                description: '每日任務與連續天數提醒',
                importance: 4, // HIGH
                visibility: 1,
                sound: 'default',
                vibration: true
            });
            await LocalNotifications.createChannel({
                id: 'quest-deadline',
                name: '截止日提醒',
                description: '任務截止日當天提醒',
                importance: 5, // MAX
                visibility: 1,
                sound: 'default',
                vibration: true
            });
        } catch(e) {
            console.warn('[Notification] createChannels 失敗:', e);
        }
    },

    // 關閉所有通知
    disableAll: async function() {
        if (!window.Capacitor) return;
        try {
            const { LocalNotifications } = Capacitor.Plugins;
            const pending = await LocalNotifications.getPending();
            if (pending.notifications.length > 0) {
                await LocalNotifications.cancel({ notifications: pending.notifications });
            }
            console.log('[Notification] 所有通知已關閉');
        } catch(e) {
            console.warn('[Notification] disableAll 失敗:', e);
        }
    }
};
