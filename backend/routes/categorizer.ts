import express, { Request, Response } from "express";
import { verifyToken } from "../Middlewares/auth";
import db from "../db";

const productRouter = express.Router();

// Get products with pagination, search, filter and sort
productRouter.get(
  "/products",
  verifyToken,
  async (req: Request, res: Response): Promise<void> => {
    try {
      //const userId = req.user.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = (page - 1) * limit;
      const search = (req.query.search as string) || "";
      const manufacturerId = req.query.manufacturer
        ? parseInt(req.query.manufacturer as string)
        : null;
      const channelId = req.query.channel
        ? parseInt(req.query.channel as string)
        : null;
      const sortField = (req.query.sort as string) || "update_datetime";
      const sortDirection = (
        (req.query.direction as string) || "desc"
      ).toUpperCase();

      // Validate sort parameters to prevent SQL injection
      const allowedSortFields = [
        "product_identifier",
        "sku",
        "ean",
        "manufacturer_id",
        "channel_id",
        "update_datetime",
      ];
      const allowedSortDirections = ["ASC", "DESC"];

      if (
        !allowedSortFields.includes(sortField) ||
        !allowedSortDirections.includes(sortDirection)
      ) {
        res.status(400).json({ message: "Invalid sort parameters" });
        return; // Added return statement to prevent further execution
      }

      // Build the query
      let query = `
      SELECT p.*, pm.producer_name as manufacturer_name
      FROM product p
      LEFT JOIN product_manufacturer pm ON p.manufacturer_id = pm.id
      LEFT JOIN channel c ON p.channel_id = c.id
      WHERE 1=1
    `;

      const queryParams: (string | number)[] = [];

      // Add search condition if provided
      if (search) {
        query += ` AND (p.product_identifier LIKE ? OR p.sku LIKE ? OR p.ean LIKE ?)`;
        const searchTerm = `%${search}%`;
        queryParams.push(searchTerm, searchTerm, searchTerm);
      }

      // Add manufacturer filter if provided
      if (manufacturerId) {
        query += ` AND p.manufacturer_id = ?`;
        queryParams.push(manufacturerId);
      }

      // Add channel filter if provided
      if (channelId) {
        query += ` AND p.channel_id = ?`;
        queryParams.push(channelId);
      }

      // Add sort and pagination
      query += ` ORDER BY p.${sortField} ${sortDirection} LIMIT ? OFFSET ?`;
      queryParams.push(limit, offset);

      // Execute the query
      const [products] = await db.query(query, queryParams);

      // Get total count for pagination
      let countQuery = `
      SELECT COUNT(*) as total
      FROM product p
      WHERE 1=1
    `;

      const countParams: (string | number)[] = [];

      // Add search condition if provided
      if (search) {
        countQuery += ` AND (p.product_identifier LIKE ? OR p.sku LIKE ? OR p.ean LIKE ?)`;
        const searchTerm = `%${search}%`;
        countParams.push(searchTerm, searchTerm, searchTerm);
      }

      // Add manufacturer filter if provided
      if (manufacturerId) {
        countQuery += ` AND p.manufacturer_id = ?`;
        countParams.push(manufacturerId);
      }

      // Add channel filter if provided
      if (channelId) {
        countQuery += ` AND p.channel_id = ?`;
        countParams.push(channelId);
      }

      // Fixed: properly handle the count query result
      const [countResult] = await db.query(countQuery, countParams);

      // Handle the count result properly, as an array of objects
      const countResultArray = countResult as any[];
      if (
        !countResultArray ||
        !Array.isArray(countResultArray) ||
        countResultArray.length === 0
      ) {
        throw new Error("Empty count query result");
      }

      const totalCount = countResultArray[0].total as number;

      res.json({
        products,
        total: totalCount,
        page,
        pages: Math.ceil(totalCount / limit),
      });
    } catch (err) {
      console.error("Error fetching products:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Get all manufacturers
productRouter.get(
  "/manufacturers",
  verifyToken,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const [manufacturers] = await db.query(
        "SELECT * FROM product_manufacturer ORDER BY producer_name"
      );
      res.json(manufacturers);
    } catch (err) {
      console.error("Error fetching manufacturers:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Get all channels with their types
productRouter.get(
  "/channels",
  verifyToken,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const [channels] = await db.query(`
      SELECT c.*, ct.name as channel_type_name
      FROM channel c
      JOIN channel_type ct ON c.channel_type_id = ct.id
    `);
      res.json(channels);
    } catch (err) {
      console.error("Error fetching channels:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Get product details including JSON data
productRouter.get(
  "/products/:id",
  verifyToken,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const productId = parseInt(req.params.id);

      const [productsResult] = await db.query(
        `
      SELECT p.*, pm.producer_name, pm.producer_id
      FROM product p
      LEFT JOIN product_manufacturer pm ON p.manufacturer_id = pm.id
      WHERE p.id = ?
    `,
        [productId]
      );

      // Fix the type to handle the result as an array
      const products = productsResult as any[];

      if (products.length === 0) {
        res.status(404).json({ message: "Product not found" });
        return; // Added return statement to prevent further execution
      }

      const product = products[0];

      // Get the latest product data
      const [productDataResult] = await db.query(
        `
      SELECT *
      FROM product_data
      WHERE product_id = ?
      ORDER BY update_datetime DESC
      LIMIT 1
    `,
        [productId]
      );

      // Fix the type to handle the result as an array
      const productData = productDataResult as any[];

      if (productData.length > 0) {
        // Parse JSON data
        try {
          // Check if json property exists and is a Buffer or string
          if (productData[0].json) {
            const jsonData = productData[0].json;
            // If it's a Buffer, convert to string first
            product.data = JSON.parse(
              Buffer.isBuffer(jsonData) ? jsonData.toString() : jsonData
            );
          } else {
            product.data = null;
          }
        } catch (e) {
          console.error("Error parsing JSON data:", e);
          product.data = null;
        }
      }

      res.json(product);
    } catch (err) {
      console.error("Error fetching product details:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Bulk action on products
productRouter.post(
  "/products/bulk",
  verifyToken,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const { productIds, action, manufacturerId } = req.body;

      if (!Array.isArray(productIds) || productIds.length === 0) {
        res.status(400).json({ message: "Invalid product selection" });
        return; // Added return statement to prevent further execution
      }

      switch (action) {
        case "assign-manufacturer":
          if (!manufacturerId) {
            res.status(400).json({ message: "Manufacturer ID is required" });
            return; // Added return statement to prevent further execution
          }

          await db.query(
            "UPDATE product SET manufacturer_id = ? WHERE id IN (?)",
            [manufacturerId, productIds]
          );
          break;

        case "mark-updated":
          await db.query(
            "UPDATE product SET updated = 1, update_datetime = NOW() WHERE id IN (?)",
            [productIds]
          );
          break;

        case "export":
          // This would typically generate a file and send it back
          // For now, we'll just return the selected product IDs
          res.json({
            message: "Export functionality would be implemented here",
            productIds,
          });
          return; // Added return statement to prevent further execution

        default:
          res.status(400).json({ message: "Invalid action" });
          return; // Added return statement to prevent further execution
      }

      res.json({
        message: `Successfully applied ${action} to ${productIds.length} products`,
      });
    } catch (err) {
      console.error("Error performing bulk action:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

export default productRouter;
