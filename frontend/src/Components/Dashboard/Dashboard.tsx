import { useState, useEffect } from "react";
import {
  Container,
  Card,
  Dropdown,
  Button,
  ListGroup,
  Badge,
} from "react-bootstrap";
import { BsArrowRight, BsPlus } from "react-icons/bs";
import NavbarComponent from "./NavbarComponent";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Dashboard = () => {
  // Sample data for dropdowns
  const [shops /*setShops*/] = useState(["Shop 1", "Shop 2", "Shop 3"]);

  const [manufacturers, setManufacturers] = useState([]);
  const [manufacturersLoading, setManufacturersLoading] = useState(true);

  const [marketplaces /*setMarketplaces*/] = useState([
    "Amazon",
    "eBay",
    "Otto",
  ]);

  // Selected items in dropdowns
  const [selectedShop, setSelectedShop] = useState("");
  const [selectedManufacturer, setSelectedManufacturer] = useState("");
  const [selectedMarketplace, setSelectedMarketplace] = useState("");

  const navigate = useNavigate();
  // Navigation functions
  const navigateToProduct = () => {
    console.log("Navigating to Product page");
    navigate("/ProductSystem");
  };

  //fetch manufacturers for the dropdown
  useEffect(() => {
    const fetchManufacturers = async () => {
      try {
        setManufacturersLoading(true);
        const response = await axios.get(
          "http://192.168.0.128:8000/manufacturers/?page=1&limit=50"
        );

        // Extract just the names for the dropdown
        const manufacturerNames = response.data.map(
          (m: { producer_name: any }) => m.producer_name
        );
        setManufacturers(manufacturerNames);

        setManufacturersLoading(false);
      } catch (err) {
        console.error("Error fetching manufacturers:", err);
        setManufacturersLoading(false);
      }
    };

    fetchManufacturers();
  }, []);

  const navigateToShop = () => {
    console.log(`Navigating to shop: ${selectedShop}`);
    // TODO navigation logic
  };

  const navigateToManufacturer = () => {
    if (selectedManufacturer) {
      console.log(`Navigating to manufacturer: ${selectedManufacturer}`);
      navigate("/manufacturers", { state: { selectedManufacturer } });
    } else {
      navigate("/manufacturers");
    }
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
    navigate("/manufacturers", { state: { showAddModal: true } });
  };

  const addNewMarketplace = () => {
    console.log("Adding new marketplace");
    // TODO navigation logic to the marketplace configuration page
  };

  return (
    <div
      className="dashboard-wrapper"
      style={{
        position: "relative",
        minHeight: "300vh",
        width: "100%",
        background: "#f5f5f5",
        overflow: "hidden",
      }}
    >
      {/* Background pattern to check scaling and position*/}
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
          linear-gradient(#4A6E96 2px, transparent 0px),
          linear-gradient(90deg, #4A6E96 2px, transparent 0px)
        `,
          backgroundSize: "50px 50px",
        }}
      ></div>

      <div>
        {/* Navbar */}
        <NavbarComponent />
        {/* Main Layout */}
        <Container
          className="mt-4 position-relative"
          style={{ minHeight: "800px" }}
        >
          {/* Central box - Product System */}
          <Card
            className="text-center mx-auto shadow border-1"
            style={{
              width: "300px",
              height: "200px",
              position: "absolute",
              top: "60%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              cursor: "pointer",
              backgroundColor: "#4B6E96",
              borderColor: "rgb(42, 18, 79)",
              borderRadius: "15px",
              transition: "transform 0.3s, box-shadow 0.3s",
              zIndex: 10,
            }}
            onClick={navigateToProduct}
            onMouseOver={(e) => {
              e.currentTarget.style.transform =
                "translate(-50%, -50%) scale(1.03)";
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
            className="text-center position-absolute shadow border-1"
            style={{
              width: "220px",
              top: "10%",
              left: "50%",
              transform: "translateX(-50%)",
              backgroundColor: "rgb(192, 216, 240)", // Light blue background
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
            className="text-center position-absolute shadow border-1"
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
            className="text-center position-absolute shadow border-1"
            style={{
              width: "220px",
              top: "60%",
              right: "10%",
              transform: "translateY(-50%)",
              backgroundColor: " #fff3e0", // Light orange background
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
                  disabled={manufacturersLoading}
                >
                  {selectedManufacturer ||
                    (manufacturersLoading ? "Loading..." : "Hersteller wählen")}
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
          {/*arrows*/}
          <div className="connection-lines position-relative">
            {/* Top connection - Product to Marketplace */}
            <svg
              style={{
                position: "relative",
                top: "230px",
                left: "600px",
                zIndex: 1,
                overflow: "visible",
              }}
            >
              {/* Import arrow (bottom to top) */}
              <path
                d="M0,150 0,24"
                fill="none"
                stroke="#4a90e2"
                strokeWidth="3"
                markerEnd="url(#arrow-top)"
                style={{
                  filter: "drop-shadow(1px -1px 2px rgba(0, 0, 0, 0.1))",
                }}
              />

              {/* Export arrow (top to bottom) */}
              <path
                d="M80,10 80,137"
                fill="none"
                stroke="#4a90e2"
                strokeWidth="3"
                markerEnd="url(#arrow-bottom)"
                style={{
                  filter: "drop-shadow(1px 1px 2px rgba(0, 0, 0, 0.1))",
                }}
              />

              <defs>
                {/* arrow-head (bottom to top) - More refined arrow shape */}
                <marker
                  id="arrow-top"
                  markerWidth="10"
                  markerHeight="6"
                  refX="8"
                  refY="3"
                  orient="auto"
                >
                  <path d="M0,0 L10,3 L0,6 L3,3 Z" fill="#4a90e2" />{" "}
                  {/* More pointed */}
                </marker>
                <marker
                  id="arrow-bottom"
                  markerWidth="10"
                  markerHeight="6"
                  refX="7"
                  refY="3"
                  orient="auto"
                >
                  <path d="M0,0 L10,3 L0,6 L3,3 Z" fill="#4a90e2" />
                </marker>
              </defs>
            </svg>

            {/* Left connection - Product to Shop */}
            <svg
              style={{
                position: "relative",
                top: "450px",
                left: "46px",
                zIndex: 1,
                overflow: "visible",
              }}
            >
              {/* Import arrow (right to left) */}
              <path
                d="M160,60 5,60"
                fill="none"
                stroke="#43b581"
                strokeWidth="3"
                markerEnd="url(#arrow-left)"
                style={{
                  filter: "drop-shadow(-1px 1px 2px rgba(0, 0, 0, 0.1))",
                }}
              />

              {/* Export arrow (left to right) */}
              <path
                d="M-10,0 140,0"
                fill="none"
                stroke="#43b581"
                strokeWidth="3"
                markerEnd="url(#arrow-right)"
                style={{
                  filter: "drop-shadow(1px -1px 2px rgba(0, 0, 0, 0.1))",
                }}
              />

              <defs>
                {/* arrow-head (center to left) */}
                <marker
                  id="arrow-left"
                  markerWidth="10"
                  markerHeight="6"
                  refX="2"
                  refY="3"
                >
                  <path d="M10,0 L0,3 L10,6 L7,3 Z" fill="#43b581" />
                </marker>
                <marker
                  id="arrow-right"
                  markerWidth="10"
                  markerHeight="6"
                  refX="8"
                  refY="3"
                  orient="auto"
                >
                  <path d="M0,0 L10,3 L0,6 L3,3 Z" fill="#43b581" />
                </marker>
              </defs>
            </svg>

            {/* Right connection - Product to Manufacturer */}
            <svg
              style={{
                position: "relative",
                top: "450px",
                left: "210px",
                zIndex: 1,
                overflow: "visible",
              }}
            >
              {/* Import arrow (left to right) */}
              <path
                d="M-20,0 135,0"
                fill="none"
                stroke="#faa61a"
                strokeWidth="3"
                markerEnd="url(#arrow-right-orange)"
                style={{
                  filter: "drop-shadow(1px -1px 2px rgba(0, 0, 0, 0.1))",
                }}
              />

              {/* Export arrow (right to left) */}
              <path
                d="M150,60 0,60"
                fill="none"
                stroke="#faa61a"
                strokeWidth="3"
                markerEnd="url(#arrow-left-orange)"
                style={{
                  filter: "drop-shadow(-1px 1px 2px rgba(0, 0, 0, 0.1))",
                }}
              />

              <defs>
                <marker
                  id="arrow-right-orange"
                  markerWidth="10"
                  markerHeight="6"
                  refX="8"
                  refY="3"
                  orient="auto"
                >
                  <path d="M0,0 L10,3 L0,6 L3,3 Z" fill="#faa61a" />
                </marker>
                <marker
                  id="arrow-left-orange"
                  markerWidth="10"
                  markerHeight="6"
                  refX="2"
                  refY="3"
                >
                  <path d="M10,0 L0,3 L10,6 L7,3 Z" fill="#faa61a" />
                </marker>
              </defs>
            </svg>
          </div>
        </Container>
      </div>

      <Container className="mb-4">
        {/* Last Orders Section */}
        <Card className="mb-4 shadow-sm border-0">
          <Card.Header className="bg-white border-bottom border-2 border-primary">
            <h5 className="mb-0 text-primary fw-bold">Letzte Bestellungen</h5>
          </Card.Header>
          <Card.Body>
            <ListGroup variant="flush">
              <ListGroup.Item className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="mb-1">ORD-12345</h6>
                  <p className="mb-0 text-muted small">
                    Max Mustermann • 08.04.2025
                  </p>
                </div>
                <Badge bg="success" pill>
                  Abgeschlossen
                </Badge>
              </ListGroup.Item>
              <ListGroup.Item className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="mb-1">ORD-12344</h6>
                  <p className="mb-0 text-muted small">
                    Maria Schmidt • 07.04.2025
                  </p>
                </div>
                <Badge bg="warning" text="dark" pill>
                  In Bearbeitung
                </Badge>
              </ListGroup.Item>
              <ListGroup.Item className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="mb-1">ORD-12343</h6>
                  <p className="mb-0 text-muted small">
                    Thomas Weber • 06.04.2025
                  </p>
                </div>
                <Badge bg="info" pill>
                  Versendet
                </Badge>
              </ListGroup.Item>
            </ListGroup>
            <Button variant="outline-primary" className="w-100 mt-3">
              Alle Bestellungen anzeigen
            </Button>
          </Card.Body>
        </Card>

        {/* Added Articles Section */}
        <Card className="mb-4 shadow-sm border-0">
          <Card.Header className="bg-white border-bottom border-2 border-success">
            <h5 className="mb-0 text-success fw-bold">Hinzugefügte Artikel</h5>
          </Card.Header>
          <Card.Body>
            <ListGroup variant="flush">
              <ListGroup.Item className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="mb-1">Samsung Galaxy S22</h6>
                  <p className="mb-0 text-muted small">SKU-5678 • Elektronik</p>
                </div>
                <small className="text-muted">Heute</small>
              </ListGroup.Item>
              <ListGroup.Item className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="mb-1">Nike Laufschuhe</h6>
                  <p className="mb-0 text-muted small">SKU-8792 • Kleidung</p>
                </div>
                <small className="text-muted">Gestern</small>
              </ListGroup.Item>
              <ListGroup.Item className="d-flex justify-content-between align-items-center">
                <div>
                  <h6 className="mb-1">Philips Kaffeemaschine</h6>
                  <p className="mb-0 text-muted small">SKU-2457 • Haushalt</p>
                </div>
                <small className="text-muted">05.04.2025</small>
              </ListGroup.Item>
            </ListGroup>
            <Button variant="outline-success" className="w-100 mt-3">
              Alle Artikel anzeigen
            </Button>
          </Card.Body>
        </Card>

        {/* Error Log Section */}
        <Card className="mb-4 shadow-sm border-0">
          <Card.Header className="bg-white border-bottom border-2 border-danger">
            <h5 className="mb-0 text-danger fw-bold">Fehler Logs</h5>
          </Card.Header>
          <Card.Body>
            <ListGroup variant="flush">
              <ListGroup.Item>
                <div className="d-flex justify-content-between">
                  <h6 className="mb-1">Bestellfehler: ORD-12342</h6>
                  <Badge bg="danger" pill>
                    Kritisch
                  </Badge>
                </div>
                <p className="mb-1">
                  Zahlung fehlgeschlagen - Transaktionsfehler
                </p>
                <small className="text-muted">08.04.2025, 10:25 Uhr</small>
              </ListGroup.Item>
              <ListGroup.Item>
                <div className="d-flex justify-content-between">
                  <h6 className="mb-1">Systemfehler</h6>
                  <Badge bg="warning" text="dark" pill>
                    Mittel
                  </Badge>
                </div>
                <p className="mb-1">Datenbanksynchronisierung unterbrochen</p>
                <small className="text-muted">07.04.2025, 14:12 Uhr</small>
              </ListGroup.Item>
              <ListGroup.Item>
                <div className="d-flex justify-content-between">
                  <h6 className="mb-1">Netzwerkfehler</h6>
                  <Badge bg="info" pill>
                    Niedrig
                  </Badge>
                </div>
                <p className="mb-1">
                  Kurzzeitiger Verbindungsabbruch zum Server
                </p>
                <small className="text-muted">06.04.2025, 08:45 Uhr</small>
              </ListGroup.Item>
            </ListGroup>
            <Button variant="outline-danger" className="w-100 mt-3">
              Alle Fehler anzeigen
            </Button>
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default Dashboard;
