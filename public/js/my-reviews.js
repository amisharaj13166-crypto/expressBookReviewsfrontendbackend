document.addEventListener("DOMContentLoaded", async () => {
  const container = document.getElementById("myReviewsContainer");

  // Modal elements
  const modal = document.getElementById("editReviewModal");
  const editForm = document.getElementById("editReviewForm");
  const reviewTextarea = document.getElementById("updatedReviewText");
  const closeModalButton = document.getElementById("closeEditModal");
  const cancelModalButton = document.getElementById("cancelEditModal");
  const saveButton = document.getElementById("saveReviewButton");

  let activeReviewItem = null;
  let activeReviewElement = null;

  // Inline feedback inside the modal
  const modalMessage = document.createElement("p");
  modalMessage.className = "modal-feedback";
  modalMessage.setAttribute("aria-live", "polite");
  editForm.insertBefore(modalMessage, editForm.querySelector(".modal-actions"));

  function openEditModal(item, reviewElement) {
    activeReviewItem = item;
    activeReviewElement = reviewElement;

    reviewTextarea.value = Array.isArray(item.review)
      ? item.review.join(", ")
      : item.review;

    modalMessage.textContent = "";
    modal.classList.add("active");
    modal.setAttribute("aria-hidden", "false");
    reviewTextarea.focus();
  }

  function closeEditModal() {
    modal.classList.remove("active");
    modal.setAttribute("aria-hidden", "true");
    editForm.reset();
    modalMessage.textContent = "";

    activeReviewItem = null;
    activeReviewElement = null;

    saveButton.disabled = false;
    saveButton.textContent = "Save Changes";
  }

  closeModalButton.addEventListener("click", closeEditModal);
  cancelModalButton.addEventListener("click", closeEditModal);

  modal.addEventListener("click", (event) => {
    if (event.target === modal) {
      closeEditModal();
    }
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && modal.classList.contains("active")) {
      closeEditModal();
    }
  });

  // Delete modal elements
const deleteModal = document.getElementById("deleteReviewModal");
const deleteDescription = document.getElementById("deleteReviewDescription");
const confirmDeleteButton = document.getElementById("confirmDeleteButton");

const closeDeleteModalButton =
    document.getElementById("closeDeleteModal");

const cancelDeleteModalButton =
    document.getElementById("cancelDeleteModal");

let activeDeleteItem = null;
let activeDeleteButton = null;

function openDeleteModal(item, button) {
    activeDeleteItem = item;
    activeDeleteButton = button;

    deleteDescription.textContent =
        `Are you sure you want to delete your review for "${item.title}"?`;

    confirmDeleteButton.disabled = false;
    confirmDeleteButton.textContent = "Delete Review";

    deleteModal.classList.add("active");
    deleteModal.setAttribute("aria-hidden", "false");
}

function closeDeleteModal() {
    deleteModal.classList.remove("active");
    deleteModal.setAttribute("aria-hidden", "true");

    activeDeleteItem = null;
    activeDeleteButton = null;

    confirmDeleteButton.disabled = false;
    confirmDeleteButton.textContent = "Delete Review";
}

closeDeleteModalButton.addEventListener("click", closeDeleteModal);
cancelDeleteModalButton.addEventListener("click", closeDeleteModal);

deleteModal.addEventListener("click", (event) => {
    if (event.target === deleteModal) {
        closeDeleteModal();
    }
});

confirmDeleteButton.addEventListener("click", async () => {
    if (!activeDeleteItem || !activeDeleteButton) {
        return;
    }

    const item = activeDeleteItem;
    const button = activeDeleteButton;

    confirmDeleteButton.disabled = true;
    confirmDeleteButton.textContent = "Deleting...";

    try {
        const response = await fetch(
            `/customer/auth/review/${encodeURIComponent(item.isbn)}`,
            {
                method: "DELETE",
                credentials: "same-origin"
            }
        );

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));

            throw new Error(
                errorData.error ||
                errorData.message ||
                "Unable to delete review."
            );
        }

        const card = button.closest(".review-card");

        closeDeleteModal();

        if (card) {
            card.remove();
        }

        const notice = document.createElement("p");
        notice.className = "review-success-message";
        notice.textContent = "Review deleted successfully!";
        container.prepend(notice);

        if (!container.querySelector(".review-card")) {
            const emptyMessage = document.createElement("p");
            emptyMessage.textContent =
                "You haven't written any reviews yet.";

            const link = document.createElement("a");
            link.href = "books.html";
            link.className = "primary-button";
            link.textContent = "Explore Books";

            container.append(emptyMessage, link);
        }

    } catch (error) {
        confirmDeleteButton.disabled = false;
        confirmDeleteButton.textContent = "Delete Review";
        deleteDescription.textContent = error.message;
    }
});

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
      const response = await fetch(`/review/${encodeURIComponent(isbn)}`);

      if (!response.ok) {
        continue;
      }

      const reviews = await response.json();

      if (reviews && Object.prototype.hasOwnProperty.call(reviews, username)) {
        myReviews.push({
          isbn,
          title: book.title,
          review: reviews[username],
        });
      }
    }

    container.replaceChildren();

    if (myReviews.length === 0) {
      const emptyMessage = document.createElement("p");
      emptyMessage.textContent = "You haven't written any reviews yet.";

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
      link.href = `book-details.html?isbn=${encodeURIComponent(item.isbn)}`;
      link.className = "text-link";
      link.textContent = "View Book";

      // Update Review button
      const editButton = document.createElement("button");
      editButton.type = "button";
      editButton.className = "edit-review-button";
      editButton.textContent = "Update Review";

      editButton.addEventListener("click", () => {
        openEditModal(item, review);
      });

      // Delete Review button
      const deleteButton = document.createElement("button");
      deleteButton.type = "button";
      deleteButton.className = "delete-review-button";
      deleteButton.textContent = "Delete Review";

      deleteButton.addEventListener("click", () => {
        openDeleteModal(item, deleteButton);
      });

      card.append(title, review, link, editButton, deleteButton);
      container.appendChild(card);
    });
  } catch (error) {
    container.textContent = error.message;
  }

  // Save updated review
  editForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    if (!activeReviewItem) {
      return;
    }

    const updatedReview = reviewTextarea.value.trim();

    if (!updatedReview) {
      modalMessage.textContent = "Review cannot be empty.";
      modalMessage.className = "modal-feedback error";
      return;
    }

    saveButton.disabled = true;
    saveButton.textContent = "Saving...";
    modalMessage.textContent = "";

    try {
      const response = await fetch(
        `/customer/auth/review/${encodeURIComponent(activeReviewItem.isbn)}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "same-origin",
          body: JSON.stringify({
            review: updatedReview,
          }),
        },
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));

        throw new Error(
          errorData.error || errorData.message || "Unable to update review.",
        );
      }

      activeReviewItem.review = updatedReview;
      activeReviewElement.textContent = updatedReview;

      closeEditModal();

      const notice = document.createElement("p");
      notice.className = "review-success-message";
      notice.textContent = "Review updated successfully!";
      container.prepend(notice);
    } catch (error) {
      modalMessage.textContent = error.message;
      modalMessage.className = "modal-feedback error";

      saveButton.disabled = false;
      saveButton.textContent = "Save Changes";
    }
  });
});
