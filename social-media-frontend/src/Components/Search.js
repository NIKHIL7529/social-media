import { useState } from "react";
import styles from "./Search.module.css";
import { useNavigate } from "react-router-dom";

export default function Search() {
  const [input, setInput] = useState({ name: "" });
  const [users, setUsers] = useState([]);
  const navigate = useNavigate();

  const handleInput = (e) => {
    setInput({ ...input, name: e.target.value });
  };

  const handleSearch = (e) => {
    e.preventDefault();
    console.log("hi");
    console.log("Handling Search...");
    fetch("http://localhost:8000/api/user/search", {
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
          console.log("Search Successful");
        } else if (!data.login) {
          navigate("/signup");
        }
      })
      .catch((err) => console.log("Error during fetch: ", err));
  };

  return (
    <div className={styles.Search}>
      <input
        type="text"
        name="input"
        value={input.name}
        placeholder="Search here..."
        onChange={handleInput}
      />
      <button onClick={handleSearch}>Submit</button>
      <p>
        {users && users.map((user) => (
          <li key={user._id} onClick={() => navigate(`/user/${user._id}`)}>
            {user.name}
          </li>
        ))}
      </p>
    </div>
  );
}
