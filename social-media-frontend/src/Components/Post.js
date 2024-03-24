import styles from "./Post.module.css";
import ThumbUpOutlinedIcon from "@mui/icons-material/ThumbUpOutlined";
import BookmarkBorderOutlinedIcon from "@mui/icons-material/BookmarkBorderOutlined";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
import { useEffect, useRef, useState } from "react";
import { BookmarkOutlined, ChatSharp, ThumbUpSharp } from "@mui/icons-material";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";
import postih from "../images/post.jpg";
import { backendUrl } from "../Utils/backendUrl";
import SendIcon from "@mui/icons-material/Send";
import Swal from "sweetalert2";
import EmojiPicker from "emoji-picker-react";

export default function Post(props) {
  const [likes, setLikes] = useState(null);
  const [likeflag, setLikeFlag] = useState(false);
  const [saveflag, setSaveFlag] = useState(false);
  const [followflag, setFollowFlag] = useState(false);
  const [button, setButton] = useState("");
  const [commentClick, setCommentClick] = useState(false);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const [commentable, setCommentable] = useState(true);
  const [fullText, setFullText] = useState(false);
  const [buttonShow, setButtonShow] = useState(false);
  const [picker, setPicker] = useState(false);

  const auth_user = useRef();
  const textRef = useRef(null);
  const post = props.post;
  const user = props.user;
  console.log("initial data is ", post, user);

  useEffect(() => {
    console.log(user.name, post.user.name);
    if (props.admin !== "false") {
      if (user.name === post.user.name) {
        setButton("Delete");
      } else {
        setButton("Follow");
      }
    } else {
      setButton("none");
    }
  }, [post.user.name, user.name]);

  useEffect(() => {
    if (user && user.liked) {
      const isLiked = user.liked.includes(post._id);
      setLikeFlag(isLiked);
    }
  }, [post._id, user]);

  useEffect(() => {
    if (user && user.saved) {
      const isSaved = user.saved.includes(post._id);
      setSaveFlag(isSaved);
    }
  }, [user, post._id]);

  useEffect(() => {
    if (user && user.followings) {
      const isFollowed = user.followings.includes(post.user.name);
      console.log("Post usr name is ", post.user.name);
      console.log("is following is ", isFollowed);
      console.log("setting Flow flag ", user.followings);
      setFollowFlag(isFollowed);
    }
  }, [user, post.user.name]);

  const handleDelete = () => {
    fetch(`${backendUrl}/api/post/deletePost`, {
      method: "POST",
      body: JSON.stringify({ _id: post._id }),
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
          console.log(data.message);
          console.log("Search Successful");
          console.log(post._id);
          props.setIndex(post._id);
          // document.window.reload();
        }
      });
  };

  const handleFollow = () => {
    fetch(`${backendUrl}/api/user/follow`, {
      method: "POST",
      body: JSON.stringify({ userName: post.user.name }),
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
          console.log(data.user1);
          // setUse(data.user);
          console.log("Search Successful");
          setFollowFlag((prevFollowFlag) => !prevFollowFlag);
          props.setFollow(post.user.name);
          // document.window.reload();
        } else {
          return;
        }
      })
      .catch((err) => console.log("Error during fetch: ", err));
  };

  const handleSaved = () => {
    fetch(`${backendUrl}/api/post/saved`, {
      method: "POST",
      body: JSON.stringify({ _id: post._id }),
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
          console.log(data);
          console.log("Search Successful");
          setSaveFlag((prevSaveFlag) => !prevSaveFlag);
        } else {
          return;
        }
      })
      .catch((err) => console.log("Error during fetch: ", err));
  };

  const handleLiked = async () => {
    await fetch(`${backendUrl}/api/post/liked`, {
      method: "POST",
      body: JSON.stringify({ _id: post._id }),
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
          console.log("likes", data.likes);
          setLikes(data.likes);
          console.log("Search Successful");
          setLikeFlag((prevLikeFlag) => !prevLikeFlag);
        } else {
          return;
        }
      })
      .catch((err) => console.log("Error during fetch: ", err));
  };

  const handleComment = () => {
    if (!commentable) {
      console.log("Comments are restricted");
      return;
    }
    setCommentClick((prevCommentClick) => !prevCommentClick);
  };

  const handleCommentChange = (e) => {
    setComment(e.target.value);
  };

  const handleCommentSend = () => {
    if (comment.length > 0) {
      setComments((prevComments) => [
        ...prevComments,
        { sender: auth_user.current, comment: comment },
      ]);
    }
    setComment("");
  };

  const handleShowDesc = () => {
    setFullText((prevFullText) => !prevFullText);
  };

  const handleText = () => {
    console.log("Enter");
    const width = textRef.current.clientWidth;
    const text = textRef.current.textContent;
    const span = document.createElement("span");
    span.textContent = text;
    document.body.appendChild(span);
    const textWidth = span.offsetWidth;
    document.body.removeChild(span);
    console.log(width, text, textWidth);

    if (textWidth > width) {
      setFullText(false);
      setButtonShow(true);
    } else {
      setFullText(true);
      setButtonShow(false);
    }
  };

  useEffect(() => {
    handleText();
    window.addEventListener("resize", handleText);
    return () => {
      window.removeEventListener("resize", handleText);
    };
  }, []);

  const handleImage = () => {
    Swal.fire({
      html: `<img src=${user.photo} alt=${user}  style="max-width: 100%; height: auto;" />`,
      showConfirmButton: false,
    });
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
    setComment((prevMessage) => prevMessage + emojiData.emoji);
  };

  return (
    <div className={styles.Post}>
      <div className={styles.postheader}>
        <div>
          <img src={user.photo} alt={user} onClick={handleImage} />
          <p>{post.user.name}</p>
        </div>

        {button === "Follow" && (
          <button onClick={handleFollow}>
            {followflag ? "Following" : "Follow"}
          </button>
        )}
        {button === "Delete" && <button onClick={handleDelete}>Delete</button>}
      </div>
      <div className={styles.image}>
        <img src={post.photo} alt="post" />
      </div>
      <div className={styles.info}>
        <div className={styles.topic}>{post.topic}</div>
        <div
          className={styles.description}
          style={{
            height: fullText ? "auto" : "20px",
            display: fullText ? "" : "flex",
          }}
          ref={textRef}
          onResize={handleText}
        >
          {post.text}
          {buttonShow ? (
            <button onClick={handleShowDesc}>
              {fullText ? "Read Less" : "Read More"}
            </button>
          ) : (
            ""
          )}
        </div>
      </div>
      <div
        className={styles.postfooter}
        style={{ borderRadius: commentClick ? "0" : "" }}
      >
        <button onClick={handleLiked}>
          {likeflag ? (
            <ThumbUpSharp style={{ fill: "blue" }} />
          ) : (
            <ThumbUpOutlinedIcon />
          )}
        </button>
        <button onClick={handleSaved}>
          {saveflag ? (
            <BookmarkOutlined style={{ fill: "blue" }} />
          ) : (
            <BookmarkBorderOutlinedIcon />
          )}
        </button>
        <button>
          <ShareOutlinedIcon />
        </button>
        <button onClick={handleComment}>
          <ChatSharp />
        </button>
        <p>{likes !== null ? likes : post.likes} likes</p>
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
      {commentClick && (
        <div className={styles.comments}>
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
              placeholder="Comment here"
              value={comment}
              onChange={handleCommentChange}
            />
            <button onClick={handleCommentSend}>
              <SendIcon />
            </button>
          </div>
          {comments.length !== 0 ? (
            comments.map((comment) => (
              <div className={styles.comment} key={comment._id}>
                <img src={postih} alt="" />
                <p>
                  {comment.sender === auth_user.current
                    ? auth_user.current
                    : comment.sender}{" "}
                  {comment.comment}
                </p>
              </div>
            ))
          ) : (
            <div className={styles.comment}>No comments yet</div>
          )}
        </div>
      )}
    </div>
  );
}
