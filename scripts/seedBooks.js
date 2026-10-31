require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("../config/db");
const Book = require("../models/Book");
const { books } = require("../router/booksdb");

async function seedBooks() {
    try {
        await connectDB();

        for (const [id, book] of Object.entries(books)) {
            await Book.updateOne(
                { bookId: Number(id) },
                {
                    $setOnInsert: {
                        bookId: Number(id),
                        ...book
                    }
                },
                { upsert: true }
            );
        }

        console.log("Books seeded successfully!");
        console.log(`Processed ${Object.keys(books).length} books.`);
    } catch (error) {
        console.error("Seeding failed:", error.message);
    } finally {
        await mongoose.disconnect();
    }
}

seedBooks();