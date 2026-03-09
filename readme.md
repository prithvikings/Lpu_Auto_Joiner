# LPU Auto Joiner

A Chrome extension that automatically logs into the LPU CodeTantra portal and joins your scheduled classes without any manual interaction.

---

## How it works

- The extension runs a background service worker that fetches today's class schedule from the CodeTantra meetings API on startup and every hour.
- For each upcoming class, a precise Chrome alarm is set using the exact `scheduledStartTime` from the API response — no manual time configuration needed.
- When an alarm fires, the extension opens a new tab directly to the join URL (`jnr.jsp?m=<meetingId>`). The platform auto-joins the meeting on page load.
- If you are not logged in when the tab opens, the extension detects the redirect to the login page, fills in your credentials, submits the form, and then navigates to the join URL after login completes.
- After the first successful login and schedule fetch, the extension sends the full schedule back to the background service worker so alarms are set for all remaining classes that day.
- The schedule is cached in local storage with the date it was fetched. It is not re-fetched until the next day or until you manually refresh from the popup.

---

## Features

- Automatic login using saved credentials.
- Schedule fetched directly from the API — no need to manually set class days or times.
- One precise alarm per class, fired at the exact scheduled start time.
- Redirect loop prevention using `sessionStorage` flags so the login and join flow each only run once per tab.
- Popup shows today's full class schedule with start times and live status (Scheduled, Started, Ended).
- Manual refresh button in the popup to force a fresh schedule fetch.
- Kill switch toggle to disable all automation instantly.
- Optional email notification via EmailJS when a class alarm fires.

---

## Limitations

- Chrome must be open for alarms to fire. The extension cannot run when Chrome is closed.
- If you open Chrome after a class has already started, the extension will not auto-join that class. Alarms that fire in the past are not replayed.
- Only classes with `status: started` are joined when navigating through the calendar page. Scheduled classes are handled by their alarms.

---

## Setup

1. Go to `chrome://extensions` and enable Developer Mode.
2. Click "Load unpacked" and select this folder.
3. Open the extension popup and enter your LPU username and password.
4. Optionally enter an email address to receive a notification when a class alarm fires.
5. Click Save. Open the CodeTantra portal once so the extension can log in and fetch the schedule.

---

## Storage keys

| Key | Description |
|---|---|
| `username` | LPU login ID |
| `password` | LPU password |
| `userEmail` | Optional notification email |
| `isExtensionEnabled` | Kill switch state |
| `cachedSchedule` | Array of today's meetings from the API |
| `cachedScheduleDate` | Date string of when the schedule was last fetched |
| `pendingMeetingId` | Meeting ID stored by the alarm, cleared after joining |

---

## Debugging

- Open `chrome://extensions` and click the **service worker** link under the extension to open the background console.
- Run `chrome.storage.local.get(null, console.log)` in that console to inspect all stored data.
- Run `chrome.alarms.getAll(console.log)` to see all scheduled class alarms with their fire timestamps.
- Content script logs appear in the DevTools console on the CodeTantra/LPU pages.
