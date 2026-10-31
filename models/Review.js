const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
    {
        bookId: {
            type: Number,
            required: true
        },
        username: {
            type: String,
            required: true
        },
        review: {
            type: String,
            required: true,
            trim: true
        }
    },
    {
        timestamps: true
    }
);

// One review per customer per book
reviewSchema.index(
    { bookId: 1, username: 1 },
    { unique: true }
);

module.exports = mongoose.model("Review", reviewSchema);