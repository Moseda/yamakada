import { useState, useEffect, SetStateAction } from "react";
import {
  Container,
  Row,
  Col,
  Card,
  Table,
  Spinner,
  Pagination,
  Form,
} from "react-bootstrap";
import { formatRelativeDate } from "../../utils/formatRelativeDate";
import NavbarComponent from "./NavbarComponent";

const apiServerUrl = import.meta.env.VITE_SERVER_API_URL;

type Product = {
  product_identifier: string;
  product_name: string;
  sku: string;
  ean: string;
  comment?: string;
  update_datetime: string;
  image?: string;
};

const RecentlyUpdatedProductsPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalItems, setTotalItems] = useState(0);

  function isErrorWithMessage(err: unknown): err is { message: string } {
    return typeof err === "object" && err !== null && "message" in err;
  }

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        // Fetch products sorted by updated_time
        const response = await fetch(
          `${apiServerUrl}/products?sort=updated_time&order=desc&page=${currentPage}&limit=${itemsPerPage}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch products");
        }

        const data = await response.json();
        setProducts(data.data || []);

        // total pages if API provides a total count
        // or estimate based on  returned items
        const total = data.meta?.total || data.data?.length || 0;
        setTotalItems(total);

        const pages = data.meta?.total_pages || Math.ceil(total / itemsPerPage);
        setTotalPages(pages > 0 ? pages : 1);

        //setTotalPages(data.totalPages || Math.ceil(data.total / itemsPerPage));
      } catch (err: unknown) {
        console.error("Error: ", err);
        if (isErrorWithMessage(err)) {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [currentPage, itemsPerPage]);

  const handlePageChange = (pageNumber: SetStateAction<number>) => {
    setCurrentPage(pageNumber);
  };

  const handleItemsPerPageChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1);
  };

  const renderPagination = () => {
    const items = [];

    // Previous button
    items.push(
      <Pagination.Prev
        key="prev"
        disabled={currentPage === 1}
        onClick={() => handlePageChange(currentPage - 1)}
      />
    );

    // First page
    items.push(
      <Pagination.Item
        key={1}
        active={currentPage === 1}
        onClick={() => handlePageChange(1)}
      >
        1
      </Pagination.Item>
    );

    // Ellipsis if needed
    if (currentPage > 3) {
      items.push(<Pagination.Ellipsis key="ellipsis1" disabled />);
    }

    // Pages around current page
    for (
      let page = Math.max(2, currentPage - 1);
      page <= Math.min(totalPages - 1, currentPage + 1);
      page++
    ) {
      items.push(
        <Pagination.Item
          key={page}
          active={currentPage === page}
          onClick={() => handlePageChange(page)}
        >
          {page}
        </Pagination.Item>
      );
    }

    // Ellipsis if needed
    if (currentPage < totalPages - 2) {
      items.push(<Pagination.Ellipsis key="ellipsis2" disabled />);
    }

    // Last page if there's more than one page
    if (totalPages > 1) {
      items.push(
        <Pagination.Item
          key={totalPages}
          active={currentPage === totalPages}
          onClick={() => handlePageChange(totalPages)}
        >
          {totalPages}
        </Pagination.Item>
      );
    }

    // Next button
    items.push(
      <Pagination.Next
        key="next"
        disabled={currentPage === totalPages}
        onClick={() => handlePageChange(currentPage + 1)}
      />
    );

    return items;
  };

  return (
    <Container fluid className="py-4">
      <NavbarComponent />
      <Card className="shadow-sm border-0">
        <Card.Header className="bg-white border-bottom border-2 border-success d-flex justify-content-between align-items-center">
          <h5 className="mb-0 text-success fw-bold">
            Kürzlich aktualisierte Artikel
          </h5>
          <div className="d-flex align-items-center">
            <span className="me-2">Einträge pro Seite:</span>
            <Form.Select
              size="sm"
              style={{ width: "70px" }}
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </Form.Select>
          </div>
        </Card.Header>
        <Card.Body>
          {loading ? (
            <div className="text-center py-5">
              <Spinner animation="border" variant="success" />
            </div>
          ) : error ? (
            <div className="text-center py-5">
              <div className="text-danger mb-3">
                Fehler beim Laden der Daten.
              </div>
              <button
                className="btn btn-outline-success"
                onClick={() => window.location.reload()}
              >
                Erneut versuchen
              </button>
            </div>
          ) : (
            <>
              <Table responsive hover>
                <thead>
                  <tr>
                    <th>Artikel</th>
                    <th>SKU</th>
                    <th>Kategorie</th>
                    <th className="text-end">Aktualisiert</th>
                  </tr>
                </thead>
                <tbody>
                  {products.length > 0 ? (
                    products.map((product) => (
                      <tr key={product.product_identifier}>
                        <td>
                          <div className="d-flex align-items-center">
                            {product.image && (
                              <div className="me-2">
                                <img
                                  src={product.image}
                                  alt={product.product_name}
                                  style={{
                                    width: "40px",
                                    height: "40px",
                                    objectFit: "contain",
                                  }}
                                />
                              </div>
                            )}
                            <div>{product.product_name}</div>
                          </div>
                        </td>
                        <td>SKU-{product.sku}</td>
                        <td>{product.ean}</td>
                        <td className="text-end">
                          {formatRelativeDate(product.update_datetime)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="text-center py-4">
                        Keine Artikel gefunden
                      </td>
                    </tr>
                  )}
                </tbody>
              </Table>

              {totalPages > 1 && (
                <Row className="mt-4">
                  <Col className="d-flex justify-content-center">
                    <Pagination>{renderPagination()}</Pagination>
                  </Col>
                </Row>
              )}
            </>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default RecentlyUpdatedProductsPage;
