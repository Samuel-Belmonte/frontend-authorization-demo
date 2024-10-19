import { useState } from "react";

import { Routes, Route, Navigate, useNavigate } from "react-router-dom";
import Ducks from "./Ducks";
import Login from "./Login";
import MyProfile from "./MyProfile";
import Register from "./Register";
import "./styles/App.css";
import ProtectedRoute from "./ProtectedRoute";
import * as auth from "../utils/auth";
import { setToken, getToken } from "../utils/token";
import * as api from "../utils/api";

function App() {
  const [userData, setUserData] = useState({ username: "", email: "" });
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const navigate = useNavigate();

  const location = useLocation();

  const handleRegistration = ({
    username,
    email,
    password,
    confirmPassword,
  }) => {
    if (password === confirmPassword) {
      auth
        .register(username, password, email)
        .then(() => {
          navigate("/login");
        })
        .catch(console.error);
    }
  };

  // handleLogin accepts one parameter: an object with two properties.
  const handleLogin = ({ username, password }) => {
    // If username or password empty, return without sending a request.
    if (!username || !password) {
      return;
    }

    // We pass the username and password as positional arguments. The
    // authorize function is set up to rename `username` to `identifier`
    // before sending a request to the server, because that is what the
    // API is expecting.
    auth
      .authorize(username, password)
      .then((data) => {
        // For now we just log the response data to the console.
        // We'll update this soon.
        if (data.jwt) {
          setToken(data.jwt);
          setUserData(data.user);
          setIsLoggedIn(true);

          const redirectPath = location.state?.from?.pathname || "/ducks";

          navigate(redirectPath);
        }
      })
      .catch(console.error);
  };

  useEffect(() => {
    const jwt = getToken();

    if (!jwt) {
      return;
    }
    api
      .getUserInfo(jwt)
      .then(({ username, email }) => {
        setIsLoggedIn(true);
        setUserData({ username, email });
      })
      .catch(console.error);
  }, []);

  return (
    <Routes>
      <Route
        path="/ducks"
        element={
          <ProtectedRoute isLoggedIn={isLoggedIn}>
            <Ducks />
          </ProtectedRoute>
        }
      />
      <Route
        path="/my-profile"
        element={
          <ProtectedRoute isLoggedIn={isLoggedIn}>
            <MyProfile userData={userData} />
          </ProtectedRoute>
        }
      />
      <Route
        path="/login"
        element={
          <ProtectedRoute isLoggedIn={isLoggedIn} anonymous>
            {" "}
            <div className="loginContainer">
              <Login handleLogin={handleLogin} />
            </div>
          </ProtectedRoute>
        }
      />
      <Route
        path="/register"
        element={
          <ProtectedRoute isLoggedIn={isLoggedIn} anonymous>
            <div className="registerContainer">
              <Register handleRegistration={handleRegistration} />
            </div>
          </ProtectedRoute>
        }
      />
      <Route
        path="*"
        element={
          isLoggedIn ? (
            <Navigate to="/ducks" replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />
    </Routes>
  );
}

export default App;
