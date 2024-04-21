const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');
const { authenticated } = require('./router/auth_users.js');
const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const app = express();

app.use(express.json());

app.use("/customer",session({
    secret:"fingerprint_customer",
    resave: true, 
    saveUninitialized: true
}));

app.use("/customer/auth/*", function auth(req,res,next){
    const token = req.header('x-auth-token');
    if (!token) return res.status(401).send('Access denied. No token provided.');
  
    try {
      const decoded = jwt.verify(token);
      req.user = decoded;
      next();
    } catch (ex) {
      res.status(400).send('Invalid token.');
    }
});
 
const PORT =5000;

app.use("/customer", customer_routes);
app.use("/", genl_routes);
app.use('/regd_users', authenticated);

app.listen(PORT,()=>console.log("Server is running"));
