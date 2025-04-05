// Load environment variables
import * as dotenv from "dotenv";
dotenv.config();

import express, { Request, Response, NextFunction, response } from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import db from "./db"; // Import database connection
import sendEmail from "./mailer";
import { verifyToken } from "./Middlewares/auth";
import settingsRouter from "./routes/settings";
import productRouter from "./routes/categorizer";

const app = express();
app.use(express.json());

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      `${process.env.FRONTEND_URL}`,
      "http://192.168.56.1:5173",
      "http://172.19.240.1:5173",
    ],
    credentials: true,
  })
);

const SECRET_KEY = process.env.SECRET_KEY;

if (!SECRET_KEY) {
  throw new Error("SECRET_KEY environment variable is not set");
}

// Start server
app.listen(3002, "0.0.0.0", () => {
  console.log("Server running on all interfaces at port 3002");
  console.log("Try connecting at:");
  console.log(`- http://localhost:3002`);
  console.log(`- ${process.env.API_URL}`);
});

// User registration
app.post("/register", async (req: Request, res: Response): Promise<any> => {
  const {
    Email: sentEmail,
    Username: sentUsername,
    Password: sentPassword,
  } = req.body;

  try {
    // Check if email or username is already taken
    const [existingUsers]: any = await db.query(
      "SELECT email, username FROM user WHERE email = ? OR username = ?",
      [sentEmail, sentUsername]
    );

    if (existingUsers.length > 0) {
      const isEmailTaken = existingUsers.some(
        (user: any) => user.email === sentEmail
      );
      const isUsernameTaken = existingUsers.some(
        (user: any) => user.username === sentUsername
      );

      return res.status(409).json({
        message:
          isEmailTaken && isUsernameTaken
            ? "Email and username already taken"
            : isEmailTaken
            ? "Email already taken"
            : "Username already taken",
      });
    }

    // Hash the password
    const hash = await bcrypt.hash(sentPassword, 10);

    // Generate verification token
    const verificationToken = jwt.sign({ email: sentEmail }, SECRET_KEY, {
      expiresIn: "1d",
    });

    // Insert user into the database
    await db.query(
      "INSERT INTO user (email, username, password, is_verified, verification_token) VALUES (?, ?, ?, ?, ?)",
      [sentEmail, sentUsername, hash, 0, verificationToken]
    );

    // Send verification email
    const confirmationLink = `${process.env.FRONTEND_URL}/verify/${verificationToken}`;
    const emailHTML = `
            <h1>Welcome to Mimuco!</h1>
            <p>Thanks for signing up. Please verify your email:</p>
            <a href="${confirmationLink}">Verify my email</a>
        `;

    await sendEmail(
      sentEmail,
      "Verify Your Mimuco Account",
      `Please verify your email: ${confirmationLink}`,
      emailHTML
    );

    res
      .status(201)
      .json({ message: "User registered. Check your email for verification." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Email verification
app.get(
  "/verify/:token",
  async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
      const { token } = req.params;
      const decoded = jwt.verify(token, SECRET_KEY) as { email: string };

      const [result]: any = await db.query(
        "UPDATE user SET is_verified = 1 WHERE email = ?",
        [decoded.email]
      );

      if (result.affectedRows === 0) {
        return res.status(400).json({ message: "Email already verified" });
      }

      res.json({ message: "Email verified successfully!" });
    } catch (err) {
      console.error(err);
      res.json({ message: "Invalid or expired token" });
    }
  }
);

// User login
app.post("/login", async (req: Request, res: Response): Promise<void> => {
  const { loginUsername, loginPassword } = req.body;

  console.log("Login Attempt:", { loginUsername, loginPassword }); // Add this

  try {
    const [users]: any = await db.query(
      "SELECT * FROM user WHERE username = ? OR email = ?",
      [loginUsername, loginUsername]
    );

    //console.log("Users Found:", users); // Add this for debugging

    if (users.length === 0) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const user = users[0];

    //console.log("User Data:", user); // Add this for debugging

    if (!user.is_verified) {
      res
        .status(403)
        .json({ message: "Account not verified. Check your email." });
      return;
    }

    const isMatch = await bcrypt.compare(loginPassword, user.password);

    //console.log("Password Match:", isMatch); // Add this for debugging

    if (!isMatch) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }
    //------------------------------------maybe us either the emai or the username test first
    const accessToken = jwt.sign(
      { id: user.id, username: user.username },
      SECRET_KEY,
      { expiresIn: "4h" }
    );

    const refreshToken = jwt.sign({ id: user.id }, SECRET_KEY, {
      expiresIn: "7d",
    });

    await db.query("UPDATE user SET refresh_token = ? WHERE id = ?", [
      refreshToken,
      user.id,
    ]);

    res.json({
      success: true,
      token: accessToken, // Match frontend expectation because i name them diffent all the time...
      refreshToken,
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// after verify-token endpoint in backend/index.ts
app.post(
  "/reset-password",
  async (req: Request, res: Response): Promise<any> => {
    const { email } = req.body;

    try {
      const [users]: any = await db.query(
        "SELECT * FROM user WHERE email = ?",
        [email]
      );

      if (users.length === 0) {
        return res.status(404).json({ message: "Email not found" });
      }

      const user = users[0];
      const resetToken = jwt.sign({ email: user.email }, SECRET_KEY, {
        expiresIn: "1h",
      });

      const resetLink = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

      const emailHTML = `
      <h2>Password Reset</h2>
      <p>Click below to reset your password:</p>
      <a href="${resetLink}">${resetLink}</a>
    `;

      await sendEmail(
        email,
        "Reset Your Password",
        `Reset link: ${resetLink}`,
        emailHTML
      );

      res.json({ message: "Password reset link sent" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

app.get("/verify-token", verifyToken, (req: any, res: any) => {
  res.json({ isValid: true, user: (req as any).user });
});

app.post(
  "/refresh-token",
  async (req: Request, res: Response): Promise<any> => {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      console.log("No refresh token provided");
      return res.status(403).json({ message: "No refresh token provided" });
    }

    try {
      const [users]: any = await db.query(
        "SELECT * FROM user WHERE refresh_token = ?",
        [refreshToken]
      );

      console.log("Users fetched from DB:", users); // Debug log

      if (users.length === 0) {
        console.log("No user found for refresh token");
        return res.status(403).json({ message: "Invalid refresh token" });
      }

      const user = users[0];

      try {
        const decoded = jwt.verify(refreshToken, SECRET_KEY);
        console.log("Token verified:", decoded);

        const newAccessToken = jwt.sign(
          { id: user.id, username: user.username },
          SECRET_KEY,
          { expiresIn: "1h" }
        );

        res.json({ accessToken: newAccessToken });
      } catch (err) {
        console.error("JWT Verification Error:", err);
        return res.status(403).json({ message: "Invalid refresh token" });
      }
    } catch (err) {
      console.error("Database Query Error:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Get user profile
app.get("/user/profile", verifyToken, async (req: any, res: any) => {
  try {
    const userId = req.user.id; // Extract user ID from the decoded token

    const [users]: any = await db.query(
      "SELECT id, username, email FROM user WHERE id = ?",
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = users[0];

    res.json({
      username: user.username,
      email: user.email,
    });
  } catch (err) {
    console.error("Error fetching user profile:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

// Update user settings
app.use("/user/settings", settingsRouter);

//made some kind of categorizer
app.use("/api", productRouter);

export default app;
