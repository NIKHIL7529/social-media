import styles from "./Post.module.css";
import ThumbUpOutlinedIcon from "@mui/icons-material/ThumbUpOutlined";
import BookmarkBorderOutlinedIcon from "@mui/icons-material/BookmarkBorderOutlined";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
import { useEffect, useRef, useState } from "react";
import {
  AccountCircle,
  BookmarkOutlined,
  ChatRounded,
  ThumbUpSharp,
} from "@mui/icons-material";
import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";
import SendIcon from "@mui/icons-material/Send";
import Swal from "sweetalert2";
import EmojiPicker from "emoji-picker-react";
import { useLocation, useNavigate } from "react-router";
import { postService } from "../services/postService";

export default function Post(props) {
  const [likes, setLikes] = useState(null);
  const [likeflag, setLikeFlag] = useState(false);
  const [saveflag, setSaveFlag] = useState(false);
  const [followflag, setFollowFlag] = useState(false);
  const [button, setButton] = useState("");
  const [commentClick, setCommentClick] = useState(false);
  const [comment, setComment] = useState("");
  const [comments, setComments] = useState([]);
  const [fullText, setFullText] = useState(false);
  const [buttonShow, setButtonShow] = useState(false);
  const [picker, setPicker] = useState(false);
  const [pendingAction, setPendingAction] = useState("");

  const auth_user = useRef();
  const textRef = useRef("");
  const post = props.post;
  const user = props.user;
  const isAuthenticated =
    props.isAuthenticated ?? Boolean(user?.name);
  const navigate = useNavigate();
  const location = useLocation();
  console.log("initial data is ", post, user);

  useEffect(() => {
    auth_user.current = user?.name || "";
  }, [user]);

  const requireAuth = (sessionExpired = false) => {
    Swal.fire({
      icon: "info",
      title: sessionExpired ? "Session expired" : "Sign in to continue",
      text: sessionExpired
        ? "Please sign in again to continue."
        : "You need an account to interact with posts.",
      confirmButtonText: "Go to login",
    }).then(() => {
      navigate("/login", {
        state: {
          from: `${location.pathname}${location.search}${location.hash}`,
        },
      });
    });
  };

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
    } // eslint-disable-next-line
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

  const runPostAction = async (action, request, onSuccess) => {
    if (!isAuthenticated) {
      requireAuth();
      return;
    }

    setPendingAction(action);
    try {
      const data = await request();
      if (data.status === 200) {
        onSuccess(data);
      }
    } catch (error) {
      if (error.status === 401) {
        requireAuth(true);
        return;
      }
      Swal.fire({
        icon: "error",
        title: "Action failed",
        text: error.message || "Please try again.",
      });
    } finally {
      setPendingAction("");
    }
  };

  const handleDelete = async () => {
    const confirmation = await Swal.fire({
      icon: "warning",
      title: "Delete this post?",
      text: "This action cannot be undone.",
      showCancelButton: true,
      confirmButtonText: "Delete",
      confirmButtonColor: "#c2413b",
    });
    if (!confirmation.isConfirmed) return;

    runPostAction(
      "delete",
      () => postService.remove(post._id),
      () => props.setIndex?.(post._id),
    );
  };

  const handleFollow = () => {
    if (!isAuthenticated) {
      requireAuth();
      return;
    }
    runPostAction(
      "follow",
      () => postService.follow(post.user.name),
      () => {
        setFollowFlag((previous) => !previous);
        props.setFollow?.(post.user.name);
      },
    );
  };

  const handleSaved = () => {
    if (!isAuthenticated) {
      requireAuth();
      return;
    }
    runPostAction(
      "save",
      () => postService.save(post._id),
      () => setSaveFlag((previous) => !previous),
    );
  };

  const handleLiked = async () => {
    if (!isAuthenticated) {
      requireAuth();
      return;
    }
    await runPostAction(
      "like",
      () => postService.like(post._id),
      (data) => {
        setLikes(data.likes);
        setLikeFlag((previous) => !previous);
      },
    );
  };

  const handleComment = () => {
    if (!isAuthenticated) {
      requireAuth();
      return;
    }
    if (!post.commentable) {
      console.log("Comments are restricted");
      Swal.fire({
        icon: "warning",
        title: "Comments are turned off",
        showConfirmButton: false,
      });
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
    if (textRef.current) {
      handleText();
    }
    window.addEventListener("resize", handleText);
    return () => {
      window.removeEventListener("resize", handleText);
    };
  }, []);

  const handleImage = () => {
    Swal.fire({
      html: `<img src=${post.user.photo} alt=${post.user.name}  style="max-width: 100%; height: auto;" />`,
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

  const handleShare = async () => {
    const shareData = {
      title: post.topic || "SocialSphere post",
      text: post.text || "View this post on SocialSphere",
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(shareData.url);
        Swal.fire({
          icon: "success",
          title: "Link copied",
          timer: 1400,
          showConfirmButton: false,
        });
      }
    } catch (error) {
      if (error.name !== "AbortError") {
        Swal.fire({
          icon: "error",
          title: "Unable to share",
          text: "Please try again.",
        });
      }
    }
  };

  return (
    <div className={styles.Post}>
      <div className={styles.postheader}>
        <div>
          {post.user.photo ? (
            <img
              src={post.user.photo}
              alt={post.user.name}
              onClick={handleImage}
            />
          ) : (
            <AccountCircle />
          )}
          <p>{post.user.name}</p>
        </div>

        {button === "Follow" && (
          <button onClick={handleFollow} disabled={pendingAction === "follow"}>
            {followflag ? "Following" : "Follow"}
          </button>
        )}
        {button === "Delete" && (
          <button
            className={styles.deleteButton}
            onClick={handleDelete}
            disabled={pendingAction === "delete"}
          >
            {pendingAction === "delete" ? "Deleting..." : "Delete"}
          </button>
        )}
      </div>
      <div className={styles.image}>
        <img src={post.photo} alt="post" />
      </div>
      {!post.topic && !post.description ? (
        ""
      ) : (
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
      )}
      <div
        className={styles.postfooter}
        style={{ borderRadius: commentClick ? "0" : "" }}
      >
        <button
          className={likeflag ? styles.activeAction : ""}
          onClick={handleLiked}
          disabled={pendingAction === "like"}
          aria-label={likeflag ? "Unlike post" : "Like post"}
          title={likeflag ? "Unlike" : "Like"}
        >
          {likeflag ? (
            <ThumbUpSharp />
          ) : (
            <ThumbUpOutlinedIcon />
          )}
        </button>
        <button onClick={handleComment} aria-label="Comment on post" title="Comment">
          <ChatRounded />
        </button>
        <button
          className={saveflag ? styles.activeAction : ""}
          onClick={handleSaved}
          disabled={pendingAction === "save"}
          aria-label={saveflag ? "Remove saved post" : "Save post"}
          title={saveflag ? "Remove from saved" : "Save"}
        >
          {saveflag ? (
            <BookmarkOutlined />
          ) : (
            <BookmarkBorderOutlinedIcon />
          )}
        </button>
        <button onClick={handleShare} aria-label="Share post" title="Share">
          <ShareOutlinedIcon />
        </button>
        <p aria-live="polite">{likes !== null ? likes : post.likes} likes</p>
        {picker && (
          <div className={styles.Picker}>
            <EmojiPicker height={400} width={400} onEmojiClick={onEmojiClick} />
          </div>
        )}
      </div>

      {commentClick && post.commentable === true ? (
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
              <div
                className={styles.comment}
                key={comment._id || `${comment.sender}-${comment.comment}`}
              >
                {user.photo ? <img src={user.photo} alt="" /> : <AccountCircle />}
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
      ) : (
        <></>
      )}
    </div>
  );
}
