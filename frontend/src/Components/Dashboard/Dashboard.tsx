import { useState, useEffect } from "react";
import { Navbar, Container, Card, Dropdown, Button } from "react-bootstrap";
import { IoExitOutline } from "react-icons/io5";
import { Link, useNavigate } from "react-router-dom";
import Axios from "axios";

const Dashboard = () => {
  const [userName, setUserName] = useState(""); // State to store username
  const [avatarColor, setAvatarColor] = useState(""); // Avatar color

  const navigate = useNavigate();

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

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("accessToken");

        if (!token) {
          console.error("No token found");
          return;
        }

        // Fetch user data from /verify-token
        const response = await Axios.get("http://localhost:3002/verify-token", {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.isValid) {
          setUserName(response.data.user.username); // Use username from token
        } else {
          console.error("Token invalid or expired.");
        }
      } catch (error) {
        console.error(
          "Error verifying token:",
          (error as any).response?.data || (error as any).message
        );
      }
    };

    fetchUser();
    setAvatarColor(colors[Math.floor(Math.random() * colors.length)]);
  }, []);

  const initial = userName ? userName[0].toUpperCase() : "?";

  const Logout = () => {
    localStorage.removeItem("accessToken");
    navigate("/");
  };

  return (
    <div>
      {/* Navbar */}
      <Navbar bg="dark" variant="dark" expand="lg">
        <Container>
          {/* Logo remains on the left */}
          <Navbar.Brand as={Link} to="/dashboard">
            Mimuco Dashboard
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse className="justify-content-end">
            {/* User Avatar with Dropdown */}
            <Dropdown align="end">
              <Dropdown.Toggle
                variant="light"
                id="dropdown-basic"
                className="d-flex align-items-center"
                style={{
                  backgroundColor: avatarColor,
                  border: "none",
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  fontWeight: "bold",
                  color: "white",
                }}
              >
                {initial}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item as={Link} to="profile">
                  Profile
                </Dropdown.Item>
                <Dropdown.Item as={Link} to="settings">
                  Settings
                </Dropdown.Item>
                <Dropdown.Item as={Link} to="about-us">
                  About Us
                </Dropdown.Item>
                <Dropdown.Item as={Link} to="categorizer">
                  Categorizer
                </Dropdown.Item>
                <Dropdown.Divider />
                <Dropdown.Item
                  as={Button}
                  className="d-flex align-items-center"
                  onClick={Logout}
                >
                  <IoExitOutline className="me-2" /> Logout
                </Dropdown.Item>
              </Dropdown.Menu>
            </Dropdown>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* Main Layout */}
      <Container
        className="mt-4 position-relative"
        style={{ minHeight: "400px" }}
      >
        {/* Central clickable container */}
        <Card
          className="text-center mx-auto"
          style={{
            width: "300px",
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            cursor: "pointer",
          }}
          onClick={() => alert("Central container clicked")}
        >
          <Card.Body>
            <Card.Title>Central Box</Card.Title>
            <Card.Text>Click to explore!</Card.Text>
          </Card.Body>
        </Card>

        {/* Top container */}
        <Card
          className="text-center position-absolute"
          style={{
            width: "200px",
            top: "10%",
            left: "50%",
            transform: "translateX(-50%)",
            cursor: "pointer",
          }}
          onClick={() => alert("Top container clicked")}
        >
          <Card.Body>
            <Card.Title>Top Box</Card.Title>
          </Card.Body>
        </Card>

        {/* Left container */}
        <Card
          className="text-center position-absolute"
          style={{
            width: "200px",
            top: "50%",
            left: "10%",
            transform: "translateY(-50%)",
            cursor: "pointer",
          }}
          onClick={() => alert("Left container clicked")}
        >
          <Card.Body>
            <Card.Title>Left Box</Card.Title>
          </Card.Body>
        </Card>

        {/* Right container */}
        <Card
          className="text-center position-absolute"
          style={{
            width: "200px",
            top: "50%",
            right: "10%",
            transform: "translateY(-50%)",
            cursor: "pointer",
          }}
          onClick={() => alert("Right container clicked")}
        >
          <Card.Body>
            <Card.Title>Right Box</Card.Title>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default Dashboard;
