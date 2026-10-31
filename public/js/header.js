document.addEventListener("DOMContentLoaded", () => {
    const navbar = document.querySelector(".navbar");
    const navLinks = document.querySelector(".nav-links");
    const navActions = document.querySelector(".nav-actions");

    if (!navbar || !navLinks || !navActions) return;

    // Create the mobile menu button.
    const menuButton = document.createElement("button");
    menuButton.type = "button";
    menuButton.className = "menu-toggle";
    menuButton.setAttribute("aria-label", "Open navigation menu");
    menuButton.setAttribute("aria-expanded", "false");
    menuButton.setAttribute("aria-controls", "primary-navigation");
    menuButton.innerHTML = "<span></span><span></span><span></span>";

    navLinks.id = "primary-navigation";
    navbar.insertBefore(menuButton, navLinks);

    menuButton.addEventListener("click", () => {
        const isOpen = menuButton.getAttribute("aria-expanded") === "true";

        menuButton.setAttribute("aria-expanded", String(!isOpen));
        menuButton.setAttribute(
            "aria-label",
            isOpen ? "Open navigation menu" : "Close navigation menu"
        );

        navLinks.classList.toggle("menu-open", !isOpen);
navActions.classList.toggle("menu-open", !isOpen);
    });

    // Close the mobile menu after selecting a link.
    navLinks.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
            navLinks.classList.remove("menu-open");
navActions.classList.remove("menu-open");
menuButton.setAttribute("aria-expanded", "false");
menuButton.setAttribute("aria-label", "Open navigation menu");
            menuButton.setAttribute("aria-expanded", "false");
            menuButton.setAttribute("aria-label", "Open navigation menu");
        });
    });

    // Highlight the current page.
    const currentPage = window.location.pathname.split("/").pop() || "index.html";

    navLinks.querySelectorAll("a").forEach((link) => {
        const linkPage = link.getAttribute("href").split("#")[0];

        if (linkPage === currentPage) {
            link.classList.add("active");
            link.setAttribute("aria-current", "page");
        }
    });

    // Build the customer navigation from the server session.
    function renderLoggedOut() {
        const themeButton = navActions.querySelector(".theme-toggle");
        navActions.replaceChildren();

        const loginLink = document.createElement("a");
        loginLink.href = "login.html";
        loginLink.className = "login-link";
        loginLink.textContent = "Login";

        const registerLink = document.createElement("a");
        registerLink.href = "register.html";
        registerLink.className = "btn btn-primary";
        registerLink.textContent = "Join Us";

        navActions.append(loginLink, registerLink);
        if (themeButton) navActions.appendChild(themeButton);
    }

    function renderLoggedIn(username) {
        const themeButton = navActions.querySelector(".theme-toggle");
        navActions.replaceChildren();

        const greeting = document.createElement("span");
        greeting.className = "nav-username";
        greeting.textContent = `Hi, ${username}`;

        const reviewsLink = document.createElement("a");
        reviewsLink.href = "my-reviews.html";
        reviewsLink.className = "login-link";
        reviewsLink.textContent = "My Reviews";

        const logoutButton = document.createElement("button");
        logoutButton.type = "button";
        logoutButton.className = "btn btn-primary";
        logoutButton.textContent = "Logout";

        logoutButton.addEventListener("click", async () => {
            logoutButton.disabled = true;
            logoutButton.textContent = "Logging out...";

            try {
                const response = await fetch("/customer/logout", {
                    method: "POST",
                    credentials: "same-origin"
                });

                if (!response.ok) {
                    throw new Error("Unable to logout. Please try again.");
                }

                localStorage.removeItem("ebrUsername");
                window.location.href = "index.html";
            } catch (error) {
                alert(error.message);
                logoutButton.disabled = false;
                logoutButton.textContent = "Logout";
            }
        });

        navActions.append(greeting, reviewsLink, logoutButton);
        if (themeButton) navActions.appendChild(themeButton);
    }

    fetch("/customer/session", {
        credentials: "same-origin"
    })
        .then((response) => {
            if (!response.ok) throw new Error("Session check failed");
            return response.json();
        })
        .then((session) => {
            if (session.authenticated && session.username) {
                localStorage.setItem("ebrUsername", session.username);
                renderLoggedIn(session.username);
            } else {
                localStorage.removeItem("ebrUsername");
                renderLoggedOut();
            }
        })
        .catch(() => {
            renderLoggedOut();
        });
});
