const apiUrl = import.meta.env.VITE_API_URL;

import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Alert,
} from "react-bootstrap";
import { FaCog, FaLanguage, FaBell, FaLock, FaPalette } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import NavbarComponent from "./NavbarComponent";

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    notifications: true,
    language: "en",
    theme: "light",
    privacyMode: false,
  });
  const [message, setMessage] = useState<{
    type: "success" | "danger" | null;
    text: string;
  }>({
    type: null,
    text: "",
  });

  // Apply theme immediately when it changes
  useEffect(() => {
    // Apply theme to document body or root element
    document.body.classList.remove("theme-light", "theme-dark");
    document.body.classList.add(`theme-${settings.theme}`);

    // document.documentElement.style.setProperty('--background-color', settings.theme === 'dark' ? '#121212' : '#ffffff');
  }, [settings.theme]);

  useEffect(() => {
    const fetchUserSettings = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          navigate("/");
          return;
        }

        const response = await axios.get(`${apiUrl}/user/settings`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setSettings(response.data);
      } catch (error) {
        console.error("Error fetching settings", error);
        setMessage({
          type: "danger",
          text: "Failed to load settings. Please try again.",
        });
      }
    };

    fetchUserSettings();
  }, [navigate]);

  const handleSettingChange = async (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, type, value } = e.target;

    let checked: boolean | undefined;
    if (e.target instanceof HTMLInputElement && type === "checkbox") {
      checked = e.target.checked;
    }

    const newSettings = {
      ...settings,
      [name]: type === "checkbox" ? checked : value,
    };

    setSettings(newSettings);

    // Show loading
    setMessage({
      type: null,
      text: "Updating...",
    });

    // Send update to server
    try {
      const token = localStorage.getItem("accessToken");
      await axios.put(`${apiUrl}/user/settings`, newSettings, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // Show brief success message that fades away
      setMessage({
        type: "success",
        text: `${name.charAt(0).toUpperCase() + name.slice(1)} updated!`,
      });

      // Clear success message after delay
      setTimeout(() => {
        setMessage({
          type: null,
          text: "",
        });
      }, 2000);
    } catch (error) {
      console.error("Error updating settings", error);
      setMessage({
        type: "danger",
        text: "Failed to update settings. Please try again.",
      });
    }
  };

  return (
    <>
      {/* Navbar */}
      <NavbarComponent />
      <div
        className="dashboard-wrapper"
        style={{
          position: "relative",
          minHeight: "100vh",
          width: "100%",
          background: "#f5f5f5",
          overflow: "hidden",
        }}
      >
        <Container className="mt-5">
          <Row className="justify-content-center">
            <Col md={10} lg={8}>
              <Card className="shadow-sm">
                <Card.Header className="bg-primary text-white">
                  <FaCog className="me-2" /> Application Settings
                </Card.Header>
                <Card.Body>
                  {message.type && (
                    <Alert variant={message.type}>{message.text}</Alert>
                  )}

                  <Form>
                    <Row className="mb-3">
                      <Col>
                        <Card className="h-100">
                          <Card.Body>
                            <h5>
                              <FaBell className="me-2" /> Notifications
                            </h5>
                            <Form.Check
                              type="switch"
                              id="notifications"
                              name="notifications"
                              label="Enable Notifications"
                              checked={settings.notifications}
                              onChange={handleSettingChange}
                            />
                          </Card.Body>
                        </Card>
                      </Col>
                      <Col>
                        <Card className="h-100">
                          <Card.Body>
                            <h5>
                              <FaLanguage className="me-2" /> Language
                            </h5>
                            <Form.Select
                              name="language"
                              value={settings.language}
                              onChange={handleSettingChange}
                            >
                              <option value="en">English</option>
                              <option value="es">Spanish</option>
                              <option value="fr">French</option>
                            </Form.Select>
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>

                    <Row className="mb-3">
                      <Col>
                        <Card className="h-100">
                          <Card.Body>
                            <h5>
                              <FaPalette className="me-2" /> Theme
                            </h5>
                            <Form.Select
                              name="theme"
                              value={settings.theme}
                              onChange={handleSettingChange}
                            >
                              <option value="light">Light Mode</option>
                              <option value="dark">Dark Mode</option>
                            </Form.Select>
                          </Card.Body>
                        </Card>
                      </Col>
                      <Col>
                        <Card className="h-100">
                          <Card.Body>
                            <h5>
                              <FaLock className="me-2" /> Privacy
                            </h5>
                            <Form.Check
                              type="switch"
                              id="privacyMode"
                              name="privacyMode"
                              label="Privacy Mode"
                              checked={settings.privacyMode}
                              onChange={handleSettingChange}
                            />
                          </Card.Body>
                        </Card>
                      </Col>
                    </Row>

                    <div className="d-flex justify-content-end">
                      <Button
                        variant="secondary"
                        onClick={() => navigate("/dashboard")}
                      >
                        Back to Dashboard
                      </Button>
                    </div>
                  </Form>
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </>
  );
};

export default Settings;
