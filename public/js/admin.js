document.addEventListener("DOMContentLoaded", async () => {
  const totalBooksElement = document.getElementById("totalBooks");
  const totalReviewsElement = document.getElementById("totalReviews");
  const totalReviewersElement = document.getElementById("totalReviewers");
  const tableBody = document.getElementById("adminBooksTable");
  const message = document.getElementById("dashboardMessage");

  const addBookForm = document.getElementById("addBookForm");
  const logoutButton = document.getElementById("adminLogoutButton");

  // Check administrator session
  async function checkAdminSession() {
    const response = await fetch("/admin/session", {
      credentials: "same-origin",
    });

    if (!response.ok) {
      window.location.replace("/admin-login.html");
      return false;
    }

    return true;
  }

  function showMessage(text, isError = false) {
    message.textContent = text;
    message.style.color = isError ? "#b42318" : "#287a45";
  }
  // Notify other open pages when books change
  const bookChannel =
    "BroadcastChannel" in window
      ? new BroadcastChannel("book-collection")
      : null;

  function notifyBookChanges() {
    if (bookChannel) {
      bookChannel.postMessage("books-updated");
    }
  }

  // Load dashboard and books
  async function loadDashboard() {
    try {
      const response = await fetch("/admin/api/books", {
  credentials: "same-origin",
  cache: "no-store",
});

      if (!response.ok) {
        throw new Error("Unable to load books.");
      }

      const books = await response.json();
      const bookEntries = Object.entries(books);

      let reviewCount = 0;
      const reviewers = new Set();

      tableBody.replaceChildren();

      for (const [id, book] of bookEntries) {
       const reviews = book.reviews || {};

        const reviewEntries = Object.entries(reviews || {});
        reviewCount += reviewEntries.length;

        reviewEntries.forEach(([reviewer]) => {
          reviewers.add(reviewer);
        });

        const row = document.createElement("tr");

        const values = [
          book.isbn,
          book.title,
          book.author,
          reviewEntries.length,
        ];

        values.forEach((value) => {
          const cell = document.createElement("td");
          cell.textContent = value;
          row.appendChild(cell);
        });

        // Edit button
        const actionsCell = document.createElement("td");

        const editButton = document.createElement("button");
        editButton.type = "button";
        editButton.textContent = "Edit";
        editButton.className = "btn btn-primary";
        editButton.dataset.action = "edit";
        editButton.dataset.id = id;

        // Delete button
        const deleteButton = document.createElement("button");
        deleteButton.type = "button";
        deleteButton.textContent = "Delete";
        deleteButton.className = "btn btn-primary";
        deleteButton.dataset.action = "delete";
        deleteButton.dataset.id = id;

        actionsCell.append(editButton, deleteButton);
        row.appendChild(actionsCell);

        tableBody.appendChild(row);
      }

      totalBooksElement.textContent = bookEntries.length;
      totalReviewsElement.textContent = reviewCount;
      totalReviewersElement.textContent = reviewers.size;

      if (bookEntries.length === 0) {
        const row = document.createElement("tr");
        const cell = document.createElement("td");
        cell.colSpan = 5;
        cell.textContent = "No books found.";
        row.appendChild(cell);
        tableBody.appendChild(row);
      }
    } catch (error) {
      showMessage(error.message, true);
    }
  }

  // Add a new book
  addBookForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const book = {
      isbn: document.getElementById("bookIsbn").value.trim(),
      title: document.getElementById("bookTitle").value.trim(),
      author: document.getElementById("bookAuthor").value.trim(),
      cover: document.getElementById("bookCover").value.trim(),
    };

    try {
      const response = await fetch("/admin/api/books", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "same-origin",
        body: JSON.stringify(book),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Unable to add book.");
      }

      addBookForm.reset();
      showMessage("Book added successfully!");
      notifyBookChanges();
      await loadDashboard();
    } catch (error) {
      showMessage(error.message, true);
    }
  });

  // Edit and delete books
  tableBody.addEventListener("click", async (event) => {
    const button = event.target.closest("button[data-action]");

    if (!button) return;

    const id = button.dataset.id;
    const action = button.dataset.action;

    try {
      const booksResponse = await fetch("/admin/api/books", {
  credentials: "same-origin",
  cache: "no-store",
});

      if (!booksResponse.ok) {
        throw new Error("Unable to retrieve book details.");
      }

      const books = await booksResponse.json();
      const book = books[id];

      if (!book) {
        throw new Error("Book not found.");
      }

      if (action === "edit") {
        const updatedBook = {
          isbn: prompt("Enter ISBN:", book.isbn),
          title: prompt("Enter book title:", book.title),
          author: prompt("Enter author:", book.author),
          cover: prompt("Enter cover image URL:", book.cover),
        };

        // Cancel if any prompt was cancelled
        if (Object.values(updatedBook).some((value) => value === null)) {
          return;
        }

        for (const key in updatedBook) {
          updatedBook[key] = updatedBook[key].trim();
        }

        const response = await fetch(
          `/admin/api/books/${encodeURIComponent(id)}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            credentials: "same-origin",
            body: JSON.stringify(updatedBook),
          },
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Unable to update book.");
        }

       showMessage("Book updated successfully!");
notifyBookChanges();
await loadDashboard();
      }

      if (action === "delete") {
        const confirmed = confirm(
          `Are you sure you want to delete "${book.title}"?`,
        );

        if (!confirmed) return;

        const response = await fetch(
          `/admin/api/books/${encodeURIComponent(id)}`,
          {
            method: "DELETE",
            credentials: "same-origin",
          },
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Unable to delete book.");
        }

        showMessage("Book deleted successfully!");
notifyBookChanges();
await loadDashboard();
      }
    } catch (error) {
      showMessage(error.message, true);
    }
  });

  // Administrator logout
  logoutButton.addEventListener("click", async () => {
    try {
      const response = await fetch("/admin/logout", {
        method: "POST",
        credentials: "same-origin",
      });

      if (!response.ok) {
        throw new Error("Unable to log out.");
      }

      window.location.replace("/admin-login.html");
    } catch (error) {
      showMessage(error.message, true);
    }
  });

  // Start dashboard
  const authenticated = await checkAdminSession();

  if (authenticated) {
    await loadDashboard();
  }
});
