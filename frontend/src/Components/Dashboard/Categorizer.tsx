import React, { useState, useEffect } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Form,
  Button,
  Table,
  Badge,
  Pagination,
  Dropdown,
  InputGroup,
  Spinner,
  Alert,
  Navbar,
} from "react-bootstrap";
import {
  FaFilter,
  FaSearch,
  FaTags,
  FaSort,
  FaDownload,
  FaPlus,
} from "react-icons/fa";
import axios from "axios";
import { IoExitOutline } from "react-icons/io5";
import { Link, useNavigate } from "react-router-dom";

interface Product {
  id: number;
  product_identifier: string;
  sku: string;
  ean: string;
  create_datetime: string;
  update_datetime: string;
  manufacturer_name?: string;
  manufacturer_id: number | null;
  updated: number;
  channel_id: number;
}

interface ProductManufacturer {
  id: number;
  producer_id: string;
  producer_name: string;
  weee_number: string;
  weee_name: string;
}

interface Channel {
  id: number;
  channel_token: string;
  channel_type_id: number;
  channel_type_name?: string;
}

const ProductCategorizer: React.FC = () => {
  // State variables
  const [products, setProducts] = useState<Product[]>([]);
  const [manufacturers, setManufacturers] = useState<ProductManufacturer[]>([]);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [selectedManufacturer, setSelectedManufacturer] = useState<
    number | null
  >(null);
  const [selectedChannel, setSelectedChannel] = useState<number | null>(null);
  const [sortField, setSortField] = useState<string>("update_datetime");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  const [selectedProducts, setSelectedProducts] = useState<number[]>([]);
  const [bulkAction, setBulkAction] = useState<string>("");
  const [message, setMessage] = useState<{
    type: "success" | "danger" | null;
    text: string;
  }>({ type: null, text: "" });

  // Fetch data on component mount
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("accessToken");
        if (!token) {
          throw new Error("No authentication token found");
        }

        // Fetch all required data
        const [productsRes, manufacturersRes, channelsRes] = await Promise.all([
          axios.get("http://localhost:3002/api/products", {
            headers: { Authorization: `Bearer ${token}` },
            params: {
              page: currentPage,
              limit: pageSize,
              search: searchTerm,
              manufacturer: selectedManufacturer,
              channel: selectedChannel,
              sort: sortField,
              direction: sortDirection,
            },
          }),
          axios.get("http://localhost:3002/api/manufacturers", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get("http://localhost:3002/api/channels", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        setProducts(productsRes.data.products);
        setTotalPages(Math.ceil(productsRes.data.total / pageSize));
        setManufacturers(manufacturersRes.data);
        setChannels(channelsRes.data);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [
    currentPage,
    pageSize,
    searchTerm,
    selectedManufacturer,
    selectedChannel,
    sortField,
    sortDirection,
  ]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleSort = (field: string) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleSelectProduct = (productId: number) => {
    if (selectedProducts.includes(productId)) {
      setSelectedProducts(selectedProducts.filter((id) => id !== productId));
    } else {
      setSelectedProducts([...selectedProducts, productId]);
    }
  };

  const handleSelectAll = () => {
    if (selectedProducts.length === products.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(products.map((product) => product.id));
    }
  };

  const handleBulkAction = async () => {
    if (!bulkAction || selectedProducts.length === 0) return;

    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      await axios.post(
        "http://localhost:3002/api/products/bulk",
        {
          productIds: selectedProducts,
          action: bulkAction,
          manufacturerId:
            bulkAction === "assign-manufacturer"
              ? selectedManufacturer
              : undefined,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setMessage({
        type: "success",
        text: `Successfully ${bulkAction.replace("-", " ")}ed ${
          selectedProducts.length
        } products`,
      });

      // Reset selection and refresh data
      setSelectedProducts([]);
      setBulkAction("");

      // Refresh data by triggering a state change
      setSortField((prevState) => prevState);
    } catch (err) {
      console.error("Error performing bulk action:", err);
      setMessage({
        type: "danger",
        text: "Failed to perform bulk action. Please try again.",
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Create pagination items
  const paginationItems = [];
  for (let number = 1; number <= totalPages; number++) {
    if (
      number === 1 ||
      number === totalPages ||
      (number >= currentPage - 2 && number <= currentPage + 2)
    ) {
      paginationItems.push(
        <Pagination.Item
          key={number}
          active={number === currentPage}
          onClick={() => handlePageChange(number)}
        >
          {number}
        </Pagination.Item>
      );
    } else if (
      (number === currentPage - 3 && currentPage > 3) ||
      (number === currentPage + 3 && currentPage < totalPages - 2)
    ) {
      paginationItems.push(<Pagination.Ellipsis key={`ellipsis-${number}`} />);
    }
  }

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
                  backgroundColor: "blue",
                  border: "none",
                  width: "40px",
                  height: "40px",
                  borderRadius: "50%",
                  fontWeight: "bold",
                  color: "white",
                }}
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
      <Container fluid className="mt-4">
        <Card className="shadow-sm">
          <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
            <div>
              <FaTags className="me-2" /> Product Categorizer
            </div>
          </Card.Header>
          <Card.Body>
            {message.type && (
              <Alert
                variant={message.type}
                dismissible
                onClose={() => setMessage({ type: null, text: "" })}
              >
                {message.text}
              </Alert>
            )}

            {/* Filters */}
            <Form onSubmit={handleSearch} className="mb-4">
              <Row>
                <Col md={3}>
                  <Form.Group>
                    <InputGroup>
                      <Form.Control
                        type="text"
                        placeholder="Search products..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      <Button variant="outline-secondary" type="submit">
                        <FaSearch />
                      </Button>
                    </InputGroup>
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Select
                      value={selectedManufacturer || ""}
                      onChange={(e) =>
                        setSelectedManufacturer(
                          e.target.value ? parseInt(e.target.value) : null
                        )
                      }
                    >
                      <option value="">All Manufacturers</option>
                      {manufacturers.map((manufacturer) => (
                        <option key={manufacturer.id} value={manufacturer.id}>
                          {manufacturer.producer_name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <Form.Group>
                    <Form.Select
                      value={selectedChannel || ""}
                      onChange={(e) =>
                        setSelectedChannel(
                          e.target.value ? parseInt(e.target.value) : null
                        )
                      }
                    >
                      <option value="">All Channels</option>
                      {channels.map((channel) => (
                        <option key={channel.id} value={channel.id}>
                          {channel.channel_type_name || `Channel ${channel.id}`}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
                <Col md={3}>
                  <div className="d-flex">
                    <Button variant="primary" type="submit" className="me-2">
                      <FaFilter /> Filter
                    </Button>
                    <Button
                      variant="outline-secondary"
                      onClick={() => {
                        setSearchTerm("");
                        setSelectedManufacturer(null);
                        setSelectedChannel(null);
                        setSortField("update_datetime");
                        setSortDirection("desc");
                      }}
                    >
                      Clear
                    </Button>
                  </div>
                </Col>
              </Row>
            </Form>

            {/* Bulk Actions */}
            {selectedProducts.length > 0 && (
              <div className="mb-3 d-flex align-items-center">
                <span className="me-2">
                  <Badge bg="info">{selectedProducts.length} selected</Badge>
                </span>
                <Form.Select
                  value={bulkAction}
                  onChange={(e) => setBulkAction(e.target.value)}
                  className="me-2"
                  style={{ width: "auto" }}
                >
                  <option value="">Bulk Action</option>
                  <option value="assign-manufacturer">
                    Assign Manufacturer
                  </option>
                  <option value="mark-updated">Mark as Updated</option>
                  <option value="export">Export Data</option>
                </Form.Select>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleBulkAction}
                  disabled={!bulkAction || selectedProducts.length === 0}
                >
                  Apply
                </Button>
              </div>
            )}

            {/* Products Table */}
            {loading ? (
              <div className="text-center my-5">
                <Spinner animation="border" variant="primary" />
              </div>
            ) : error ? (
              <Alert variant="danger">{error}</Alert>
            ) : (
              <>
                <div className="table-responsive">
                  <Table striped hover className="align-middle">
                    <thead>
                      <tr>
                        <th>
                          <Form.Check
                            type="checkbox"
                            onChange={handleSelectAll}
                            checked={
                              selectedProducts.length === products.length &&
                              products.length > 0
                            }
                          />
                        </th>
                        <th
                          onClick={() => handleSort("product_identifier")}
                          className="cursor-pointer"
                        >
                          ID{" "}
                          {sortField === "product_identifier" &&
                            (sortDirection === "asc" ? "▲" : "▼")}
                        </th>
                        <th
                          onClick={() => handleSort("sku")}
                          className="cursor-pointer"
                        >
                          SKU{" "}
                          {sortField === "sku" &&
                            (sortDirection === "asc" ? "▲" : "▼")}
                        </th>
                        <th
                          onClick={() => handleSort("ean")}
                          className="cursor-pointer"
                        >
                          EAN{" "}
                          {sortField === "ean" &&
                            (sortDirection === "asc" ? "▲" : "▼")}
                        </th>
                        <th
                          onClick={() => handleSort("manufacturer_id")}
                          className="cursor-pointer"
                        >
                          Manufacturer{" "}
                          {sortField === "manufacturer_id" &&
                            (sortDirection === "asc" ? "▲" : "▼")}
                        </th>
                        <th
                          onClick={() => handleSort("channel_id")}
                          className="cursor-pointer"
                        >
                          Channel{" "}
                          {sortField === "channel_id" &&
                            (sortDirection === "asc" ? "▲" : "▼")}
                        </th>
                        <th
                          onClick={() => handleSort("update_datetime")}
                          className="cursor-pointer"
                        >
                          Updated{" "}
                          {sortField === "update_datetime" &&
                            (sortDirection === "asc" ? "▲" : "▼")}
                        </th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="text-center">
                            No products found
                          </td>
                        </tr>
                      ) : (
                        products.map((product) => (
                          <tr key={product.id}>
                            <td>
                              <Form.Check
                                type="checkbox"
                                checked={selectedProducts.includes(product.id)}
                                onChange={() => handleSelectProduct(product.id)}
                              />
                            </td>
                            <td>{product.product_identifier}</td>
                            <td>{product.sku}</td>
                            <td>{product.ean}</td>
                            <td>
                              {product.manufacturer_name || (
                                <Badge bg="light" text="dark">
                                  Not Assigned
                                </Badge>
                              )}
                            </td>
                            <td>
                              {channels.find((c) => c.id === product.channel_id)
                                ?.channel_type_name ||
                                `Channel ${product.channel_id}`}
                            </td>
                            <td>
                              {new Date(
                                product.update_datetime
                              ).toLocaleDateString()}
                              {product.updated === 1 && (
                                <Badge bg="success" className="ms-2">
                                  Updated
                                </Badge>
                              )}
                            </td>
                            <td>
                              <Dropdown>
                                <Dropdown.Toggle
                                  variant="light"
                                  size="sm"
                                  id={`dropdown-${product.id}`}
                                >
                                  Actions
                                </Dropdown.Toggle>
                                <Dropdown.Menu>
                                  <Dropdown.Item>Edit</Dropdown.Item>
                                  <Dropdown.Item>View Details</Dropdown.Item>
                                  <Dropdown.Item>View Data</Dropdown.Item>
                                  <Dropdown.Divider />
                                  <Dropdown.Item>
                                    Assign Manufacturer
                                  </Dropdown.Item>
                                </Dropdown.Menu>
                              </Dropdown>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </Table>
                </div>

                {/* Pagination */}
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <Form.Select
                      className="d-inline-block"
                      style={{ width: "auto" }}
                      value={pageSize}
                      onChange={(e) => {
                        setPageSize(parseInt(e.target.value));
                        setCurrentPage(1);
                      }}
                    >
                      {[10, 25, 50, 100].map((size) => (
                        <option key={size} value={size}>
                          {size} per page
                        </option>
                      ))}
                    </Form.Select>
                  </div>
                  <Pagination>{paginationItems}</Pagination>
                </div>
              </>
            )}
          </Card.Body>
        </Card>
      </Container>
    </div>
  );
};

export default ProductCategorizer;
