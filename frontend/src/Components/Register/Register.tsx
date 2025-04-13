const apiUrl = import.meta.env.VITE_API_URL;
import { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import video from "../../LoginAssets/video.mp4";
import MimucoLogo from "../../LoginAssets/mimuco_4.png";
import { Link, useNavigate } from "react-router-dom";
import { FaEnvelope } from "react-icons/fa";
import { IoKey } from "react-icons/io5";
import Axios from "axios";

const Register = () => {
  // State for form inputs
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  //redirecting func
  const navigateTo = useNavigate();

  // State for error and success messages
  const [registerStatus, setRegisterStatus] = useState("");
  const [passwordErrors, setPasswordErrors] = useState<String[]>([]);
  const [confirmPasswordError, setConfirmPasswordError] = useState("");
  const [emailErrors, setEmailErrors] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  //State for validity of flieds
  const [isEmailValid, setIsEmailValid] = useState(true);
  const [isPasswordValid, setIsPasswordValid] = useState(true);
  const [isConfirmPasswordValid, setIsConfirmPasswordValid] = useState(true);

  //validate email regex
  const validateEmail = (email: string): string[] => {
    const errors: string[] = [];
    if (!email.includes("@")) {
      errors.push("Email must contain an @ sign");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.push("Invalid email");
    }
    return errors;
  };

  // Validate password regex
  const validatePassword = (password: string) => {
    const errors = [];
    if (password.length < 8)
      errors.push("Password must be at least 8 characters");
    if (!/[A-Z]/.test(password))
      errors.push("Password must contain an uppercase letter");
    if (!/[a-z]/.test(password))
      errors.push("Password must contain a lowercase letter");
    if (!/[0-9]/.test(password)) errors.push("Password must contain a number");
    return errors;
  };

  const createUser = (e: { preventDefault: () => void }) => {
    e.preventDefault();

    // Clear previous statuses
    setRegisterStatus("");
    setPasswordErrors([]);
    setConfirmPasswordError("");

    // Check if all fields are filled
    if (!email || !password || !confirmPassword) {
      setRegisterStatus("All fields are required");
      //check validity
      setIsEmailValid(!!email);
      setIsPasswordValid(!!password);
      setIsConfirmPasswordValid(!!confirmPassword);

      return;
    }

    //validate Email
    const emailValidationErrors = validateEmail(email);
    if (emailValidationErrors.length > 0) {
      setEmailErrors(emailValidationErrors);
      setIsEmailValid(false);
      return;
    }

    // Validate password
    const errors: String[] = validatePassword(password);
    if (errors.length > 0) {
      setPasswordErrors(errors);
      setIsPasswordValid(false);
      return;
    }

    // Validate confirm password
    if (password !== confirmPassword) {
      setConfirmPasswordError("Passwords do not match");
      setIsConfirmPasswordValid(false);
      return;
    }

    setIsSubmitting(true);
    // API request using Axios
    Axios.post(`${apiUrl}/register`, {
      Email: email,
      Password: password,
    })
      .then(() => {
        // Navigate to verification page with email information
        navigateTo("/email-verification", { state: { email } });
      })
      .catch((error) => {
        setRegisterStatus(
          error.response?.data?.message || "Registration failed"
        );
        setIsSubmitting(false);
      });
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
              Registrieren Sie sich für nahtlose Datensynchronisation und
              -verteilung.
            </h2>
            <p>Optimieren Sie Ihre Datenmanagement-Prozesse</p>
          </div>
          <div className="position-absolute bottom-0 start-50 translate-middle-x text-white text-center mb-3">
            <span>Bereits ein Konto?</span>
            <Link to="/" className="btn btn-primary ms-2">
              Anmelden
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
            <h3>Erstellen Sie Ihr Konto</h3>
          </div>

          {/* Form */}
          <form className="w-75" onSubmit={createUser}>
            {registerStatus && (
              <div className="mb-3 d-flex justify-content-center">
                <div
                  className={`alert ${
                    registerStatus.includes("successful")
                      ? "alert-success"
                      : "alert-danger"
                  } mb-3`}
                  style={{
                    display: "inline-block",
                    maxWidth: "100%",
                    textAlign: "center",
                    margin: "0 auto",
                    paddingRight: "1rem",
                    paddingLeft: "1rem",
                  }}
                >
                  {registerStatus}
                </div>
              </div>
            )}

            {/* Email Input */}
            <div className="mb-3">
              <label htmlFor="email" className="form-label">
                E-Mail
              </label>
              <div className="input-group">
                <span className="input-group-text">
                  <FaEnvelope />
                </span>
                <input
                  type="email"
                  id="email"
                  placeholder="E-Mail eingeben"
                  className={`form-control ${
                    !isEmailValid ? "is-invalid" : ""
                  }`}
                  value={email}
                  onChange={(e) => {
                    const valEmail = e.target.value;
                    setEmail(valEmail);
                    const errors = validateEmail(valEmail);
                    setEmailErrors(errors);
                    setIsEmailValid(errors.length === 0);
                  }}
                  style={
                    !isEmailValid
                      ? {
                          borderColor: "rgba(230, 18, 21, 0.91)",
                          borderWidth: "2.5px",
                        }
                      : {}
                  }
                />
              </div>
              {emailErrors.length > 0 && (
                <div className="text-danger mt-1">
                  <ul>
                    {emailErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Password Input */}
            <div className="mb-3">
              <label htmlFor="password" className="form-label">
                Passwort
              </label>
              <div className="input-group">
                <span className="input-group-text">
                  <IoKey />
                </span>
                <input
                  type="password"
                  id="password"
                  placeholder="Passwort eingeben"
                  autoComplete="new-password"
                  className={`form-control ${
                    !isPasswordValid ? "is-invalid" : ""
                  }`}
                  value={password}
                  onChange={(e) => {
                    const newPassword = e.target.value;
                    setPassword(newPassword);
                    setPasswordErrors(validatePassword(newPassword));
                    setIsPasswordValid(
                      validatePassword(newPassword).length === 0
                    );
                  }}
                  style={
                    !isPasswordValid
                      ? {
                          borderColor: "rgba(230, 18, 21, 0.91)",
                          borderWidth: "2.5px",
                        }
                      : {}
                  }
                />
              </div>
              {passwordErrors.length > 0 && (
                <div className="text-danger mt-1">
                  <ul>
                    {passwordErrors.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>

            {/* Confirm Password Input */}
            <div className="mb-3">
              <label htmlFor="confirmPassword" className="form-label">
                Passwort bestätigen
              </label>
              <div className="input-group">
                <span className="input-group-text">
                  <IoKey />
                </span>
                <input
                  type="password"
                  id="confirmPassword"
                  placeholder="Passwort bestätigen"
                  autoComplete="new-password"
                  className={`form-control ${
                    !isConfirmPasswordValid ? "is-invalid" : ""
                  }`}
                  value={confirmPassword}
                  onChange={(e) => {
                    const confirmPass = e.target.value;
                    setConfirmPassword(confirmPass);
                    if (confirmPass !== password) {
                      setConfirmPasswordError("Passwords do not match");
                      setIsConfirmPasswordValid(false);
                    } else {
                      setConfirmPasswordError("");
                      setIsConfirmPasswordValid(true);
                    }
                  }}
                  style={
                    !isConfirmPasswordValid
                      ? {
                          borderColor: "rgba(230, 18, 21, 0.91)",
                          borderWidth: "2.5px",
                        }
                      : {}
                  }
                />
              </div>
              {confirmPasswordError && (
                <div className="text-danger mt-1">{confirmPasswordError}</div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="btn btn-primary w-100"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span
                    className="spinner-border spinner-border-sm me-2"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  Verarbeitung...
                </>
              ) : (
                "Registrieren"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
