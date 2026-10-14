const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
    let userswithsamename = users.filter((user) => {
      return user.username === username;
    });
    return userswithsamename.length > 0;
  };

const authenticatedUser = (username, password) => {
    let validusers = users.filter((user) => {
      return user.username === username && user.password === password;
    });
    return validusers.length > 0;
  };

  // Register a new user
regd_users.post("/register", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(400).json({
            message: "Username and password are required"
        });
    }

    if (isValid(username)) {
        return res.status(409).json({
            message: "Username already exists"
        });
    }

    users.push({
        username: username,
        password: password
    });

    return res.status(201).json({
        message: "User successfully registered"
    });
});

//only registered users can login
regd_users.post("/login", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (!username || !password) {
        return res.status(400).json({
            message: "Username and password are required"
        });
    }

    if (!authenticatedUser(username, password)) {
        return res.status(401).json({
            message: "Invalid username or password"
        });
    }

    const accessToken = jwt.sign(
        { username: username },
        "access",
        { expiresIn: 60 * 60 }
    );

    req.session.authorization = {
        accessToken: accessToken,
        username: username
    };

    return res.status(200).json({
        message: "User successfully logged in",
        token: accessToken
    });
});

const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).json({
            message: "Authorization token required"
        });
    }

    const token = authHeader.startsWith("Bearer ")
        ? authHeader.slice(7)
        : authHeader;

    jwt.verify(token, "access", (err, decoded) => {
        if (err) {
            return res.status(401).json({
                message: "Invalid or expired token"
            });
        }

        req.user = decoded;
        next();
    });
};

// Add a book review
// Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;
    const review = req.query.review;

    // Check whether the user is logged in
    if (!req.session.authorization ||
        !req.session.authorization.username) {
        return res.status(401).json({
            message: "User not logged in"
        });
    }

    const username = req.session.authorization.username;

    // Check whether the book exists
    if (!books[isbn]) {
        return res.status(404).json({
            message: "Book not found"
        });
    }

    // Check whether a review was provided
    if (!review) {
        return res.status(400).json({
            message: "Review is required"
        });
    }

    // Add a new review or modify the existing review
    books[isbn].reviews[username] = review;

    return res.status(200).json({
        message: "Review added or updated successfully",
        reviews: books[isbn].reviews
    });
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const isbn = req.params.isbn;

    // Check whether the user is logged in
    if (!req.session.authorization ||
        !req.session.authorization.username) {
        return res.status(403).json({
            message: "User not logged in"
        });
    }

    const username = req.session.authorization.username;

    // Check whether the book exists
    if (!books[isbn]) {
        return res.status(404).json({
            message: "Book not found"
        });
    }

    // Check whether this user has reviewed the book
    if (!books[isbn].reviews[username]) {
        return res.status(404).json({
            message: "Review not found for this user"
        });
    }

    // Delete this user's review
    delete books[isbn].reviews[username];

    return res.status(200).json({
        message: "Review deleted successfully",
        reviews: books[isbn].reviews
    });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
