document.addEventListener("DOMContentLoaded", () => {
  chrome.storage.local.get(
    [
      "username",
      "password",
      "classDays",
      "classTime",
      "theme",
      "isExtensionEnabled",
      "userEmail",
    ],
    (data) => {
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
      let activeTheme = data.theme || (prefersDark ? "dark" : "light");
      document.body.setAttribute("data-theme", activeTheme);
      updateThemelogo(activeTheme);

      const isEnabled = data.isExtensionEnabled !== false;
      document.getElementById("killSwitchToggle").checked = isEnabled;
      if (data.userEmail)
        document.getElementById("userEmail").value = data.userEmail;
      if (data.username)
        document.getElementById("username").value = data.username;
      if (data.password)
        document.getElementById("password").value = data.password;
      if (data.classTime)
        document.getElementById("classTime").value = data.classTime;
      if (data.classDays) {
        data.classDays.forEach((day) => {
          let checkbox = document.querySelector(
            `.day-pill input[value="${day}"]`,
          );
          if (checkbox) checkbox.checked = true;
        });
      }
    },
  );
});

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
  document.getElementById("sunlogo").style.display =
    theme === "dark" ? "block" : "none";
  document.getElementById("moonlogo").style.display =
    theme === "dark" ? "none" : "block";
}

document.getElementById("saveBtn").addEventListener("click", () => {
  const user = document.getElementById("username").value;
  const pass = document.getElementById("password").value;
  const time = document.getElementById("classTime").value;
  const email = document.getElementById("userEmail").value;
  const selectedDays = Array.from(
    document.querySelectorAll(".day-pill input:checked"),
  ).map((cb) => cb.value);

  chrome.storage.local.set(
    {
      username: user,
      password: pass,
      classDays: selectedDays,
      classTime: time,
      userEmail: email,
    },
    () => {
      const status = document.getElementById("status");
      status.style.opacity = "1";
      setTimeout(() => {
        status.style.opacity = "0";
      }, 2000);
    },
  );
});
