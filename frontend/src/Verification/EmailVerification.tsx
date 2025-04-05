const apiUrl = import.meta.env.VITE_API_URL;

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import { Card, CardBody, CardTitle, CardText } from "reactstrap";
//import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
//import { faEnvelopeOpen } from '@fortawesome/free-solid-svg-icons';
import Axios from "axios";

const EmailVerification = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("Verifying your email...");

  useEffect(() => {
    Axios.get(`${process.env.API_URL}/verify/${token}`)
      .then(() => {
        setStatus("Email verified successfully! Redirecting to login...");
        setTimeout(() => navigate("/?verified=true"), 3000);
      })
      .catch((error) => {
        setStatus(
          error.response?.data?.message ||
            "Verification failed. Please try again or contact support."
        );
      });
  }, [token, navigate]);

  return (
    <div className="d-flex justify-content-center align-items-center vh-100">
      <Card style={{ width: "25rem" }}>
        <CardBody className="text-center">
          <CardTitle tag="h5">Email Verification</CardTitle>
          <CardText>{status}</CardText>
        </CardBody>
      </Card>
    </div>
  );
};

export default EmailVerification;
