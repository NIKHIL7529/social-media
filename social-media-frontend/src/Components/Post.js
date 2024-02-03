import styles from "./Post.module.css";
import ThumbUpOutlinedIcon from "@mui/icons-material/ThumbUpOutlined";
import BookmarkBorderOutlinedIcon from "@mui/icons-material/BookmarkBorderOutlined";
import ShareOutlinedIcon from "@mui/icons-material/ShareOutlined";
import { useEffect, useState } from "react";
import { BookmarkOutlined, ThumbUpSharp } from "@mui/icons-material";
// import postih from "../images/post.jpg";

export default function Post({ post, user }) {
  const [likes, setLikes] = useState(null);
  const [likeflag, setLikeFlag] = useState(false);
  const [saveflag, setSaveFlag] = useState(false);
  const [followflag, setFollowFlag] = useState(false);
  const [button, setButton] = useState("");

  console.log("initial data is ", post, user);

  useEffect(() => {
    if (user.name === post.user.name) {
      setButton("Delete");
    } else {
      setButton("Follow");
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
    fetch("http://localhost:8000/api/post/deletePost", {
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
          // document.window.reload();
        }
      });
  };

  const handleFollow = () => {
    fetch("http://localhost:8000/api/user/follow", {
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
          console.log(data.user);
          // setUse(data.user);
          console.log("Search Successful");
          setFollowFlag((prevFollowFlag) => !prevFollowFlag);
          // document.window.reload();
        } else {
          return;
        }
      })
      .catch((err) => console.log("Error during fetch: ", err));
  };

  const handleSaved = () => {
    fetch("http://localhost:8000/api/post/saved", {
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
    await fetch("http://localhost:8000/api/post/liked", {
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

  return (
    <div className={styles.Post}>
      <h3>
        {post.user.name}

        {button === "Follow" && (
          <button onClick={handleFollow}>
            {followflag ? "Following" : "Follow"}
          </button>
        )}
        {button === "Delete" && <button onClick={handleDelete}>Delete</button>}
      </h3>
      <h4>{post.topic}</h4>
      <span>{post.text}</span>
      <div>
        <img src={post.photo} alt="post" />
      </div>
      {likes !== null ? likes : post.likes}
      <button onClick={handleLiked}>
        {likeflag ? <ThumbUpSharp /> : <ThumbUpOutlinedIcon />}
      </button>
      <button onClick={handleSaved}>
        {saveflag ? <BookmarkOutlined /> : <BookmarkBorderOutlinedIcon />}
      </button>
      <ShareOutlinedIcon />
    </div>
  );
}
