const mongoose = require("mongoose");
const Group = require("../model/Group");
const Message = require("../model/Message");
const ChatMessage = require("../model/ChatMessage");
const User = require("../model/User");

const MAX_PAGE_SIZE = 100;

const participantKey = (users) =>
  [...new Set(users)].sort((first, second) => first.localeCompare(second)).join(":");

const getConversationForUser = (conversationId, userName) => {
  if (!mongoose.isValidObjectId(conversationId)) {
    return null;
  }

  return Message.findOne({ _id: conversationId, users: userName });
};

const addMessage = async (req, res) => {
  try {
    const { receiver = [], msg, _id } = req.body;
    const sender = req.user.name;
    const text = typeof msg === "string" ? msg.trim() : "";

    if (!text) {
      return res.status(400).json({ status: 400, message: "Message is required" });
    }

    let conversation;
    if (_id) {
      conversation = await getConversationForUser(_id, sender);
      if (!conversation) {
        return res.status(404).json({ status: 404, message: "Conversation not found" });
      }
    } else {
      const users = [...new Set([sender, ...receiver])];
      if (users.length !== 2) {
        return res.status(400).json({
          status: 400,
          message: "A direct conversation requires one recipient",
        });
      }

      const key = participantKey(users);
      conversation = await Message.findOne({
        group: false,
        users: { $all: users, $size: users.length },
      });

      if (conversation && !conversation.participantKey) {
        conversation.participantKey = key;
        try {
          await conversation.save();
        } catch (error) {
          if (error.code !== 11000) throw error;
          conversation = await Message.findOne({ participantKey: key });
        }
      }

      if (!conversation) {
        conversation = await Message.findOneAndUpdate(
          { participantKey: key },
          {
            $setOnInsert: {
              users,
              participantKey: key,
              group: false,
            },
          },
          { upsert: true, new: true, setDefaultsOnInsert: true },
        );
      }
    }

    const message = await ChatMessage.create({
      conversation: conversation._id,
      sender,
      message: text,
    });

    conversation.lastMessage = {
      message: text,
      sender,
      createdAt: message.createdAt,
    };
    conversation.updatedAt = message.createdAt;
    await conversation.save();

    return res.status(200).json({
      status: 200,
      statusMessage: "Message Added",
      conversationId: conversation._id,
      recipients: conversation.users.filter((userName) => userName !== sender),
      chatMessage: message,
      message: { messages: [message] },
    });
  } catch (error) {
    console.error("Add message error:", error);
    return res
      .status(500)
      .json({ status: 500, message: "Internal server error" });
  }
};

const messages = async (req, res) => {
  try {
    const { _id, before } = req.body;
    const requestedLimit = Number(req.body.limit) || 50;
    const limit = Math.min(Math.max(requestedLimit, 1), MAX_PAGE_SIZE);
    const conversation = await getConversationForUser(_id, req.user.name);

    if (!conversation) {
      return res.status(404).json({ status: 404, message: "Conversation not found" });
    }

    const legacyCursor = typeof before === "string" && before.startsWith("legacy:")
      ? Number(before.split(":")[1])
      : null;
    let currentMessages = [];

    if (legacyCursor === null) {
      const query = { conversation: conversation._id };
      if (before && !Number.isNaN(Date.parse(before))) {
        query.createdAt = { $lt: new Date(before) };
      }

      currentMessages = await ChatMessage.find(query)
        .sort({ createdAt: -1 })
        .limit(limit + 1)
        .lean();
    }

    const hasMoreCurrentMessages = currentMessages.length > limit;
    const page = currentMessages.slice(0, limit).reverse();
    const legacyMessages = conversation.messages || [];
    const legacyEnd =
      legacyCursor === null
        ? legacyMessages.length
        : Math.min(Math.max(legacyCursor, 0), legacyMessages.length);
    const remaining = limit - page.length;
    const legacyStart = Math.max(0, legacyEnd - remaining);
    const legacyPage =
      !hasMoreCurrentMessages && remaining > 0
        ? legacyMessages.slice(legacyStart, legacyEnd).map((message) => ({
            ...message.toObject(),
            conversation: conversation._id,
          }))
        : [];
    const combinedMessages = [...legacyPage, ...page];
    const hasMoreLegacyMessages =
      !hasMoreCurrentMessages && legacyStart > 0;
    const nextCursor = hasMoreCurrentMessages
      ? page[0]?.createdAt || null
      : hasMoreLegacyMessages
        ? `legacy:${legacyStart}`
        : null;

    return res.status(200).json({
      status: 200,
      message: "Messages",
      messages: {
        _id: conversation._id,
        messages: combinedMessages,
      },
      pagination: {
        hasMore:
          hasMoreCurrentMessages || hasMoreLegacyMessages,
        nextCursor,
      },
    });
  } catch (error) {
    console.error("Messages error:", error);
    return res
      .status(500)
      .json({ status: 500, message: "Internal server error" });
  }
};

const allChats = async (req, res) => {
  try {
    const userName = req.user.name;
    const [conversations, groups] = await Promise.all([
      Message.find(
        { users: userName, group: false },
        { users: 1, updatedAt: 1, lastMessage: 1 },
      )
        .sort({ updatedAt: -1 })
        .lean(),
      Group.find({ users: userName }).sort({ updatedAt: -1 }).lean(),
    ]);
    const groupConversations = await Message.find(
      { _id: { $in: groups.map((group) => group.chatId) } },
      { updatedAt: 1, lastMessage: 1 },
    ).lean();
    const groupConversationMap = new Map(
      groupConversations.map((conversation) => [
        String(conversation._id),
        conversation,
      ]),
    );

    const directChats = conversations.map((conversation) => ({
      chatId: conversation._id,
      users: conversation.users.filter((user) => user !== userName),
      updatedAt: conversation.updatedAt,
      lastMessage: conversation.lastMessage,
      group: false,
    }));

    const groupChats = groups.map((group) => {
      const conversation = groupConversationMap.get(String(group.chatId));
      return {
        ...group,
        updatedAt: conversation?.updatedAt || group.updatedAt,
        lastMessage: conversation?.lastMessage,
        group: true,
      };
    });

    const chats = [...directChats, ...groupChats].sort(
      (first, second) => new Date(second.updatedAt) - new Date(first.updatedAt),
    );

    return res.status(200).json({
      status: 200,
      message: "Chats",
      chats,
      user: userName,
    });
  } catch (error) {
    console.error("All chats error:", error);
    return res
      .status(500)
      .json({ status: 500, message: "Internal server error" });
  }
};

const followings = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("followings").lean();
    return res.status(200).json({
      status: 200,
      message: "Followings",
      followings: user ? [user] : [],
    });
  } catch (error) {
    console.error("Followings error:", error);
    return res
      .status(500)
      .json({ status: 500, message: "Internal server error" });
  }
};

module.exports = { allChats, addMessage, messages, followings };
