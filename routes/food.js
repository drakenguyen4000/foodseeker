require("dotenv").config();

var express = require("express"),
  Food = require("../models/food"),
  Comment = require("../models/comment"),
  router = express.Router(),
  middleware = require("../middleware"),
  NodeGeocoder = require("node-geocoder");

var options = {
  provider: "google",
  httpAdapter: "https",
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null,
};

var geocoder = NodeGeocoder(options);

function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

//main food page
router.get("/food", (req, res) => {
  var noMatch = null;
  if (req.query.search) {
    const regex = new RegExp(escapeRegex(req.query.search), "gi");
    Food.find({ dish: regex }, function (err, allFood) {
      if (err) {
        console.log(err);
      } else {
        if (allFood.length < 1) {
          noMatch = "No dish match that search! Please search again!";
        }
        res.render("food/index", { food: allFood, noMatch: noMatch });
      }
    });
  } else {
    Food.find({}, function (err, allFood) {
      if (err) {
        console.log(err);
      } else {
        res.render("food/index", { food: allFood, noMatch: noMatch });
      }
    });
  }
});

//Create Route
router.post("/food", middleware.isLoggedIn, (req, res) => {
  var dish = req.body.dish;
  var image = req.body.image;
  var review = req.body.review;
  var price = req.body.price;
  var website = req.body.website;
  var restaurant = req.body.restaurant;
  var author = {
    id: req.user._id,
    username: req.user.username,
    photo: req.user.photo, 
    location: req.user.location
  };

  geocoder.geocode(req.body.location, function (err, data) {
    if (err || !data.length) {
      req.flash("error", "Address not found!");
      return res.redirect("back");
    }
    var lat = data[0].latitude;
    var lng = data[0].longitude;
    var location = data[0].formattedAddress;

    var newFood = {
      dish: dish,
      image: image,
      review: review,
      price: price,
      restaurant: restaurant,
      website: website,
      author: author,
      location: location,
      lat: lat,
      lng: lng,
    };

    Food.create(newFood, function (err, addDish) {
      // Food.create(req.body.food, function (err, addDish) {
      if (err) {
        req.flash("error", "Oops, something went wrong!");
      } else {
        req.flash("success", "You've added a new dish!");
        res.redirect("/food");
      }
    });
  });
});

//new route
router.get("/food/new", middleware.isLoggedIn, (req, res) => {
  res.render("food/new");
});

//Show route
router.get("/food/:id", (req, res) => {
  Food.findById(req.params.id)
    .populate("comments")
    .exec(function (err, showFood) {
      if (err || !showFood) {
        console.log(err);
      } else {
        res.render("food/show", { food: showFood });
      }
    });
});

//Edit Route
router.get(
  "/food/:id/edit",
  middleware.checkFoodPostOwnership,
  middleware.isLoggedIn,
  (req, res) => {
    Food.findById(req.params.id, function (err, editFood) {
      if (err) {
        res.redirect("/food");
      } else {
        res.render("food/edit", { food: editFood });
      }
    });
  }
);

//Update Route
router.put("/food/:id", (req, res) => {
  geocoder.geocode(req.body.location, function (err, data) {
    if (err || !data.length) {
      req.flash("error", "Address not found!");
      return res.redirect("back");
    }

    req.body.food.lat = data[0].latitude;
    req.body.food.lng = data[0].longitude;
    req.body.food.location = data[0].formattedAddress;

    Food.findByIdAndUpdate(req.params.id, req.body.food, function (
      err,
      updateFood
    ) {
      if (err) {
        req.flash("error", "Oops, something went wrong!");
        res.redirect("/food");
      } else {
        req.flash("success", "You've successfully updated!");
        res.redirect("/food/" + req.params.id);
      }
    });
  });
});

//Delete Route
router.delete(
  "/food/:id",
  middleware.checkFoodPostOwnership,
  middleware.isLoggedIn,
  (req, res) => {
    Food.findByIdAndRemove(req.params.id, (err, deleteFood) => {
      if (err) {
        res.redirect("/food");
      }
      Comment.deleteMany({ _id: { $in: deleteFood.comments } }, (err) => {
        if (err) {
          console.log(err);
        }
        req.flash("success", "Dish deleted!");
        res.redirect("/food");
      });
    });
  }
);

module.exports = router;
