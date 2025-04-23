import { useState, useEffect, useRef, useCallback } from "react"; // Added useRef, useCallback
import {
  Container,
  Card,
  Dropdown,
  Button,
  ListGroup,
  Badge,
  Spinner,
  Alert,
} from "react-bootstrap";
import { BsArrowRight, BsPlus } from "react-icons/bs";
import NavbarComponent from "./NavbarComponent";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { debounce } from "lodash"; // Import debounce

// --- Interfaces ---
interface Channel {
  channel_token: string;
  id: number;
  user_id?: number;
  comment: string;
  host: string;
  client_id?: string | null;
  client_secret?: string | null;
  retrieval_days?: number | null;
  channel_type_id: number;
  channel_type_name: string;
}

// API response structure
interface ChannelsResponse {
  channels: Channel[];
  total_count: number;
}

// --- API Configuration ---
const apiUrl =
  import.meta.env.VITE_SERVER_API_URL || "http://192.168.0.128:8000";
const CHANNELS_API_ENDPOINT = `${apiUrl}/channels/`;

// --- Arrow Path State ---
interface ArrowPaths {
  productToMarketplace: { import: string; export: string };
  shopToProduct: { import: string; export: string };
  productToChannel: { import: string; export: string };
}

const initialArrowPaths: ArrowPaths = {
  productToMarketplace: { import: "", export: "" },
  shopToProduct: { import: "", export: "" },
  productToChannel: { import: "", export: "" },
};

