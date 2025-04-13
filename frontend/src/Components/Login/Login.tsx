import React, { useEffect, useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import video from "../../LoginAssets/video.mp4";
import MimucoLogo from "../../LoginAssets/Mimuco_4.png";
import { Link, useNavigate } from "react-router-dom";
import { FaUser } from "react-icons/fa";
import { IoKey } from "react-icons/io5";
import api from "../../utils/api";

const Login = () => {
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [isUnverified, setIsUnverified] = useState(false);
  const [isResendingVerification, setIsResendingVerification] = useState(false);

  const navigateTo = useNavigate();

  const [loginStatus, setLoginStatus] = useState("");
  const [statusHolder, setStatusHolder] = useState("message");

  const [alertType, setAlertType] = useState("info");

  const validateForm = () => {
    const errors: { email?: string; password?: string } = {};
    if (!loginEmail.trim()) errors.email = "Email is required";
    if (!loginPassword) errors.password = "Password is required";
    return errors;
  };

  const loginUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsUnverified(false); // Reset unverified state on new login attempt

    const errors = validateForm();

    if (Object.keys(errors).length > 0) {
      setLoginStatus(Object.values(errors)[0] || "");
      setStatusHolder("show");
      return;
    }

    try {
      const response = await api.post("/login", {
        loginEmail,
        loginPassword,
      });

      if (response.data.success) {
        setAlertType("succes");
        setLoginStatus("Login succesful! Redirecting...");
        setStatusHolder("show");
        localStorage.setItem("accessToken", response.data.token);
        localStorage.setItem("refreshToken", response.data.refreshToken);
        setTimeout(() => {
          navigateTo("/dashboard"), 1000;
        });
      } else {
        setAlertType("danger");
        setLoginStatus(response.data.message || "Login failed");
        setStatusHolder("show");
      }
    } catch (error: any) {
      // hadle 401 not authorized
      setAlertType("danger");

      if (error.response?.status === 401) {
        setLoginStatus(error.response?.data?.message || "Invalid credentials");
      }

      // Check if this is a "not verified" aka 403 (hadi li 9wdatha 3lik f refresh) error
      if (error.response?.status === 403 && error.response?.data?.unverified) {
        setIsUnverified(true);
        setLoginStatus(
          "Account not verified. Please verify your email to continue."
        );
      } else {
        setLoginStatus(
          error.response?.data?.message || "Server error. Please try again."
        );
      }
      setStatusHolder("show");
    }
  };

  const resendVerificationEmail = async (e: React.MouseEvent) => {
    e.preventDefault();
    setIsResendingVerification(true);

    try {
      const response = await api.post("/resend-verification", {
        email: loginEmail,
      });

      setAlertType("succes");
      setLoginStatus("Verification email sent! Please check your inbox.");
      setStatusHolder("show");
      setIsUnverified(false); // Hide resend button after successful send
    } catch (error: any) {
      setAlertType("danger");
      setLoginStatus(
        error.response?.data?.message ||
          "Failed to send verification email. Please try again."
      );
      setStatusHolder("show");
    } finally {
      setIsResendingVerification(false);
    }
  };

  useEffect(() => {
    if (loginStatus !== "") {
      setStatusHolder("show");
      const timer = setTimeout(() => {
        setStatusHolder("message");
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [loginStatus]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const verified = urlParams.get("verified");

    if (verified === "true") {
      setAlertType("succes");
      setLoginStatus("Email verified successfully! You can now log in.");
      setStatusHolder("show");
    }
  }, []);

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
            {loginStatus && (
              <div className="mb-3 d-flex justify-content-center">
                <div
                  className={`alert alert-${alertType} alert-dismissible fade ${statusHolder}`}
                  role="alert"
                  style={{
                    display: "inline-block",
                    maxWidth: "100%",
                    textAlign: "center",
                    margin: "0 auto",
                    paddingRight: "1rem",
                    paddingLeft: "1rem",
                  }}
                >
                  {loginStatus}
                </div>
              </div>
            )}

            {/* email Input */}
            <div className="mb-3">
              <label htmlFor="email" className="form-label">
                Email
              </label>
              <div className="input-group">
                <span className="input-group-text">
                  <FaUser />
                </span>
                <input
                  type="text"
                  id="email"
                  placeholder="Enter Email"
                  className="form-control"
                  onChange={(event) => {
                    setLoginEmail(event.target.value);
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
                  autoComplete="current-password"
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

            {/* Resend Verification Email Button - Only shows when needed */}
            {isUnverified && (
              <button
                className="btn btn-outline-primary w-100 mt-2"
                onClick={resendVerificationEmail}
                disabled={isResendingVerification}
              >
                {isResendingVerification
                  ? "Sending..."
                  : "Resend Verification Email"}
              </button>
            )}

            {/*forgot password*/}
            <div className="mt-3">
              <a href="/forgot-password">Forgot password?</a>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
