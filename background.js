chrome.runtime.onInstalled.addListener(() => {
    chrome.alarms.create("scheduleChecker", { periodInMinutes: 1 });
});

chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name === "scheduleChecker") {
        chrome.storage.local.get(['classDays', 'classTime', 'lastTriggered', 'isExtensionEnabled'], (data) => {
            
            if (data.isExtensionEnabled === false) {
                console.log("Auto-Joiner is disabled via Kill Switch.");
                return;
            }

            if (!data.classDays || data.classDays.length === 0 || !data.classTime) return;

            const now = new Date();
            const currentDay = now.getDay().toString();
            const currentHour = now.getHours();
            const currentMinute = now.getMinutes();
            const [savedHour, savedMinute] = data.classTime.split(':').map(Number);

            const triggerKey = `${now.toDateString()}-${data.classTime}`;

            if (data.classDays.includes(currentDay)) {
                const currentTotalMinutes = (currentHour * 60) + currentMinute;
                const savedTotalMinutes = (savedHour * 60) + savedMinute;
                const timeDiff = currentTotalMinutes - savedTotalMinutes;

                if (timeDiff >= 0 && timeDiff <= 3 && data.lastTriggered !== triggerKey) {
                    chrome.storage.local.set({ lastTriggered: triggerKey }, () => {
                        
                        chrome.notifications.create({
                            type: 'basic',
                            logoUrl: 'logo.png', 
                            title: 'LPU Auto Joiner',
                            message: 'Time for class! Opening the portal now...',
                            priority: 2
                        });

                        chrome.tabs.create({ url: "https://myclass.lpu.in/" });
                    });
                }
            }
        });
    }
});