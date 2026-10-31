document.addEventListener("DOMContentLoaded", () => {
    const isbn = new URLSearchParams(window.location.search).get("isbn");
    const detailsContainer = document.getElementById("bookDetails");
    const reviewsContainer = document.getElementById("reviewsList");
    const reviewForm = document.getElementById("reviewForm");
    const reviewMessage = document.getElementById("reviewMessage");

    if (!isbn) {
        detailsContainer.textContent = "No book was selected.";
        reviewForm.hidden = true;
        return;
    }

    async function loadBook() {
        try {
            const response = await fetch(`/isbn/${encodeURIComponent(isbn)}`);

            if (!response.ok) {
                throw new Error("Book not found.");
            }

            const book = await response.json();

            const heading = document.createElement("h1");
            heading.textContent = book.title;

            const author = document.createElement("p");
            author.textContent = `Author: ${book.author}`;

            const isbnText = document.createElement("p");
            isbnText.textContent = `ISBN: ${isbn}`;

            const cover = document.createElement("div");
            cover.className = "details-cover";
            cover.textContent = book.title;

            const information = document.createElement("div");
            information.className = "details-information";
            information.append(heading, author, isbnText);

            detailsContainer.replaceChildren(cover, information);
        } catch (error) {
            detailsContainer.textContent = error.message;
            reviewForm.hidden = true;
        }
    }

    async function loadReviews() {
        try {
            const response = await fetch(`/review/${encodeURIComponent(isbn)}`);

            if (!response.ok) {
                throw new Error("Unable to load reviews.");
            }

            const reviews = await response.json();
            reviewsContainer.replaceChildren();

            const entries = Object.entries(reviews || {});

            if (entries.length === 0) {
                reviewsContainer.textContent = "No reviews yet. Be the first to review this book!";
                return;
            }

            entries.forEach(([username, review]) => {
                const card = document.createElement("article");
                card.className = "review-card";

                const name = document.createElement("h3");
                name.textContent = username;

                const text = document.createElement("p");
                text.textContent = Array.isArray(review) ? review.join(", ") : review;

                card.append(name, text);
                reviewsContainer.appendChild(card);
            });
        } catch (error) {
            reviewsContainer.textContent = error.message;
        }
    }

    reviewForm.addEventListener("submit", async (event) => {
        event.preventDefault();

        const review = document.getElementById("reviewText").value.trim();

        if (!review) {
            reviewMessage.textContent = "Please write a review first.";
            return;
        }

        try {
            const response = await fetch(
                `/customer/auth/review/${encodeURIComponent(isbn)}`,
                {
                    method: "PUT",
                    credentials: "same-origin",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ review })
                }
            );

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || result.message || "Could not submit review.");
            }

            reviewMessage.textContent = result.message || "Review submitted successfully.";
            reviewForm.reset();
            await loadReviews();
        } catch (error) {
            reviewMessage.textContent = error.message + " Please login if you have not already.";
        }
    });

    loadBook();
    loadReviews();
});