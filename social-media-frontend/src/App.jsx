import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  Outlet,
  useLocation,
} from "react-router";
import { useEffect, useState } from "react";
import "./App.css";

import NavBar from "./Components/NavBar";
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
import EditProfile from "./Components/EditProfile";
import UserContext from "./UserContext";
import SavedPosts from "./Components/SavedPosts";
import { backendUrl } from "./Utils/backendUrl";

function RequireAuth({ authChecked, isAuthenticated, children }) {
  const location = useLocation();

  if (!authChecked) {
    return null;
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: `${location.pathname}${location.search}${location.hash}`,
        }}
      />
    );
  }

  return children;
}

function AppLayout({ user, setUser, isAuthenticated }) {
  return (
    <UserContext.Provider value={user || {}}>
      <NavBar setUser={setUser} isAuthenticated={isAuthenticated} />
      <div className="appShell">
        <SideBar />
        <main className="appMain">
          <Outlet />
        </main>
      </div>
    </UserContext.Provider>
  );
}

function App() {
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);

  useEffect(() => {
    fetch(`${backendUrl}/api/user/profile`, {
      headers: {
        "Content-type": "application/json; charset=UTF-8",
      },
      withCredentials: true,
      credentials: "include",
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.status === 200) {
          setUser(data.user);
        } else {
          setUser(null);
        }
      })
      .catch(() => {
        setUser(null);
      })
      .finally(() => {
        setAuthChecked(true);
      });
  }, []);

  return (
    <Router>
      <Routes>
        <Route
          path="/login"
          element={
            <Login
              setUser={setUser}
              isAuthenticated={Boolean(user)}
              authChecked={authChecked}
            />
          }
        />
        <Route path="/signup" element={<Signup />} />
        <Route
          element={
            <AppLayout
              user={user}
              setUser={setUser}
              isAuthenticated={Boolean(user)}
            />
          }
        >
          <Route index element={<Navigate to="/posts" replace />} />
          <Route
            path="/posts"
            element={<Posts user={user} isAuthenticated={Boolean(user)} />}
          />
          <Route
            path="/user/:id"
            element={<User user={user} isAuthenticated={Boolean(user)} />}
          />
          <Route
            path="/profile"
            element={
              <RequireAuth
                authChecked={authChecked}
                isAuthenticated={Boolean(user)}
              >
                <Profile />
              </RequireAuth>
            }
          />
          <Route
            path="/addPost"
            element={
              <RequireAuth
                authChecked={authChecked}
                isAuthenticated={Boolean(user)}
              >
                <AddPost />
              </RequireAuth>
            }
          />
          <Route
            path="/search"
            element={<Search />}
          />
          <Route
            path="/chat"
            element={
              <RequireAuth
                authChecked={authChecked}
                isAuthenticated={Boolean(user)}
              >
                <Chat />
              </RequireAuth>
            }
          />
          <Route
            path="/chat/:id"
            element={
              <RequireAuth
                authChecked={authChecked}
                isAuthenticated={Boolean(user)}
              >
                <Chat />
              </RequireAuth>
            }
          />
          <Route
            path="/savedPosts"
            element={
              <RequireAuth
                authChecked={authChecked}
                isAuthenticated={Boolean(user)}
              >
                <SavedPosts />
              </RequireAuth>
            }
          />
          <Route
            path="/settings"
            element={<Settings setUser={setUser} isAuthenticated={Boolean(user)} />}
          />
          <Route
            path="/editProfile"
            element={
              <RequireAuth
                authChecked={authChecked}
                isAuthenticated={Boolean(user)}
              >
                <EditProfile />
              </RequireAuth>
            }
          />
          <Route path="*" element={<Navigate to="/posts" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
