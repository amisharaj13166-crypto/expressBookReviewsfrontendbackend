document.addEventListener("DOMContentLoaded", () => {
    const registerForm = document.getElementById("registerForm");
    const loginForm = document.getElementById("loginForm");
    const message = document.getElementById("authMessage");

    if (registerForm) {
        registerForm.addEventListener("submit", async (event) => {
            event.preventDefault();

            const username = document.getElementById("username").value.trim();
            const password = document.getElementById("password").value;

            message.textContent = "Creating your account...";

            try {
                const response = await fetch("/register", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username, password })
                });

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.message || result.error || "Registration failed.");
                }

                message.textContent = "Registration successful! Redirecting to login...";

                setTimeout(() => {
                    window.location.href = "login.html";
                }, 1200);
            } catch (error) {
                message.textContent = error.message;
            }
        });
    }

    if (loginForm) {
        loginForm.addEventListener("submit", async (event) => {
            event.preventDefault();

            const username = document.getElementById("username").value.trim();
            const password = document.getElementById("password").value;

            message.textContent = "Logging in...";

            try {
                const response = await fetch("/customer/login", {
                    method: "POST",
                    credentials: "same-origin",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ username, password })
                });

                const result = await response.json();

                if (!response.ok) {
                    throw new Error(result.message || result.error || "Login failed.");
                }

                localStorage.setItem("ebrUsername", username);
                message.textContent = "Login successful!";

                setTimeout(() => {
                    window.location.href = "books.html";
                }, 800);
            } catch (error) {
                message.textContent = error.message;
            }
        });
    }
});