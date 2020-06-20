var Food = require("../models/food"),
  Comment = require("../models/comment"),
  User = require("../models/user"),
  middlewareObj = {};

middlewareObj.checkProfileOwnership = function (req, res, next) {
  if (req.isAuthenticated()) {
    User.findById(req.params.id, function (err, findUser) {
      if (err) {
        res.redirect("back");
      } else {
        if (req.user._id.equals(findUser.id)) {
          next();
        } else {
          req.flash("error", "You do not have permission!");
          res.redirect("back");
        }
      }
    });
  } else {
    req.flash("error", "Please login!");
    res.redirect("back");
  }
};

middlewareObj.checkFoodPostOwnership = function (req, res, next) {
  if (req.isAuthenticated()) {
    Food.findById(req.params.id, function (err, showFood) {
      if (err || !showFood) {
        res.redirect("back");
      } else {
        if (showFood.author.id.equals(req.user._id) || req.user.isAdmin) {
          next();
        } else {
          req.flash("error", "You do not have permission!");
          res.redirect("back");
        }
      }
    });
  } else {
    req.flash("error", "Please login!");
    res.redirect("back");
  }
};

middlewareObj.isLoggedIn = function (req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  req.flash("error", "Please Login First!");
  res.redirect("/login");
};

middlewareObj.checkCommentOwnership = function (req, res, next) {
  if (req.isAuthenticated()) {
    Comment.findById(req.params.comment_id, function (err, showComment) {
      if (err || !showComment) {
        res.redirect("back");
      } else {
        if (showComment.author.id.equals(req.user._id) || req.user.isAdmin) {
          next();
        } else {
          req.flash("error", "You do not have permission!");
          res.redirect("back");
        }
      }
    });
  } else {
    req.flash("error", "Please login!");
    res.redirect("back");
  }
};

module.exports = middlewareObj;
