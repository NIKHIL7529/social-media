const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    topic: {
      type: String,
    },
    text: {
      type: String,
    },
    photo: {
      type: String,
      required: true,
    },
    likes: {
      type: Number,
    },
    saved: {
      type: Number,
    },
    share: {
      type: Number,
    },
    commentable: {
      type: Boolean,
      default: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Post", postSchema);
