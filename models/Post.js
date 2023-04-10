const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  body: {
    type: String,
    required: true,
  },
  createAt: {
    type: Date,
    default: function () {
      return new Date();
    },
  },
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
    },
  ],
});

const Post = mongoose.model("Post", PostSchema);

module.exports = Post;
