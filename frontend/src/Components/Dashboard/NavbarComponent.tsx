// src/components/NavbarComponent.js
import { useEffect, useState } from "react";
import { Navbar, Container, Dropdown, Button } from "react-bootstrap";
import Axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { IoExitOutline } from "react-icons/io5";
import mimuco_4 from "../../LoginAssets/mimuco_4.png"; // Adjust the path as necessary
const apiUrl = import.meta.env.VITE_API_URL;

const NavbarComponent = () => {
  const [email, setEmail] = useState(""); // State to store email
  const [avatarColor, setAvatarColor] = useState(""); // Avatar color
  const navigate = useNavigate();
  const [prevScrollPos, setPrevScrollPos] = useState(0);
  const [visible, setVisible] = useState(true);

  const colors = [
    "#FFB400", // amber (golden but modern)
    "#00BFFF", // deep sky blue
    "#FF6347", // tomato red
    "#32CD32", // lime green
    "#FFC300", // rich golden yellow
    "#FF8C69", // light coral
    "#20C997", // teal / greenish cyan
    "#FF1493", // deep pink
    "#6495ED", // cornflower blue
    "#FF6F61", // pastel red (but more saturated)
    "#F0E68C", // khaki
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
        const response = await Axios.get(`${apiUrl}/verify-token`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.data.isValid) {
          setEmail(response.data.user.email); // Use email from token
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

  // Add scroll behavior hook
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPos = window.pageYOffset;

      // Show navbar if scrolling up or at the top of the page
      setVisible(prevScrollPos > currentScrollPos || currentScrollPos < 10);

      setPrevScrollPos(currentScrollPos);
    };

    window.addEventListener("scroll", handleScroll);

    return () => window.removeEventListener("scroll", handleScroll);
  }, [prevScrollPos]);

  const initial = email ? email[0].toUpperCase() : "?";

  const Logout = () => {
    localStorage.removeItem("accessToken");
    navigate("/");
  };

  return (
    <>
      <Navbar
        style={{
          backgroundColor: "#305CDE",
          transition: "top 0.3s",
          position: "fixed",
          width: "100%",
          zIndex: 1030,
          borderTopRightRadius: "10px", // Add rounded corner on top right
          //borderBottomRightRadius: "10px", // Add rounded corner on bottom right
          top: visible ? "0" : "-60px", // Adjust the negative value based on your navbar height
        }}
        variant="dark"
        expand="lg"
      >
        <Container>
          {/* Logo remains on the left */}
          <Navbar.Brand as={Link} to="/dashboard">
            <div className="text-center">
              <img
                src={mimuco_4}
                alt="Logo"
                style={{
                  width: "150px",
                  height: "auto",
                  maxHeight: "40px", // Add max height to ensure consistency
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
                className="d-flex align-items-center justify-content-center"
                style={{
                  backgroundColor: avatarColor,
                  //border: "none",
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  borderWidth: "2px",
                  borderColor: "lightGreen",
                  fontWeight: "bold",
                  color: "white",
                  padding: 0,
                }}
              >
                {initial}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item onClick={() => navigate("/profile")}>
                  Profile
                </Dropdown.Item>
                <Dropdown.Item onClick={() => navigate("/settings")}>
                  Settings
                </Dropdown.Item>
                <Dropdown.Item onClick={() => navigate("/about-us")}>
                  About Us
                </Dropdown.Item>
                <Dropdown.Item onClick={() => navigate("/categorizer")}>
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
      <div />
      <div style={{ height: "60px" }}></div>
    </>
  );
};

export default NavbarComponent;
