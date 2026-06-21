const Group = require("../model/Group");
const Message = require("../model/Message");
const ChatMessage = require("../model/ChatMessage");

const createGroup = async (req, res) => {
  const group = req.body;
  const creator = req.user.name;
  const name = typeof group.name === "string" ? group.name.trim() : "";
  const users = [...new Set([...(group.users || []), creator])];

  if (!name || users.length < 2) {
    return res.status(400).json({
      status: 400,
      message: "Group name and at least one member are required",
    });
  }

  try {
    const conversation = await Message.create({
      users,
      group: true,
      lastMessage: {
        message: "Created Group",
        sender: creator,
        createdAt: new Date(),
      },
    });

    await ChatMessage.create({
      conversation: conversation._id,
      sender: creator,
      message: "Created Group",
      type: "system",
    });

    const addGroup = await Group.create({
      creator,
      users,
      name,
      chatId: conversation._id,
    });

    return res.status(200).json({ status: 200, message: "Group created", addGroup });
  } catch (err) {
    console.error("Create group error:", err);
    return res
      .status(500)
      .json({ status: 500, message: "Internal server error" });
  }
};

module.exports = { createGroup };
