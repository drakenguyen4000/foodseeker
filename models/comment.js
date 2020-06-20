var mongoose = require("mongoose");

var commentSchema = mongoose.Schema({
  text: String,
  //Associate to User
  createdAt: { type: Date, default: Date.now },
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
    website: String,
    location: String,
  },
});

module.exports = mongoose.model("Comment", commentSchema);
