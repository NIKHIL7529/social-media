const mongoose = require("mongoose");

const groupSchema = new mongoose.Schema(
  {
    creator: {
      type: String,
      required: true,
    },
    photo:{
      type: String,
    },
    users: Array,
    name: {
      type: String,
      required: true,
    },
    chatId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Group", groupSchema);
