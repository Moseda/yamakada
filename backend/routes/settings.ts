import express, { Request, Response } from "express";
import { verifyToken } from "../Middlewares/auth";
import db from "../db";

const settingsRouter = express.Router();

// Get user settings
settingsRouter.get("/", verifyToken, async (req: any, res: any) => {
  try {
    const userId = req.user.id;

    const [settings]: any = await db.query(
      "SELECT notifications, language, theme, privacyMode FROM user WHERE id = ?",
      [userId]
    );

    if (settings.length === 0) {
      return res.status(404).json({ message: "Settings not found" });
    }

    res.json(settings[0]);
  } catch (err) {
    console.error("Error fetching user settings:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Update user settings - Optimized for single setting updates
settingsRouter.put("/", verifyToken, async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const { notifications, language, theme, privacyMode } = req.body;

    // Prepare update query - only update fields that are provided
    const updates = [];
    const params = [];

    if (notifications !== undefined) {
      updates.push("notifications = ?");
      params.push(notifications);
    }

    if (language !== undefined) {
      updates.push("language = ?");
      params.push(language);
    }

    if (theme !== undefined) {
      updates.push("theme = ?");
      params.push(theme);
    }

    if (privacyMode !== undefined) {
      updates.push("privacyMode = ?");
      params.push(privacyMode);
    }

    // If no valid updates, return early
    if (updates.length === 0) {
      return res.status(400).json({ message: "No valid settings to update" });
    }

    // Add userId to params
    params.push(userId);

    const query = `UPDATE user SET ${updates.join(", ")} WHERE id = ?`;

    const [result]: any = await db.query(query, params);

    if (result.affectedRows === 0) {
      return res.status(400).json({ message: "Failed to update settings" });
    }

    res.json({
      message: "Settings updated successfully",
      // Return the updated settings for confirmation
      updatedSettings: { notifications, language, theme, privacyMode },
    });
  } catch (err) {
    console.error("Error updating user settings:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Add endpoint for individual setting updates for more efficient updates
settingsRouter.patch("/:setting", verifyToken, async (req: any, res: any) => {
  try {
    const userId = req.user.id;
    const { setting } = req.params;
    const { value } = req.body;

    // Validate setting name to prevent SQL injection
    const validSettings = ["notifications", "language", "theme", "privacyMode"];
    if (!validSettings.includes(setting)) {
      return res.status(400).json({ message: "Invalid setting name" });
    }

    const query = `UPDATE user SET ${setting} = ? WHERE id = ?`;

    const [result]: any = await db.query(query, [value, userId]);

    if (result.affectedRows === 0) {
      return res.status(400).json({ message: "Failed to update setting" });
    }

    res.json({
      message: `${setting} updated successfully`,
      setting,
      value,
    });
  } catch (err) {
    console.error("Error updating user setting:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

export default settingsRouter;
