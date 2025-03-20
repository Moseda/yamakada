const express = require ('express');
const app = express();
const mysql = require('mysql');
const cors = require('cors');

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


    db.query('SELECT * FROM user WHERE email = ? OR username = ?', [sentEmail, sentUsername], (err, results) => {
        if (err) return res.status(500).send(err);
        
        if (results.length > 0) {
            // User already exists
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
            const SQL = 'INSERT INTO user (email, username, password) VALUES (?, ?, ?)';
            const values = [sentEmail, sentUsername, hash];

            // Execute query
            db.query(SQL, values, (err, results)=>{
                if(err){
                    res.send(err)
                }else{
                    console.log('user inserted check table in DB')
                    res.send({message: 'User added'})
                }
            })
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

            //hash the typed pass and compare it to the stored hash
            const bcrypt = require('bcrypt')
            bcrypt.compare(sentLoginPassword, user.password, (err, isMatch)=>{
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