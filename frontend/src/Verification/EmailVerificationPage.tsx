import { useState } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import MimucoLogo from "../LoginAssets/mimuco_4.png";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaEnvelope, FaCheckCircle } from "react-icons/fa";
import Axios from "axios";

const VerificationPage = () => {
  const location = useLocation();
  const navigateTo = useNavigate();
  const email = location.state?.email || "";
  const apiUrl = import.meta.env.VITE_API_URL;

  const [resendStatus, setResendStatus] = useState("");
  const [isResending, setIsResending] = useState(false);

  const handleResendEmail = () => {
    setIsResending(true);
    setResendStatus("");

    // API request to resend verification email
    Axios.post(`${apiUrl}/resend-verification`, { email })
      .then(() => {
        setResendStatus("Verification email has been resent successfully!");
        setIsResending(false);
      })
      .catch((error) => {
        setResendStatus(
          error.response?.data?.message ||
            "Failed to resend verification email. Please try again later."
        );
        setIsResending(false);
      });
  };

  return (
    <div className="d-flex vh-100 align-items-center justify-content-center bg-light">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6">
            <div className="card shadow">
              <div className="card-body p-5 text-center">
                <img
                  src={MimucoLogo}
                  alt="Logo"
                  className="mb-4"
                  style={{ width: "150px" }}
                />

                <div className="mb-4">
                  <FaCheckCircle className="text-success" size={50} />
                </div>

                <h3 className="mb-3">Bestätigen Sie Ihre E-Mail-Adresse</h3>

                <p className="mb-4">
                  Wir haben eine Bestätigungs-E-Mail an <strong>{email}</strong>{" "}
                  gesendet. Bitte klicken Sie auf den Link in der E-Mail, um Ihr
                  Konto zu aktivieren.
                </p>

                {resendStatus && (
                  <div
                    className={`alert ${
                      resendStatus.includes("successfully")
                        ? "alert-success"
                        : "alert-danger"
                    } mb-4`}
                  >
                    {resendStatus}
                  </div>
                )}

                <div className="d-grid gap-3">
                  <button
                    className="btn btn-outline-primary"
                    onClick={handleResendEmail}
                    disabled={isResending}
                  >
                    {isResending ? (
                      <>
                        <span
                          className="spinner-border spinner-border-sm me-2"
                          role="status"
                          aria-hidden="true"
                        ></span>
                        Senden...
                      </>
                    ) : (
                      "E-Mail erneut senden"
                    )}
                  </button>

                  <Link to="/" className="btn btn-primary">
                    Weiter zur Anmeldung
                  </Link>
                </div>
              </div>
            </div>

            <div className="text-center mt-3">
              <p>
                Benötigen Sie Hilfe?{" "}
                <a href="#" className="text-decoration-none">
                  Kontaktieren Sie uns
                </a>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerificationPage;
