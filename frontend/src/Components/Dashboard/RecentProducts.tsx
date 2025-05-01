import { useEffect, useState } from "react";
import { Button, Card, ListGroup } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { formatRelativeDate } from "../../utils/formatRelativeDate";

const apiServerUrl = import.meta.env.VITE_SERVER_API_URL;

type Product = {
  product_identifier: string;
  product_name: string;
  sku: string;
  comment?: string;
  update_datetime: string;
};

const RecentProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  function isErrorWithMessage(err: unknown): err is { message: string } {
    return typeof err === "object" && err !== null && "message" in err;
  }

  useEffect(() => {
    const fetchRecentProducts = async () => {
      try {
        setLoading(true);
        //latest 3 products
        const response = await fetch(
          `${apiServerUrl}/products/?page=1&limit=3&sort=update_datetime`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch recent products");
        }

        const data = await response.json();
        setProducts(data.data || []);
      } catch (err: unknown) {
        console.error("Error: ", err);
        if (isErrorWithMessage(err)) {
          setError(err.message);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchRecentProducts();
  }, []);

  const handleViewAllClick = () => {
    navigate("/products/recently-updated");
  };

  if (loading) {
    return (
      <Card className="mb-4 shadow-sm border-0">
        <Card.Header className="bg-white border-bottom border-2 border-success">
          <h5 className="mb-0 text-success fw-bold">Hinzugefügte Artikel</h5>
        </Card.Header>
        <Card.Body className="text-center py-4">
          <div className="spinner-border text-success" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </Card.Body>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="mb-4 shadow-sm border-0">
        <Card.Header className="bg-white border-bottom border-2 border-success">
          <h5 className="mb-0 text-success fw-bold">Hinzugefügte Artikel</h5>
        </Card.Header>
        <Card.Body>
          <p className="text-danger">Fehler beim Laden von Produkten</p>
          <Button
            variant="outline-success"
            onClick={() => window.location.reload()}
          >
            Erneut versuchen
          </Button>
        </Card.Body>
      </Card>
    );
  }

  return (
    <Card className="mb-4 shadow-sm border-0">
      <Card.Header className="bg-white border-bottom border-2 border-success">
        <h5 className="mb-0 text-success fw-bold">Hinzugefügte Artikel</h5>
      </Card.Header>
      <Card.Body>
        <ListGroup variant="flush">
          {products.length > 0 ? (
            products.map((product) => (
              <ListGroup.Item
                key={product.product_identifier}
                className="d-flex justify-content-between align-items-center"
              >
                <div>
                  <h6 className="mb-1">{product.product_name}</h6>
                  <p className="mb-0 text-muted small">
                    {product.sku} • {product.comment || "Elektronik"}
                  </p>
                </div>
                <small className="text-muted">
                  {formatRelativeDate(product.update_datetime)}
                </small>
              </ListGroup.Item>
            ))
          ) : (
            <p className="text-center mb-0 py-3">
              Keine kürzlich aktualisierten Artikel vorhanden.
            </p>
          )}
        </ListGroup>
        <Button
          variant="outline-success"
          className="w-100 mt-3"
          onClick={handleViewAllClick}
        >
          Alle Artikel anzeigen
        </Button>
      </Card.Body>
    </Card>
  );
};

export default RecentProducts;
