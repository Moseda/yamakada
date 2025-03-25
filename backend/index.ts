// Load environment variables
import * as dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import db from './db'; // Import database connection
import sendEmail from './mailer';
import { verifyToken } from './Middlewares/auth';

const app = express();
app.use(express.json());
app.use(cors());

const SECRET_KEY = process.env.SECRET_KEY || 'default_secret';

// Start server
app.listen(3002, () => console.log('Server running on port 3002'));

// User registration
app.post('/register', async (req: Request, res: Response): Promise<any>=> {
    
    const { Email: sentEmail, Username: sentUsername, Password: sentPassword } = req.body;

    try {
        // Check if email or username is already taken
        const [existingUsers]: any = await db.query(
            'SELECT email, username FROM user WHERE email = ? OR username = ?',
            [sentEmail, sentUsername]
        );

        if (existingUsers.length > 0) {
            const isEmailTaken = existingUsers.some((user: any) => user.email === sentEmail);
            const isUsernameTaken = existingUsers.some((user: any) => user.username === sentUsername);

            return res.status(409).json({
                message:
                    isEmailTaken && isUsernameTaken
                        ? 'Email and username already taken'
                        : isEmailTaken
                        ? 'Email already taken'
                        : 'Username already taken',
            });
        }

        // Hash the password
        const hash = await bcrypt.hash(sentPassword, 10);

        // Generate verification token
        const verificationToken = jwt.sign({ email: sentEmail }, SECRET_KEY, { expiresIn: '1d' });

        // Insert user into the database
        await db.query(
            'INSERT INTO user (email, username, password, is_verified, verification_token) VALUES (?, ?, ?, ?, ?)',
            [sentEmail, sentUsername, hash, 0, verificationToken]
        );

        // Send verification email
        const confirmationLink = `http://localhost:5173/verify/${verificationToken}`;
        const emailHTML = `
            <h1>Welcome to Mimuco!</h1>
            <p>Thanks for signing up. Please verify your email:</p>
            <a href="${confirmationLink}">Verify my email</a>
        `;

        await sendEmail(
            sentEmail,
            'Verify Your Mimuco Account',
            `Please verify your email: ${confirmationLink}`,
            emailHTML
        );

        res.status(201).json({ message: 'User registered. Check your email for verification.' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Email verification
app.get('/verify/:token', async (req: Request, res: Response, next: NextFunction):Promise<any> => {
    try {
        const { token } = req.params;
        const decoded = jwt.verify(token, SECRET_KEY) as { email: string };

        const [result]: any = await db.query('UPDATE user SET is_verified = 1 WHERE email = ?', [
            decoded.email,
        ]);

        if (result.affectedRows === 0) {
            return res.status(400).json({ message: 'Email already verified' });
        }

        res.json({ message: 'Email verified successfully!' });
    } catch (err) {
        console.error(err);
        res.json({ message: 'Invalid or expired token' });
    }
});

// User login
app.post('/login', async (req: Request, res: Response): Promise<void> => {
    const { loginUsername, loginPassword } = req.body;

    try {
        const [users]: any = await db.query('SELECT * FROM user WHERE username = ?', [
            loginUsername,
        ]);
        if (users.length === 0) {
            res.status(401).json({ message: 'Invalid username or password' });
            return;
        }

        const user = users[0];
        if (!user.is_verified) {
            res.status(403).json({ message: 'Account not verified. Check your email.' });
            return;
        }

        const isMatch = await bcrypt.compare(loginPassword, user.password);
        if (!isMatch) {
            res.status(401).json({ message: 'Invalid username or password' });
            return;
        }

        const token = jwt.sign(
            { id: user.id, username: user.username },
            SECRET_KEY,
            { expiresIn: '1h' }
        );
        res.json({ success: true, token });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Internal server error' });
    }
});

app.get('/verify-token', verifyToken, (req: any, res: any)=> {
    res.json({ isValid: true, user: (req as any).user });
});

export default app;
