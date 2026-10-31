(function () {
    const root = document.documentElement;
    const savedTheme = localStorage.getItem("ebr-theme") || "light";
    root.setAttribute("data-theme", savedTheme);

    function addThemeToggle() {
        const navActions = document.querySelector(".nav-actions");
        if (!navActions || document.querySelector(".theme-toggle")) return;

        const button = document.createElement("button");
        button.type = "button";
        button.className = "theme-toggle";

        function updateButton() {
            const isDark = root.getAttribute("data-theme") === "dark";

            button.textContent = isDark ? "☀" : "☾";
            button.setAttribute("aria-label",
                isDark ? "Switch to light mode" : "Switch to dark mode");
            button.title = isDark ? "Switch to light mode" : "Switch to dark mode";
            button.setAttribute("aria-pressed", String(isDark));
        }

        button.addEventListener("click", function () {
            const newTheme =
                root.getAttribute("data-theme") === "dark" ? "light" : "dark";

            root.setAttribute("data-theme", newTheme);
            localStorage.setItem("ebr-theme", newTheme);
            updateButton();
        });

        updateButton();
        navActions.prepend(button);
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", addThemeToggle);
    } else {
        addThemeToggle();
    }
})();