document.addEventListener('DOMContentLoaded', () => {
    chrome.storage.local.get(['username', 'password', 'classDays', 'classTime', 'theme', 'isExtensionEnabled'], (data) => {
        
        // Handle Theme
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        let activeTheme = data.theme || (prefersDark ? 'dark' : 'light');
        document.body.setAttribute('data-theme', activeTheme);
        updateThemeIcon(activeTheme);

        // Handle Kill Switch (Defaults to true if undefined)
        const isEnabled = data.isExtensionEnabled !== false; 
        document.getElementById('killSwitchToggle').checked = isEnabled;

        // Handle Form Data
        if (data.username) document.getElementById('username').value = data.username;
        if (data.password) document.getElementById('password').value = data.password;
        if (data.classTime) document.getElementById('classTime').value = data.classTime;
        if (data.classDays) {
            data.classDays.forEach(day => {
                let checkbox = document.querySelector(`.day-pill input[value="${day}"]`);
                if (checkbox) checkbox.checked = true;
            });
        }
    });
});

// Immediately save the state of the Master Kill Switch when toggled
document.getElementById('killSwitchToggle').addEventListener('change', (e) => {
    chrome.storage.local.set({ isExtensionEnabled: e.target.checked });
});

// Theme Toggle Logic
document.getElementById('themeToggle').addEventListener('click', () => {
    let currentTheme = document.body.getAttribute('data-theme');
    let newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.body.setAttribute('data-theme', newTheme);
    updateThemeIcon(newTheme);
    chrome.storage.local.set({ theme: newTheme });
});

function updateThemeIcon(theme) {
    document.getElementById('sunIcon').style.display = theme === 'dark' ? 'block' : 'none';
    document.getElementById('moonIcon').style.display = theme === 'dark' ? 'none' : 'block';
}

// Form Saving Logic
document.getElementById('saveBtn').addEventListener('click', () => {
    const user = document.getElementById('username').value;
    const pass = document.getElementById('password').value;
    const time = document.getElementById('classTime').value;
    const selectedDays = Array.from(document.querySelectorAll('.day-pill input:checked')).map(cb => cb.value);

    chrome.storage.local.set({
        username: user,
        password: pass,
        classDays: selectedDays, 
        classTime: time
    }, () => {
        const status = document.getElementById('status');
        status.style.opacity = '1';
        setTimeout(() => { status.style.opacity = '0'; }, 2000);
    });
});