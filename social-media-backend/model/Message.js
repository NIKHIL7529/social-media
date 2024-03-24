const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
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
    users: Array,
    group: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Message", messageSchema);
