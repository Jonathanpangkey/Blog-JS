const express = require("express");
const expressLayouts = require("express-ejs-layouts");
const mongoose = require("mongoose");
const passport = require("passport");
const flash = require("connect-flash");
const session = require("express-session");
const User = require("./models/User");
const Post = require("./models/Post");
require("dotenv").config();

// initilize app
const app = express();

// passport config
require("./config/passport")(passport);

// Express session
app.use(
  session({
    secret: "secret",
    resave: true,
    saveUninitialized: true,
  })
);

// template middleware
app.use(expressLayouts);
app.set("view engine", "ejs");

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash
app.use(flash());

async function connectToDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error(err);
  }
}

connectToDB();

// static/public file
app.use(express.static("public"));

// Express body parser
app.use(express.urlencoded({ extended: true }));

// global var
app.use(function (req, res, next) {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  user = req.user;
  next();
});

app.get("/", (req, res) => res.render("welcome"));

app.get("/dashboard", async (req, res) => {
  const posts = await Post.find().sort({ createAt: "desc" });
  res.render("dashboard", {
    posts: posts,
  });
});

app.use("/users", require("./routes/users"));
app.use("/posts", require("./routes/posts"));

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`server running on ${PORT}`));
