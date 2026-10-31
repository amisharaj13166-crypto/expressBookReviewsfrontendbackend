
const express = require('express');
const jwt = require('jsonwebtoken');
const session = require('express-session');

const customer_routes = require('./router/auth_users.js').authenticated;
const genl_routes = require('./router/general.js').general;

const { regd_books } = require('./router/booksdb');

const app = express();




app.use(express.static('public'));




app.use(express.json());

app.use(
    "/customer",
    session({
        secret: "fingerprint_customer",
        resave: true,
        saveUninitialized: true
    })
);



app.use("/books", regd_books);



app.use("/customer/auth", function auth(req, res, next) {

    if (!req.session || !req.session.authorization) {
        return res.status(401).json({
            error: "Unauthorized. Please login first."
        });
    }

    const token = req.session.authorization.token;

    jwt.verify(token, 'my-secret-key', (err, user) => {

        if (err) {
            return res.status(401).json({
                error: "Invalid or expired authentication token."
            });
        }

        req.session.user = user;

        next();

    });

});




app.use("/customer", customer_routes);



app.use("/", genl_routes);



const PORT = 8080;

app.listen(PORT, () => {
    console.log(`Express Book Reviews server is running at http://localhost:${PORT}`);
});
