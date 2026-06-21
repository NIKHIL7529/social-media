const mongoose = require("mongoose");

const postSchema = new mongoose.Schema(
  {
    topic: {
      type: String,
      trim: true,
      maxlength: 120,
    },
    text: {
      type: String,
      trim: true,
      maxlength: 5000,
    },
    photo: {
      type: String,
      required: true,
    },
    likes: {
      type: Number,
      default: 0,
      min: 0,
    },
    saved: {
      type: Number,
      default: 0,
      min: 0,
    },
    share: {
      type: Number,
      default: 0,
      min: 0,
    },
    commentable: {
      type: Boolean,
      default: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

postSchema.index({ createdAt: -1, _id: -1 });
postSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model("Post", postSchema);
