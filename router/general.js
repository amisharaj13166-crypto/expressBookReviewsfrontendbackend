const express = require("express");
const Book = require("../models/Book");
const User = require("../models/User");
const bcrypt = require("bcryptjs");

const public_users = express.Router();

public_users.use(express.json());


// ========================================
// 1. USER REGISTRATION
// ========================================

public_users.post("/register", async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                message: "Username and password are required"
            });
        }

        const cleanUsername = username.trim();

        if (cleanUsername.length < 3) {
            return res.status(400).json({
                message: "Username must contain at least 3 characters"
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                message: "Password must contain at least 6 characters"
            });
        }

        const existingUser = await User.findOne({
            username: cleanUsername
        });

        if (existingUser) {
            return res.status(409).json({
                message: "Username already exists"
            });
        }

        const hashedPassword = await bcrypt.hash(password, 12);

        await User.create({
            username: cleanUsername,
            password: hashedPassword
        });

        return res.status(201).json({
            message: "User registered successfully"
        });

    } catch (error) {
        if (error.code === 11000) {
            return res.status(409).json({
                message: "Username already exists"
            });
        }

        console.error("Registration error:", error);

        return res.status(500).json({
            message: "Unable to register user"
        });
    }
});


// ========================================
// 2. GET ALL BOOKS
// ========================================

public_users.get("/", async (req, res) => {
    try {
        const allBooks = await Book.find().sort({ bookId: 1 });

        if (allBooks.length === 0) {
            return res.status(404).json({
                message: "No books found"
            });
        }

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
            message: "Unable to fetch books"
        });
    }
});


// ========================================
// 3. GET BOOK DETAILS BY BOOK ID
// ========================================

public_users.get("/isbn/:isbn", async (req, res) => {
    try {
        const bookId = Number(req.params.isbn);

        const book = await Book.findOne({ bookId });

        if (!book) {
            return res.status(404).send(
                "No book found with ID " + req.params.isbn
            );
        }

        return res.status(200).json({
            isbn: book.isbn,
            title: book.title,
            author: book.author,
            cover: book.cover,
            reviews: book.reviews || {}
        });

    } catch (error) {
        console.error("Error fetching book:", error);

        return res.status(500).send("Internal Server Error");
    }
});


// ========================================
// 4. GET BOOKS BY AUTHOR
// ========================================

public_users.get("/author/:author", async (req, res) => {
    try {
        const author = req.params.author;

        const booksByAuthor = await Book.find({
            author: {
                $regex: `^${author.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
                $options: "i"
            }
        }).sort({ bookId: 1 });

        if (booksByAuthor.length === 0) {
            return res.status(404).send(
                "No book found with author " + author
            );
        }

        const result = booksByAuthor.map((book) => ({
            isbn: book.isbn,
            title: book.title,
            author: book.author,
            cover: book.cover,
            reviews: book.reviews || {}
        }));

        return res.status(200).json(result);

    } catch (error) {
        console.error("Error searching by author:", error);

        return res.status(500).send("Internal Server Error");
    }
});


// ========================================
// 5. GET BOOKS BY TITLE
// ========================================

public_users.get("/title/:title", async (req, res) => {
    try {
        const title = req.params.title;

        const booksByTitle = await Book.find({
            title: {
                $regex: `^${title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`,
                $options: "i"
            }
        }).sort({ bookId: 1 });

        if (booksByTitle.length === 0) {
            return res.status(404).send(
                "No book found with title " + title
            );
        }

        const result = booksByTitle.map((book) => ({
            isbn: book.isbn,
            title: book.title,
            author: book.author,
            cover: book.cover,
            reviews: book.reviews || {}
        }));

        return res.status(200).json(result);

    } catch (error) {
        console.error("Error searching by title:", error);

        return res.status(500).send("Internal Server Error");
    }
});


// ========================================
// 6. GET BOOK REVIEWS
// ========================================

public_users.get("/review/:isbn", async (req, res) => {
    try {
        const bookId = Number(req.params.isbn);

        const book = await Book.findOne({ bookId });

        if (!book) {
            return res.status(404).json({
                message: "No book found with ID " + req.params.isbn
            });
        }

        return res.status(200).json(book.reviews || {});

    } catch (error) {
        console.error("Error fetching reviews:", error);

        return res.status(500).json({
            message: "Unable to fetch reviews"
        });
    }
});


module.exports.general = public_users;