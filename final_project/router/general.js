const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require('axios');

// Simulate async call to fetch books
public_users.get('/books-async', async function (req, res) {
  try {
    const response = await axios.get('http://localhost:5000/'); // reuse the GET /
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ message: "Error fetching books", error: error.message });
  }
});

public_users.get('/books-promise', function (req, res) {
  axios.get('http://localhost:5000/')
    .then(response => {
      res.status(200).json(response.data);
    })
    .catch(error => {
      res.status(500).json({ message: "Error fetching books", error: error.message });
    });
});

public_users.get('/isbn-async/:isbn', async function (req, res) {
  const isbn = req.params.isbn;

  try {
    const response = await axios.get(`http://localhost:5000/isbn/${isbn}`);
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ message: "Error fetching book by ISBN", error: error.message });
  }
});

public_users.get('/isbn-promise/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  axios.get(`http://localhost:5000/isbn/${isbn}`)
    .then(response => {
      res.status(200).json(response.data);
    })
    .catch(error => {
      res.status(500).json({ message: "Error fetching book by ISBN", error: error.message });
    });
});

public_users.get('/author-async/:author', async function (req, res) {
  const author = req.params.author;

  try {
    const response = await axios.get(`http://localhost:5000/author/${author}`);
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ message: "Error fetching books by author", error: error.message });
  }
});

public_users.get('/author-promise/:author', function (req, res) {
  const author = req.params.author;

  axios.get(`http://localhost:5000/author/${author}`)
    .then(response => {
      res.status(200).json(response.data);
    })
    .catch(error => {
      res.status(500).json({ message: "Error fetching books by author", error: error.message });
    });
});

public_users.get('/title-async/:title', async function (req, res) {
  const title = req.params.title;

  try {
    const response = await axios.get(`http://localhost:5000/title/${title}`);
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ message: "Error fetching books by title", error: error.message });
  }
});

public_users.get('/title-promise/:title', function (req, res) {
  const title = req.params.title;

  axios.get(`http://localhost:5000/title/${title}`)
    .then(response => {
      res.status(200).json(response.data);
    })
    .catch(error => {
      res.status(500).json({ message: "Error fetching books by title", error: error.message });
    });
});


public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  // Check if username or password is missing
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  // Check if user already exists
  const userExists = users.some(user => user.username === username);

  if (userExists) {
    return res.status(409).json({ message: "Username already exists. Please choose another." });
  }

  // Add new user
  users.push({ username, password });

  return res.status(201).json({ message: "User registered successfully." });
});


// Get the book list available in the shop
public_users.get('/', function (req, res) {
  return res.status(200).send(JSON.stringify(books, null, 4));
});


// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book) {
    return res.status(200).json(book);
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});
// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;
  const matchingBooks = [];

  for (let isbn in books) {
    if (books[isbn].author.toLowerCase() === author.toLowerCase()) {
      matchingBooks.push({ isbn, ...books[isbn] });
    }
  }

  if (matchingBooks.length > 0) {
    return res.status(200).json(matchingBooks);
  } else {
    return res.status(404).json({ message: "No books found by this author" });
  }
});


// Get all books based on title
function toTitleCase(str) {
  return str.toLowerCase().split(' ').map(word => {
    return word.charAt(0).toUpperCase() + word.slice(1);
  }).join(' ');
}

public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;
  const matchingBooks = [];

  for (let isbn in books) {
    if (books[isbn].title.toLowerCase().includes(title.toLowerCase())) {
      // Clone and fix the title format
      const fixedBook = {
        isbn,
        ...books[isbn],
        title: toTitleCase(books[isbn].title)
      };
      matchingBooks.push(fixedBook);
    }
  }

  if (matchingBooks.length > 0) {
    return res.status(200).json({ books: matchingBooks });
  } else {
    return res.status(404).json({ message: "No books found with this title" });
  }
});


//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book) {
    return res.status(200).json({ reviews: book.reviews });
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});

module.exports.general = public_users;
