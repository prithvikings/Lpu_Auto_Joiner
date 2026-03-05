# 🎓 LPU Auto Joiner — Chrome Extension

A Chrome extension that **automatically logs you into** the LPU (Lovely Professional University) student portal and navigates to your class meetings at your scheduled time. Set it once, and never miss a class again.

---

## ✨ Features

- **⏰ Scheduled Auto-Join** — Automatically opens the LPU portal at your configured class time.
- **🔐 Auto-Login** — Fills in your credentials and logs you in without any manual input.
- **📅 Day Selection** — Choose specific days of the week when classes are scheduled.
- **🔔 Notifications** — Sends a browser notification when it's time for class.
- **🎨 Dark / Light Theme** — Toggle between dark and light mode with a single click.
- **🛑 Kill Switch** — Quickly enable or disable the extension without uninstalling it.
- **💾 Persistent Settings** — All your settings are saved locally and restored automatically.

---

## 📸 Preview

| Light Mode                                  | Dark Mode                                       |
| ------------------------------------------- | ----------------------------------------------- |
| Clean, modern interface with orange accents | Sleek dark theme that follows system preference |

---

## 🚀 Installation

### Load as an Unpacked Extension (Developer Mode)

1. **Download or Clone** this repository:

   ```bash
   git clone https://github.com/your-username/lpu-auto-join.git
   ```

2. Open **Google Chrome** and navigate to:

   ```
   chrome://extensions/
   ```

3. Enable **Developer mode** (toggle in the top-right corner).

4. Click **"Load unpacked"** and select the `lpu-auto-join` folder.

5. The extension icon will appear in your Chrome toolbar. Pin it for easy access.

---

## ⚙️ Usage

1. **Click** the extension icon in your Chrome toolbar to open the popup.

2. **Enable the Auto-Joiner** using the toggle switch at the top.

3. **Enter your credentials:**
   - **Username** — Your LPU student ID
   - **Password** — Your LPU portal password

4. **Select Active Days** — Click on the day pills (M, T, W, T, F, S, S) to mark which days you have classes.

5. **Set Class Time** — Use the time picker to set when your class starts.

6. **Click "Save Settings"** — A confirmation message will appear.

That's it! The extension will now:

- Check every minute if it's time for class.
- Open the LPU portal automatically within a 3-minute window of your scheduled time.
- Log you in and navigate to the meetings page.

---

## 📁 Project Structure

```
lpu-auto-join/
├── manifest.json      # Extension configuration and permissions
├── background.js      # Background service worker (alarm-based scheduler)
├── content.js         # Content script (auto-login and navigation logic)
├── popup.html         # Extension popup UI (settings panel)
├── popup.js           # Popup interaction logic (save/load settings, theme toggle)
├── logo.png           # Extension icon
└── readme.md          # Documentation
```

---

## 🔍 How It Works

The extension operates through three main components:

### 1. Background Service Worker (`background.js`)

- Creates a **Chrome Alarm** (`scheduleChecker`) that fires every **1 minute**.
- On each alarm tick, it:
  - Checks if the extension is enabled (kill switch).
  - Retrieves the saved schedule (days + time) from `chrome.storage.local`.
  - Compares the current day and time against the saved schedule.
  - If the current time is within a **3-minute window** of the scheduled class time and on a matching day, it:
    - Sends a **browser notification** ("Time for class!").
    - Opens a **new tab** to `https://myclass.lpu.in/`.
  - Uses a `lastTriggered` key to prevent duplicate triggers on the same day/time.

### 2. Content Script (`content.js`)

- Runs on pages matching `*.lpu.in/*` and `*.codetantra.com/*`.
- When the LPU login page loads (`myclass.lpu.in`):
  - Retrieves stored credentials from `chrome.storage.local`.
  - Auto-fills the **username** and **password** fields.
  - Clicks the **login button** automatically.
- After login, when on the dashboard:
  - Looks for the **Meetings** navigation link (`/secure/tla/m.jsp`).
  - Automatically navigates to the meetings page.
- If already on the meetings page, it does nothing (avoids redirect loops).

### 3. Popup UI (`popup.html` + `popup.js`)

- Provides a clean settings interface with:
  - **Toggle switch** to enable/disable the extension.
  - **Text inputs** for username and password.
  - **Day picker** with circular pill buttons for selecting active days.
  - **Time picker** for setting class time.
  - **Save button** that persists all settings to `chrome.storage.local`.
- **Theme toggle** (sun/moon icon) to switch between light and dark mode.
- Loads saved settings on popup open and restores the UI state.

---

## 🔒 Permissions Explained

| Permission               | Why It's Needed                                                    |
| ------------------------ | ------------------------------------------------------------------ |
| `alarms`                 | To create a recurring 1-minute timer that checks the schedule.     |
| `storage`                | To save and retrieve user settings (credentials, schedule, theme). |
| `tabs`                   | To open a new tab to the LPU portal when it's class time.          |
| `notifications`          | To send a browser notification when the class is about to start.   |
| `*://*.lpu.in/*`         | Host permission to run the content script on LPU portal pages.     |
| `*://*.codetantra.com/*` | Host permission to run the content script on CodeTantra pages.     |

---

## 🛡️ Privacy & Security

- **All data is stored locally** on your machine using `chrome.storage.local`. Nothing is sent to any external server.
- Your credentials are only used to auto-fill the login form on `myclass.lpu.in` and are never transmitted elsewhere.
- The extension only activates on LPU and CodeTantra domains.

---

## 🛠️ Tech Stack

- **Manifest V3** — Latest Chrome Extension architecture
- **Vanilla JavaScript** — No frameworks or dependencies
- **HTML & CSS** — Clean, responsive popup UI with CSS custom properties
- **Google Fonts (Poppins)** — Modern typography

---

## 🐛 Troubleshooting

| Issue                             | Solution                                                                                                                                                                                                |
| --------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Extension doesn't open the portal | Make sure the toggle is **enabled** and you've selected the correct **days** and **time**.                                                                                                              |
| Auto-login doesn't work           | Verify your **username** and **password** are correct. The extension looks for specific input field selectors on the LPU page — if LPU changes their login page structure, selectors may need updating. |
| Notification not showing          | Ensure Chrome notifications are **allowed** in your system settings.                                                                                                                                    |
| Triggers multiple times           | This shouldn't happen due to the `lastTriggered` guard, but try reloading the extension from `chrome://extensions/`.                                                                                    |
| Theme doesn't persist             | Make sure the extension has `storage` permission. Reload the extension if needed.                                                                                                                       |

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

---

## 🤝 Contributing

Contributions are welcome! Feel free to:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

<p align="center">
  Made with ❤️ for LPU Students
</p>
