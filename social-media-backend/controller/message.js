const Group = require("../model/Group");
const Message = require("../model/Message");
const User = require("../model/User");

const addMessage = async (req, res, next) => {
  console.log("Add Message");
  try {
    const { receiver, msg, _id } = req.body;
    const sender = req.user.name;
    let users;

    receiver.length === 1
      ? (users = [sender, ...receiver])
      : (users = receiver);

    console.log(receiver, msg, sender, _id);
    console.log("users", users);

    let message;
    if (_id) {
      message = await Message.findOneAndUpdate(
        { _id },
        { $push: { messages: { message: msg, sender } } },
        { new: true }
      );
      console.log(message);
    } else {
      message = new Message({
        messages: [{ message: msg, sender }],
        users,
      });
      await message.save();
      console.log(message);
    }
    console.log("Suucess");
    return res
      .status(200)
      .json({ status: 200, message: "Message Added", message });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: 500, message: "Internal server error", err });
  }
};

const messages = async (req, res, next) => {
  console.log("Messages");
  try {
    const { _id } = req.body;
    console.log({ _id });
    const messages = await Message.findOne({ _id }).sort({
      createdAt: 1,
    });
    console.log(messages);
    return res.status(200).json({ status: 200, message: "Messages", messages });
  } catch (error) {
    console.log(error);
    return res
      .status(500)
      .json({ status: 500, message: "Internal server error", err });
  }
};

const allChats = async (req, res, next) => {
  console.log("All Chats");
  try {
    const user = req.user.name;
    let chats = await Message.find(
      { users: { $in: [user] } },
      { _id: 1, users: 1, group: 1, updatedAt: 1 }
    );
    const groups = await Group.find({ users: { $in: [req.user.name] } });
    console.log("initial chats ", chats);

    chats.map((chat) => {
      chat.users = chat.users.filter((user) => user !== req.user.name);
    });
    const temp = [];
    chats.map((chat) => {
      if (!chat.group) {
        temp.push({
          chatId: chat._id,
          users: chat.users,
          updatedAt: chat.updatedAt,
        });
      }
    });

    console.log("updated chats ", chats);

    chats = [...temp, ...groups];
    chats.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
    console.log(chats);
    return res.status(200).json({ status: 200, message: "Chats", chats, user });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ status: 500, message: "Internal server error", err });
  }
};

const followings = async (req, res, next) => {
  console.log("Followings");
  try {
    const followings = await User.find({ name: req.user.name }).select(
      "followings"
    );
    return res
      .status(200)
      .json({ status: 200, message: "Followings", followings });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ status: 500, message: "Internal server error", err });
  }
};

module.exports = { allChats, addMessage, messages, followings };
