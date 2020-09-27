var express = require("express"),
  router = express.Router(),
  Food = require("../models/food"),
  Comment = require("../models/comment"),
  middleware = require("../middleware")

router.get("/food/:id/comments/new", middleware.isLoggedIn, (req, res) => {
  Food.findById(req.params.id, function (err, food) {
    if (err) {
      console.log(err);
    } else {
      res.render("comments/new", { food: food });
    }
  });
});

//comment create route
router.post("/food/:id/comments", middleware.isLoggedIn, (req, res) => {
  Food.findById(req.params.id, function (err, food) {
    if (err) {
      console.log(err);
      res.redirect("/food");
    } else {
      Comment.create(req.body.comment, function (err, comment) {
        if (err) {
          req.flash("error", "Oops, something went wrong!");
          console.log(err);
        } else {
          //create req.body.comments makes an empty comment object
          //Here were create properties and assigning them to comment object directly
          comment.author.id = req.user._id;
          comment.author.username = req.user.username;
          comment.author.photo = req.user.photo;
          comment.author.location = req.user.location;
          //Save to comment model.  
          comment.save();
          //push comment into model into food model with comment array (associated property)
          food.comments.push(comment);
          //save this push
          food.save();
          req.flash("success", "Your comment has been added!");
          res.redirect(`/food/` + food._id);
        }
      });
    }
  });
});

//Comment Edit
router.get("/food/:id/comments/:comment_id/edit", middleware.checkCommentOwnership, middleware.isLoggedIn, function (req, res) {
  Food.findById(req.params.id, function(err, showFood){
    if(err || !showFood) {
      return res.redirect("back");
    } 
    Comment.findById(req.params.comment_id, function (err, showComment) {
      if (err) {
        res.redirect("back");
      } else {
        res.render("comments/edit", { food_id: req.params.id, comment: showComment });
      }
    });
  });
});

//Comment Update
router.put("/food/:id/comments/:comment_id", middleware.checkCommentOwnership, middleware.isLoggedIn, function(req, res){
  Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updateComment){
    if(err){
      req.flash("error", "Oops, something went wrong!");
      res.redirect("back");
    } else {
      req.flash("success", "You're comment has been updated!");
      res.redirect("/food/" + req.params.id);
    }
  });
});

//Comment Destroy
router.delete("/food/:id/comments/:comment_id", middleware.checkCommentOwnership, function(req, res){
  Comment.findByIdAndRemove(req.params.comment_id, function(err, deleteFood){
    if(err){
      res.redirect("back");
    } else {
      req.flash("success", "Comment deleted!");
      res.redirect("/food/" + req.params.id);
    }
  });
});

module.exports = router;
