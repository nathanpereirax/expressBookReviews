const express = require('express');
let books = require("./booksdb.js");
let isValidUsername = require("./auth_users.js").isValidUsername;
let isValidPassword = require("./auth_users.js").isValidPassword;
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  if (!isValidUsername(username)) {
    return res.status(400).json({ message: "Username must be at least 3 characters long." });
  }

  if (!isValidPassword(password)) {
    return res.status(400).json({ message: "Password must be at least 6 characters long." });
  }

  if (isValid(username)) {
    return res.status(400).json({ message: "Username already exists." });
  }

  users.push({ username, password });
  res.status(201).json({ message: "User registered successfully." });
});

// Get the book list available in the shop
// public_users.get('/',function (req, res) {
//   res.status(200).json(books);
// });

function getBooks() {
  return new Promise((resolve, reject) => {
      resolve(books);
  });
}

// Get the book list available in the shop
public_users.get('/', async function (req, res) {
  try {
    const bks = await getBooks();
    res.send(JSON.stringify(bks));
  } catch (error) {
    console.error(error);
    res.status(500).send('Internal Server Error');
  }
});

// Get book details based on ISBN
// public_users.get('/isbn/:isbn',function (req, res) {
//   const i = Number(req.params.isbn);
//   const booksArr = Object.values(books);
//   const book = booksArr.find((b) => b.isbn === i);

//   if (!book) {
//     return res.status(404).json({ message: "Book not found." });
//   }

//   res.status(200).json(book);
// });

function getByISBN(isbn) {
  return new Promise((resolve, reject) => {
      let isbnNum = parseInt(isbn);
      if (books[isbnNum]) {
          resolve(books[isbnNum]);
      } else {
          reject({status:404, message:`ISBN ${isbn} not found`});
      }
  })
}
// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  getByISBN(req.params.isbn)
  .then(
      result => res.send(result),
      error => res.status(error.status).json({message: error.message})
  );
});

// Get book details based on author
// public_users.get('/author/:author',function (req, res) {
//   const author = req.params.author;
//   const booksArr = Object.values(books);
//   const booksByAuthor = booksArr.filter(b => b.author.toLowerCase() === author.toLowerCase());

//   if (booksByAuthor.length === 0) {
//     return res.status(404).json({ message: "No books found for this author." });
//   }

//   res.status(200).json(booksByAuthor);
// });

public_users.get('/author/:author',function (req, res) {
  const author = req.params.author;
  getBooks()
  .then((bookEntries) => Object.values(bookEntries))
  .then((books) => books.filter((book) => book.author === author))
  .then((filteredBooks) => res.send(filteredBooks));
});

// Get all books based on title
// public_users.get('/title/:title',function (req, res) {
//   const title = req.params.title;
//   const booksArr = Object.values(books);
//   const booksWithTitle = booksArr.filter(b => b.title.toLowerCase().includes(title.toLowerCase()));

//   if (booksWithTitle.length === 0) {
//     return res.status(404).json({ message: "No books found with this title." });
//   }

//   res.status(200).json(booksWithTitle);
// });

public_users.get('/title/:title',function (req, res) {
  const title = req.params.title;
  getBooks()
  .then((bookEntries) => Object.values(bookEntries))
  .then((books) => books.filter((book) => book.title.toLowerCase().includes(title.toLowerCase())))
  .then((filteredBooks) => res.send(filteredBooks));
});

// Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = Number(req.params.isbn);
  const booksArr = Object.values(books);
  const book = booksArr.find(b => b.isbn === isbn);

  if (!book) {
    return res.status(404).json({ message: "Book not found." });
  }

  const review = Object.values(book.reviews).find(r => r.username === req.query.username);

  if (!review) {
    return res.status(404).json({ message: "Review not found." });
  }

  res.status(200).json(review);
});

module.exports.general = public_users;