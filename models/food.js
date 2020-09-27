var mongoose = require("mongoose");

var foodSchema = new mongoose.Schema({
  dish: String,
  image: String,
  review: String,
  price: Number,
  restaurant: String,
  website: String,
  location: String,
  lat: Number,
  lng: Number,
  createdAt: { type: Date, default: Date.now },
  //associate to user
  author: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    isAdmin: {type: Boolean, default: false},
    username: String,
    photo: String,
    firstname: String, 
    lastname: String, 
    location: String
  },
  //associate food to comments
  //Set as comment is set array so we can push our created comment from comment model into the food model 
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
    },
  ],
});

module.exports = mongoose.model("Food", foodSchema);
