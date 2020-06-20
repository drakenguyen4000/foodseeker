var express = require("express"),
  app = express(),
  bodyParser = require("body-parser"),
  mongoose = require("mongoose"),
  passport = require("passport"),
  LocalStrategy = require("passport-local"),
  methodOverride = require("method-override"),
  User = require("./models/user"),
  flash = require("connect-flash")

//Require Routes
var foodRoute = require("./routes/food");
var commentRoute = require("./routes/comments");
var indexRoute = require("./routes/index");

//====Use====
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
mongoose.connect("mongodb://localhost/food_seeker", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
app.set("view engine", "ejs");
app.use(methodOverride("_method"));
app.use(
  require("express-session")({
    secret: "Rusty is the best and cutest dog",
    resave: false,
    saveUninitialized: false,
  })
);

app.use(flash());
app.locals.moment = require("moment");
app.use(passport.initialize());
app.use(passport.session());
//authentication method checks when user logins in against the database’s pw record
passport.use(new LocalStrategy(User.authenticate()));
//These two methods is responsible for reading the session, taking the data to encode or decode it.
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

//our own middleware that will pass req.user to all ejs templates
app.use(function (req, res, next) {
  res.locals.currentUser = req.user;
  res.locals.error = req.flash("error");
  res.locals.success = req.flash("success");
  next();
});

//Use Routes
app.use(foodRoute);
app.use(commentRoute);
app.use(indexRoute);

app.listen(process.env.PORT || 3000, function () {
  console.log("FoodSeeker Works!");
});
