document.addEventListener("DOMContentLoaded", async () => {
    const totalBooksElement = document.getElementById("totalBooks");
    const totalReviewsElement = document.getElementById("totalReviews");
    const totalReviewersElement = document.getElementById("totalReviewers");
    const tableBody = document.getElementById("adminBooksTable");
    const message = document.getElementById("dashboardMessage");

    try {
        const response = await fetch("/books");

        if (!response.ok) {
            throw new Error("Unable to load the book collection.");
        }

        const books = await response.json();
        const bookEntries = Object.entries(books);

        let reviewCount = 0;
        const reviewers = new Set();

        tableBody.replaceChildren();

        for (const [isbn, book] of bookEntries) {
            const reviewResponse = await fetch(`/review/${encodeURIComponent(isbn)}`);
            let reviews = {};

            if (reviewResponse.ok) {
                reviews = await reviewResponse.json();
            }

            const reviewEntries = Object.entries(reviews || {});
            reviewCount += reviewEntries.length;

            reviewEntries.forEach(([reviewer]) => reviewers.add(reviewer));

            const row = document.createElement("tr");

            [isbn, book.title, book.author, reviewEntries.length].forEach((value) => {
                const cell = document.createElement("td");
                cell.textContent = value;
                row.appendChild(cell);
            });

            tableBody.appendChild(row);
        }

        totalBooksElement.textContent = bookEntries.length;
        totalReviewsElement.textContent = reviewCount;
        totalReviewersElement.textContent = reviewers.size;

        if (bookEntries.length === 0) {
            tableBody.innerHTML = "<tr><td colspan='4'>No books found.</td></tr>";
        }
    } catch (error) {
        message.textContent = error.message;
        tableBody.replaceChildren();

        const row = document.createElement("tr");
        const cell = document.createElement("td");
        cell.colSpan = 4;
        cell.textContent = "Could not load dashboard data.";
        row.appendChild(cell);
        tableBody.appendChild(row);
    }
});