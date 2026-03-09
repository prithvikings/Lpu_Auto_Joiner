document.addEventListener("DOMContentLoaded", () => {
  chrome.storage.local.get(
    ["username", "password", "theme", "isExtensionEnabled", "userEmail"],
    (data) => {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      let activeTheme = data.theme || (prefersDark ? "dark" : "light");
      document.body.setAttribute("data-theme", activeTheme);
      updateThemelogo(activeTheme);

      const isEnabled = data.isExtensionEnabled !== false;
      document.getElementById("killSwitchToggle").checked = isEnabled;
      if (data.userEmail) document.getElementById("userEmail").value = data.userEmail;
      if (data.username) document.getElementById("username").value = data.username;
      if (data.password) document.getElementById("password").value = data.password;
    },
  );

  loadSchedule();
});

function loadSchedule() {
  chrome.storage.local.get(["cachedSchedule", "cachedScheduleDate"], (data) => {
    const list = document.getElementById("scheduleList");
    const updated = document.getElementById("scheduleUpdated");

    if (!data.cachedSchedule || data.cachedSchedule.length === 0) {
      list.innerHTML = '<div class="schedule-empty">No classes found — log in to CodeTantra to fetch your schedule.</div>';
      updated.textContent = "";
      return;
    }

    updated.textContent = data.cachedScheduleDate
      ? `Last updated: ${data.cachedScheduleDate}`
      : "";

    list.innerHTML = data.cachedSchedule.map((m) => {
      const ts = m.extra?.recurrence?.scheduledStartTime || m.startTime;
      const time = new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      const title = formatClassTitle(m.title);
      const badgeClass = m.status === "started"
        ? "badge-started"
        : m.status === "ended"
          ? "badge-ended"
          : "badge-scheduled";
      const badgeText = m.status.charAt(0).toUpperCase() + m.status.slice(1);
      return `<div class="class-item">
        <span class="class-time">${time}</span>
        <span class="class-title" title="${m.title}">${title}</span>
        <span class="class-badge ${badgeClass}">${badgeText}</span>
      </div>`;
    }).join("");
  });
}

function formatClassTitle(title) {
  // "CSES003-Lecture by : ..." → "CSES003 · Lecture"
  const match = title.match(/^([A-Z0-9]+)-([A-Za-z]+)/);
  if (match) return `${match[1]} · ${match[2]}`;
  return title.length > 35 ? title.substring(0, 35) + "…" : title;
}

document.getElementById("killSwitchToggle").addEventListener("change", (e) => {
  chrome.storage.local.set({ isExtensionEnabled: e.target.checked });
});

document.getElementById("themeToggle").addEventListener("click", () => {
  let currentTheme = document.body.getAttribute("data-theme");
  let newTheme = currentTheme === "dark" ? "light" : "dark";
  document.body.setAttribute("data-theme", newTheme);
  updateThemelogo(newTheme);
  chrome.storage.local.set({ theme: newTheme });
});

function updateThemelogo(theme) {
  document.getElementById("sunlogo").style.display = theme === "dark" ? "block" : "none";
  document.getElementById("moonlogo").style.display = theme === "dark" ? "none" : "block";
}

document.getElementById("refreshBtn").addEventListener("click", () => {
  const btn = document.getElementById("refreshBtn");
  btn.textContent = "Refreshing…";
  btn.disabled = true;
  // Clear cached date so background re-fetches, then ask it to run now
  chrome.storage.local.remove("cachedScheduleDate", () => {
    chrome.runtime.sendMessage({ type: "REFRESH_SCHEDULE" }, () => {
      // Give it 3 s to fetch, then reload the displayed schedule
      setTimeout(() => {
        loadSchedule();
        btn.textContent = "↻ Refresh";
        btn.disabled = false;
      }, 3000);
    });
  });
});

document.getElementById("saveBtn").addEventListener("click", () => {
  const user = document.getElementById("username").value;
  const pass = document.getElementById("password").value;
  const email = document.getElementById("userEmail").value;

  chrome.storage.local.set({ username: user, password: pass, userEmail: email }, () => {
    const status = document.getElementById("status");
    status.style.opacity = "1";
    setTimeout(() => { status.style.opacity = "0"; }, 2000);
  });
});
