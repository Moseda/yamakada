const apiUrl = import.meta.env.VITE_API_URL;

import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { Card, CardBody, CardTitle, CardText } from "reactstrap";
//import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
//import { faEnvelopeOpen } from '@fortawesome/free-solid-svg-icons';
import MimucoLogo from "../LoginAssets/mimuco_4.png";
import Axios from "axios";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";

const EmailVerification = () => {
  const { token } = useParams();
  const [verificationStatus, setVerificationStatus] =
    useState<string>("loading");
  const [message, setMessage] = useState<string>("");
  const apiUrl = import.meta.env.VITE_API_URL;

  useEffect(() => {
    if (token) {
      verifyEmail();
    } else {
      setVerificationStatus("error");
      setMessage("Invalid verification link");
    }
  }, [token]);

  const verifyEmail = async () => {
    try {
      const response = await Axios.get(`${apiUrl}/verify/${token}`);
      setVerificationStatus("success");
      setMessage(response.data.message || "Email verified successfully!");
    } catch (error: any) {
      setVerificationStatus("error");
      setMessage(
        error.response?.data?.message ||
          "Failed to verify email. The link may be invalid or expired."
      );
    }
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

                {verificationStatus === "loading" && (
                  <div className="mb-4">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <p className="mt-3">Verifying your email...</p>
                  </div>
                )}

                {verificationStatus === "success" && (
                  <>
                    <div className="mb-4">
                      <FaCheckCircle className="text-success" size={50} />
                    </div>
                    <h3 className="mb-3">Email Verified Successfully!</h3>
                    <p className="mb-4">{message}</p>
                    <div className="d-grid">
                      <Link to="/" className="btn btn-primary">
                        Proceed to Login
                      </Link>
                    </div>
                  </>
                )}

                {verificationStatus === "error" && (
                  <>
                    <div className="mb-4">
                      <FaTimesCircle className="text-danger" size={50} />
                    </div>
                    <h3 className="mb-3">Verification Failed</h3>
                    <p className="mb-4">{message}</p>
                    <div className="d-grid gap-3">
                      <Link
                        to="/verification"
                        className="btn btn-outline-primary"
                      >
                        Request New Verification
                      </Link>
                      <Link to="/" className="btn btn-primary">
                        Back to Login
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerification;
