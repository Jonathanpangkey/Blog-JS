const express = require("express");
const router = express.Router();
const Post = require("../models/Post");
const Comment = require("../models/Comment");
const { ensureAuthenticated } = require("../config/auth");

// Render form to create new post
router.get("/new", ensureAuthenticated, (req, res) =>
  res.render("new", {
    post: new Post(),
  })
);

// Handle form submission to create new post
router.post("/new", async (req, res) => {
  const { title, body } = req.body;
  let errors = [];

  // Validate form data
  if (!title || !body) {
    errors.push({ msg: "Please enter all fields" });
  }
  if (errors.length > 0) {
    res.render("new", {
      errors: errors,
    });
  } else {
    // If form data is valid, create a new post and save it to the database
    const newPost = new Post({
      email: req.user.email,
      title,
      body,
    });
    await newPost.save();
    req.flash("success_msg", "Posted!");
    res.redirect("/dashboard");
  }
});

// Render a single post
router.get("/:id", async (req, res) => {
  const post = await Post.findById(req.params.id).populate("comments");
  res.render("read", {
    post: post,
    user: (req.user && req.user.email) ?? "", //render user's email (if authenticated or login)
  });
});

// handle form submission for comment
router.post("/:id/comments", async (req, res) => {
  const { body } = req.body;
  const post = await Post.findById(req.params.id);
  // create newComment and save in database
  const newComment = new Comment({
    post: post._id,
    user: req.user.name,
    email: req.user.email,
    body,
  });
  await newComment.save();
  // push comment in post.comments array
  post.comments.push(newComment);
  await post.save();
  res.redirect(`/posts/${req.params.id}`);
});

// Render form to edit an existing post
router.get("/edit/:id", ensureAuthenticated, async (req, res) => {
  const post = await Post.findById(req.params.id);
  // Render the 'edit' template with the post to be edited
  res.render("edit", { post: post });
});

// Handle form submission to update an existing post
router.post("/edit/:id", async (req, res) => {
  const { title, body } = req.body;
  let post = {};
  post.title = title;
  post.body = body;

  try {
    // Update the post with the new data
    const result = await Post.updateOne({ _id: req.params.id }, post);
    if (result.nModified === 0) {
      throw new Error("Post not found or not modified.");
    }
    req.flash("success_msg", "Updated");
    res.redirect(`/posts/${req.params.id}`);
  } catch (err) {
    console.log(err);
  }
});

// delete the comment
router.get("/:id/comments/:commentId", async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    const comment = await Comment.findById(req.params.commentId);
    // Check if the user is the author of the comment
    if (comment.user !== req.user.name) {
      throw new Error("Unauthorized");
    }
    // Remove the comment from the post comments array
    post.comments.pull(comment._id);
    await post.save();
    // Remove the comment from the database
    await Comment.findByIdAndDelete(comment._id);
    res.redirect(`/posts/${req.params.id}`);
  } catch (err) {
    console.log(err);
  }
});

// Handle deleting a post
router.get("/delete/:id", ensureAuthenticated, async (req, res) => {
  // Find and delete a post by its ID
  await Post.findByIdAndDelete(req.params.id);
  req.flash("success_msg", "post removed");
  res.redirect("/dashboard");
});

module.exports = router;
