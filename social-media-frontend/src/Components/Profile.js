import styles from "./Profile.module.css";
import user from "../images/user.jpg";
import { useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import Post from "./Post";
import ListPage from "./ListPage";

export default function Profile() {
  const [use, setUse] = useState({});
  const [posts, setPosts] = useState([]);
  const [clicked, setClicked] = useState(false);
  const [clickedtype, setClickeddType] = useState(null);
  const navigate = useNavigate();

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
    fetch("http://localhost:8000/api/user/profile", {
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

    fetch("http://localhost:8000/api/post/signedUserPosts", {
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
  }, []);

  console.log(posts);

  return (
    <>
      {clicked && (
        <ListPage
          list={clickedtype}
          clicked={clicked}
          setClicked={setClicked}
        />
      )}
      <div className={styles.Profile}>
        {/* <div> */}
        <img src={use.photo} alt={user} />
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
        <button onClick={() => navigate("/addPost")}>New Post</button>
        {/* </div> */}
        <p ref={postsRef}>Posts</p>
        {posts &&
          posts.map((post) => <Post key={post._id} post={post} user={use} />)}
      </div>
    </>
  );
}
