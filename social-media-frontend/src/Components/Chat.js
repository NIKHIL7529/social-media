import { useCallback, useEffect, useRef, useState } from "react";
import styles from "./Chat.module.css";
import io from "socket.io-client";
import { useLocation } from "react-router-dom";

export default function Chat() {
  const [chats, setChats] = useState([]);
  const [chatName, setChatName] = useState("");
  const [chatId, setChatId] = useState(null);
  const [receiver, setReceiver] = useState([]);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [clickedCreateGroup, setClickedCreateGroup] = useState(false);
  const [groupUsers, setGroupUsers] = useState([]);
  const [group, setGroup] = useState({
    name: "",
    users: [],
  });

  const location = useLocation();

  const auth_user = useRef(null);
  const socket = useRef(null);

  const generateSocket = () => {
    let socket = io("http://localhost:8000", {
      withCredentials: true,
    });

    return socket;
  };

  useEffect(() => {
    console.log("Connection Created", socket);
  }, []);

  useEffect(() => {
    socket.current = generateSocket();

    socket.current.on("message", (msg) => {
      console.log("start");
      setMessages((prevMessages) => [...prevMessages, msg]);
      console.log(msg);
    });
    socket.current.on("group", (group) => {
      console.log("start");
      const chat = [...chats, group];
      const orderedChats = chat.sort(
        (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
      );
      setChats(orderedChats);
      console.log(group);
    });
  }, [chats]);

  useEffect(() => {
    const getChats = async () => {
      await fetch("http://localhost:8000/api/message/allChats", {
        method: "GET",
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
        withCredentials: true,
        credentials: "include",
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("Fetch response received: ", data);
          if (data.status === 200) {
            console.log(data.chats);
            console.log(data.user);
            setChats(data.chats);
            auth_user.current = data.user;
            console.log("Search Successful");
          }
        })
        .catch((err) => console.log("Error during fetch: ", err));
    };

    getChats();
  }, []);

  const handleReceiver = useCallback(
    (_id, chat) => {
      setReceiver(chat.users);
      setChatName(chat.name ? chat.name : chat.users.length && chat.users[0]);
      setChatId(_id);
      setMessage("");

      fetch("http://localhost:8000/api/message/messages", {
        method: "POST",
        body: JSON.stringify({ _id }),
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
        withCredentials: true,
        credentials: "include",
      })
        .then((response) => response.json())
        .then((data) => {
          console.log("Fetch response received: ", data);
          if (data.status === 200) {
            console.log(data.messages.messages);
            console.log(data.messages.messages.length);
            if (data.messages.messages.length === 0) {
              setMessages("");
            } else {
              setMessages(data.messages.messages);
              console.log(messages);
            }
          }
        })
        .catch((err) => console.log("Error during fetch: ", err));
    },
    [messages]
  );

  useEffect(() => {
    console.log(location.state);
    if (location.state) {
      const name = chats.filter(
        (chat) => chat.users.length === 1 && chat.users[0] === location.state
      )[0];
      console.log("NAME: ", name);
      if (name) {
        handleReceiver(name.chatId, name);
      } else {
        setChatName(location.state);
      }
    }
  }, [location.state, chats, handleReceiver]);

  const handleMsgChange = (e) => {
    if (e.key === "Enter") {
      handleSendMsg();
    } else {
      console.log(e.target.value);
      setMessage(e.target.value);
    }
  };

  const handleSendMsg = async () => {
    const msg = message;
    const _id = chatId;
    console.log(msg);
    let messageId;

    await fetch("http://localhost:8000/api/message/sendMessage", {
      method: "POST",
      body: JSON.stringify({ receiver, msg, _id }),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
      withCredentials: true,
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Fetch response received: ", data);
        if (data.status === 200) {
          console.log("Message Send");
          messageId =
            data.message.messages[data.message.messages.length - 1]._id;
          console.log(messageId);
        }
      })
      .catch((err) => console.log("Error during fetch: ", err));

    const currentMessage = {
      _id: messageId,
      sender: auth_user.current,
      receiver: receiver,
      message: msg,
      updatedAt: new Date().getTime(),
    };

    socket.current.emit("message", currentMessage);
    setMessage("");
  };

  const handleCreateGroup = () => {
    setClickedCreateGroup((prevClickedCreateGroup) => !prevClickedCreateGroup);
    fetch("http://localhost:8000/api/message/followings", {
      method: "GET",
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
      withCredentials: true,
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Fetch response received: ", data);
        if (data.status === 200) {
          console.log(data.followings[0].followings);
          setGroupUsers(data.followings[0].followings);
          console.log("Search Successful");
        }
      })
      .catch((err) => console.log("Error during fetch: ", err));
  };

  const handleToggleGroupUser = (user) => {
    if (group.users.includes(user)) {
      setGroup({ ...group, users: group.users.filter((u) => u !== user) });
    } else {
      setGroup({ ...group, users: [...group.users, user] });
    }
  };

  const handleCreateGroupSubmit = async () => {
    console.log("Selected Group Users:", group.users);
    let _id = "";

    await fetch("http://localhost:8000/api/group/createGroup", {
      method: "POST",
      body: JSON.stringify(group),
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
      withCredentials: true,
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        console.log("Fetch response received: ", data);
        if (data.status === 200) {
          console.log("Group Created");
          _id = data.addGroup.chatId;
          console.log(_id, data.addGroup.chatId);
        }
      })
      .catch((err) => console.log("Error during fetch: ", err));

    const currentChat = {
      chatId: _id,
      name: group.name,
      group: true,
      users: [...group.users],
      updatedAt: new Date().getTime(),
    };

    console.log(currentChat);

    const chat = [...chats, currentChat];
    const orderedChats = chat.sort(
      (a, b) => new Date(b.updatedAt) - new Date(a.updatedAt)
    );
    setChats(orderedChats);

    socket.current.emit("group", currentChat);
    setClickedCreateGroup(false);
  };

  return (
    <div className={styles.Chat}>
      <div>
        <button onClick={handleCreateGroup}>Create Group</button>
        {clickedCreateGroup && (
          <>
            <label>Group name</label>
            <input
              type="text"
              name="group"
              value={group.name}
              onChange={(e) => setGroup({ ...group, name: e.target.value })}
            />
            {groupUsers &&
              groupUsers.map((user, index) => (
                <div>
                  <input
                    key={index}
                    type="checkbox"
                    id={user}
                    name={user}
                    value={user}
                    onChange={() => handleToggleGroupUser(user)}
                  />
                  <label htmlFor={user}>{user}</label>
                </div>
              ))}
            <button onClick={handleCreateGroupSubmit}>
              Create Group with Selected Users
            </button>
          </>
        )}
      </div>
      <div className={styles.names}>
        {chats.length &&
          chats.map((chat) => (
            <p
              key={chat.chatId}
              onClick={() => {
                handleReceiver(chat.chatId, chat);
              }}
            >
              {chat.name ? chat.name : chat.users && chat.users[0]}
            </p>
          ))}
      </div>
      <div>
        <h1>{chatName ? chatName : "Start Conversation"}</h1>
        {chatName && (
          <>
            {messages
              ? messages.map((message) => (
                  <p key={message._id}>
                    {message.sender === auth_user.current
                      ? "YOU: "
                      : "FRIEND: "}{" "}
                    {message.message}
                  </p>
                ))
              : "No Messages Yet"}
            <input
              type="text"
              placeholder="type here"
              value={message}
              onChange={handleMsgChange}
            />
            <button onClick={handleSendMsg}>Send</button>
          </>
        )}
      </div>
    </div>
  );
}
