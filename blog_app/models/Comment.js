const mongoose = require('mongoose')

const commentSchema = new mongoose.Schema({
    commenter: String,
    text: String,
    blogPost: {
        type: Date,
        default: Date.now
    },
});

module.exports = mongoose.model('Comment', commentSchema)