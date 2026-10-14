const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  //Write your code here
  const username = req.body.username;
    const password = req.body.password;

    // Check if username or password is missing
    if (!username || !password) {
        return res.status(400).json({
            message: "Username and password are required"
        });
    }

    // Check if username already exists
    if (users[username]) {
        return res.status(409).json({
            message: "Username already exists"
        });
    }

    // Register the new user
    users[username] = {
        password: password
    };

    return res.status(201).json({
        message: "User successfully registered"
    });
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  //Write your code here
  return res.send(JSON.stringify(books,null,4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  //Write your code here
  const isbn = req.params.isbn;

    if (books[isbn]) {
        return res.status(200).json(books[isbn]);
    }

    return res.status(404).json({
        message: "Book not found"
    });
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  //Write your code here
  const author = req.params.author;

    const matchingBooks = Object.values(books).filter(
        book => book.author.toLowerCase() === author.toLowerCase()
    );

    if (matchingBooks.length > 0) {
        return res.status(200).json(matchingBooks);
    }

    return res.status(404).json({
        message: "No books found for this author"
    });
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  //Write your code here
  const title = req.params.title;

    const matchingBooks = Object.values(books).filter(
        book => book.title.toLowerCase() === title.toLowerCase()
    );

    if (matchingBooks.length > 0) {
        return res.status(200).json(matchingBooks);
    }

    return res.status(404).json({
        message: "No books found with this title"
    });
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  //Write your code here
  const isbn = req.params.isbn;

    if (books[isbn]) {
        return res.status(200).json(books[isbn].reviews);
    }

    return res.status(404).json({
        message: "Book not found"
    });
});

module.exports.general = public_users;
