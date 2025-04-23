import { useState, useEffect, useCallback } from "react";
import {
  Container,
  Table,
  Button,
  Pagination,
  Spinner,
  Alert,
  Modal,
  Form,
  Row,
  Col,
} from "react-bootstrap";
import { BsPlusLg, BsPencilSquare, BsTrash3 } from "react-icons/bs";
import axios from "axios";
import NavbarComponent from "../Dashboard/NavbarComponent"; // Adjust path if needed

// --- Configuration ---
const apiUrl =
  import.meta.env.VITE_SERVER_API_URL || "http://192.168.0.128:8000";
const API_ENDPOINT = `${apiUrl}/channels/`; // Base endpoint for channels

// --- Interfaces ---
interface Channel {
  id: number; // This is actually the channel_type_id
  channel_token: string;
  user_id: number;
  comment: string;
  host: string;
  client_id: string | null;
  client_secret: string | null;
  retrieval_days: number | null;
  channel_type_id: number;
  channel_type_name: string;
}

// API response structure
interface ChannelsResponse {
  channels: Channel[];
  total_count: number;
}

// Fields likely editable in the modal
interface ChannelFormState {
  id?: number;
  user_id: number;
  channel_type_id: number;
  comment: string;
  host: string;
  client_id: string | null;
  client_secret: string | null;
  retrieval_days: number | null;
  channel_token?: string; // For display only in edit mode
}

const initialChannel: ChannelFormState = {
  user_id: 1, // Default to user ID 1 based on your API response example
  channel_type_id: 1,
  comment: "",
  host: "",
  client_id: "",
  client_secret: "",
  retrieval_days: null,
};

