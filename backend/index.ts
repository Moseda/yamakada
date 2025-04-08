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
  const { Email: sentEmail, Password: sentPassword } = req.body;

  try {
    // Check if email is already taken
    const [existingUsers]: any = await db.query(
      "SELECT email FROM user WHERE email = ?",
      [sentEmail]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({
        message: "Email already taken",
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
      "INSERT INTO user (email, password, is_verified, verification_token) VALUES (?, ?, ?, ?)",
      [sentEmail, hash, 0, verificationToken]
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

    res.status(201).json({
      message:
        "You are registered but not yet verified. Check your email for verification.",
    });
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
  const { loginEmail, loginPassword } = req.body;

  console.log("Login Attempt:", { loginEmail, loginPassword }); // Add this

  try {
    const [users]: any = await db.query("SELECT * FROM user WHERE email = ?", [
      loginEmail,
    ]);

    //console.log("Users Found:", users); // Add this for debugging

    // user not found
    if (users.length === 0) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const user = users[0];

    //console.log("User Data:", user); // Add this for debugging

    //user not verified
    if (!user.is_verified) {
      res
        .status(403)
        .json({ message: "Account not verified. Check your email." });
      return;
    }

    const isMatch = await bcrypt.compare(loginPassword, user.password);

    //console.log("Password Match:", isMatch); // Add this for debugging

    // user regitered but wrong password
    if (!isMatch) {
      res.status(401).json({ message: "Invalid credentials" });
      return;
    }

    const accessToken = jwt.sign(
      { id: user.id, email: user.email },
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
      token: accessToken, // Match frontend expectation because I name them diffent all the time...
      refreshToken,
    });
  } catch (err) {
    console.error("Login Error:", err);
    res.status(500).json({ message: "Internal server error" });
  }
});

app.post(
  "/forgot-password",
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
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Reset Your Password</title>
  <style>
    body {
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      color: #333;
      line-height: 1.6;
      margin: 0;
      padding: 0;
    }
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #f9f9f9;
    }
    .email-header {
      background-color: #4a90e2;
      padding: 25px;
      text-align: center;
      border-radius: 5px 5px 0 0;
    }
    .email-header h1 {
      color: white;
      margin: 0;
      font-size: 24px;
      font-weight: 500;
    }
    .email-body {
      background-color: white;
      padding: 30px;
      border-radius: 0 0 5px 5px;
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
    }
    .email-body p {
      font-size: 16px;
      margin-bottom: 20px;
    }
    .button {
      display: inline-block;
      background-color: #4a90e2;
      color: white;
      text-decoration: none;
      padding: 12px 30px;
      border-radius: 4px;
      font-weight: bold;
      margin: 20px 0;
      text-align: center;
    }
    .button:hover {
      background-color: #3a80d2;
    }
    .fallback-link {
      word-break: break-all;
      color: #666;
      font-size: 14px;
      margin-top: 15px;
    }
    .email-footer {
      margin-top: 20px;
      text-align: center;
      font-size: 12px;
      color: #888;
    }
    .security-note {
      background-color: #f7f7f7;
      border-left: 4px solid #4a90e2;
      padding: 10px 15px;
      font-size: 14px;
      margin-top: 25px;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-header">
      <h1>Password Reset Request</h1>
    </div>
    <div class="email-body">
      <p>Hello,</p>
      <p>We received a request to reset the password for your account. To proceed with resetting your password, please click the button below:</p>
      
      <a href="${resetLink}" class="button">Reset My Password</a>
      
      <p>If the button above doesn't work, copy and paste the following link into your browser:</p>
      <p class="fallback-link">${resetLink}</p>
      
      <div class="security-note">
        <strong>Security Note:</strong> If you didn't request a password reset, please ignore this email or contact support if you have concerns about your account security.
      </div>
    </div>
    <div class="email-footer">
      <p>This is an automated email, please do not reply. If you need assistance, please contact our support team.</p>
    </div>
  </div>
</body>
</html>
      `;

      await sendEmail(
        email,
        "Reset Your Password",
        `Reset link: ${resetLink}`,
        emailHTML
      );

      res.json({ message: "Password reset link sent. Check your email!" });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

app.get(
  "/reset-password/:token",
  async (req: Request, res: Response): Promise<any> => {
    const { token } = req.params;

    try {
      // Verify the token is valid and not expired
      const decoded = jwt.verify(token, SECRET_KEY) as { email: string };

      // If verification passes, token is valid
      res.json({ valid: true, email: decoded.email });
    } catch (err) {
      console.error("Token verification error:", err);
      res
        .status(400)
        .json({ valid: false, message: "Invalid or expired token" });
    }
  }
);

app.post(
  "/complete-reset-password",
  async (req: Request, res: Response): Promise<any> => {
    const { token, password } = req.body;

    try {
      // Verify token
      const decoded = jwt.verify(token, SECRET_KEY) as { email: string };
      const email = decoded.email;

      // Hash the new password
      const hashedPassword = await bcrypt.hash(password, 10);

      // Update user's password
      const [result]: any = await db.query(
        "UPDATE user SET password = ? WHERE email = ?",
        [hashedPassword, email]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ message: "User not found" });
      }

      res.json({ message: "Password successfully reset!" });
    } catch (err) {
      console.error("Password reset error:", err);
      res.status(400).json({ message: "Invalid or expired token" });
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
          { id: user.id, email: user.email },
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
      "SELECT id, email FROM user WHERE id = ?",
      [userId]
    );

    if (users.length === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const user = users[0];

    res.json({
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
