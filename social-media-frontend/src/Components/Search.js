import { useState } from "react";
import styles from "./Search.module.css";
import { useNavigate, useLocation } from "react-router-dom";
import { backendUrl } from "../Utils/backendUrl";
import SearchIcon from "@mui/icons-material/Search";

export default function Search() {
  const [input, setInput] = useState({ name: "" });
  const [users, setUsers] = useState([]);
  const [found, setFound] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

  const handleInput = (e) => {
    setInput({ ...input, name: e.target.value });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    console.log("hi");
    console.log("Handling Search...");
    fetch(`${backendUrl}/api/user/search`, {
      method: "POST",
      body: JSON.stringify(input),
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
          setUsers(data.search_users);
          if (data.search_users.length === 0) {
            setFound(false);
          }
          console.log("Search Successful");
        } else if (!data.login) {
          navigate("/signup");
        }
      })
      .catch((err) => console.log("Error during fetch: ", err));
  };

  const navigateto = (user) => {
    console.log("Location", location.state);
    if (location.state === "chat") {
      navigate("/chat", { state: user.name });
    } else {
      navigate(`/user/${user._id}`);
    }
  };

  return (
    <div className={styles.Search}>
      <div className={styles.searchbar}>
        <div className={styles.searchinput}>
          <input
            type="text"
            name="input"
            value={input.name}
            placeholder="Search here..."
            onChange={handleInput}
          />
        </div>
        <div className={styles.searchIcon} onClick={handleSearch}>
          <SearchIcon />
        </div>
      </div>
      <div className={styles.searchnames}>
        {users.length !== 0 ? (
          users.map((user) => (
            <div className={styles.searchname} key={user._id}>
              <img src={user.photo} alt="" />
              <p onClick={() => navigateto(user)}>{user.name}</p>
            </div>
          ))
        ) : (
          <>
            {!found && (
              <div className={styles.searchname}>
                <p>No Match Found</p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
