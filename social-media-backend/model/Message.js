const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    participantKey: {
      type: String,
      trim: true,
    },
    messages: [
      {
        message: {
          type: String,
          required: true,
        },
        sender: {
          type: String,
          required: true,
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
        updatedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    users: {
      type: [String],
      required: true,
      default: [],
    },
    group: { type: Boolean, default: false },
    lastMessage: {
      message: String,
      sender: String,
      createdAt: Date,
    },
  },
  {
    timestamps: true,
  }
);

messageSchema.index({ users: 1, updatedAt: -1 });
messageSchema.index({ participantKey: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model("Message", messageSchema);
