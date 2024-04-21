const express = require('express');
const regd_users = express.Router();
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");

const s = 'AbCdExYz123';

let users = [
  {
    "username": "admin",
    "password": "abc123@"
  },
  {
    "username": "nate",
    "password": "xyz234!"
  }
];

const findUser = (username) => {
  return users.find((user) => user.username === username);
};

function findBookByISBN(isbn) {
  const i = Number(isbn);
  const booksArr = Object.values(books);
  const book = booksArr.find((b) => b.isbn === i);
  if (!book.reviews) {
    book.reviews = {};
  }
  return book;
}

const isValidUsername = (username) => username.length >= 3;
const isValidPassword = (password) => password.length >= 6;

const isValid = (username)=>{ //returns boolean
  return users.some((user) => user.username === username);
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const generateJWT = (user) => {
    const secret = s;
    const payload = { username: user.username };
    const options = { expiresIn: '1h' };
  
    return jwt.sign(payload, secret, options);
  };

  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }
  const user = findUser(username);
  if (!user || user.password !== password) {
    return res.status(401).json({ message: "Invalid username or password." });
  }
  const token = generateJWT(user);
  res.status(200).json({ message: "Logged in successfully.", token });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const { username, review } = req.body;

  if (!review) {
    return res.status(400).json({ message: "Review is required." });
  }

  const user = findUser(username);

  if (!user) {
    return res.status(401).json({ message: "Invalid user." });
  }

  const book = findBookByISBN(isbn);

  if (!book) {
    return res.status(404).json({ message: "Book not found." });
  }

  const reviewIndex = book.reviews.hasOwnProperty(username);

  if (reviewIndex) {
    book.reviews[username] = review;
  } else {
    book.reviews[username] = { review };
  }

  res.status(200).json({ message: "Review updated or added.", book });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  
});

module.exports.authenticated = regd_users;
module.exports.isValidUsername = isValidUsername;
module.exports.isValidPassword = isValidPassword;
module.exports.isValid = isValid;
module.exports.users = users;
