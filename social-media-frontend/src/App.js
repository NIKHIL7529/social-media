import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import NavBar from "./Components/NavBar";
import Home from "./Components/Home";
import Posts from "./Components/Posts";
import Search from "./Components/Search";
import Profile from "./Components/Profile";
import Settings from "./Components/Settings";
import SideBar from "./Components/SideBar";
import Signup from "./Components/Signup";
import Login from "./Components/Login";
import AddPost from "./Components/AddPost";
import User from "./Components/User";
import Chat from "./Components/Chat";

function App() {
  return (
    <Router>
      <NavBar />
      <SideBar />
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/Home" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/user/:id" element={<User />} />
        <Route path="/addPost" element={<AddPost />} />
        <Route path="/search" element={<Search />} />
        <Route path="/chat" element={<Chat />} />
        <Route path="/posts" element={<Posts />} />
        <Route path="/settings" element={<Settings />} />

        {/* Redirect to "/login" if no matching route is found */}
        <Route path="/*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
}

export default App;
