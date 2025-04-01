import { useState, useEffect } from "react";
import {
  Navbar,
  Container,
  Card,
  Dropdown,
  Button,
  Col,
  Form,
  Row,
} from "react-bootstrap";
import { IoExitOutline } from "react-icons/io5";
import { Link, useNavigate } from "react-router-dom";
import Axios from "axios";
import MimucoLogo from "../../LoginAssets/MimucoLogo.png";
import { BsArrowRight, BsPlus } from "react-icons/bs";

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

  // Sample data for dropdowns
  const [shops, setShops] = useState(["Shop 1", "Shop 2", "Shop 3"]);
  const [manufacturers, setManufacturers] = useState([
    "Hersteller 1",
    "Hersteller 2",
  ]);
  const [marketplaces, setMarketplaces] = useState(["Amazon", "eBay", "Otto"]);

  // Selected items in dropdowns
  const [selectedShop, setSelectedShop] = useState("");
  const [selectedManufacturer, setSelectedManufacturer] = useState("");
  const [selectedMarketplace, setSelectedMarketplace] = useState("");

  // Navigation functions
  const navigateToProduct = () => {
    console.log("Navigating to Product page");
    // TODO navigation logic
  };

  const navigateToShop = () => {
    console.log(`Navigating to shop: ${selectedShop}`);
    // TODO navigation logic
  };

  const navigateToManufacturer = () => {
    console.log(`Navigating to manufacturer: ${selectedManufacturer}`);
    // TODO navigation logic
  };

  const navigateToMarketplace = () => {
    console.log(`Navigating to marketplace: ${selectedMarketplace}`);
    // TODO navigation logic
  };

  // Add new item functions
  const addNewShop = () => {
    console.log("Adding new shop");
    // TODO navigation logic to the shop configuration page
  };

  const addNewManufacturer = () => {
    console.log("Adding new manufacturer");
    // TODO navigation logic to the manufacturer configuration page
  };

  const addNewMarketplace = () => {
    console.log("Adding new marketplace");
    // TODO navigation logic to the marketplace configuration page
  };

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
    <div
      className="dashboard-wrapper"
      style={{
        position: "relative",
        minHeight: "200vh",
        width: "100%",
        background: "linear-gradient(30deg,#4A6E96 0%,#3E6C6A 100%)",
        overflow: "hidden",
      }}
    >
      {/* Background pattern */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0,
          pointerEvents: "none",
          backgroundImage: `
          linear-gradient(#4A6E96 1px, transparent 0px),
          linear-gradient(90deg, #4A6E96 1px, transparent 0px)
        `,
          backgroundSize: "40px 40px",
        }}
      ></div>
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          opacity: 0,
          pointerEvents: "none",
          backgroundImage: `
          linear-gradient(#4A6E96 10px, transparent 0px),
          linear-gradient(90deg, #4A6E96 2px, transparent 0px)
        `,
          backgroundSize: "10px 10px",
        }}
      ></div>

      <div>
        {/* Navbar */}
        <Navbar bg="dark" variant="dark" expand="lg">
          <Container>
            {/* Logo remains on the left */}
            <Navbar.Brand as={Link} to="/dashboard">
              <div className="text-center mb-24">
                <img src={MimucoLogo} alt="Logo" style={{ width: "150px" }} />
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
          style={{ minHeight: "800px" }}
        >
          {/* Central box - Product System */}
          <Card
            className="text-center mx-auto shadow border-0"
            style={{
              width: "300px",
              height: "200px",
              position: "absolute",
              top: "60%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              cursor: "pointer",
              backgroundColor: "#f8f9fa",
              borderRadius: "15px",
              transition: "transform 0.3s, box-shadow 0.3s",
              zIndex: 10,
            }}
            onClick={navigateToProduct}
            onMouseOver={(e) => {
              e.currentTarget.style.transform =
                "translate(-50%, -50%) scale(1.05)";
              e.currentTarget.style.boxShadow =
                "0 10px 20px rgba(0,0,0,0.19), 0 6px 6px rgba(0,0,0,0.23)";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "translate(-50%, -50%)";
              e.currentTarget.style.boxShadow = "0 4px 8px rgba(0,0,0,0.15)";
            }}
          >
            <Card.Body className="d-flex flex-column align-items-center justify-content-center">
              <Card.Title className="fw-bold fs-4 mb-3">
                Produktsystem
              </Card.Title>
              <div
                className="bg-warning rounded-circle d-flex align-items-center justify-content-center mb-3"
                style={{
                  width: "60px",
                  height: "60px",
                }}
              >
                <i className="fs-3 text-white">🛒</i>
              </div>
              <Card.Text>Produkte verwalten</Card.Text>
            </Card.Body>
          </Card>

          {/* Top box - Target System (Zielsystem) */}
          <Card
            className="text-center position-absolute shadow border-0"
            style={{
              width: "220px",
              top: "10%",
              left: "50%",
              transform: "translateX(-50%)",
              backgroundColor: "#e3f2fd", // Light blue background
              borderRadius: "12px",
              transition: "transform 0.2s",
              zIndex: 10,
            }}
          >
            <Card.Body>
              <Card.Title className="fw-bold mb-2">Zielsystem</Card.Title>
              <Card.Text className="mb-2 text-muted small">
                Marketplaces
              </Card.Text>
              <Dropdown className="mb-2">
                <Dropdown.Toggle
                  variant="outline-primary"
                  id="marketplace-dropdown"
                  size="sm"
                  className="w-100"
                >
                  {selectedMarketplace || "Marketplace wählen"}
                </Dropdown.Toggle>
                <Dropdown.Menu className="w-100">
                  {marketplaces.map((marketplace, idx) => (
                    <Dropdown.Item
                      key={idx}
                      onClick={() => setSelectedMarketplace(marketplace)}
                    >
                      {marketplace}
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              </Dropdown>
              <div className="d-flex justify-content-between">
                <Button
                  variant="success"
                  size="sm"
                  onClick={addNewMarketplace}
                  disabled={!selectedMarketplace}
                  className="me-2"
                >
                  <BsPlus size={18} />
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={navigateToMarketplace}
                  disabled={!selectedMarketplace}
                >
                  <BsArrowRight size={18} />
                </Button>
              </div>
            </Card.Body>
          </Card>

          {/* Left box - Main System (Hauptsystem) */}
          <Card
            className="text-center position-absolute shadow border-0"
            style={{
              width: "220px",
              top: "60%",
              left: "10%",
              transform: "translateY(-50%)",
              backgroundColor: "#e8f5e9", // Light green background
              borderRadius: "12px",
              transition: "transform 0.2s",
              zIndex: 10,
            }}
          >
            <Card.Body>
              <Card.Title className="fw-bold mb-2">Hauptsystem</Card.Title>
              <Card.Text className="mb-2 text-muted small">Shops</Card.Text>
              <Dropdown className="mb-2">
                <Dropdown.Toggle
                  variant="outline-success"
                  id="shop-dropdown"
                  size="sm"
                  className="w-100"
                >
                  {selectedShop || "Shop wählen"}
                </Dropdown.Toggle>
                <Dropdown.Menu className="w-100">
                  {shops.map((shop, idx) => (
                    <Dropdown.Item
                      key={idx}
                      onClick={() => setSelectedShop(shop)}
                    >
                      {shop}
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              </Dropdown>
              <div className="d-flex justify-content-between">
                <Button
                  variant="success"
                  size="sm"
                  onClick={addNewShop}
                  className="me-2"
                >
                  <BsPlus size={18} />
                </Button>
                <Button
                  variant="success"
                  size="sm"
                  onClick={navigateToShop}
                  disabled={!selectedShop}
                >
                  <BsArrowRight size={18} />
                </Button>
              </div>
            </Card.Body>
          </Card>

          {/* Right box - Data System (Datensystem) */}
          <Card
            className="text-center position-absolute shadow border-0"
            style={{
              width: "220px",
              top: "60%",
              right: "10%",
              transform: "translateY(-50%)",
              backgroundColor: "#fff3e0", // Light orange background
              borderRadius: "12px",
              transition: "transform 0.2s",
              zIndex: 10,
            }}
          >
            <Card.Body>
              <Card.Title className="fw-bold mb-2">Datensystem</Card.Title>
              <Card.Text className="mb-2 text-muted small">
                Hersteller
              </Card.Text>
              <Dropdown className="mb-2">
                <Dropdown.Toggle
                  variant="outline-warning"
                  id="manufacturer-dropdown"
                  size="sm"
                  className="w-100"
                >
                  {selectedManufacturer || "Hersteller wählen"}
                </Dropdown.Toggle>
                <Dropdown.Menu className="w-100">
                  {manufacturers.map((manufacturer, idx) => (
                    <Dropdown.Item
                      key={idx}
                      onClick={() => setSelectedManufacturer(manufacturer)}
                    >
                      {manufacturer}
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              </Dropdown>
              <div className="d-flex justify-content-between">
                <Button
                  variant="warning"
                  size="sm"
                  onClick={addNewManufacturer}
                  className="me-2"
                >
                  <BsPlus size={18} />
                </Button>
                <Button
                  variant="warning"
                  size="sm"
                  onClick={navigateToManufacturer}
                  disabled={!selectedManufacturer}
                >
                  <BsArrowRight size={18} />
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Container>
      </div>

      {/* Independent Curved Arrows */}
      <div className="connection-lines">
        {/* Top connection - Product to Marketplace */}
        <svg
          style={{
            position: "absolute",
            top: "19%",
            left: "50%",
            transform: "translateX(-50%)",
            width: "80px",
            height: "140px",
            zIndex: 1,
            overflow: "visible",
          }}
        >
          {/* Import arrow (bottom to top) */}
          <path
            d="M0,150  0,24"
            fill="none"
            stroke="#4a90e2"
            strokeWidth="2"
            markerEnd="url(#arrow-top)"
          />

          {/* Export arrow (top to bottom) */}
          <path
            d="M80,10  80,137"
            fill="none"
            stroke="#4a90e2"
            strokeWidth="2"
            markerEnd="url(#arrow-bottom)"
          />

          <defs>
            {/* arrow-head (bottom to top) */}
            <marker
              id="arrow-top"
              markerWidth="11"
              markerHeight="7"
              refX="5"
              refY="3.5"
              orient="auto"
            >
              <polygon points="2 0, 8 3.5, 2 7" fill="#4a90e2" />
            </marker>
            <marker
              id="arrow-bottom"
              markerWidth="11"
              markerHeight="7"
              refX="5"
              refY="3.5"
              orient="auto"
            >
              <polygon points="2 0, 8 3.5, 2 7" fill="#4a90e2" />
            </marker>
          </defs>
        </svg>

        {/* Left connection - Product to Shop */}
        <svg
          style={{
            position: "absolute",
            top: "35%",
            left: "32%",
            transform: "translateY(-50%)",
            width: "140px",
            height: "80px",
            zIndex: 1,
            overflow: "visible",
          }}
        >
          {/* Import arrow (right to left) */}
          <path
            d="M160,60  5,60"
            fill="none"
            stroke="#43b581"
            strokeWidth="2"
            markerEnd="url(#arrow-left)"
          />

          {/* Export arrow (left to right) */}
          <path
            d="M-10,0  140,0"
            fill="none"
            stroke="#43b581"
            strokeWidth="2"
            markerEnd="url(#arrow-right)"
          />

          <defs>
            {/* arrow-head (center to left) */}
            <marker
              id="arrow-left"
              markerWidth="11"
              markerHeight="7"
              refX="5"
              refY="3.5"
              orient="auto"
            >
              <polygon points="2 0, 8 3.5, 2 7" fill="#43b581" />
            </marker>
            <marker
              id="arrow-right"
              markerWidth="11"
              markerHeight="7"
              refX="5"
              refY="3.5"
              orient="auto"
            >
              <polygon points="2 0, 8 3.5, 2 7" fill="#43b581" />
            </marker>
          </defs>
        </svg>

        {/* Right connection - Product to Manufacturer */}
        <svg
          style={{
            position: "absolute",
            top: "35%",
            right: "32%",
            transform: "translateY(-50%)",
            width: "140px",
            height: "80px",
            zIndex: 1,
            overflow: "visible",
          }}
        >
          {/* Import arrow (left to right) */}
          <path
            d="M-20,0 135,0"
            fill="none"
            stroke="#faa61a"
            strokeWidth="2"
            markerEnd="url(#arrow-right-orange)"
          />

          {/* Export arrow (right to left) */}
          <path
            d="M150,60 0,60"
            fill="none"
            stroke="#faa61a"
            strokeWidth="2"
            markerEnd="url(#arrow-left-orange)"
          />

          <defs>
            <marker
              id="arrow-right-orange"
              markerWidth="11"
              markerHeight="7"
              refX="5"
              refY="3.5"
              orient="auto"
            >
              <polygon points="2 0, 8 3.5, 2 7" fill="#faa61a" />
            </marker>
            <marker
              id="arrow-left-orange"
              markerWidth="11"
              markerHeight="7"
              refX="5"
              refY="3.5"
              orient="auto"
            >
              <polygon points="2 0, 8 3.5, 2 7" fill="#faa61a" />
            </marker>
          </defs>
        </svg>
      </div>

      {/*added last Bestellung*/}
      <Container className="mt-5 mb-4">
        <Row className="g-4">
          {/* Last Order Section */}
          <Col md={4}>
            <Card className="h-100 shadow-sm border-0">
              <Card.Header className="bg-white border-bottom border-2 border-primary">
                <h5 className="mb-0 text-primary fw-bold">Letzte Bestellung</h5>
              </Card.Header>
              <Card.Body>
                <Form>
                  <Form.Group className="mb-3">
                    <Form.Label>Bestellnummer</Form.Label>
                    <Form.Control type="text" placeholder="z.B. ORD-12345" />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Kunde</Form.Label>
                    <Form.Control type="text" placeholder="Name des Kunden" />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Datum</Form.Label>
                    <Form.Control type="date" />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Status</Form.Label>
                    <Form.Select>
                      <option>Bestätigt</option>
                      <option>In Bearbeitung</option>
                      <option>Versendet</option>
                      <option>Abgeschlossen</option>
                    </Form.Select>
                  </Form.Group>
                  <Button variant="outline-primary" className="w-100">
                    Details anzeigen
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>

          {/* Added Articles Section */}
          <Col md={4}>
            <Card className="h-100 shadow-sm border-0">
              <Card.Header className="bg-white border-bottom border-2 border-success">
                <h5 className="mb-0 text-success fw-bold">
                  Hinzugefügte Artikel
                </h5>
              </Card.Header>
              <Card.Body>
                <Form>
                  <Form.Group className="mb-3">
                    <Form.Label>Artikelname</Form.Label>
                    <Form.Control type="text" placeholder="Neuer Artikel" />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Artikelnummer</Form.Label>
                    <Form.Control type="text" placeholder="z.B. SKU-12345" />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Kategorie</Form.Label>
                    <Form.Select>
                      <option>Bitte wählen</option>
                      <option>Elektronik</option>
                      <option>Kleidung</option>
                      <option>Haushalt</option>
                    </Form.Select>
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Hinzugefügt am</Form.Label>
                    <Form.Control type="date" />
                  </Form.Group>
                  <Button variant="outline-success" className="w-100">
                    Artikel hinzufügen
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>

          {/* Error Log Section */}
          <Col md={4}>
            <Card className="h-100 shadow-sm border-0">
              <Card.Header className="bg-white border-bottom border-2 border-danger">
                <h5 className="mb-0 text-danger fw-bold">Fehler Log</h5>
              </Card.Header>
              <Card.Body>
                <Form>
                  <Form.Group className="mb-3">
                    <Form.Label>Fehlertyp</Form.Label>
                    <Form.Select>
                      <option>Bitte wählen</option>
                      <option>Systemfehler</option>
                      <option>Benutzerfehler</option>
                      <option>Netzwerkfehler</option>
                    </Form.Select>
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Fehlerbeschreibung</Form.Label>
                    <Form.Control
                      as="textarea"
                      rows={3}
                      placeholder="Fehlerdetails eingeben"
                    />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Zeitpunkt</Form.Label>
                    <Form.Control type="datetime-local" />
                  </Form.Group>
                  <Form.Group className="mb-3">
                    <Form.Label>Priorität</Form.Label>
                    <Form.Select>
                      <option>Niedrig</option>
                      <option>Mittel</option>
                      <option>Hoch</option>
                      <option>Kritisch</option>
                    </Form.Select>
                  </Form.Group>
                  <Button variant="outline-danger" className="w-100">
                    Log speichern
                  </Button>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default Dashboard;
