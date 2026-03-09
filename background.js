// On install: kick off first schedule fetch and set hourly refresh alarm
chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create("refreshSchedule", { periodInMinutes: 60 });
  refreshAndSchedule();
});

// On browser startup: re-fetch schedule (alarms don't persist across restarts)
chrome.runtime.onStartup.addListener(() => {
  refreshAndSchedule();
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "refreshSchedule") {
    refreshAndSchedule();
  } else if (alarm.name.startsWith("joinClass_")) {
    const meetingId = alarm.name.replace("joinClass_", "");
    chrome.storage.local.get(["isExtensionEnabled", "userEmail"], (data) => {
      if (data.isExtensionEnabled === false) return;

      chrome.notifications.create({
        type: "basic",
        iconUrl: "logo.png",
        title: "LPU Auto Joiner",
        message: "Time for class! Joining now...",
        priority: 2,
      });

      // Store meeting ID so content.js can pick it up if login is needed
      chrome.storage.local.set({ pendingMeetingId: meetingId }, () => {
        chrome.tabs.create({
          url: `https://lovelyprofessionaluniversity.codetantra.com/secure/tla/jnr.jsp?m=${meetingId}`,
        });
      });

      if (data.userEmail) sendEmail(data.userEmail);
    });
  }
});

// Called by content.js after it fetches the meetings API, so background can
// cache the schedule and set alarms without needing its own fetch to succeed.
chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  if (msg.type === "SCHEDULE_FETCHED" && Array.isArray(msg.meetings)) {
    chrome.storage.local.set({
      cachedSchedule: msg.meetings,
      cachedScheduleDate: new Date().toDateString(),
    });
    scheduleAlarms(msg.meetings);
  } else if (msg.type === "REFRESH_SCHEDULE") {
    refreshAndSchedule();
    sendResponse({});
  }
});

// Fetch today's schedule from the API using the browser session cookies.
// Works as long as the user is logged into codetantra in any tab.
function refreshAndSchedule() {
  chrome.storage.local.get(["isExtensionEnabled", "cachedScheduleDate"], (data) => {
    if (data.isExtensionEnabled === false) return;

    // Skip if we already fetched successfully today
    const today = new Date().toDateString();
    if (data.cachedScheduleDate === today) return;

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const endOfDay = startOfDay + 86400000 - 1;

    fetch("https://lovelyprofessionaluniversity.codetantra.com/secure/rest/dd/mf", {
      method: "POST",
      headers: {
        accept: "application/json",
        "content-type": "application/json",
        "x-requested-with": "XMLHttpRequest",
      },
      credentials: "include",
      body: JSON.stringify({
        minDate: startOfDay,
        maxDate: endOfDay,
        filters: { showSelf: true, status: "started,scheduled,ended" },
      }),
    })
      .then((res) => {
        if (!res.ok) throw new Error("not authenticated");
        return res.json();
      })
      .then((result) => {
        if (!result.ref || result.ref.length === 0) return;
        chrome.storage.local.set({
          cachedSchedule: result.ref,
          cachedScheduleDate: today,
        });
        scheduleAlarms(result.ref);
      })
      .catch(() => {
        // Not logged in yet — content.js will push the schedule once it fetches
        console.log("LPU Auto Joiner: Background schedule fetch skipped (not logged in).");
      });
  });
}

function scheduleAlarms(meetings) {
  // Clear any existing joinClass alarms first, then set fresh ones
  chrome.alarms.getAll((alarms) => {
    const old = alarms.filter((a) => a.name.startsWith("joinClass_"));
    let cleared = 0;
    const setNew = () => {
      const now = Date.now();
      meetings.forEach((meeting) => {
        const fireAt =
          meeting.extra?.recurrence?.scheduledStartTime || meeting.startTime;
        if (fireAt > now) {
          chrome.alarms.create(`joinClass_${meeting._id}`, { when: fireAt });
          console.log(
            `LPU Auto Joiner: Alarm set for "${meeting.title}" at ${new Date(fireAt)}`
          );
        }
      });
    };
    if (old.length === 0) { setNew(); return; }
    old.forEach((a) => chrome.alarms.clear(a.name, () => {
      if (++cleared === old.length) setNew();
    }));
  });
}

function sendEmail(toEmail) {
  const classTime = new Date().toLocaleTimeString();
  const serviceID = "service_vfzyy46";
  const templateID = "template_s1bzgvt";
  const publicKey = "rhGbPW24FXeTaWsmN";

  fetch("https://api.emailjs.com/api/v1.0/email/send", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      service_id: serviceID,
      template_id: templateID,
      user_id: publicKey,
      template_params: {
        to_email: toEmail,
        class_time: classTime,
        message: "Your LPU class is starting now. Please join it as fast as possible",
      },
    }),
  })
    .then((response) => {
      if (response.ok)
        console.log("Class notification email sent successfully!");
      else console.error("Failed to send email", response);
    })
    .catch((error) => console.error("Error sending email:", error));
}
