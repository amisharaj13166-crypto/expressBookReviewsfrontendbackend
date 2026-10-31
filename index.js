require("dotenv").config();

const express = require("express");
const jwt = require("jsonwebtoken");
const session = require("express-session");
const rateLimit = require("express-rate-limit");
const path = require("path");
const connectDB = require("./config/db");
const Book = require("./models/Book");

const customer_routes = require("./router/auth_users.js").authenticated;
const genl_routes = require("./router/general.js").general;
const { regd_books, books } = require("./router/booksdb");

const app = express();
const PORT = 8080;

// Check required environment variables
if (
  !process.env.MONGODB_URI ||
  !process.env.JWT_SECRET ||
  !process.env.CUSTOMER_SESSION_SECRET ||
  !process.env.SESSION_SECRET ||
  !process.env.ADMIN_USERNAME ||
  !process.env.ADMIN_PASSWORD
) {
  throw new Error("Missing required environment variables. Check your .env file.");
}

app.use(express.json());
// Limit repeated customer login attempts
const customerLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    error: "Too many login attempts. Please try again after 15 minutes.",
  },
});

// Limit repeated administrator login attempts
const adminLoginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: "draft-8",
  legacyHeaders: false,
  message: {
    error: "Too many login attempts. Please try again after 15 minutes.",
  },
});
// Separate administrator session
const adminSession = session({
  name: "admin.sid",
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 1000,
  },
});

app.use(adminSession);

// Administrator authentication middleware
function requireAdmin(req, res, next) {
  if (!req.session || req.session.isAdmin !== true) {
    return res.status(401).json({
      error: "Administrator login required.",
    });
  }

  next();
}
// Protect all administrator book-management APIs
app.use("/admin/api", requireAdmin);

// Get all books from MongoDB
app.get("/admin/api/books", async (req, res) => {
  try {
    const allBooks = await Book.find().sort({ bookId: 1 });

    const booksObject = {};

    allBooks.forEach((book) => {
      booksObject[book.bookId] = {
        isbn: book.isbn,
        title: book.title,
        author: book.author,
        cover: book.cover,
        reviews: book.reviews || {},
      };
    });

    res.json(booksObject);
  } catch (error) {
    console.error("Error fetching books:", error);
    res.status(500).json({ error: "Unable to fetch books." });
  }
});

// Add a new book
// Add a new book to MongoDB
app.post("/admin/api/books", async (req, res) => {
  try {
    const { isbn, title, author, cover } = req.body;

    if (!isbn?.trim() || !title?.trim() || !author?.trim() || !cover?.trim()) {
      return res.status(400).json({
        error: "ISBN, title, author and cover image are required.",
      });
    }

    const cleanIsbn = isbn.trim();

    const duplicate = await Book.findOne({ isbn: cleanIsbn });

    if (duplicate) {
      return res.status(409).json({
        error: "A book with this ISBN already exists.",
      });
    }

    const lastBook = await Book.findOne().sort({ bookId: -1 });
    const newId = lastBook ? lastBook.bookId + 1 : 1;

    const newBook = await Book.create({
      bookId: newId,
      isbn: cleanIsbn,
      title: title.trim(),
      author: author.trim(),
      cover: cover.trim(),
      reviews: {},
    });

    res.status(201).json({
      message: "Book added successfully.",
      id: String(newId),
      book: {
        isbn: newBook.isbn,
        title: newBook.title,
        author: newBook.author,
        cover: newBook.cover,
        reviews: newBook.reviews,
      },
    });
  } catch (error) {
    console.error("Error adding book:", error);
    res.status(500).json({ error: "Unable to add book." });
  }
});

