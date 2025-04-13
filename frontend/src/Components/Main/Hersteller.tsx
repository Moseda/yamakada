import { useState, useEffect } from "react";
import {
  Container,
  Table,
  Button,
  Pagination,
  Spinner,
  Alert,
  Modal,
  Form,
} from "react-bootstrap";
import { BsPlus, BsPencil, BsTrash } from "react-icons/bs";
import axios from "axios";

const Hersteller = () => {
  const [manufacturers, setManufacturers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [limit, setLimit] = useState(10);

  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add"); // 'add' or 'edit'
  const [currentManufacturer, setCurrentManufacturer] = useState({
    id: "",
    producer_id: "",
    producer_name: "",
    weee_number: "",
    weee_name: "",
  });

  // Fetch manufacturers
  const fetchManufacturers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        `http://192.168.0.128:8000/manufacturers/?page=${currentPage}&limit=${limit}`
      );

      // Assuming the API returns data in the format shown in your paste
      setManufacturers(response.data);

      // For pagination - if your API returns metadata about total pages
      // This is a placeholder; adjust based on your actual API response format
      setTotalPages(Math.ceil(response.data.length / limit)); // Adjust this as needed

      setLoading(false);
    } catch (err) {
      setError("Failed to fetch manufacturers");
      setLoading(false);
      console.error("Error fetching manufacturers:", err);
    }
  };

  useEffect(() => {
    fetchManufacturers();
  }, [currentPage, limit]);

  // Handle modal actions
  const handleCloseModal = () => {
    setShowModal(false);
    setCurrentManufacturer({
      id: "",
      producer_id: "",
      producer_name: "",
      weee_number: "",
      weee_name: "",
    });
  };

  const handleShowModal = (mode: any, manufacturer: any = null) => {
    setModalMode(mode);
    if (manufacturer) {
      setCurrentManufacturer({
        id: manufacturer.id,
        producer_id: manufacturer.producer_id,
        producer_name: manufacturer.producer_name,
        weee_number: manufacturer.weee_number,
        weee_name: manufacturer.weee_name,
      });
    }
    setShowModal(true);
  };

  const handleInputChange = (e: { target: { name: any; value: any } }) => {
    const { name, value } = e.target;
    setCurrentManufacturer((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault();

    try {
      if (modalMode === "add") {
        // API call to add a new manufacturer
        await axios.post(
          "http://192.168.0.128:8000/manufacturers/",
          currentManufacturer
        );
        console.log("Adding manufacturer:", currentManufacturer);
      } else {
        // API call to update an existing manufacturer
        await axios.put(
          `http://192.168.0.128:8000/manufacturers/${currentManufacturer.id}`,
          currentManufacturer
        );
        console.log("Updating manufacturer:", currentManufacturer);
      }

      // Refresh the data
      fetchManufacturers();
      handleCloseModal();
    } catch (err) {
      setError(`Failed to ${modalMode} manufacturer`);
      console.error(
        `Error ${modalMode === "add" ? "adding" : "updating"} manufacturer:`,
        err
      );
    }
  };

  const handleDelete = async (id: any) => {
    if (window.confirm("Are you sure you want to delete this manufacturer?")) {
      try {
        // API call to delete manufacturer
        await axios.delete(`http://192.168.0.128:8000/manufacturers/${id}`);
        console.log("Deleting manufacturer with ID:", id);

        // Refresh the data
        fetchManufacturers();
      } catch (err) {
        setError("Failed to delete manufacturer");
        console.error("Error deleting manufacturer:", err);
      }
    }
  };

  // Generate pagination items
  const paginationItems = [];
  for (let number = 1; number <= totalPages; number++) {
    paginationItems.push(
      <Pagination.Item
        key={number}
        active={number === currentPage}
        onClick={() => setCurrentPage(number)}
      >
        {number}
      </Pagination.Item>
    );
  }

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Manufacturers</h2>
        <Button variant="primary" onClick={() => handleShowModal("add")}>
          <BsPlus className="me-1" /> Add Manufacturer
        </Button>
      </div>

      {error && <Alert variant="danger">{error}</Alert>}

      {loading ? (
        <div className="text-center my-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
        </div>
      ) : (
        <>
          <Table striped bordered hover responsive>
            <thead>
              <tr>
                <th>ID</th>
                <th>Producer Name</th>
                <th>WEEE Number</th>
                <th>WEEE Name</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {manufacturers.map((manufacturer) => (
                <tr key={manufacturer.id}>
                  <td>{manufacturer.id}</td>
                  <td>{manufacturer.producer_name}</td>
                  <td>{manufacturer.weee_number || "-"}</td>
                  <td>{manufacturer.weee_name || "-"}</td>
                  <td>
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="me-2"
                      onClick={() => handleShowModal("edit", manufacturer)}
                    >
                      <BsPencil />
                    </Button>
                    <Button
                      variant="outline-danger"
                      size="sm"
                      onClick={() => handleDelete(manufacturer.id)}
                    >
                      <BsTrash />
                    </Button>
                  </td>
                </tr>
              ))}
              {manufacturers.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center">
                    No manufacturers found
                  </td>
                </tr>
              )}
            </tbody>
          </Table>

          <div className="d-flex justify-content-between align-items-center">
            <Form.Select
              style={{ width: "auto" }}
              value={limit}
              onChange={(e) => setLimit(parseInt(e.target.value))}
            >
              <option value="5">5 per page</option>
              <option value="10">10 per page</option>
              <option value="25">25 per page</option>
              <option value="50">50 per page</option>
            </Form.Select>

            <Pagination>
              <Pagination.Prev
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
              />
              {paginationItems}
              <Pagination.Next
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
              />
            </Pagination>
          </div>
        </>
      )}

      {/* Add/Edit Manufacturer Modal */}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>
            {modalMode === "add" ? "Add New Manufacturer" : "Edit Manufacturer"}
          </Modal.Title>
        </Modal.Header>
        <Form onSubmit={handleSubmit}>
          <Modal.Body>
            <Form.Group className="mb-3">
              <Form.Label>Producer Name</Form.Label>
              <Form.Control
                type="text"
                name="producer_name"
                value={currentManufacturer.producer_name}
                onChange={handleInputChange}
                required
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>WEEE Number</Form.Label>
              <Form.Control
                type="text"
                name="weee_number"
                value={currentManufacturer.weee_number}
                onChange={handleInputChange}
              />
            </Form.Group>
            <Form.Group className="mb-3">
              <Form.Label>WEEE Name</Form.Label>
              <Form.Control
                type="text"
                name="weee_name"
                value={currentManufacturer.weee_name}
                onChange={handleInputChange}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Cancel
            </Button>
            <Button variant="primary" type="submit">
              {modalMode === "add" ? "Add" : "Save Changes"}
            </Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </Container>
  );
};

export default Hersteller;
