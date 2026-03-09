window.addEventListener('load', () => {

    chrome.storage.local.get(['isExtensionEnabled', 'username', 'password'], (data) => {

        if (data.isExtensionEnabled === false) return;

        const currentUrl = window.location.href;

        // 1. LPU Login Page — use sessionStorage flag to prevent re-submitting on SSO redirects
        if (currentUrl.includes("myclass.lpu.in")) {
            if (sessionStorage.getItem('autoLoginDone')) return;
            if (!data.username || !data.password) return;

            let usernameInput = document.querySelector('input[name="i"]');
            let passwordInput = document.querySelector('input[name="p"]');
            let loginButton = document.querySelector('button[type="submit"]');

            if (usernameInput && passwordInput && loginButton) {
                sessionStorage.setItem('autoLoginDone', 'true');
                usernameInput.value = data.username;
                passwordInput.value = data.password;
                loginButton.click();
            }
        }
        // 2. Meetings Calendar Page — fetch API, find a started class, navigate to join page
        else if (currentUrl.includes("/secure/tla/m.jsp")) {
            if (!sessionStorage.getItem('autoJoinDone')) {
                setTimeout(fetchAndJoinClass, 2000);
            }
        }
        // 3. Join page — already joining, set flag and do nothing
        else if (currentUrl.includes("/secure/tla/jnr.jsp")) {
            sessionStorage.setItem('autoJoinDone', 'true');
            return;
        }
        // 4. Any other post-login codetantra page
        else if (currentUrl.includes("codetantra.com/secure")) {
            // If background already resolved the meeting ID, skip m.jsp entirely
            chrome.storage.local.get(['pendingMeetingId'], (d) => {
                if (d.pendingMeetingId) {
                    const id = d.pendingMeetingId;
                    chrome.storage.local.remove('pendingMeetingId');
                    sessionStorage.setItem('autoJoinDone', 'true');
                    window.location.href =
                        `https://lovelyprofessionaluniversity.codetantra.com/secure/tla/jnr.jsp?m=${id}`;
                    return;
                }
                // Otherwise navigate to meetings calendar to fetch schedule
                let attempts = 0;
                let checkDashboard = setInterval(() => {
                    attempts++;
                    let meetingsBtn = document.querySelector('a[href="/secure/tla/m.jsp"]');
                    if (meetingsBtn) {
                        clearInterval(checkDashboard);
                        window.location.href = "https://lovelyprofessionaluniversity.codetantra.com/secure/tla/m.jsp";
                    } else if (attempts > 15) {
                        clearInterval(checkDashboard);
                    }
                }, 1000);
            });
        }
    });
});

function fetchAndJoinClass() {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const endOfDay   = startOfDay + 86400000 - 1;

    fetch("https://lovelyprofessionaluniversity.codetantra.com/secure/rest/dd/mf", {
        method: "POST",
        headers: {
            "accept": "application/json",
            "content-type": "application/json",
            "x-requested-with": "XMLHttpRequest"
        },
        body: JSON.stringify({
            minDate: startOfDay,
            maxDate: endOfDay,
            filters: { showSelf: true, status: "started,ended,scheduled" }
        })
    })
    .then(res => res.json())
    .then(result => {
        if (!result.ref || result.ref.length === 0) {
            console.log("LPU Auto Joiner: No meetings found for today.");
            return;
        }
        // Push full schedule to background so it can set precise alarms
        chrome.runtime.sendMessage({ type: "SCHEDULE_FETCHED", meetings: result.ref });

        const activeClass = result.ref.find(m => m.status === "started");
        if (activeClass) {
            console.log("LPU Auto Joiner: Joining class —", activeClass.title);
            sessionStorage.setItem('autoJoinDone', 'true');
            window.location.href =
                `https://lovelyprofessionaluniversity.codetantra.com/secure/tla/jnr.jsp?m=${activeClass._id}`;
        } else {
            console.log("LPU Auto Joiner: No started class found right now.");
        }
    })
    .catch(err => console.error("LPU Auto Joiner: Error fetching meetings:", err));
}