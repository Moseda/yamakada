// src/components/NavbarComponent.js
import { useEffect, useState, useRef, ReactNode } from "react";
import { Navbar, Container, Button } from "react-bootstrap";
import Axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { IoExitOutline } from "react-icons/io5";
import { motion, AnimatePresence } from "framer-motion";
import { FaUserCircle, FaCog, FaInfo, FaLayerGroup } from "react-icons/fa";
import mimuco_4 from "../../LoginAssets/mimuco_4.png"; // Adjust the path as necessary
const apiUrl = import.meta.env.VITE_API_URL;

const NavbarComponent = () => {
  const [email, setEmail] = useState("");
  const [avatarColor, setAvatarColor] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const [prevScrollPos, setPrevScrollPos] = useState(0);
  const [visible, setVisible] = useState(true);
  const [isMouseOver, setIsMouseOver] = useState(false);
  const [pulseEffect, setPulseEffect] = useState(false);
  const navbarRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  interface DropdownItemProps {
    icon: ReactNode;
    text: string;
    onClick: (event: React.MouseEvent<HTMLDivElement>) => void;
    highlight?: boolean;
  }

  // Enhanced color palette with gradients
  const avatarGradients = [
    "linear-gradient(135deg, #FF9966, #FF5E62)",
    "linear-gradient(135deg, #4158D0, #C850C0)",
    "linear-gradient(135deg, #0093E9, #80D0C7)",
    "linear-gradient(135deg, #8BC6EC, #9599E2)",
    "linear-gradient(135deg, #43CBFF, #9708CC)",
    "linear-gradient(135deg, #FA8BFF, #2BD2FF)",
    "linear-gradient(135deg, #FBAB7E, #F7CE68)",
    "linear-gradient(135deg, #85FFBD, #FFFB7D)",
    "linear-gradient(135deg, #FF3CAC, #784BA0)",
    "linear-gradient(135deg, #FEE140, #FA709A)",
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
          setEmail(response.data.user.email);
          // Trigger pulse effect when user data loads
          setTimeout(() => {
            setPulseEffect(true);
            setTimeout(() => setPulseEffect(false), 2000);
          }, 500);
        } else {
          console.error("Token invalid or expired.");
        }
      } catch (error: any) {
        console.error(
          "Error verifying token:",
          error.response?.data || error.message
        );
      }
    };

    fetchUser();
    setAvatarColor(
      avatarGradients[Math.floor(Math.random() * avatarGradients.length)]
    );

    // Set up interval for subtle animation
    const interval = setInterval(() => {
      if (navbarRef.current && !isMouseOver) {
        const hue = Math.floor(Math.random() * 10) - 5;
        navbarRef.current.style.filter = `hue-rotate(${hue}deg)`;
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [isMouseOver]);

  // Enhanced scroll behavior
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollPos = window.pageYOffset;
      const isScrollingUp = prevScrollPos > currentScrollPos;
      const isAtTop = currentScrollPos < 10;

      // Show navbar if scrolling up or at the top of the page
      setVisible(isScrollingUp || isAtTop);

      // Apply a subtle scale effect based on scroll position
      if (navbarRef.current) {
        const scale = isAtTop ? 1 : 0.98;
        navbarRef.current.style.transform = `scale(${scale})`;
      }

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

  const DropdownItem = ({
    icon,
    text,
    onClick,
    highlight,
  }: DropdownItemProps) => (
    <motion.div
      whileHover={{
        scale: 1.05,
        backgroundColor: "rgba(255, 255, 255, 0.1)",
      }}
      className="dropdown-item d-flex align-items-center"
      onClick={onClick}
      style={{
        padding: "10px 15px",
        borderRadius: "8px",
        margin: "4px 0",
        cursor: "pointer",
        background: highlight ? "rgba(255, 255, 255, 0.08)" : "transparent",
        transition: "all 0.3s ease",
      }}
    >
      {icon}
      <span className="ms-2">{text}</span>
    </motion.div>
  );

  // Handle click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div style={{ marginBottom: "100px" }}>
      <motion.div
        ref={navbarRef}
        initial={{ y: -100 }}
        animate={{
          y: visible ? 0 : -70,
          opacity: visible ? 1 : 0.8,
        }}
        transition={{
          type: "spring",
          stiffness: 100,
          damping: 20,
        }}
        onMouseEnter={() => setIsMouseOver(true)}
        onMouseLeave={() => setIsMouseOver(false)}
        className={`navbar navbar-expand-lg navbar-dark fixed-top ${
          pulseEffect ? "pulse" : ""
        }`}
        style={{
          background: "linear-gradient(135deg, #2E3192,rgb(62, 172, 202))",
          backgroundSize: "200% 200%",
          animation: "gradientBG 10s ease infinite",
          boxShadow: "0 5px 20px rgba(0, 0, 0, 0.2)",
          borderRadius: "0 0 20px 20px",
          padding: "12px 0",
          zIndex: 1030,
          transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
        }}
      >
        <Container>
          <Navbar.Brand as={Link} to="/dashboard" className="position-relative">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="brand-container"
            >
              <img
                src={mimuco_4}
                alt="Logo"
                className="logo-image"
                style={{
                  width: "150px",
                  maxHeight: "40px",
                  filter: "drop-shadow(0 0 5px rgba(255, 255, 255, 0.5))",
                  transition: "all 0.3s ease",
                }}
              />
              <div
                className="logo-glow"
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: "160px",
                  height: "50px",
                  background:
                    "radial-gradient(circle, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 70%)",
                  zIndex: -1,
                  opacity: isMouseOver ? 0.8 : 0.4,
                  transition: "opacity 0.5s ease",
                }}
              />
            </motion.div>
          </Navbar.Brand>

          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse className="justify-content-end">
            {/* User Avatar with Custom Dropdown */}
            <div className="position-relative" ref={dropdownRef}>
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="avatar-container"
              >
                <Button
                  variant="light"
                  className="d-flex align-items-center justify-content-center position-relative"
                  style={{
                    background: avatarColor,
                    width: "45px",
                    height: "45px",
                    borderRadius: "50%",
                    border: "1px solid rgba(255, 255, 255, 0.8)",
                    fontWeight: "bold",
                    color: "white",
                    fontSize: "18px",
                    padding: 0,
                    boxShadow: "0 8px 15px rgba(0, 0, 0, 0.35)",
                    cursor: "pointer",
                    overflow: "hidden",
                  }}
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <span style={{ zIndex: 2 }}>{initial}</span>
                  <div
                    className="avatar-shine"
                    style={{
                      position: "absolute",
                      top: 0,
                      left: "-100%",
                      width: "20%",
                      height: "100%",
                      background:
                        "linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent)",
                      animation: "shine 10s infinite",
                      zIndex: 1,
                    }}
                  />
                </Button>
              </motion.div>

              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 1, x: 80, y: -170, scale: 0.15 }}
                    animate={{ opacity: 1, y: 10, scale: 1 }}
                    exit={{ opacity: 1, x: 80, y: -170, scale: 0.15 }}
                    transition={{ duration: 0.2 }}
                    className="custom-dropdown"
                    style={{
                      position: "absolute",
                      top: "55px",
                      right: 0,
                      width: "200px",
                      background: "rgb(251, 251, 251)",
                      backdropFilter: "blur(10px)",
                      borderRadius: "15px",
                      padding: "0px",
                      boxShadow:
                        "0 5px 35px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(255, 255, 255, 0.1)",
                      zIndex: 1000,
                      overflow: "hidden",
                    }}
                  >
                    <div className="text-center mb-3 p-2">
                      <div
                        className="mb-2"
                        style={{
                          background: avatarColor,
                          width: "50px",
                          height: "50px",
                          borderRadius: "50%",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          margin: "0 auto",
                          fontSize: "20px",
                          color: "black",
                          border: "2px solid rgba(255, 255, 255, 0.3)",
                        }}
                      >
                        {initial}
                      </div>
                      <div className="text-dark">{email}</div>
                    </div>

                    <div
                      className="dropdown-divider"
                      style={{
                        borderTop: "1px solid rgb(0, 0, 0)",
                        marginInline: "20px",
                      }}
                    ></div>

                    <DropdownItem
                      icon={<FaUserCircle color="rgb(0, 0, 0)" size={15} />}
                      text="Profile"
                      onClick={() => navigate("/profile")}
                      highlight={undefined}
                    />
                    <DropdownItem
                      icon={<FaCog color="rgb(0, 0, 0)" size={15} />}
                      text="Settings"
                      onClick={() => navigate("/settings")}
                      highlight={undefined}
                    />
                    <DropdownItem
                      icon={<FaInfo color="rgb(0, 0, 0)" size={15} />}
                      text="About Us"
                      onClick={() => navigate("/about-us")}
                      highlight={undefined}
                    />
                    <DropdownItem
                      icon={<FaLayerGroup color="rgb(0, 0, 0)" size={15} />}
                      text="Categorizer"
                      onClick={() => navigate("/categorizer")}
                      highlight={undefined}
                    />

                    <div
                      className="dropdown-divider"
                      style={{
                        borderTop: "1px solid rgb(0, 0, 0)",
                        marginInline: "20px",
                      }}
                    ></div>

                    <DropdownItem
                      icon={<IoExitOutline color="rgb(0, 0, 0)" size={15} />}
                      text="Logout"
                      onClick={Logout}
                      highlight={false}
                    />

                    <div
                      className="dropdown-glow"
                      style={{
                        position: "absolute",
                        bottom: "-50px",
                        right: "-50px",
                        width: "300px",
                        height: "1000px",
                        background:
                          "radial-gradient(circle, rgba(255, 255, 255, 0) 0%, rgba(0,0,0,0) 70%)",
                        zIndex: -1,
                      }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </Navbar.Collapse>
        </Container>
      </motion.div>

      {/* Add global styles for animations */}
      <style>
        {`
          @keyframes gradientBG {
            0% { background-position: 0% 50% }
            50% { background-position: 100% 50% }
            100% { background-position: 0% 50% }
          }
          
          @keyframes shine {
            0% { left: -100%; }
            20% { left: 100%; }
            100% { left: 100%; }
          }
          
          .pulse {
            animation: pulse 1s cubic-bezier(0.4, 0, 0.6, 1) 1;
          }
          
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.02); }
          }
          
          .dropdown-divider {
            margin: 8px 0;
          }
        `}
      </style>

      <div style={{ height: "70px" }}></div>
    </div>
  );
};

export default NavbarComponent;
