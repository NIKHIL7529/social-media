import { useContext, useEffect, useRef, useState } from "react";
import styles from "./Chat.module.css";
import io from "socket.io-client";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { backendUrl } from "../Utils/backendUrl";
import image from "../images/user.jpg";
import EmojiPicker from "emoji-picker-react/dist";
import SendIcon from "@mui/icons-material/Send";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";
import UserContext from "../UserContext";
import { format } from "timeago.js";
import Swal from "sweetalert2";
import { AccountCircle, Groups } from "@mui/icons-material";

export default function Chat() {
  const [chats, setChats] = useState([]);
  const [chatName, setChatName] = useState("");
  const [chatId, setChatId] = useState(null);
  const [receiver, setReceiver] = useState([]);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([]);
  const [clickedCreateGroup, setClickedCreateGroup] = useState(false);
  const [groupUsers, setGroupUsers] = useState([]);
  const [picker, setPicker] = useState(false);
  const [status, setStatus] = useState("Online");
  const [group, setGroup] = useState({
    name: "",
    users: [],
  });

  const { id } = useParams();
  console.log(
    "-------------------------------------------------------------------------------------",
    id
  );
  const location = useLocation();
  const navigate = useNavigate();

  const scrollMessageRef = useRef(null);
  const user = useContext(UserContext);
  const auth_user = useRef(null);
  const socket = useRef(null);

  const generateSocket = () => {
    let socket = io(`${backendUrl}`, {
      withCredentials: true,
    });

    return socket;
  };

  useEffect(() => {
    console.log("Scroll1");
    if (messages.length && scrollMessageRef.current) {
      console.log("Scroll2");
      scrollMessageRef.current.scrollTop =
        scrollMessageRef.current.scrollHeight;
    }
  }, [messages]);

  useEffect(() => {
    console.log(user);
    auth_user.current = user.name;
    console.log(auth_user.current);
    console.log("Connection Created", socket);
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    socket.current = generateSocket();

    socket.current.on("message", (msg) => {
      console.log("start");
      if (chatId === msg.chatId) {
        setMessages((prevMessages) => [
          ...prevMessages,
          {
            _id: msg._id,
            sender: msg.sender,
            receiver: msg.receiver,
            message: msg.message,
            updatedAt: msg.updatedAt,
          },
        ]);
      }
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

    socket.current.on("chat", (onlineUsers) => {
      console.log(receiver);
      console.log("Chat Socket");
      console.log(onlineUsers);
      if (receiver.length === 1) {
        let flag = false;
        onlineUsers.map((o_user, index) => {
          if (flag === false && o_user.user.name === receiver[0]) {
            // setStatus("Online");
            console.log(o_user.user.name, " ///// ", receiver[0]);
            flag = true;
            setStatus("Online");
          }
        });
        if (!flag) {
          setStatus("Offline");
        }
      } else {
        setStatus("");
      }
    });
  }, [chats, chatId]);

  useEffect(() => {
    window.onpopstate = () => {
      console.log("Navigating back to chat");
      navigate("/chat");
      window.location.reload();
    };
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    console.log("id: ", id);
    if (id) {
      console.log(chats);

      chats.map((chat, index) => {
        console.log(index, "chat.chatId:", chat.chatId, "id: ", id);
        if (chat.chatId === id) {
          handleReceiver(id, chat);
        }
      });
    }
    // eslint-disable-next-line
  }, [chats, id]);

  useEffect(() => {
    console.log("Chats");
    const getChats = async () => {
      Swal.fire({
        width: "120",
        allowEscapeKey: false,
        allowOutsideClick: false,
        timer: 2000,
        didOpen: () => {
          Swal.showLoading();
        },
      });
      await fetch(`${backendUrl}/api/message/allChats`, {
        method: "GET",
        headers: {
          "Content-type": "application/json; charset=UTF-8",
        },
        withCredentials: true,
        credentials: "include",
      })
        .then((response) => response.json())
        .then((data) => {
          Swal.close();
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

  const userMesage = () => {
    console.log(location.state);
    console.log(chats);
    if (location.state) {
      const name = chats.filter(
        (chat) => chat.users.length === 1 && chat.users[0] === location.state
      )[0];
      console.log("NAME: ", name);
      return name;
    }
    return;
  };

  useEffect(() => {
    const name = userMesage();
    if (location.state) {
      if (name) {
        console.log("True");
        handleReceiver(name.chatId, name);
      } else {
        console.log("False");
        setChatName(location.state);
        setReceiver([location.state]);
        setChatId(null);
        setMessage("");
        socket.current.emit("chat", [location.state]);
      }
    } // eslint-disable-next-line
  }, [chats]);

  const handleReceiver = (_id, chat) => {
    setReceiver(chat.users);
    setChatName(chat.name ? chat.name : chat.users.length && chat.users[0]);
    setChatId(_id);
    setPicker(false);
    setMessage("");
    navigate(`/chat/${chat.chatId}`);
    Swal.fire({
      width: "120",
      allowEscapeKey: false,
      allowOutsideClick: false,
      timer: 2000,
      didOpen: () => {
        Swal.showLoading();
      },
    });
    console.log("handle Receiver");
    console.log(_id, chat);
    socket.current.emit("chat");

    fetch(`${backendUrl}/api/message/messages`, {
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
        Swal.close();
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
  };

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
    Swal.fire({
      width: "120",
      allowEscapeKey: false,
      allowOutsideClick: false,
      timer: 2000,
      didOpen: () => {
        Swal.showLoading();
      },
    });
    await fetch(`${backendUrl}/api/message/sendMessage`, {
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
        Swal.close();
        console.log("Fetch response received: ", data);
        if (data.status === 200) {
          console.log("Message Send");
          messageId =
            data.message.messages[data.message.messages.length - 1]._id;
          console.log(messageId);
          if (chatId === null) {
            setChatId(data.message._id);
          }
        }
      })
      .catch((err) => console.log("Error during fetch: ", err));

    const currentMessage = {
      _id: messageId,
      sender: auth_user.current,
      receiver: receiver,
      message: msg,
      updatedAt: new Date().toISOString(),
      chatId: _id,
    };

    socket.current.emit("message", currentMessage);
    setMessage("");
  };

  const handleCreateGroup = () => {
    setClickedCreateGroup((prevClickedCreateGroup) => !prevClickedCreateGroup);
    Swal.fire({
      width: "120",
      allowEscapeKey: false,
      allowOutsideClick: false,
      timer: 2000,
      didOpen: () => {
        Swal.showLoading();
      },
    });
    fetch(`${backendUrl}/api/message/followings`, {
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
        Swal.close();
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
    Swal.fire({
      width: "120",
      allowEscapeKey: false,
      allowOutsideClick: false,
      timer: 2000,
      didOpen: () => {
        Swal.showLoading();
      },
    });
    await fetch(`${backendUrl}/api/group/createGroup`, {
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
        Swal.close();
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
      updatedAt: new Date().toISOString(),
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

  const handleEmojiPicker = () => {
    if (picker === true) {
      setPicker(false);
    }
  };

  const onEmojiClick = (emojiData, event) => {
    console.log(emojiData.emoji);
    // setEmoji(emojiData.unified);
    // {emoji && <Emoji unified={emoji} />}
    setMessage((prevMessage) => prevMessage + emojiData.emoji);
  };

  return (
    <div className={styles.Chat}>
      {clickedCreateGroup && (
        <div className={`${styles.chatmenu} ${id ? styles.hide : ""}`}>
          <div className={styles.groupname}>
            <label>Group name</label>
            <input
              type="text"
              name="group"
              value={group.name}
              placeholder="Enter name"
              onChange={(e) => setGroup({ ...group, name: e.target.value })}
            />
          </div>
          <div className={styles.groupusers}>
            <p style={{ color: "blue" }}>Select Friends</p>
            {groupUsers.length > 0 ? (
              groupUsers.map((user, index) => (
                <>
                  <div className={styles.groupuser}>
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
                </>
              ))
            ) : (
              <>
                <p>No Friends</p>
              </>
            )}
          </div>
          <div className={styles.chatmenubuttons}>
            <button
              className={styles.chatmenubutton}
              onClick={handleCreateGroupSubmit}
              disabled={groupUsers.length === 0}
            >
              Create Group
            </button>
            <button
              className={styles.chatmenubutton}
              onClick={handleCreateGroup}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
      {!clickedCreateGroup && (
        <div className={`${styles.chatmenu} ${id ? styles.hide : ""}`}>
          <div className={styles.chatmenubuttons}>
            <button
              className={styles.chatmenubutton}
              onClick={() => {
                navigate("/search", { state: "chat" });
              }}
            >
              Search for new chat
            </button>
            <button
              className={styles.chatmenubutton}
              onClick={handleCreateGroup}
            >
              Create Group
            </button>
          </div>
          <hr />
          <div className={styles.names}>
            {chats.length ? (
              chats.map((chat) => (
                <>
                  <div
                    className={styles.name}
                    key={chat.chatId}
                    onClick={() => {
                      handleReceiver(chat.chatId, chat);
                    }}
                  >
                    {chat.users.length === 1 ? <AccountCircle /> : <Groups />}
                    {/* <img src={image} alt="" /> */}
                    <div>
                      {chat.name ? chat.name : chat.users && chat.users[0]}
                    </div>
                  </div>
                  <hr />
                </>
              ))
            ) : (
              <>
                <p>No Chats</p>
              </>
            )}
          </div>
        </div>
      )}

      {chatName ? (
        <div className={`${styles.chat} ${id ? "" : styles.hide}`}>
          <div className={styles.nameheader}>
            {receiver.length === 1 ? <AccountCircle /> : <Groups />}
            <div className={styles.namestatus}>
              <div>{chatName}</div>
              <div>{status}</div>
            </div>
          </div>
          <div ref={scrollMessageRef} className={styles.messages}>
            {messages.length ? (
              messages.map((message) => (
                <div
                  className={`${styles.message} ${
                    message.sender === auth_user.current
                      ? styles.messageRight
                      : styles.messageLeft
                  }`}
                  key={message._id}
                >
                  {receiver.length > 1 && <AccountCircle />}
                  <div className={styles.msg}>
                    {receiver.length > 1 && <span>{message.sender}</span>}
                    <p>
                      {message.message}
                      <sub>{format(message.updatedAt)}</sub>
                    </p>
                  </div>
                  {picker && (
                    <div className={styles.Picker}>
                      <EmojiPicker
                        height={400}
                        width={400}
                        onEmojiClick={onEmojiClick}
                      />
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className={styles.chatP}>No message yet</div>
            )}
          </div>

          <div className={styles.input} onClick={handleEmojiPicker}>
            <button>
              <EmojiEmotionsIcon
                onClick={() => {
                  setPicker((prevPicker) => !prevPicker);
                }}
              />
            </button>
            <input
              type="text"
              placeholder="Type a message"
              value={message}
              onChange={handleMsgChange}
            />
            <button onClick={handleSendMsg}>
              <SendIcon />
            </button>
          </div>
        </div>
      ) : (
        <div className={`${styles.chatPP} ${id ? "" : styles.hide}`}>
          Start Conversation
        </div>
      )}
    </div>
  );
}