// Update an existing book
// Update an existing book in MongoDB
app.put("/admin/api/books/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { isbn, title, author, cover } = req.body;

    if (!Number.isInteger(id)) {
      return res.status(400).json({ error: "Invalid book ID." });
    }

    if (!isbn?.trim() || !title?.trim() || !author?.trim() || !cover?.trim()) {
      return res.status(400).json({
        error: "ISBN, title, author and cover image are required.",
      });
    }

    const book = await Book.findOne({ bookId: id });

    if (!book) {
      return res.status(404).json({ error: "Book not found." });
    }

    const cleanIsbn = isbn.trim();

    const duplicate = await Book.findOne({
      isbn: cleanIsbn,
      bookId: { $ne: id },
    });

    if (duplicate) {
      return res.status(409).json({
        error: "Another book with this ISBN already exists.",
      });
    }

    book.isbn = cleanIsbn;
    book.title = title.trim();
    book.author = author.trim();
    book.cover = cover.trim();

    await book.save();

    res.json({
      message: "Book updated successfully.",
      book: {
        isbn: book.isbn,
        title: book.title,
        author: book.author,
        cover: book.cover,
        reviews: book.reviews,
      },
    });
  } catch (error) {
    console.error("Error updating book:", error);
    res.status(500).json({ error: "Unable to update book." });
  }
});

// Delete a book
// Delete a book from MongoDB
app.delete("/admin/api/books/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id)) {
      return res.status(400).json({ error: "Invalid book ID." });
    }

    const deletedBook = await Book.findOneAndDelete({ bookId: id });

    if (!deletedBook) {
      return res.status(404).json({
        error: "Book not found.",
      });
    }

    res.json({
      message: "Book deleted successfully.",
    });
  } catch (error) {
    console.error("Error deleting book:", error);
    res.status(500).json({ error: "Unable to delete book." });
  }
});
// Administrator login
app.post("/admin/login", adminLoginLimiter, (req, res) => {
  const { username, password } = req.body;

  if (
    username !== process.env.ADMIN_USERNAME ||
    password !== process.env.ADMIN_PASSWORD
  ) {
    return res.status(401).json({
      error: "Invalid administrator credentials.",
    });
  }

  req.session.regenerate((err) => {
    if (err) {
      return res.status(500).json({
        error: "Unable to create administrator session.",
      });
    }

    req.session.isAdmin = true;

    req.session.save((saveError) => {
      if (saveError) {
        return res.status(500).json({
          error: "Unable to save administrator session.",
        });
      }

      res.json({
        message: "Administrator login successful.",
      });
    });
  });
});

// Check administrator session
app.get("/admin/session", requireAdmin, (req, res) => {
  res.json({ authenticated: true });
});

// Administrator logout
app.post("/admin/logout", requireAdmin, (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({
        error: "Unable to log out.",
      });
    }

    res.clearCookie("admin.sid", { path: "/" });

    res.json({
      message: "Administrator logged out successfully.",
    });
  });
});

// Protect the dashboard page
app.get("/admin.html", requireAdmin, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "admin.html"));
});

// Static frontend files
app.use(express.static(path.join(__dirname, "public")));

// Existing customer authentication — unchanged
app.use(
  "/customer",
 session({
  name: "customer.sid",
  secret: process.env.CUSTOMER_SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 1000,
  },
})
);

// Existing book routes
app.use("/books", regd_books);
// Check customer login status
app.get("/customer/session", (req, res) => {
  if (!req.session || !req.session.authorization) {
    return res.json({
      authenticated: false,
    });
  }

  jwt.verify(
    req.session.authorization.token,
    process.env.JWT_SECRET,
    (err, user) => {
      if (err) {
        return res.json({
          authenticated: false,
        });
      }

      return res.json({
        authenticated: true,
        username: user.username,
      });
    }
  );
});

// Customer logout
app.post("/customer/logout", (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({
        message: "Unable to logout.",
      });
    }

    res.clearCookie("customer.sid", {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    });

    return res.json({
      message: "Logged out successfully.",
    });
  });
});

// Existing customer JWT authentication
app.use("/customer/auth", (req, res, next) => {
  if (!req.session || !req.session.authorization) {
    return res.status(401).json({
      error: "Unauthorized. Please login first.",
    });
  }

  const token = req.session.authorization.token;

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(401).json({
        error: "Invalid or expired authentication token.",
      });
    }

    req.session.user = user;
    next();
  });
});

// Existing customer and public routes
app.use("/customer/login", customerLoginLimiter);
app.use("/customer", customer_routes);
app.use("/", genl_routes);

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(
      `Express Book Reviews server is running at http://localhost:${PORT}`,
    );
  });
});
