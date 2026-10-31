
document.addEventListener("DOMContentLoaded", async () => {
    const container = document.getElementById("myReviewsContainer");
    const username = localStorage.getItem("ebrUsername");

    if (!username) {
        container.replaceChildren();

        const message = document.createElement("p");
        message.textContent = "Please login to view your reviews.";

        const link = document.createElement("a");
        link.href = "login.html";
        link.className = "primary-button";
        link.textContent = "Login";

        container.append(message, link);
        return;
    }

    try {
        const booksResponse = await fetch("/books");

        if (!booksResponse.ok) {
            throw new Error("Unable to retrieve books.");
        }

        const books = await booksResponse.json();
        const myReviews = [];

        for (const [isbn, book] of Object.entries(books)) {
            const response = await fetch(
                `/review/${encodeURIComponent(isbn)}`
            );

            if (!response.ok) {
                continue;
            }

            const reviews = await response.json();

            if (
                reviews &&
                Object.prototype.hasOwnProperty.call(reviews, username)
            ) {
                myReviews.push({
                    isbn,
                    title: book.title,
                    review: reviews[username]
                });
            }
        }

        container.replaceChildren();

        if (myReviews.length === 0) {
            const emptyMessage = document.createElement("p");
            emptyMessage.textContent =
                "You haven't written any reviews yet.";

            const link = document.createElement("a");
            link.href = "books.html";
            link.className = "primary-button";
            link.textContent = "Explore Books";

            container.append(emptyMessage, link);
            return;
        }

        myReviews.forEach((item) => {
            const card = document.createElement("article");
            card.className = "review-card";

            const title = document.createElement("h2");
            title.textContent = item.title;

            const review = document.createElement("p");
            review.textContent = Array.isArray(item.review)
                ? item.review.join(", ")
                : item.review;

            const link = document.createElement("a");
            link.href =
                `book-details.html?isbn=${encodeURIComponent(item.isbn)}`;
            link.className = "text-link";
            link.textContent = "View Book";

            const editButton = document.createElement("button");
editButton.type = "button";
editButton.className = "edit-review-button";
editButton.textContent = "Update Review";

editButton.addEventListener("click", async () => {
    const currentReview = Array.isArray(item.review)
        ? item.review.join(", ")
        : item.review;

    const updatedReview = prompt(
        "Enter your updated review:",
        currentReview
    );

    if (updatedReview === null) {
        return;
    }

    if (!updatedReview.trim()) {
        alert("Review cannot be empty.");
        return;
    }

    editButton.disabled = true;
    editButton.textContent = "Updating...";

    try {
        const response = await fetch(
            `/customer/auth/review/${encodeURIComponent(item.isbn)}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "same-origin",
                body: JSON.stringify({
                    review: updatedReview.trim()
                })
            }
        );

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));

            throw new Error(
                errorData.error ||
                errorData.message ||
                "Unable to update review."
            );
        }

        alert("Review updated successfully!");
        window.location.reload();

    } catch (error) {
        alert(error.message);
        editButton.disabled = false;
        editButton.textContent = "Update Review";
    }
});

            const deleteButton = document.createElement("button");
            deleteButton.type = "button";
            deleteButton.className = "delete-review-button";
            deleteButton.textContent = "Delete Review";

            deleteButton.addEventListener("click", async () => {
                const confirmed = confirm(
                    `Are you sure you want to delete your review for "${item.title}"?`
                );

                if (!confirmed) {
                    return;
                }

                deleteButton.disabled = true;
                deleteButton.textContent = "Deleting...";

                try {
                    const deleteResponse = await fetch(
                        `/customer/auth/review/${encodeURIComponent(item.isbn)}`,
                        {
                            method: "DELETE",
                            credentials: "same-origin"
                        }
                    );

                    if (!deleteResponse.ok) {
                        const errorData = await deleteResponse.json()
                            .catch(() => ({}));

                        throw new Error(
                            errorData.error ||
                            errorData.message ||
                            "Unable to delete review."
                        );
                    }

                    alert("Review deleted successfully!");
                    window.location.reload();

                } catch (error) {
                    alert(error.message);
                    deleteButton.disabled = false;
                    deleteButton.textContent = "Delete Review";
                }
            });

            card.append(title, review, link, deleteButton);
            card.append(title, review, link, editButton, deleteButton);
            container.appendChild(card);
        });

    } catch (error) {
        container.textContent = error.message;
    }
});
