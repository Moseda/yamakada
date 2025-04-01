import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import video from "../../LoginAssets/video.mp4";
import MimucoLogo from "../../LoginAssets/MimucoLogo.png";
import { Link, useNavigate } from "react-router-dom";
import { FaUser } from "react-icons/fa";
import { IoKey } from "react-icons/io5";
import api from "../../utils/api";

const Login = () => {
  const [loginUsername, setLoginUsername] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  const navigateTo = useNavigate();

  const [loginStatus, setLoginStatus] = useState("");
  const [statusHolder, setStatusHolder] = useState("message");

  const validateForm = () => {
    const errors: { username?: string; password?: string } = {};
    if (!loginUsername.trim()) errors.username = "Username is required";
    if (!loginPassword) errors.password = "Password is required";
    return errors;
  };

  const loginUser = async (
    e: React.FormEvent<HTMLFormElement> | React.MouseEvent<HTMLButtonElement>
  ) => {
    e.preventDefault();

    const errors = validateForm();

    if (Object.keys(errors).length > 0) {
      setLoginStatus(Object.values(errors)[0] || "");
      setStatusHolder("show");
      return;
    }

    try {
      const response = await api.post("/login", {
        loginUsername,
        loginPassword,
      });

      if (response.data.success) {
        localStorage.setItem("accessToken", response.data.token);
        localStorage.setItem("refreshToken", response.data.refreshToken);
        navigateTo("/dashboard");
      } else {
        setLoginStatus(response.data.message || "Login failed");
        setStatusHolder("show");
      }
    } catch (error: any) {
      setLoginStatus(
        error.response?.data?.message || "Server error. Please try again."
      );
      setStatusHolder("show");
    }
  };

  useEffect(() => {
    if (loginStatus !== "") {
      setStatusHolder("show");
      const timer = setTimeout(() => {
        setStatusHolder("message");
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [loginStatus]);

  useEffect(() => {
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
          <form className="w-75" onSubmit={loginUser}>
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
            <button type="submit" className="btn btn-primary w-100">
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
