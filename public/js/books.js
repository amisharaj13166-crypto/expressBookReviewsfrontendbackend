document.addEventListener("DOMContentLoaded", () => {
    const featuredContainer = document.getElementById("featuredBooks");
    const booksContainer = document.getElementById("booksGrid");
    const countElement = document.getElementById("bookCount");
    const noBooksMessage = document.getElementById("noBooksMessage");

    let searchInitialized = false;

    async function loadBooks() {
        try {
            const response = await fetch("/books", {
    cache: "no-store"
});

            if (!response.ok) {
                throw new Error("Unable to load books.");
            }

            allBooks = await response.json();

            if (featuredContainer) {
                displayFeaturedBooks();
            }

           if (booksContainer) {
    const searchInput = document.getElementById("bookSearchInput");

    if (!searchInitialized) {
        const params = new URLSearchParams(window.location.search);
        const initialSearch = params.get("search") || "";

        if (searchInput) {
            searchInput.value = initialSearch;
        }

        searchInitialized = true;
    }

    displayBooks(searchInput ? searchInput.value : "");
}
        } catch (error) {
            console.error(error);

            if (featuredContainer) {
                featuredContainer.textContent = "Unable to load books. Please try again.";
            }

            if (booksContainer) {
                booksContainer.textContent = "Unable to load books. Please refresh the page.";
            }
        }
    }
    function refreshBookPages() {
    const searchInput = document.getElementById("bookSearchInput");
    const currentSearch = searchInput ? searchInput.value : "";

    if (featuredContainer) {
        displayFeaturedBooks();
    }

    if (booksContainer) {
        displayBooks(currentSearch);
    }
}

    
function createBookCard(isbn, book) {
    const card = document.createElement("article");
    card.className = "book-card";

    const cover = document.createElement("div");
    cover.className = "book-cover";

    const image = document.createElement("img");
    image.src = book.cover;
    image.alt = `Cover of ${book.title}`;
    image.loading = "lazy";

    image.onerror = () => {
        cover.textContent = book.title;
        cover.classList.add("cover-fallback");
    };

    cover.appendChild(image);

    const info = document.createElement("div");
    info.className = "book-info";

    const title = document.createElement("h3");
    title.textContent = book.title;

    const author = document.createElement("p");
    author.textContent = `By ${book.author}`;

    const link = document.createElement("a");
    link.className = "primary-button";
    link.href = `book-details.html?isbn=${encodeURIComponent(isbn)}`;
    link.textContent = "View Details";

    info.append(title, author, link);
    card.append(cover, info);

    return card;
}


    function displayFeaturedBooks() {
        featuredContainer.replaceChildren();

        Object.entries(allBooks).slice(0, 4).forEach(([isbn, book]) => {
            featuredContainer.appendChild(createBookCard(isbn, book));
        });
    }

    function displayBooks(searchTerm = "") {
        booksContainer.replaceChildren();

        const term = searchTerm.trim().toLowerCase();

        const filteredBooks = Object.entries(allBooks).filter(([, book]) => {
            return (
                book.title.toLowerCase().includes(term) ||
                book.author.toLowerCase().includes(term)
            );
        });

        if (countElement) {
            countElement.textContent =
                `${filteredBooks.length} book${filteredBooks.length === 1 ? "" : "s"} found`;
        }

        if (noBooksMessage) {
            noBooksMessage.hidden = filteredBooks.length !== 0;
        }

        filteredBooks.forEach(([isbn, book]) => {
            booksContainer.appendChild(createBookCard(isbn, book));
        });
    }

    const searchForm = document.getElementById("bookSearchForm");
    const searchInput = document.getElementById("bookSearchInput");

    if (searchForm && searchInput) {
        searchForm.addEventListener("submit", (event) => {
            event.preventDefault();
            displayBooks(searchInput.value);
        });

        searchInput.addEventListener("input", () => {
            displayBooks(searchInput.value);
        });
    }

    const homeSearchForm = document.getElementById("homeSearchForm");
    const homeSearchInput = document.getElementById("homeSearch");

    if (homeSearchForm && homeSearchInput) {
        homeSearchForm.addEventListener("submit", (event) => {
            event.preventDefault();

            const search = encodeURIComponent(homeSearchInput.value.trim());
            window.location.href = `books.html?search=${search}`;
        });
    }
    // Listen for book changes from the administrator dashboard
// Listen for book changes from the administrator dashboard
if ("BroadcastChannel" in window) {
    const bookChannel = new BroadcastChannel("book-collection");

    bookChannel.addEventListener("message", (event) => {
        if (event.data === "books-updated") {
            loadBooks();
        }
    });
}

loadBooks();
});