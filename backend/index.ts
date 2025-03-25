require('dotenv').config();


const express = require ('express');
const app = express();

const mysql = require('mysql');
const cors = require('cors');

import sendEmail from "./mailer";


app.use(express.json())
app.use(cors())

const jwt = require('jsonwebtoken');
const SECRET_KEY = 'xlzdc5mCFG5X1O+xm1+FPGao/CXeYwhhZfwJ4dhp5J4=';


//remember this does its function its not the problem
app.listen(3002, ()=>{
    console.log('Server is running on port 3002')
})

//create database
const db = mysql.createConnection({
    user: 'sammy',
    port: '3307',
    host: 'localhost',
    password: 'Nogamenolife1',
    database: 'mimuco',
})

db.connect((err) => {
    if(err) {
        console.error('Error connecting to database:', err);
        return;
    }
    console.log('Connected to database');
});

app.post('/register', (req, res)=>{
    const sentEmail = req.body.Email
    const sentUsername = req.body.Username
    const sentPassword = req.body.Password

    // check if username and email used
    db.query('SELECT * FROM user WHERE email = ? OR username = ?', [sentEmail, sentUsername], (err, results) => {
        if (err) return res.status(500).send(err);
        
        if (results.length > 0) {
            const isEmailTaken = results.some(user => user.email === sentEmail);
            const isUsernameTaken = results.some(user => user.username === sentUsername);
            
            if (isEmailTaken && isUsernameTaken) {
                return res.status(409).send({ message: 'Email and username already taken' });
            } else if (isEmailTaken) {
                return res.status(409).send({ message: 'Email already taken' });
            } else {
                return res.status(409).send({ message: 'Username already taken' });
            }
        }
    
        //hash password
        const bcrypt = require('bcrypt');
        const saltRounds = 10;
        bcrypt.hash(sentPassword, saltRounds, (err, hash) => {
            if (err) return res.status(500).send({ message: "Error hashing password" });

            //confirmation token
            const verification_token = jwt.sign({ email: sentEmail }, SECRET_KEY, { expiresIn: '1d' });


            const SQL = 'INSERT INTO user (email, username, password, is_verified, verification_token) VALUES (?, ?, ?, ?, ?)';
            const values = [sentEmail, sentUsername, hash, 0, verification_token];

            // Execute query
            db.query(SQL, values, (err, results)=>{
                if(err){
                    return res.status(500).send(err);
                }else{

                    //send a verification link
                    const confirmationLink = `http://localhost:5173/verify/${verification_token}`;
                    const emailHTML = `
                    <h1>Welcome to Mimuco!</h1>
                    <p>Thanks for signing up. Please verify your email by clicking the link below:</p>
                    <a href="${confirmationLink}">Verify my email</a>
                    `;
                    
                    sendEmail(
                        sentEmail,
                        "Verify Your Mimuco Account",
                        `Please verify your email by visiting: ${confirmationLink}`,
                        emailHTML
                    )
                    .then(() => {
                        console.log(`Confirmation email sent to: ${sentEmail}`);
                        return res.send({ message: 'User added. Please check your email to confirm your account.' });
                    })
                    .catch((err) => {
                        console.error("Email failed", err);
                        return res.status(500).send({ message: "Registration successful but verification email could not be sent. Please contact support." });
                    });

                }
            })
        });
    });
    
});

// for the verification of the email
app.get('/verify/:token', (req, res) => {
    const token = req.params.token;
    
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) {
            return res.status(400).send({ message: 'Invalid or expired verification token' });
        }
        
        const email = decoded.email;
        
        db.query('UPDATE user SET is_verified = 1 WHERE email = ?', [email], (err, results) => {
            if (err) {
                return res.status(500).send({ message: 'Error updating user verification status' });
            }
            
            if (results.affectedRows === 0) {
                return res.send({ message: 'Email already verified.' });
            }
            
            // Redirect to frontend with success message
            res.send({ message: 'Email verified successfully!' });

            //res.redirect('http://localhost:5173/?verified=true');
        });
    });
});



// let registred users log in (check if there credentials are in DB)

app.post('/login', (req, res)=>{
   
    const sentLoginUsername = req.body.loginUsername
    const sentLoginPassword = req.body.loginPassword

    // now create SQL statement to insert the user data

    const SQL = 'SELECT * FROM user WHERE username = ?'

    

    db.query(SQL, [sentLoginUsername], (err, results)=>{
        if(err){
            return res.send({error : err})

        //check if user exists
        }if(results.length > 0){
            const user = results[0]

            if(user.is_verified === 0){
                return res.send({message:'account not activated yet check your email'}) // the email hasnt been verified yet
            }

            //hash the typed pass and compare it to the stored hash
            const bcrypt = require('bcrypt')
            bcrypt.compare(sentLoginPassword, user.password, (err: any, isMatch: any)=>{
                if (err){
                    return res.send({error:err})
                }
                
                if(isMatch){
                    //passes matched
                    const token = jwt.sign({ id: user.id, username: user.username }, SECRET_KEY, { expiresIn: '1h' });
                    return res.send({ success: true, token });
                }

                else{
                    return res.send({message:'Invalid Username or Password'}) // wrong pass
                }

            })
        }else{
            return res.send({message: 'Invalid Username or Password'}) // user not in DB
        }
    })
});

const verifyToken = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(403).send({ message: 'No token provided' });
    
    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) return res.status(401).send({ message: 'Unauthorized' });
        req.userId = decoded.id;
        next();
    });
};

// Example protected route
app.get('/protected-route', verifyToken, (req, res) => {
    res.send({ message: 'This is protected data' });
})

