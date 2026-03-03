window.addEventListener('load', () => {
    
    chrome.storage.local.get(['isExtensionEnabled', 'username', 'password'], (data) => {
        
        if (data.isExtensionEnabled === false) return;

        const currentUrl = window.location.href;

        if (currentUrl.includes("myclass.lpu.in")) {
            if (!data.username || !data.password) return;
            let usernameInput = document.querySelector('input[name="i"]');
            let passwordInput = document.querySelector('input[name="p"]');
            let loginButton = document.querySelector('button[type="submit"]');

            if (usernameInput && passwordInput && loginButton) {
                usernameInput.value = data.username;
                passwordInput.value = data.password;
                loginButton.click();
            }
        } 
        else if (currentUrl.includes("/secure/tla/m.jsp")) {
            return;
        }
        else {
            let checkDashboard = setInterval(() => {
                let meetingsBtn = document.querySelector('a[href="/secure/tla/m.jsp"]');
                if (meetingsBtn) {
                    clearInterval(checkDashboard);
                    window.location.href = meetingsBtn.getAttribute('href');
                }
            }, 1000);
        }
    });
});