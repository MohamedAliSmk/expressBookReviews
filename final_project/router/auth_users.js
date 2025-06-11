const express = require('express');
const jwt = require('jsonwebtoken');
const regd_users = express.Router();
let books = require("./booksdb.js");

let users = [];

const isValid = (username) => users.some(user => user.username === username);

const authenticatedUser = (username, password) => {
  return users.find(user => user.username === username && user.password === password);
};

// Login endpoint
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  // Check if username and password are provided
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required." });
  }

  // Authenticate user
  const user = authenticatedUser(username, password);
  if (!user) {
    return res.status(401).json({ message: "Invalid credentials." });
  }

  // Generate JWT
  const accessToken = jwt.sign({ username: user.username }, 'access', { expiresIn: '1h' });

  // Save to session
  req.session.authorization = {
    accessToken,
    username: user.username
  };

  return res.status(200).json({ message: "Login successful.", token: accessToken });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;
  const username = req.session?.authorization?.username;

  // Validate
  if (!username) {
    return res.status(401).json({ message: "User not logged in." });
  }

  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found." });
  }

  if (!review) {
    return res.status(400).json({ message: "Review is required as a query parameter." });
  }

  // Add or update review
  books[isbn].reviews[username] = review;

  return res.status(200).json({ message: "Review added/updated successfully." });
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session?.authorization?.username;

  // Check if user is logged in
  if (!username) {
    return res.status(401).json({ message: "Unauthorized. Please login." });
  }

  // Check if the book exists
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found." });
  }

  // Check if the user has a review
  if (books[isbn].reviews && books[isbn].reviews[username]) {
    delete books[isbn].reviews[username];
    return res.status(200).json({ message: "Review deleted successfully." });
  } else {
    return res.status(404).json({ message: "No review by this user to delete." });
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
