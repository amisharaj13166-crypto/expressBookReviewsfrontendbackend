document.addEventListener("DOMContentLoaded", () => {
    if (!document.title || document.title.trim() === "") {
        document.title = "Express Book Reviews";
    }

    // Keep internal navigation links consistent with the current site.
    document.querySelectorAll('a[href^="#"]').forEach((link) => {
        link.addEventListener("click", (event) => {
            const targetId = link.getAttribute("href");
            const target = document.querySelector(targetId);

            if (target) {
                event.preventDefault();
                target.scrollIntoView({ behavior: "smooth" });
            }
        });
    });
});