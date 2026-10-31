const express = require('express');
const jwt = require('jsonwebtoken');
const Book = require("../models/Book");
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const regd_users = express.Router();
const axios = require("axios")

// let users = [{ username: "alaa", password: "blue" }];



//only registered users can login
regd_users.post("/login", async (req, res) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        message: "Username and password are required"
      });
    }

    const user = await User.findOne({
      username: username.trim()
    });

    if (!user) {
      return res.status(401).json({
        message: "Username or password is incorrect"
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Username or password is incorrect"
      });
    }

    const token = jwt.sign(
      { username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    req.session.authorization = {
      token,
      username: user.username
    };

    return res.status(200).json({
      message: "User logged in successfully",
      token
    });

  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({
      message: "Unable to login"
    });
  }
});



// TASK update book
regd_users.put("/auth/review/:isbn", async (req, res) => {
  try {
    const bookId = Number(req.params.isbn);
    const review = req.body.review;
    const username = req.session.authorization.username;

    if (!review || !review.trim()) {
      return res.status(400).json({
        message: "Review cannot be empty"
      });
    }

    const book = await Book.findOne({ bookId });

    if (!book) {
      return res.status(404).json({
        message: "No book found with ID " + bookId
      });
    }

    const isExistingReview = Boolean(book.reviews?.[username]);

    book.reviews = book.reviews || {};
    book.reviews[username] = [review.trim()];
    book.markModified("reviews");
    await book.save();

    return res.status(200).json({
      message: isExistingReview
        ? "Review modified successfully"
        : "Review added successfully"
    });

  } catch (error) {
    console.error("Review update error:", error);
    return res.status(500).json({
      message: "Unable to save review"
    });
  }
});




// delete book review
regd_users.delete("/auth/review/:isbn", async (req, res) => {
  try {
    const bookId = Number(req.params.isbn);
    const username = req.session.authorization.username;

    const book = await Book.findOne({ bookId });

    if (!book) {
      return res.status(404).json({
        message: "No book found with ID " + bookId
      });
    }

    if (!book.reviews || !book.reviews[username]) {
      return res.status(404).json({
        message: "No review found for this book"
      });
    }

    delete book.reviews[username];

    book.markModified("reviews");
    await book.save();

    return res.status(200).json({
      message: "Review deleted successfully"
    });

  } catch (error) {
    console.error("Review deletion error:", error);
    return res.status(500).json({
      message: "Unable to delete review"
    });
  }
});







module.exports.authenticated = regd_users;