// --- Component ---
const Dashboard = () => {
  const navigate = useNavigate();

  // --- State ---
  // Static data
  const [shops] = useState(["Shop 1", "Shop 2", "Shop 3"]);
  const [marketplaces] = useState(["Amazon", "eBay", "Otto"]);

  // Channel data
  const [channelsData, setChannelsData] = useState<ChannelsResponse | null>(
    null
  );
  const [channelsLoading, setChannelsLoading] = useState<boolean>(true);
  const [channelsError, setChannelsError] = useState<string | null>(null);

  // Selected items
  const [selectedShop, setSelectedShop] = useState<string>("");
  const [selectedChannelToken, setSelectedChannelToken] = useState<
    string | null
  >(null);
  const [SelectedChannelName, setSelectedChannelName] = useState<string | null>(
    null
  );
  const [selectedMarketplace, setSelectedMarketplace] = useState<string>("");

  // Refs for Boxes and Container
  const containerRef = useRef<HTMLDivElement>(null);
  const productBoxRef = useRef<HTMLDivElement>(null);
  const shopBoxRef = useRef<HTMLDivElement>(null);
  const channelBoxRef = useRef<HTMLDivElement>(null);
  const marketplaceBoxRef = useRef<HTMLDivElement>(null);

  // State for SVG Arrow Paths
  const [arrowPaths, setArrowPaths] = useState<ArrowPaths>(initialArrowPaths);

  const handleChannelSelect = (channel: Channel) => {
    setSelectedChannelToken(channel.channel_token);
    setSelectedChannelName(channel.comment);
    // Any other state updates needed when selecting a channel
  };

  const fetchChannels = useCallback(async () => {
    setChannelsLoading(true);
    setChannelsError(null);

    try {
      const response = await axios.get<ChannelsResponse>(
        `${apiUrl}/channels/`,
        {
          params: {
            page: 1, // First page is enough for dropdown
            limit: 100, // Adjust limit as needed for dropdown
          },
        }
      );

      setChannelsData(response.data);

      // If you need to pre-select a channel, do it here
      if (response.data.channels.length > 0 && !selectedChannelToken) {
        handleChannelSelect(response.data.channels[0]);
      }
    } catch (err) {
      console.error("Error fetching channels:", err);
      let errorMsg = "Failed to load channels";
      if (axios.isAxiosError(err)) {
        errorMsg = err.response?.data?.detail || err.message;
      } else if (err instanceof Error) {
        errorMsg = err.message;
      }
      setChannelsError(errorMsg);
    } finally {
      setChannelsLoading(false);
    }
  }, [apiUrl, selectedChannelToken]);
  // --- Data Fetching (Keep as is) ---
  useEffect(() => {
    fetchChannels();
  }, [fetchChannels]);

  // --- Arrow Calculation Logic ---
  const updateArrowPaths = useCallback(() => {
    if (
      !containerRef.current ||
      !productBoxRef.current ||
      !shopBoxRef.current ||
      !channelBoxRef.current ||
      !marketplaceBoxRef.current
    ) {
      // Refs not ready yet
      return;
    }

    const containerRect = containerRef.current.getBoundingClientRect();
    const productRect = productBoxRef.current.getBoundingClientRect();
    const shopRect = shopBoxRef.current.getBoundingClientRect();
    const channelRect = channelBoxRef.current.getBoundingClientRect();
    const marketplaceRect = marketplaceBoxRef.current.getBoundingClientRect();

    // Calculate relative positions within the container
    const getRelativePos = (rect: DOMRect) => ({
      top: rect.top - containerRect.top,
      left: rect.left - containerRect.left,
      right: rect.right - containerRect.left,
      bottom: rect.bottom - containerRect.top,
      width: rect.width,
      height: rect.height,
      centerX: rect.left - containerRect.left + rect.width / 2,
      centerY: rect.top - containerRect.top + rect.height / 2,
    });

    const pPos = getRelativePos(productRect);
    const sPos = getRelativePos(shopRect);
    const cPos = getRelativePos(channelRect);
    const mPos = getRelativePos(marketplaceRect);

    // Define connection points (adjust offsets slightly for better visual connection)
    const arrowOffset = -10; // How far from the edge the arrow starts/ends visually
    const horizontalGapOffset = 35; // Offset for horizontal arrows start/end points

    // --- Product <-> Marketplace (Top) ---
    const productTopCenter = { x: pPos.centerX, y: pPos.top + arrowOffset };
    const marketplaceBottomCenter = {
      x: mPos.centerX,
      y: mPos.bottom - arrowOffset,
    };
    // Add intermediate points for curved or offset paths if needed
    const productToMarketplaceImport = `M ${
      marketplaceBottomCenter.x - horizontalGapOffset
    },${marketplaceBottomCenter.y} L ${
      productTopCenter.x - horizontalGapOffset
    },${productTopCenter.y}`; // Left arrow (import to product)
    const productToMarketplaceExport = `M ${
      marketplaceBottomCenter.x + horizontalGapOffset
    },${marketplaceBottomCenter.y} L ${
      productTopCenter.x + horizontalGapOffset
    },${productTopCenter.y}`; // Right arrow (export from product)

    // --- Product <-> Shop (Left) ---
    const productLeftCenter = {
      x: pPos.left + arrowOffset,
      y: pPos.centerY,
    };
    const shopRightCenter = { x: sPos.right - arrowOffset, y: sPos.centerY };
    const shopToProductImport = `M ${productLeftCenter.x},${
      productLeftCenter.y - horizontalGapOffset
    } L ${shopRightCenter.x},${shopRightCenter.y - horizontalGapOffset}`;
    const shopToProductExport = `M ${productLeftCenter.x},${
      productLeftCenter.y + horizontalGapOffset
    } L ${shopRightCenter.x},${shopRightCenter.y + horizontalGapOffset}`; // Bottom arrow (export from product)

    // --- Product <-> Channel (Right) ---
    const productRightCenter = { x: pPos.right - arrowOffset, y: pPos.centerY };
    const channelLeftCenter = { x: cPos.left + arrowOffset, y: cPos.centerY };
    const productToChannelImport = `M ${productRightCenter.x},${
      productRightCenter.y - horizontalGapOffset
    } L ${channelLeftCenter.x},${channelLeftCenter.y - horizontalGapOffset}`; // Top arrow (import to product)
    const productToChannelExport = `M ${productRightCenter.x},${
      productRightCenter.y + horizontalGapOffset
    } L ${channelLeftCenter.x},${channelLeftCenter.y + horizontalGapOffset}`;

    setArrowPaths({
      productToMarketplace: {
        import: productToMarketplaceImport,
        export: productToMarketplaceExport,
      },
      shopToProduct: {
        import: shopToProductImport,
        export: shopToProductExport,
      },
      productToChannel: {
        import: productToChannelImport,
        export: productToChannelExport,
      },
    });
  }, []); // No dependencies, relies on refs being current when called

  // Debounce the update function
  // Adjust the debounce time (e.g., 100ms) as needed
  const debouncedUpdateArrowPaths = useCallback(
    debounce(updateArrowPaths, 100),
    [updateArrowPaths]
  );

  // Effect to calculate paths on mount and window resize
  useEffect(() => {
    // Initial calculation
    // Use requestAnimationFrame to ensure layout is stable after initial render
    const rafId = requestAnimationFrame(updateArrowPaths);

    // Add resize listener
    window.addEventListener("resize", debouncedUpdateArrowPaths);

    // Cleanup
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("resize", debouncedUpdateArrowPaths);
      debouncedUpdateArrowPaths.cancel(); // Cancel any pending debounced calls
    };
  }, [updateArrowPaths, debouncedUpdateArrowPaths]); // Include debounced function in dependencies

  // --- Navigation and Actions (Keep as is) ---
  const navigateToProduct = () => {
    console.log("Navigating to Product page");
    navigate("/ProductSystem");
  };
  const navigateToShop = () => {
    console.log(`Navigating to shop: ${selectedShop}`); /* navigate(...) */
  };
  const navigateToChannel = () => {
    console.log(
      `Navigating to Channel page (selected token: ${selectedChannelToken})`
    );
    navigate("/channels");
  };
  const navigateToMarketplace = () => {
    console.log(
      `Navigating to marketplace: ${selectedMarketplace}`
    ); /* navigate(...) */
  };

  const navigateToFilesOverview = () => {
    console.log(`Navigating to files overview`);
    navigate("/filesOverview");
  };
  const addNewShop = () => {
    console.log("Adding new shop"); /* navigate(...) */
  };
  const addNewChannel = () => {
    console.log("Adding new Channel - navigating");
    navigate("/channels", { state: { showAddModal: true } });
  };
  const addNewMarketplace = () => {
    console.log("Adding new marketplace"); /* navigate(...) */
  };

  // --- Render ---
  return (
    <div
      className="dashboard-wrapper"
      style={{
        position: "relative",
        minHeight: "150vh", // Reduced height a bit
        width: "100%",
        background: "#f5f5f5",
        overflow: "hidden",
      }}
    >
      {/* Background pattern */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          opacity: 0,
          pointerEvents: "none",
          backgroundImage: `linear-gradient(#4A6E96 1px, transparent 0px), linear-gradient(90deg, #4A6E96 1px, transparent 0px)`,
          backgroundSize: "40px 40px",
          zIndex: 0,
        }}
      ></div>

      <div>
        <NavbarComponent />

        {/* === Main Layout Container === */}
        {/* Added ref here */}
        <Container
          ref={containerRef}
          className="mt-4 position-relative"
          style={{ minHeight: "800px" }} // Ensure container has enough height
        >
          {/* === Boxes === */}
          {/* Pass refs to the cards */}
          {/* Central box - Product System */}
          <Card
            ref={productBoxRef}
            className="text-center mx-auto shadow border-1"
            style={{
              width: "300px",
              height: "200px",
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)", // Centered
              cursor: "pointer",
              backgroundColor: "#4B6E96",
              borderColor: "rgb(42, 18, 79)",
              borderRadius: "15px",
              transition: "transform 0.3s, box-shadow 0.3s",
              zIndex: 10,
            }}
            onClick={navigateToProduct}
            // Removed hover style manipulation via JS, prefer CSS :hover
          >
            <Card.Body className="d-flex flex-column align-items-center justify-content-center">
              <Card.Title className="fw-bold fs-4 mb-3 text-white">
                Produktsystem
              </Card.Title>
              <div
                className="bg-light rounded-circle d-flex align-items-center justify-content-center mb-3"
                style={{ width: "60px", height: "60px" }}
              >
                <i className="fs-3 text-primary">🛒</i>
              </div>
              <Card.Text className="text-white-50">
                Produkte verwalten
              </Card.Text>
            </Card.Body>
          </Card>

          {/* Top box - Zielsystem */}
          <Card
            ref={marketplaceBoxRef}
            className="text-center position-absolute shadow border-1"
            style={{
              width: "220px",
              top: "0%",
              left: "50%",
              transform: "translateX(-50%)", // Positioned top-center
              backgroundColor: "rgb(192, 216, 240)",
              borderRadius: "12px",
              zIndex: 5, // Lower z-index than center
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
                  className="w-100 text-truncate"
                >
                  {selectedMarketplace || "Marketplace wählen"}
                </Dropdown.Toggle>
                <Dropdown.Menu className="w-100">
                  {marketplaces.map((m, idx) => (
                    <Dropdown.Item
                      key={idx}
                      onClick={() => setSelectedMarketplace(m)}
                    >
                      {m}
                    </Dropdown.Item>
                  ))}
                </Dropdown.Menu>
              </Dropdown>
              <div className="d-flex justify-content-between">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={addNewMarketplace}
                  className="me-2"
                  aria-label="Add"
                >
                  <BsPlus size={18} />
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={navigateToMarketplace}
                  disabled={!selectedMarketplace}
                  aria-label="Go"
                >
                  <BsArrowRight size={18} />
                </Button>
              </div>
            </Card.Body>
          </Card>

          {/* Left box - Hauptsystem */}
          <Card
            ref={shopBoxRef}
            className="text-center position-absolute shadow border-1"
            style={{
              width: "220px",
              top: "50%",
              left: "10%",
              transform: "translateY(-50%)", // Positioned middle-left
              backgroundColor: "#e8f5e9",
              borderRadius: "12px",
              zIndex: 5,
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
                  className="w-100 text-truncate"
                >
                  {selectedShop || "Shop wählen"}
                </Dropdown.Toggle>
                <Dropdown.Menu className="w-100">
                  {shops.map((s, idx) => (
                    <Dropdown.Item key={idx} onClick={() => setSelectedShop(s)}>
                      {s}
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
                  aria-label="Add"
                >
                  <BsPlus size={18} />
                </Button>
                <Button
                  variant="success"
                  size="sm"
                  onClick={navigateToShop}
                  disabled={!selectedShop}
                  aria-label="Go"
                >
                  <BsArrowRight size={18} />
                </Button>
              </div>
            </Card.Body>
          </Card>

          {/* Right box - Datensystem */}
          <Card
            ref={channelBoxRef}
            className="text-center position-absolute shadow border-1"
            style={{
              width: "220px",
              top: "50%",
              right: "10%",
              transform: "translateY(-50%)", // Positioned middle-right
              backgroundColor: "#fff3e0",
              borderRadius: "12px",
              zIndex: 5,
            }}
          >
            <Card.Body>
              <Card.Title className="fw-bold mb-2">Datensystem</Card.Title>
              <Card.Text className="mb-2 text-muted small">
                Hersteller / Channel
              </Card.Text>
              {channelsError && (
                <Alert variant="danger" className="p-1 small text-center">
                  {channelsError}
                </Alert>
              )}
              <Dropdown className="mb-2">
                <Dropdown.Toggle
                  variant="outline-warning"
                  id="channel-dropdown"
                  size="sm"
                  className="w-100 text-truncate"
                  disabled={channelsLoading}
                >
                  {channelsLoading ? (
                    <Spinner as="span" animation="border" size="sm" />
                  ) : (
                    // USE THE STATE VARIABLE HERE (Capital 'S')
                    SelectedChannelName || "Hersteller wählen"
                  )}
                </Dropdown.Toggle>
                <Dropdown.Menu
                  className="w-100"
                  style={{ maxHeight: "200px", overflowY: "auto" }}
                >
                  {channelsData &&
                  channelsData.channels && // Good practice to check both levels
                  channelsData.channels.length > 0 ? (
                    channelsData.channels.map((c) => (
                      <Dropdown.Item
                        key={c.channel_token}
                        onClick={() => handleChannelSelect(c)} // This correctly updates SelectedChannelName state
                        active={selectedChannelToken === c.channel_token}
                      >
                        {c.comment}{" "}
                        <span className="text-muted small ms-2">
                          ({c.channel_type_name})
                        </span>
                      </Dropdown.Item>
                    ))
                  ) : (
                    <Dropdown.Item disabled>
                      {channelsLoading ? "Loading..." : "No channels found"}
                    </Dropdown.Item>
                  )}
                </Dropdown.Menu>
              </Dropdown>
              <div className="d-flex justify-content-between">
                <Button
                  variant="warning"
                  size="sm"
                  onClick={addNewChannel}
                  className="me-2"
                  aria-label="Add"
                >
                  <BsPlus size={18} />
                </Button>
                <Button
                  variant="warning"
                  size="sm"
                  onClick={navigateToChannel}
                  disabled={!selectedChannelToken}
                  aria-label="Go"
                >
                  <BsArrowRight size={18} />
                </Button>
              </div>
            </Card.Body>
          </Card>

          {/* === SVG Overlay for Arrows === */}
          <svg
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%", // Ensure SVG covers the container
              pointerEvents: "none", // Allow clicks to go through to boxes
              overflow: "visible",
              zIndex: 1, // Render below boxes if needed, or adjust box zIndex
            }}
          >
            {/* Arrow Head Definitions */}
            <defs>
              {/* Blue Arrows (Marketplace) */}
              <marker
                id="arrow-m-top"
                markerWidth="10"
                markerHeight="7"
                refX="8"
                refY="3.5"
                orient="auto"
              >
                <path d="M0,0 L10,3.5 L0,7 L2.5,3.5 Z" fill="#4a90e2" />
              </marker>
              <marker
                id="arrow-m-bottom"
                markerWidth="10"
                markerHeight="7"
                refX="2"
                refY="3.5"
                orient="auto"
              >
                <path d="M10,0 L0,3.5 L10,7 L7.5,3.5 Z" fill="#4a90e2" />
              </marker>
              {/* Green Arrows (Shop) */}
              <marker
                id="arrow-s-left"
                markerWidth="10"
                markerHeight="7"
                refX="2"
                refY="3.5"
                orient="auto"
              >
                <path d="M10,0 L0,3.5 L10,7 L7.5,3.5 Z" fill="#43b581" />
              </marker>
              <marker
                id="arrow-s-right"
                markerWidth="10"
                markerHeight="7"
                refX="8"
                refY="3.5"
                orient="auto"
              >
                <path d="M0,0 L10,3.5 L0,7 L2.5,3.5 Z" fill="#43b581" />
              </marker>
              {/* Orange Arrows (Channel) */}
              <marker
                id="arrow-c-left"
                markerWidth="10"
                markerHeight="7"
                refX="2"
                refY="3.5"
                orient="180"
              >
                <path d="M10,0 L0,3.5 L10,7 L7.5,3.5 Z" fill="#faa61a" />
              </marker>
              <marker
                id="arrow-c-right"
                markerWidth="10"
                markerHeight="7"
                refX="8"
                refY="3.5"
                orient="180"
              >
                <path d="M0,0 L10,3.5 L0,7 L2.5,3.5 Z" fill="#faa61a" />
              </marker>
            </defs>

            {/* Render Paths using state */}
            {/* Product <-> Marketplace */}
            <path
              d={arrowPaths.productToMarketplace.import}
              fill="none"
              stroke="#4a90e2"
              strokeWidth="2.5"
              markerEnd="url(#arrow-m-top)"
              style={{ filter: "drop-shadow(1px 1px 1px rgba(0,0,0,0.2))" }}
            />
            <path
              d={arrowPaths.productToMarketplace.export}
              fill="none"
              stroke="#4a90e2"
              strokeWidth="2.5"
              markerStart="url(#arrow-m-bottom)"
              style={{ filter: "drop-shadow(1px 1px 1px rgba(0,0,0,0.2))" }}
            />

            {/* Shop <-> Product */}
            <path
              d={arrowPaths.shopToProduct.import}
              fill="none"
              stroke="#43b581"
              strokeWidth="2.5"
              markerEnd="url(#arrow-s-right)"
              style={{ filter: "drop-shadow(1px 1px 1px rgba(0,0,0,0.2))" }}
            />
            <path
              d={arrowPaths.shopToProduct.export}
              fill="none"
              stroke="#43b581"
              strokeWidth="2.5"
              markerStart="url(#arrow-s-left)"
              style={{ filter: "drop-shadow(1px 1px 1px rgba(0,0,0,0.2))" }}
            />

            {/* Product <-> Channel */}
            <path
              d={arrowPaths.productToChannel.import}
              fill="none"
              stroke="#faa61a"
              strokeWidth="2.5"
              markerEnd="url(#arrow-c-left)"
              style={{ filter: "drop-shadow(1px 1px 1px rgba(0,0,0,0.2))" }}
            />
            <path
              d={arrowPaths.productToChannel.export}
              fill="none"
              stroke="#faa61a"
              strokeWidth="2.5"
              markerStart="url(#arrow-c-right)"
              style={{ filter: "drop-shadow(1px 1px 1px rgba(0,0,0,0.2))" }}
            />
          </svg>
        </Container>

        {/* Bottom Sections (Keep as is) */}
        <Container className="mt-5 mb-4 pt-5">
          {/* Last Orders */}
          <Card className="mb-4 shadow-sm border-0">
            <Card.Header className="bg-white border-bottom border-2 border-primary">
              <h5 className="mb-0 text-primary fw-bold">Letzte Bestellungen</h5>
            </Card.Header>
            <Card.Body>
              {" "}
              {/* Static */}{" "}
              <ListGroup variant="flush">
                <ListGroup.Item className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="mb-1">ORD-12345</h6>
                    <p className="mb-0 text-muted small">
                      Max Mustermann • 14.04.2025
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
                      Maria Schmidt • 13.04.2025
                    </p>
                  </div>
                  <Badge bg="warning" text="dark" pill>
                    In Bearbeitung
                  </Badge>
                </ListGroup.Item>
              </ListGroup>
              <Button variant="outline-primary" className="w-100 mt-3">
                Alle Bestellungen anzeigen
              </Button>
            </Card.Body>
          </Card>
          {/* Added Articles */}
          <Card className="mb-4 shadow-sm border-0">
            <Card.Header className="bg-white border-bottom border-2 border-success">
              <h5 className="mb-0 text-success fw-bold">
                Hinzugefügte Artikel
              </h5>
            </Card.Header>
            <Card.Body>
              {" "}
              {/* Static */}{" "}
              <ListGroup variant="flush">
                <ListGroup.Item className="d-flex justify-content-between align-items-center">
                  <div>
                    <h6 className="mb-1">Samsung Galaxy S22</h6>
                    <p className="mb-0 text-muted small">
                      SKU-5678 • Elektronik
                    </p>
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
              </ListGroup>
              <Button variant="outline-success" className="w-100 mt-3">
                Alle Artikel anzeigen
              </Button>
            </Card.Body>
          </Card>
          {/* Error Logs */}
          <Card className="mb-4 shadow-sm border-0">
            <Card.Header className="bg-white border-bottom border-2 border-danger">
              <h5 className="mb-0 text-danger fw-bold">Fehler Logs</h5>
            </Card.Header>
            <Card.Body>
              {" "}
              {/* Static */}{" "}
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
                  <small className="text-muted">14.04.2025, 10:25 Uhr</small>
                </ListGroup.Item>
                <ListGroup.Item>
                  <div className="d-flex justify-content-between">
                    <h6 className="mb-1">Systemfehler</h6>
                    <Badge bg="warning" text="dark" pill>
                      Mittel
                    </Badge>
                  </div>
                  <p className="mb-1">Datenbanksynchronisierung unterbrochen</p>
                  <small className="text-muted">13.04.2025, 14:12 Uhr</small>
                </ListGroup.Item>
              </ListGroup>
              <Button variant="outline-danger" className="w-100 mt-3">
                Alle Fehler anzeigen
              </Button>
            </Card.Body>
          </Card>
        </Container>
      </div>
      <Container
        className="mt4 position-relative"
        style={{ minHeight: "400px" }}
      >
        <button onClick={navigateToFilesOverview}>upload files</button>
      </Container>
    </div>
  );
};

export default Dashboard;
