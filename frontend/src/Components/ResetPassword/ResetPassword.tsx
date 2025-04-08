const apiUrl = import.meta.env.VITE_API_URL;

import { useState } from "react";
import axios from "axios";
import { Container, Form, Button, Alert } from "react-bootstrap";

const ResetPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false); // Add loading state

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setError(null);
    setIsLoading(true); // Start loading

    try {
      const response = await axios.post(`${apiUrl}/forgot-password`, { email });
      setMessage(response.data.message);
    } catch (err: any) {
      setError(err.response?.data?.message || "Something went wrong");
    } finally {
      setIsLoading(false); // Stop loading regardless of outcome
    }
  };

  return (
    <Container
      className="mt-5"
      style={{
        maxWidth: "27%",
        margin: "auto",
      }}
    >
      <h2>Reset Password</h2>
      <Form onSubmit={handleSubmit}>
        <Form.Group controlId="formEmail" className="mb-3">
          <Form.Label>Email address</Form.Label>
          <Form.Control
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </Form.Group>
        <Button
          type="submit"
          variant="primary"
          className="w-100"
          disabled={isLoading} // Disable button during loading
        >
          {isLoading ? (
            <>
              <span
                className="spinner-border spinner-border-sm"
                role="status"
                aria-hidden="true"
              ></span>
              <span className="ms-2">Sending...</span>
            </>
          ) : (
            "Send Reset Link"
          )}
        </Button>
      </Form>
      {message && (
        <Alert
          variant="success"
          className="mt-4 text-center fw-bold fs-5 p-1"
          aria-live="polite"
        >
          {message}
        </Alert>
      )}
      {error && (
        <Alert variant="danger" className="mt-4 text-center fw-bold fs-5 p-1">
          {error}
        </Alert>
      )}
    </Container>
  );
};

export default ResetPassword;
