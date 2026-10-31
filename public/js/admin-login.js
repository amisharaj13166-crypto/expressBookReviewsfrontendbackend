document.addEventListener("DOMContentLoaded", async () => {
    const form = document.getElementById("adminLoginForm");
    const message = document.getElementById("adminAuthMessage");
    const button = document.getElementById("adminLoginButton");

    // If the administrator is already logged in, open the dashboard.
    try {
        const sessionResponse = await fetch("/admin/session", {
            credentials: "same-origin"
        });

        if (sessionResponse.ok) {
            window.location.replace("/admin.html");
            return;
        }
    } catch (error) {
        console.error("Unable to check admin session:", error);
    }

    form.addEventListener("submit", async (event) => {
        event.preventDefault();

        message.textContent = "";
        button.disabled = true;
        button.textContent = "Signing in...";

        const username = document.getElementById("username").value.trim();
        const password = document.getElementById("password").value;

        try {
            const response = await fetch("/admin/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "same-origin",
                body: JSON.stringify({ username, password })
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || "Administrator login failed.");
            }

            message.textContent = "Login successful. Opening dashboard...";
            window.location.replace("/admin.html");

        } catch (error) {
            message.textContent = error.message;
            button.disabled = false;
            button.textContent = "Login as Administrator";
        }
    });
});
