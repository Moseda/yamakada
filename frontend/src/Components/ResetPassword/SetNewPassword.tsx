import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Container,
  Form,
  Button,
  Alert,
  Card,
  Spinner,
  Col,
  Row,
} from "react-bootstrap";

const apiUrl = import.meta.env.VITE_API_URL;

interface FormErrors {
  password?: string;
  confirmPassword?: string;
}

const ResetPasswordPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isVerifying, setIsVerifying] = useState(true);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tokenValid, setTokenValid] = useState(false);
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  // Verify token on component mount
  useEffect(() => {
    const verifyToken = async () => {
      try {
        const response = await axios.get(`${apiUrl}/reset-password/${token}`);
        if (response.data.valid) {
          setTokenValid(true);
        } else {
          console.log({ message, error, isLoading });

          setError("Password reset link is invalid or has expired.");
        }
      } catch (err) {
        console.log({ message, error, isLoading });

        setError("Password reset link is invalid or has expired.");
      } finally {
        setIsVerifying(false);
      }
    };

    if (token) {
      verifyToken();
    } else {
      setError("No reset token provided.");
      setIsVerifying(false);
    }
  }, [token]);

  const validateForm = (): boolean => {
    const errors: FormErrors = {};
    let isValid = true;

    if (password.length < 8) {
      errors.password = "Password must be at least 8 characters";
      isValid = false;
    }

    // Check for at least one uppercase letter, one lowercase letter, and one number
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    //const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (!(hasUppercase && hasLowercase && hasNumber)) {
      errors.password =
        "Password must include uppercase, lowercase, and number";
      isValid = false;
    }

    if (password !== confirmPassword) {
      errors.confirmPassword = "Passwords don't match";
      isValid = false;
    }

    setFormErrors(errors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setMessage(null);
    setError(null);

    try {
      const response = await axios.post(`${apiUrl}/complete-reset-password`, {
        token,
        password,
      });

      setMessage(response.data.message || "Password successfully reset!");

      // Clear form
      setPassword("");
      setConfirmPassword("");

      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate("/");
      }, 3000);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
          "Failed to reset password. Please try again."
      );
    } finally {
      setIsLoading(false);
    }
  };

  if (isVerifying) {
    return (
      <Container
        className="d-flex justify-content-center align-items-center"
        style={{ minHeight: "80vh" }}
      >
        <div className="text-center">
          <Spinner animation="border" variant="primary" />
          <p className="mt-3">Verifying reset link...</p>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={6} lg={5}>
          <Card className="shadow-sm">
            <Card.Header className="bg-primary text-white text-center py-3">
              <h3 className="mb-0">Reset Your Password</h3>
            </Card.Header>
            <Card.Body className="p-4">
              {error && <Alert variant="danger">{error}</Alert>}

              {message && (
                <Alert variant="success">
                  {message}
                  <div className="mt-2">
                    <small>Redirecting to login page...</small>
                  </div>
                </Alert>
              )}

              {tokenValid && !message && (
                <>
                  <p className="text-muted mb-4">
                    Please enter your new password below.
                  </p>

                  <Form onSubmit={handleSubmit}>
                    <Form.Group className="mb-3">
                      <Form.Label>New Password</Form.Label>
                      <Form.Control
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        isInvalid={!!formErrors.password}
                        disabled={isLoading}
                      />
                      <Form.Control.Feedback type="invalid">
                        {formErrors.password}
                      </Form.Control.Feedback>
                      <Form.Text className="text-muted">
                        Password must be at least 8 characters and include
                        uppercase, lowercase, and numbers.
                      </Form.Text>
                    </Form.Group>

                    <Form.Group className="mb-4">
                      <Form.Label>Confirm Password</Form.Label>
                      <Form.Control
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        isInvalid={!!formErrors.confirmPassword}
                        disabled={isLoading}
                      />
                      <Form.Control.Feedback type="invalid">
                        {formErrors.confirmPassword}
                      </Form.Control.Feedback>
                    </Form.Group>

                    <Button
                      variant="primary"
                      type="submit"
                      className="w-100"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <Spinner
                            as="span"
                            animation="border"
                            size="sm"
                            role="status"
                            aria-hidden="true"
                            className="me-2"
                          />
                          Resetting Password...
                        </>
                      ) : (
                        "Reset Password"
                      )}
                    </Button>
                  </Form>
                </>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default ResetPasswordPage;
