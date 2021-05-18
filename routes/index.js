
const middlewareObj = require("../middleware");

var express = require("express"),
  router = express.Router(),
  User = require("../models/user"),
  Food = require("../models/food"),
  passport = require("passport"),
  middleware = require("../middleware")

router.get("/", function (req, res) {
  res.render("food/landing");
});


//=====================
//Authentication Routes
//=====================

//Register form page
router.get("/register", (req, res) => {
  res.render("register");
});

//Register
router.post("/register", (req, res) => {
  //Create new User Model
  var newUser = new User({
    username: req.body.username,
    photo: req.body.photo,
    firstname: req.body.firstname,
    lastname: req.body.lastname,
    location: req.body.location,
  });

  //isAdmin - Determines if use entered the correct admin code to give them admin status
  if(req.body.admincode === 'foodfanatic2099') {
    newUser.isAdmin = true;
  }

  User.register(newUser, req.body.password, (err, user) => {
    if (err) {
      req.flash("error", err.message);
      return res.redirect("register");
    } else {
      passport.authenticate("local")(req, res, function () {
        req.flash("success", "Welcome to FoodSeeker, " + user.username + "!");
        res.redirect("/food");
      });
    }
  });
});

//Login Form
router.get("/login", (req, res) => {
  res.render("login");
});

//handling login logic route
//passport middleware checks authenication of user password
router.post(
  "/login",
  passport.authenticate("local", {
    successRedirect: "/food",
    failureRedirect: "/login",
  }),
  (req, res) => {}
);

//logout route
router.get("/logout", (req, res) => {
  req.logout();
  req.flash("success", "You've logged out!");
  res.redirect("/food");
});

//User profile
router.get("/users/:id", (req, res) => {
  User.findById(req.params.id, (err, foundUser) => {
    if (err) {
      req.flash("error", "Something went wrong");
      res.redirect("/");
    } else {
      Food.find()
        .where("author.id")
        .equals(foundUser._id)
        .exec(function (err, food) {
          if (err) {
            req.flash("error", "Something went wrong!");
            res.redirect("/");
          } else {
            res.render("users/profile", { user: foundUser, food: food });
          }
        });
    }
  });
});

//Edit User Profile
router.get("/users/:id/edit", middleware.checkProfileOwnership, (req, res) => {
  User.findById(req.params.id, (err, findUser) => {
    if(err){
      res.redirect("back");
    } else {
      res.render("users/edit", {user: findUser});
    }
  });
});

//Update User Profile
router.put("/users/:id", (req, res) => {
  User.findByIdAndUpdate(req.params.id, req.body.user, (err, updateUser) => {
    if(err){
      res.redirect("back");
    } else {
      res.redirect("/users/" + req.params.id);
    }
  });
});

module.exports = router;
