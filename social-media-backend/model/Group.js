const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema(
  {
    creator: {
      type: String,
      required: true,
      trim: true,
      maxlength: 20,
    },
    photo:{
      type: String,
    },
    users: {
      type: [String],
      required: true,
      default: [],
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      required: true,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

groupSchema.index({ users: 1, updatedAt: -1 });

module.exports = mongoose.model("Group", groupSchema);
