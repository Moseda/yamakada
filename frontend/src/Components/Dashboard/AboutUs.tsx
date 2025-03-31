import React from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Button,
  Navbar,
  Dropdown,
} from "react-bootstrap";
import { FaInfo, FaUsers, FaEnvelope } from "react-icons/fa";
import { GiCompass } from "react-icons/gi";
import { IoExitOutline } from "react-icons/io5";
import { Link, useNavigate } from "react-router-dom";

const AboutUs: React.FC = () => {
  //NAVBAR justCopyOnAllPageForNow
  const navigate = useNavigate();
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
            Mimuco
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
                  //TOBE CHANGED?? ::::::::::::::::::: either have a color for each page or a fixed for the user or randomfromListLike dashboard ::::::::::::::::::::::
                  backgroundColor: "blue",
                  border: "none",
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  fontWeight: "bold",
                  color: "white",
                }}

                //TOBE CHANGED ::::::::::::::::::: the S is the initial for the username ::::::::::::::::::::::
              >
                {"S"}
              </Dropdown.Toggle>
              <Dropdown.Menu>
                <Dropdown.Item as={Link} to="/dashboard/profile">
                  Profile
                </Dropdown.Item>
                <Dropdown.Item as={Link} to="/dashboard/settings">
                  Settings
                </Dropdown.Item>
                <Dropdown.Item as={Link} to="/dashboard/about-us">
                  About Us
                </Dropdown.Item>
                <Dropdown.Item as={Link} to="/dashboard/categorizer">
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

      <Container className="mt-5">
        <Row>
          <Col>
            <Card className="shadow-sm">
              <Card.Header className="bg-primary text-white">
                <FaInfo className="me-2" /> About Mimuco
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={6}>
                    <Card className="mb-4">
                      <Card.Body>
                        <h5>
                          <FaUsers className="me-2" /> Our Story
                        </h5>
                        <p>
                          Mimuco was founded with a simple mission: to simplify
                          and streamline your daily organizational needs. We
                          believe in creating intuitive, powerful tools that
                          help individuals and teams work more efficiently.
                        </p>
                      </Card.Body>
                    </Card>
                  </Col>
                  <Col md={6}>
                    <Card className="mb-4">
                      <Card.Body>
                        <h5>
                          <GiCompass className="me-2" /> Our Mission
                        </h5>
                        <p>
                          To empower users with cutting-edge technology that
                          transforms how they manage, categorize, and interact
                          with their digital workspace. We're committed to
                          innovation, user experience, and continuous
                          improvement.
                        </p>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>

                <Row>
                  <Col>
                    <Card>
                      <Card.Body>
                        <h5>
                          <FaEnvelope className="me-2" /> Contact Us
                        </h5>
                        <p>
                          Have questions or suggestions? We'd love to hear from
                          you!
                        </p>
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <strong>Email:</strong> info@miksim.de
                            <br />
                            <strong>Phone:</strong> +49 11111111
                          </div>
                          <Button variant="outline-primary">
                            Send Feedback
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  </Col>
                </Row>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default AboutUs;
