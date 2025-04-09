const apiUrl = import.meta.env.VITE_API_URL;

import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Form,
  Alert,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { FaUser, FaCog, FaSignOutAlt } from "react-icons/fa";
import axios from "axios";
import NavbarComponent from "./NavbarComponent";

interface UserProfile {
  email: string;
  avatarColor: string;
}

const Profile: React.FC = () => {
  const colors = [
    "#FF5733",
    "#33FF57",
    "#3357FF",
    "#F0A500",
    "#8E44AD",
    "#FF0000",
    "#00FF00",
    "#0000FF",
    "#00FFFF",
    "#800000",
    "#008000",
    "#000080",
    "#808000",
    "#C0C0C0",
  ];

  const navigate = useNavigate();
  const [profile, setProfile] = useState<UserProfile>({
    email: "",
    avatarColor: colors[Math.floor(Math.random() * colors.length)],
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<UserProfile>({
    email: "",
    avatarColor: colors[Math.floor(Math.random() * colors.length)],
  });
  const [message, setMessage] = useState<{
    type: "success" | "danger" | null;
    text: string;
  }>({
    type: null,
    text: "",
  });

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          navigate("/");
          return;
        }

        const response = await axios.get(`${apiUrl}/user/profile`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const userData = response.data;
        setProfile({
          email: userData.email,
          avatarColor: colors[Math.floor(Math.random() * colors.length)],
        });
        setEditedProfile({
          email: userData.email,
          avatarColor: colors[Math.floor(Math.random() * colors.length)],
        });
      } catch (error) {
        console.error("Error fetching profile", error);
        setMessage({
          type: "danger",
          text: "Failed to load profile. Please try again.",
        });
      }
    };

    fetchUserProfile();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    navigate("/");
  };

  const handleEditToggle = () => {
    setIsEditing(!isEditing);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedProfile((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSaveProfile = async () => {
    try {
      //const token = localStorage.getItem("accessToken");
      // const response = await axios.put(
      //   "http://192.168.0.144:3002/user/profile",
      //   editedProfile,
      //   { headers: { Authorization: `Bearer ${token}` } }
      // );

      setProfile(editedProfile);
      setIsEditing(false);
      setMessage({
        type: "success",
        text: "Profile updated successfully!",
      });
    } catch (error) {
      console.error("Error updating profile", error);
      setMessage({
        type: "danger",
        text: "Failed to update profile. Please try again.",
      });
    }
  };

  const renderAvatar = () => {
    const initial = profile.email ? profile.email[0].toUpperCase() : "?";
    return (
      <div
        style={{
          width: "150px",
          height: "150px",
          borderRadius: "50%",
          backgroundColor: profile.avatarColor,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: "4rem",
          color: "white",
          margin: "0 auto 20px",
        }}
      >
        {initial}
      </div>
    );
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
            <Col md={8} lg={6}>
              <Card className="shadow-sm">
                <Card.Header className="bg-primary text-white text-center">
                  <FaUser className="me-2" />
                  Profile
                </Card.Header>
                <Card.Body>
                  {message.type && (
                    <Alert variant={message.type}>{message.text}</Alert>
                  )}

                  {renderAvatar()}

                  {!isEditing ? (
                    <>
                      <div className="text-center mb-4">
                        <h4>{profile.email}</h4>
                        <p className="text-muted">{profile.email}</p>
                      </div>
                      <div className="d-flex justify-content-between">
                        <Button
                          variant="outline-primary"
                          onClick={handleEditToggle}
                        >
                          <FaCog className="me-2" /> Edit Profile
                        </Button>
                        <Button variant="outline-danger" onClick={handleLogout}>
                          <FaSignOutAlt className="me-2" /> Logout
                        </Button>
                      </div>
                    </>
                  ) : (
                    <Form>
                      <Form.Group className="mb-3">
                        <Form.Label>Email</Form.Label>
                        <Form.Control
                          type="email"
                          name="email"
                          value={editedProfile.email}
                          onChange={handleInputChange}
                          disabled
                        />
                      </Form.Group>

                      <div className="d-flex justify-content-between">
                        <Button variant="secondary" onClick={handleEditToggle}>
                          Cancel
                        </Button>
                        <Button variant="primary" onClick={handleSaveProfile}>
                          Save Changes
                        </Button>
                      </div>
                    </Form>
                  )}
                </Card.Body>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>
    </>
  );
};

export default Profile;
