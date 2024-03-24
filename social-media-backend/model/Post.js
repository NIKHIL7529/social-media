const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    topic: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    photo: {
      type: String,
      required: true,
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
      required: true,
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
