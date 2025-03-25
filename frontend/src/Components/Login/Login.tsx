import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import video from "../../LoginAssets/video.mp4";
import MimucoLogo from "../../LoginAssets/MimucoLogo.png";
import { Link, useNavigate } from "react-router-dom";
import { FaUser } from "react-icons/fa";
import { IoKey } from "react-icons/io5";
import Axios from "axios";

const Login = () => {
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const navigateTo = useNavigate();

  //login status
  const [loginStatus, setLoginStatus] = useState("");
  const [statusHolder, setStatusHolder] = useState("message");

  //check if either of the fields are empty
  const validateForm = () => {
    interface Errors {
      username?: string;
      password?: string;
    }

    const errors: Errors = {};
    if (!loginUsername.trim()) errors.username = "Username is required";
    if (!loginPassword) errors.password = "Password is required";
    return errors;
  };

  //for the onClick to get what the user typed
  const loginUser = (
    e: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();

    const errors = validateForm();

    if (Object.keys(errors).length > 0) {
      setLoginStatus(Object.values(errors)[0]);
      setStatusHolder("show");
      return;
    }

    //check if both are missing (just for the status to be distinct)
    if (loginUsername === "" || loginPassword === "") {
      setLoginStatus("Username and password are required");
      return;
    }

    Axios.post("http://localhost:3002/login", {
      loginUsername: loginUsername,
      loginPassword: loginPassword,
    })
      .then((response) => {
        if (response.data.success) {
          // Store the token
          localStorage.setItem("token", response.data.token);
          navigateTo("/dashboard");
        } else {
          // Handle error messages from the server
          setLoginStatus(response.data.message || "Login failed");
          setStatusHolder("show");
        }
      })
      .catch((error) => {
        // Handle network or server errors
        setLoginStatus(
          error.response?.data?.message || "Server error. Please try again."
        );
        setStatusHolder("show");
      });
  };

  useEffect(() => {
    if (loginStatus !== "") {
      setStatusHolder("show"); //show message
      setTimeout(() => {
        setStatusHolder("message"); // hide it
      }, 4000);
    }
  }, [loginStatus]);

  useEffect(() => {
    // Check if user was redirected after email verification
    const urlParams = new URLSearchParams(window.location.search);
    const verified = urlParams.get("verified");

    if (verified === "true") {
      setLoginStatus("Email verified successfully! You can now log in.");
      setStatusHolder("show");
    }
  }, []);

  const onSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    loginUser(e);
  };

  return (
    <div className="d-flex vh-100">
      <div className="container-fluid d-flex">
        {/* Left Section: Video and Text */}
        <div className="col-md-6 position-relative">
          <video
            src={video}
            autoPlay
            muted
            loop
            className="w-100 h-100 object-fit-cover"
          ></video>
          <div className="position-absolute top-50 start-50 translate-middle text-white text-center">
            <h2 className="fw-bold mb-3">
              Daten automatisch mit Ihren Hauptsystem synchronisieren und
              effizient an mehrere Zielsysteme verteilen.
            </h2>
            <p>Nahtlose Integration mit Datensystemen</p>
          </div>
          <div className="position-absolute bottom-0 start-50 translate-middle-x text-white text-center mb-3">
            <span>Noch keinen Account?</span>
            <Link to={"register"} className="btn btn-primary ms-2">
              Sign up
            </Link>
          </div>
        </div>

        {/* Right Section: Form */}
        <div className="col-md-6 d-flex flex-column justify-content-center align-items-center bg-light">
          {/* Header */}
          <div className="text-center mb-4">
            <img
              src={MimucoLogo}
              alt="Logo"
              className="mb-3"
              style={{ width: "150px" }}
            />
            <h3>Welcome Back!</h3>
          </div>

          {/* Form */}
          <form className="w-75" onSubmit={onSubmit}>
            <div className="mb-3" style={{ textAlign: "center" }}>
              <span
                className={`alert alert-info alert-dismissible fade ${statusHolder}`}
                role="alert"
              >
                {loginStatus}
              </span>
            </div>

            {/* Username Input */}
            <div className="mb-3">
              <label htmlFor="username" className="form-label">
                Username
              </label>
              <div className="input-group">
                <span className="input-group-text">
                  <FaUser />
                </span>
                <input
                  type="text"
                  id="username"
                  placeholder="Enter Username"
                  className="form-control"
                  onChange={(event) => {
                    setLoginUsername(event.target.value);
                  }}
                />
              </div>
            </div>

            <div className="mb-3">
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <div className="input-group">
                <span className="input-group-text">
                  <IoKey />
                </span>
                <input
                  type="password"
                  id="password"
                  placeholder="Enter Password"
                  className="form-control"
                  onChange={(event) => {
                    setLoginPassword(event.target.value);
                  }}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-primary w-100"
              onClick={loginUser}
            >
              Login
            </button>

            {/*forgot password*/}
            <span className="forgotPassword">
              <a href="">Forgot password?</a>
            </span>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
