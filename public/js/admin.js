document.addEventListener("DOMContentLoaded", async () => {
  const totalBooksElement = document.getElementById("totalBooks");
  const totalReviewsElement = document.getElementById("totalReviews");
  const totalReviewersElement = document.getElementById("totalReviewers");
  const tableBody = document.getElementById("adminBooksTable");
  const message = document.getElementById("dashboardMessage");

  const addBookForm = document.getElementById("addBookForm");
  const logoutButton = document.getElementById("adminLogoutButton");

  // Edit Book Modal elements
const editBookModal = document.getElementById("editBookModal");
const editBookForm = document.getElementById("editBookForm");

const editBookISBN = document.getElementById("editBookISBN");
const editBookName = document.getElementById("editBookName");
const editBookAuthor = document.getElementById("editBookAuthor");
const editBookCover = document.getElementById("editBookCover");

const editBookMessage = document.getElementById("editBookMessage");
const saveEditBookButton = document.getElementById("saveEditBook");

const closeEditBookModalButton =
    document.getElementById("closeEditBookModal");

const cancelEditBookButton =
    document.getElementById("cancelEditBook");

// Delete Book Modal elements
const deleteBookModal = document.getElementById("deleteBookModal");
const deleteBookDescription =
    document.getElementById("deleteBookDescription");

const deleteBookMessage = document.getElementById("deleteBookMessage");
const confirmDeleteBookButton =
    document.getElementById("confirmDeleteBook");

const closeDeleteBookModalButton =
    document.getElementById("closeDeleteBookModal");

const cancelDeleteBookButton =
    document.getElementById("cancelDeleteBook");

let selectedBookId = null;
let selectedBook = null;
let selectedDeleteBookId = null;

// Open Edit Book Modal
function openEditBookModal(id, book) {
    selectedBookId = id;
    selectedBook = book;

    editBookISBN.value = book.isbn || "";
    editBookName.value = book.title || "";
    editBookAuthor.value = book.author || "";
    editBookCover.value = book.cover || "";

    editBookMessage.textContent = "";

    editBookModal.classList.add("active");
    editBookModal.setAttribute("aria-hidden", "false");
}

// Close Edit Book Modal
function closeEditBookModal() {
    editBookModal.classList.remove("active");
    editBookModal.setAttribute("aria-hidden", "true");

    editBookForm.reset();
    editBookMessage.textContent = "";

    selectedBookId = null;
    selectedBook = null;

    saveEditBookButton.disabled = false;
    saveEditBookButton.textContent = "Save Changes";
}

// Open Delete Book Modal
function openDeleteBookModal(id, book) {
    selectedDeleteBookId = id;

    deleteBookDescription.textContent =
        `Are you sure you want to delete "${book.title}"?`;

    deleteBookMessage.textContent = "";

    confirmDeleteBookButton.disabled = false;
    confirmDeleteBookButton.textContent = "Delete Book";

    deleteBookModal.classList.add("active");
    deleteBookModal.setAttribute("aria-hidden", "false");
}

// Close Delete Book Modal
function closeDeleteBookModal() {
    deleteBookModal.classList.remove("active");
    deleteBookModal.setAttribute("aria-hidden", "true");

    selectedDeleteBookId = null;

    confirmDeleteBookButton.disabled = false;
    confirmDeleteBookButton.textContent = "Delete Book";
}

// Modal close buttons
closeEditBookModalButton.addEventListener("click", closeEditBookModal);
cancelEditBookButton.addEventListener("click", closeEditBookModal);

closeDeleteBookModalButton.addEventListener("click", closeDeleteBookModal);
cancelDeleteBookButton.addEventListener("click", closeDeleteBookModal);

// Close modal when clicking outside
editBookModal.addEventListener("click", (event) => {
    if (event.target === editBookModal) {
        closeEditBookModal();
    }
});

deleteBookModal.addEventListener("click", (event) => {
    if (event.target === deleteBookModal) {
        closeDeleteBookModal();
    }
});

// Close modals using Escape
document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
        closeEditBookModal();
        closeDeleteBookModal();
    }
});

// Save updated book
editBookForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!selectedBookId) return;

    const updatedBook = {
        isbn: editBookISBN.value.trim(),
        title: editBookName.value.trim(),
        author: editBookAuthor.value.trim(),
        cover: editBookCover.value.trim()
    };

    if (Object.values(updatedBook).some((value) => !value)) {
        editBookMessage.textContent = "Please fill in all fields.";
        editBookMessage.className = "modal-feedback error";
        return;
    }

    saveEditBookButton.disabled = true;
    saveEditBookButton.textContent = "Saving...";

    try {
        const response = await fetch(
            `/admin/api/books/${encodeURIComponent(selectedBookId)}`,
            {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                credentials: "same-origin",
                body: JSON.stringify(updatedBook)
            }
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || "Unable to update book.");
        }

        closeEditBookModal();
        showMessage("Book updated successfully!");
        notifyBookChanges();
        await loadDashboard();

    } catch (error) {
        editBookMessage.textContent = error.message;
        editBookMessage.className = "modal-feedback error";

        saveEditBookButton.disabled = false;
        saveEditBookButton.textContent = "Save Changes";
    }
});

// Confirm and delete book
confirmDeleteBookButton.addEventListener("click", async () => {
    if (!selectedDeleteBookId) return;

    confirmDeleteBookButton.disabled = true;
    confirmDeleteBookButton.textContent = "Deleting...";

    try {
        const response = await fetch(
            `/admin/api/books/${encodeURIComponent(selectedDeleteBookId)}`,
            {
                method: "DELETE",
                credentials: "same-origin"
            }
        );

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.error || "Unable to delete book.");
        }

        closeDeleteBookModal();
        showMessage("Book deleted successfully!");
        notifyBookChanges();
        await loadDashboard();

    } catch (error) {
        deleteBookMessage.textContent = error.message;
        deleteBookMessage.className = "modal-feedback error";

        confirmDeleteBookButton.disabled = false;
        confirmDeleteBookButton.textContent = "Delete Book";
    }
});

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
            cache: "no-store"
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
            openEditBookModal(id, book);
        }

        if (action === "delete") {
            openDeleteBookModal(id, book);
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