const Channels = () => {
  // --- State ---
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);

  // Modal state
  const [showModal, setShowModal] = useState<boolean>(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [currentChannel, setCurrentChannel] =
    useState<ChannelFormState>(initialChannel);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // --- API Calls ---
  const fetchChannels = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Updated API endpoint - using environment variable or a more flexible approach
      const endpoint = `${apiUrl}/channels/`;

      const response = await axios.get<ChannelsResponse>(endpoint, {
        params: {
          page: currentPage,
          limit: pageSize,
        },
      });

      // Extract channels and total count from response
      const { channels: fetchedChannels, total_count } = response.data;
      setChannels(fetchedChannels);
      setTotalCount(total_count);

      // Calculate total pages
      const calculatedTotalPages = Math.ceil(total_count / pageSize) || 1;
      setTotalPages(calculatedTotalPages);

      // If current page is beyond total pages, go to last valid page
      if (currentPage > calculatedTotalPages && calculatedTotalPages > 0) {
        setCurrentPage(calculatedTotalPages);
      }
    } catch (err) {
      console.error("Error fetching channels:", err);
      let errorMsg = "An unknown error occurred while fetching channels.";
      if (axios.isAxiosError(err)) {
        errorMsg =
          err.response?.data?.detail ||
          err.response?.data?.message ||
          err.message ||
          "Failed to fetch channels.";
      } else if (err instanceof Error) {
        errorMsg = err.message;
      }
      setError(errorMsg);
      setChannels([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, apiUrl]);

  // Fetch data on initial load and when pagination/page size changes
  useEffect(() => {
    fetchChannels();
  }, [fetchChannels]);

  // --- Event Handlers ---
  const handleModalOpen = (
    mode: "add" | "edit",
    channelData: Channel | null = null
  ) => {
    setModalMode(mode);
    setError(null);

    if (mode === "edit" && channelData) {
      setCurrentChannel({
        id: channelData.id, // Store the actual ID for API calls
        user_id: channelData.user_id,
        channel_type_id: channelData.channel_type_id,
        comment: channelData.comment,
        host: channelData.host,
        client_id: channelData.client_id,
        client_secret: "", // Don't show the existing secret
        retrieval_days: channelData.retrieval_days,
        channel_token: channelData.channel_token, // For reference only
      });
    } else {
      setCurrentChannel(initialChannel);
    }

    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setTimeout(() => {
      setCurrentChannel(initialChannel);
      setModalMode("add");
      setIsSubmitting(false);
    }, 300);
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;

    setCurrentChannel((prev) => ({
      ...prev,
      [name]: type === "number" ? (value === "" ? null : Number(value)) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    // Prepare the payload
    const payload = {
      user_id: currentChannel.user_id,
      channel_type_id: currentChannel.channel_type_id,
      comment: currentChannel.comment,
      host: currentChannel.host,
      client_id: currentChannel.client_id || null,
      client_secret: currentChannel.client_secret || null,
      retrieval_days: currentChannel.retrieval_days,
    };

    // For PUT requests, omit client_secret if it's empty
    const putPayload: Partial<typeof payload> = { ...payload };
    if (modalMode === "edit" && !currentChannel.client_secret) {
      delete putPayload.client_secret;
    }

    try {
      if (modalMode === "add") {
        await axios.post(API_ENDPOINT, payload);
      } else {
        // Use channel_type_id for the PUT endpoint
        await axios.put(
          `${API_ENDPOINT}${currentChannel.channel_type_id}`,
          putPayload
        );
      }
      await fetchChannels();
      handleModalClose();
    } catch (err) {
      console.error(
        `Error ${modalMode === "add" ? "adding" : "updating"} channel:`,
        err
      );

      let errorMsg = `Failed to ${
        modalMode === "add" ? "add" : "update"
      } channel.`;

      if (axios.isAxiosError(err)) {
        const responseData = err.response?.data;

        if (typeof responseData === "object" && responseData !== null) {
          errorMsg =
            responseData.detail ||
            responseData.message ||
            JSON.stringify(responseData);
        } else {
          errorMsg = err.message || errorMsg;
        }
      } else if (err instanceof Error) {
        errorMsg = err.message;
      }

      setError(errorMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (channelId: number, channelToken: string) => {
    if (
      !window.confirm(
        `Are you sure you want to delete channel (Token: ${channelToken})?`
      )
    ) {
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Use the ID field for deletion - not channel_type_id
      await axios.delete(`${API_ENDPOINT}${channelId}`);

      // Handle edge case of deleting last item on a page
      const isLastItemOnPage = channels.length === 1 && currentPage > 1;
      if (isLastItemOnPage) {
        setCurrentPage(currentPage - 1); // Fetch will happen via useEffect
      } else {
        await fetchChannels(); // Re-fetch the current page
      }
    } catch (err) {
      console.error("Error deleting channel:", err);
      let errorMsg = "Failed to delete channel.";

      if (axios.isAxiosError(err)) {
        const responseData = err.response?.data;
        if (typeof responseData === "object" && responseData !== null) {
          errorMsg =
            responseData.detail ||
            responseData.message ||
            JSON.stringify(responseData);
        } else {
          errorMsg = err.message || errorMsg;
        }
      } else if (err instanceof Error) {
        errorMsg = err.message;
      }

      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  // Handle pagination page change
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      setCurrentPage(page);
    }
  };

  // Handle page size change
  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSize = parseInt(e.target.value, 10);
    setPageSize(newSize);
    setCurrentPage(1);
  };

  // --- Render Functions ---
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    const paginationItems = [];
    const visiblePages = 2;
    let startPage = Math.max(1, currentPage - visiblePages);
    let endPage = Math.min(totalPages, currentPage + visiblePages);

    if (currentPage - visiblePages <= 1) {
      endPage = Math.min(totalPages, 1 + visiblePages * 2);
    }
    if (currentPage + visiblePages >= totalPages) {
      startPage = Math.max(1, totalPages - visiblePages * 2);
    }

    if (startPage > 1) {
      paginationItems.push(
        <Pagination.Item
          key={1}
          onClick={() => handlePageChange(1)}
          aria-label="Go to page 1"
        >
          1
        </Pagination.Item>
      );
      if (startPage > 2) {
        paginationItems.push(
          <Pagination.Ellipsis key="start-ellipsis" disabled />
        );
      }
    }

    for (let page = startPage; page <= endPage; page++) {
      paginationItems.push(
        <Pagination.Item
          key={page}
          active={page === currentPage}
          onClick={() => handlePageChange(page)}
          aria-label={`Go to page ${page}`}
          aria-current={page === currentPage ? "page" : undefined}
        >
          {page}
        </Pagination.Item>
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        paginationItems.push(
          <Pagination.Ellipsis key="end-ellipsis" disabled />
        );
      }
      paginationItems.push(
        <Pagination.Item
          key={totalPages}
          onClick={() => handlePageChange(totalPages)}
          aria-label={`Go to page ${totalPages}`}
        >
          {totalPages}
        </Pagination.Item>
      );
    }

    return (
      <Pagination>
        <Pagination.Prev
          onClick={() => handlePageChange(currentPage - 1)}
          disabled={currentPage === 1}
          aria-label="Go to previous page"
        />
        {paginationItems}
        <Pagination.Next
          onClick={() => handlePageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          aria-label="Go to next page"
        />
      </Pagination>
    );
  };

  // --- JSX ---
  return (
    <>
      <NavbarComponent />
      <Container className="py-4">
        <div className="d-flex justify-content-between align-items-center mb-4 flex-wrap gap-2">
          <h2>Channels</h2>
          <Button variant="primary" onClick={() => handleModalOpen("add")}>
            <BsPlusLg className="me-2" aria-hidden="true" /> Add Channel
          </Button>
        </div>

        {error && (
          <Alert variant="danger" onClose={() => setError(null)} dismissible>
            {typeof error === "object" ? JSON.stringify(error) : error}
          </Alert>
        )}

        {loading && !isSubmitting ? (
          <div className="text-center my-5">
            <Spinner animation="border" role="status">
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          </div>
        ) : !error && channels.length === 0 && !loading ? (
          <Alert variant="info">No channels found.</Alert>
        ) : channels.length > 0 ? (
          <>
            <Table striped bordered hover responsive>
              <thead className="table-dark">
                <tr>
                  <th>Comment</th>
                  <th>Type</th>
                  <th>Host</th>
                  <th>Retrieval Days</th>
                  <th>Client ID</th>
                  <th>Token</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {channels.map((channel) => (
                  <tr key={channel.channel_token}>
                    <td>{channel.comment}</td>
                    <td>
                      {channel.channel_type_name} ({channel.channel_type_id})
                    </td>
                    <td>{channel.host}</td>
                    <td>{channel.retrieval_days ?? "-"}</td>
                    <td>{channel.client_id ?? "-"}</td>
                    <td>
                      <code>{channel.channel_token}</code>
                    </td>
                    <td>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="me-2"
                        onClick={() => handleModalOpen("edit", channel)}
                        aria-label={`Edit ${channel.comment}`}
                      >
                        <BsPencilSquare />
                      </Button>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        onClick={() =>
                          handleDelete(
                            channel.id, // Use the ID field, not channel_type_id
                            channel.channel_token
                          )
                        }
                        aria-label={`Delete ${channel.comment}`}
                      >
                        <BsTrash3 />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>

            {channels.length > 0 && (
              <Row className="align-items-center mt-3">
                <Col xs="auto">
                  <Form.Select
                    value={pageSize}
                    onChange={handlePageSizeChange}
                    aria-label="Items per page"
                  >
                    {[10, 25, 50, 100].map((size) => (
                      <option key={size} value={size}>
                        {size} per page
                      </option>
                    ))}
                  </Form.Select>
                </Col>
                <Col className="d-flex justify-content-center justify-content-md-end mt-2 mt-md-0">
                  {renderPagination()}
                </Col>
              </Row>
            )}
          </>
        ) : null}

        {/* Modal for Add/Edit Channel */}
        <Modal
          show={showModal}
          onHide={handleModalClose}
          centered
          backdrop="static"
        >
          <Modal.Header closeButton>
            <Modal.Title>
              {modalMode === "add" ? "Add Channel" : "Edit Channel"}
            </Modal.Title>
          </Modal.Header>
          <Form onSubmit={handleSubmit}>
            <Modal.Body>
              {modalMode === "edit" && currentChannel.channel_token && (
                <Form.Group className="mb-3">
                  <Form.Label>Channel Token</Form.Label>
                  <Form.Control
                    type="text"
                    value={currentChannel.channel_token}
                    disabled
                    readOnly
                  />
                  <Form.Text className="text-muted">
                    This token is system-generated and cannot be modified.
                  </Form.Text>
                </Form.Group>
              )}

              <Form.Group className="mb-3" controlId="user_id">
                <Form.Label>User ID</Form.Label>
                <Form.Control
                  type="number"
                  name="user_id"
                  value={currentChannel.user_id}
                  onChange={handleInputChange}
                  required
                  disabled={isSubmitting}
                  min="1"
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="channel_type_id">
                <Form.Label>Channel Type ID</Form.Label>
                <Form.Control
                  type="number"
                  name="channel_type_id"
                  value={currentChannel.channel_type_id}
                  onChange={handleInputChange}
                  required
                  disabled={modalMode === "edit" || isSubmitting}
                  min="1"
                />
                {modalMode === "edit" && (
                  <Form.Text className="text-muted">
                    Channel Type ID cannot be modified after creation.
                  </Form.Text>
                )}
              </Form.Group>

              <Form.Group className="mb-3" controlId="comment">
                <Form.Label>Comment</Form.Label>
                <Form.Control
                  type="text"
                  name="comment"
                  value={currentChannel.comment}
                  onChange={handleInputChange}
                  required
                  disabled={isSubmitting}
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="host">
                <Form.Label>Host</Form.Label>
                <Form.Control
                  type="text"
                  name="host"
                  placeholder="e.g., https://example.com"
                  value={currentChannel.host}
                  onChange={handleInputChange}
                  required
                  disabled={isSubmitting}
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="client_id">
                <Form.Label>Client ID</Form.Label>
                <Form.Control
                  type="text"
                  name="client_id"
                  value={currentChannel.client_id ?? ""}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="client_secret">
                <Form.Label>Client Secret</Form.Label>
                <Form.Control
                  type="password"
                  name="client_secret"
                  placeholder={
                    modalMode === "edit" ? "Enter new secret to change" : ""
                  }
                  value={currentChannel.client_secret ?? ""}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                />
                {modalMode === "edit" && (
                  <Form.Text className="text-muted">
                    Leave blank to keep the existing secret.
                  </Form.Text>
                )}
              </Form.Group>

              <Form.Group className="mb-3" controlId="retrieval_days">
                <Form.Label>Retrieval Days</Form.Label>
                <Form.Control
                  type="number"
                  name="retrieval_days"
                  value={currentChannel.retrieval_days ?? ""}
                  onChange={handleInputChange}
                  disabled={isSubmitting}
                  min="1"
                />
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button
                variant="secondary"
                onClick={handleModalClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button variant="primary" type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Spinner
                      as="span"
                      animation="border"
                      size="sm"
                      role="status"
                      aria-hidden="true"
                      className="me-1"
                    />
                    Saving...
                  </>
                ) : modalMode === "add" ? (
                  "Add Channel"
                ) : (
                  "Save Changes"
                )}
              </Button>
            </Modal.Footer>
          </Form>
        </Modal>
      </Container>
    </>
  );
};

export default Channels;
