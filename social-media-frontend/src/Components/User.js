import styles from "./User.module.css";
import pic from "../images/user.jpg";
import { useNavigate, useParams } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import Post from "./Post";
import ListPage from "./ListPage";

export default function User() {
  const [use, setUse] = useState({});
  const [user, setUser] = useState({});
  const [posts, setPosts] = useState([]);
  const [clicked, setClicked] = useState(false);
  const [clickedtype, setClickeddType] = useState(null);
  const navigate = useNavigate();
  const { id } = useParams();

  const postsRef = useRef(null);

  const handleClick = (type) => {
    console.log(type);
    const clicktype = type;
    if (clickedtype === clicktype) {
      setClicked((prevClick) => !prevClick);
    } else {
      setClickeddType(type);
      setClicked(true);
    }
  };

  const handlePostsClick = () => {
    if (postsRef.current) {
      postsRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    fetch("https://social-media-backend-d246.onrender.com/api/user/profile", {
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
          setUser(data.user);
          console.log("Search Successful");
        }
      })
      .catch((err) => console.log("Error during fetch: ", err));

    fetch("https://social-media-backend-d246.onrender.com/api/user/user", {
      method: "POST",
      body: JSON.stringify({ _id: id }),
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
          setUse(data.user);
          console.log("Search Successful");
        }
      })
      .catch((err) => console.log("Error during fetch: ", err));

    fetch("https://social-media-backend-d246.onrender.com/api/post/userPosts", {
      method: "POST",
      body: JSON.stringify({ _id: id }),
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
          console.log(data.post);
          setPosts(data.post);
          console.log("Search Successful");
        }
      })
      .catch((err) => console.log("Error during fetch: ", err));
  }, [id]);

  const handleFollow = () => {
    fetch("https://social-media-backend-d246.onrender.com/api/user/follow", {
      method: "POST",
      body: JSON.stringify({ userName: use.name }),
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
          setUse(data.user);
          console.log("Search Successful");
        } else {
          return;
        }
      })
      .catch((err) => console.log("Error during fetch: ", err));
  };

  return (
    <>
      {clicked && (
        <ListPage
          list={clickedtype}
          clicked={clicked}
          setClicked={setClicked}
        />
      )}
      <div className={styles.User}>
        <div>
          <img src={use.photo && use.photo} alt={pic} />

          <h3>{use.name}</h3>
          <span>{use.description}</span>
          <ul>
            <li onClick={() => handleClick(use.followers)}>
              {use.followers && use.followers.length} Followers
            </li>
            <li onClick={() => handleClick(use.followings)}>
              {use.followings && use.followings.length} Following
            </li>
            <li onClick={handlePostsClick}>{posts && posts.length} Posts</li>
          </ul>
          <button onClick={handleFollow}>Follow</button>
          <button onClick={() => navigate("/chat", { state: use.name })}>
            Message
          </button>
        </div>
        <p ref={postsRef}>Posts</p>
        {posts &&
          posts.map((post) => <Post key={post._id} post={post} user={user} />)}
      </div>
    </>
  );
}
