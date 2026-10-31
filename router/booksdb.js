
const express = require("express");
const Book = require("../models/Book");
const regd_books = express.Router();

// Book collection
// Each book has a unique ID, ISBN, title, author, cover image and reviews.

const books = {
    1: {
        isbn: "9780385474542",
        title: "Things Fall Apart",
        author: "Chinua Achebe",
        cover: "https://covers.openlibrary.org/b/isbn/9780385474542-L.jpg",
        reviews: {}
    },
    2: {
        isbn: "9780140449334",
        title: "Fairy Tales",
        author: "Hans Christian Andersen",
        cover: "https://covers.openlibrary.org/b/isbn/9780140449334-L.jpg",
        reviews: {}
    },
    3: {
        isbn: "9780140448955",
        title: "The Divine Comedy",
        author: "Dante Alighieri",
        cover: "https://covers.openlibrary.org/b/isbn/9780140448955-L.jpg",
        reviews: {}
    },
    4: {
        isbn: "9780140441000",
        title: "The Epic of Gilgamesh",
        author: "Unknown",
        cover: "https://covers.openlibrary.org/b/isbn/9780140441000-L.jpg",
        reviews: {}
    },
    5: {
        isbn: "9780140441034",
        title: "The Book of Job",
        author: "Unknown",
        cover: "https://covers.openlibrary.org/b/isbn/9780140441034-L.jpg",
        reviews: {}
    },
    6: {
        isbn: "9780140449389",
        title: "One Thousand and One Nights",
        author: "Unknown",
        cover: "https://covers.openlibrary.org/b/isbn/9780140449389-L.jpg",
        reviews: {}
    },
    7: {
        isbn: "9780140441034",
        title: "Njál's Saga",
        author: "Unknown",
        cover: "https://covers.openlibrary.org/b/isbn/9780140441034-L.jpg",
        reviews: {}
    },
    8: {
        isbn: "9780141439518",
        title: "Pride and Prejudice",
        author: "Jane Austen",
        cover: "https://covers.openlibrary.org/b/isbn/9780141439518-L.jpg",
        reviews: {}
    },
    9: {
        isbn: "9780140449723",
        title: "Le Père Goriot",
        author: "Honoré de Balzac",
        cover: "https://covers.openlibrary.org/b/isbn/9780140449723-L.jpg",
        reviews: {}
    },
    10: {
        isbn: "9780802144479",
        title: "Molloy",
        author: "Samuel Beckett",
        cover: "https://covers.openlibrary.org/b/isbn/9780802144479-L.jpg",
        reviews: {}
    },
    11: {
        isbn: "9780451524935",
        title: "1984",
        author: "George Orwell",
        cover: "https://covers.openlibrary.org/b/isbn/9780451524935-L.jpg",
        reviews: {}
    },
    12: {
        isbn: "9780061120084",
        title: "To Kill a Mockingbird",
        author: "Harper Lee",
        cover: "https://covers.openlibrary.org/b/isbn/9780061120084-L.jpg",
        reviews: {}
    },
    13: {
        isbn: "9780743273565",
        title: "The Great Gatsby",
        author: "F. Scott Fitzgerald",
        cover: "https://covers.openlibrary.org/b/isbn/9780743273565-L.jpg",
        reviews: {}
    },
    14: {
        isbn: "9780061122415",
        title: "The Alchemist",
        author: "Paulo Coelho",
        cover: "https://covers.openlibrary.org/b/isbn/9780061122415-L.jpg",
        reviews: {}
    },
    15: {
        isbn: "9780735211292",
        title: "Atomic Habits",
        author: "James Clear",
        cover: "https://covers.openlibrary.org/b/isbn/9780735211292-L.jpg",
        reviews: {}
    },
    16: {
        isbn: "9780590353427",
        title: "Harry Potter and the Sorcerer's Stone",
        author: "J. K. Rowling",
        cover: "https://covers.openlibrary.org/b/isbn/9780590353427-L.jpg",
        reviews: {}
    },
    17: {
        isbn: "9780547928227",
        title: "The Hobbit",
        author: "J. R. R. Tolkien",
        cover: "https://covers.openlibrary.org/b/isbn/9780547928227-L.jpg",
        reviews: {}
    },
    18: {
        isbn: "9780316769488",
        title: "The Catcher in the Rye",
        author: "J. D. Salinger",
        cover: "https://covers.openlibrary.org/b/isbn/9780316769488-L.jpg",
        reviews: {}
    },
    19: {
        isbn: "9780375842207",
        title: "The Book Thief",
        author: "Markus Zusak",
        cover: "https://covers.openlibrary.org/b/isbn/9780375842207-L.jpg",
        reviews: {}
    },
    20: {
        isbn: "9781594631931",
        title: "The Kite Runner",
        author: "Khaled Hosseini",
        cover: "https://covers.openlibrary.org/b/isbn/9781594631931-L.jpg",
        reviews: {}
    },
    21: {
        isbn: "9780062316097",
        title: "Sapiens",
        author: "Yuval Noah Harari",
        cover: "https://covers.openlibrary.org/b/isbn/9780062316097-L.jpg",
        reviews: {}
    },
    22: {
        isbn: "9781250301697",
        title: "The Silent Patient",
        author: "Alex Michaelides",
        cover: "https://covers.openlibrary.org/b/isbn/9781250301697-L.jpg",
        reviews: {}
    },
    23: {
        isbn: "9781455563937",
        title: "Pachinko",
        author: "Min Jin Lee",
        cover: "https://covers.openlibrary.org/b/isbn/9781455563937-L.jpg",
        reviews: {}
    },
    24: {
        isbn: "9780399590504",
        title: "Educated",
        author: "Tara Westover",
        cover: "https://covers.openlibrary.org/b/isbn/9780399590504-L.jpg",
        reviews: {}
    },
    25: {
        isbn: "9780525559474",
        title: "The Midnight Library",
        author: "Matt Haig",
        cover: "https://covers.openlibrary.org/b/isbn/9780525559474-L.jpg",
        reviews: {}
    }
};

// Get all books
// Get all books directly from MongoDB
regd_books.get("/", async (req, res) => {
    try {
        const allBooks = await Book.find().sort({ bookId: 1 });

        const booksObject = {};

        allBooks.forEach((book) => {
            booksObject[book.bookId] = {
                isbn: book.isbn,
                title: book.title,
                author: book.author,
                cover: book.cover,
                reviews: book.reviews || {}
            };
        });

        return res.status(200).json(booksObject);

    } catch (error) {
        console.error("Error fetching books:", error);

        return res.status(500).json({
            message: "Unable to fetch books from database."
        });
    }
});

module.exports = { books, regd_books };
