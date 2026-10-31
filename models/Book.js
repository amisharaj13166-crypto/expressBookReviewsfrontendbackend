const mongoose = require("mongoose");

const bookSchema = new mongoose.Schema(
    {
        bookId: {
            type: Number,
            required: true,
            unique: true
        },
        isbn: {
            type: String,
            required: true
        },
        title: {
            type: String,
            required: true,
            trim: true
        },
        author: {
            type: String,
            required: true,
            trim: true
        },
        cover: {
            type: String,
            required: true
        },
        reviews: {
            type: mongoose.Schema.Types.Mixed,
            default: {}
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Book", bookSchema);