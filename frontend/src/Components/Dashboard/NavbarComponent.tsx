// src/components/NavbarComponent.js
import { useEffect, useState } from "react";
import { Navbar, Container, Dropdown, Button } from "react-bootstrap";
import Axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { IoExitOutline } from "react-icons/io5";
import mimuco_4 from "../../LoginAssets/mimuco_4.png"; // Adjust the path as necessary

const NavbarComponent = () => {
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
        const response = await Axios.get(
          "http://192.168.0.144:3002/verify-token",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

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
    <Navbar bg="dark" variant="dark" expand="lg">
      <Container>
        {/* Logo remains on the left */}
        <Navbar.Brand as={Link} to="/dashboard">
          <div className="text-center mb-24">
            <img
              src={mimuco_4}
              alt="Logo"
              style={{
                width: "150px",
                filter:
                  "invert(60%) sepia(30%) saturate(500%) hue-rotate(180deg)",
              }}
            />
          </div>
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
              <Dropdown.Item onClick={() => navigate("../dashboard/profile")}>
                Profile
              </Dropdown.Item>
              <Dropdown.Item onClick={() => navigate("../dashboard/settings")}>
                Settings
              </Dropdown.Item>
              <Dropdown.Item onClick={() => navigate("../dashboard/about-us")}>
                About Us
              </Dropdown.Item>
              <Dropdown.Item
                onClick={() => navigate("../dashboard/categorizer")}
              >
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
  );
};

export default NavbarComponent;
