const mongoose = require("mongoose");

const chatMessageSchema = new mongoose.Schema(
  {
    conversation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      required: true,
    },
    sender: {
      type: String,
      required: true,
      trim: true,
      maxlength: 20,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      maxlength: 4000,
    },
    type: {
      type: String,
      enum: ["text", "system"],
      default: "text",
    },
  },
  {
    timestamps: true,
  },
);

chatMessageSchema.index({ conversation: 1, createdAt: -1 });

module.exports = mongoose.model("ChatMessage", chatMessageSchema);
