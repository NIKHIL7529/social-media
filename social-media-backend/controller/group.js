const Group = require("../model/Group");
const Message = require("../model/Message");

const createGroup = async (req, res, next) => {
  console.log("Add Group");
  let group = req.body;
  console.log(group);
  const creator = req.user.name;
  group.users = [...group.users, creator];
  try {
    const message = new Message({
      messages: [{ message: "Created Group", sender: creator }],
      users: group.users,
      group: true,
    });
    await message.save();

    const addGroup = new Group({
      creator,
      users: group.users,
      name: group.name,
      chatId: message._id,
    });
    await addGroup.save();
    console.log(addGroup);

    console.log(message);

    res.json({ status: 200, message: "Group created", addGroup });
  } catch (err) {
    console.log(err);
    return res
      .status(500)
      .json({ status: 500, message: "Internal server error" , err});
  }
};

module.exports = { createGroup };
