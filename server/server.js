require('dotenv').config(); // Load environment variables from .env file
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const searchRoutes = require('./routes/search'); // Import the routes file

const mongoURI = process.env.MONGO_URI; // Get MongoDB URI from .env

if (!mongoURI) {
  console.error('Error: MONGO_URI is not set in the .env file.');
  process.exit(1); // Exit the process if no MongoDB URI is provided
}

// Connect to MongoDB
mongoose.connect(mongoURI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch((err) => {
    console.error('MongoDB connection error:', err);
    process.exit(1); // Exit if connection fails
  });

const app = express();
const PORT = process.env.PORT || 5001; // Use PORT from .env or default to 5001

// Middleware
app.use(express.json()); // Parse JSON request bodies
app.use(cors()); // Enable CORS for all origins

// Use the search routes
app.use('/api', searchRoutes);

// Catch-all route for invalid endpoints
app.use((req, res) => {
  res.status(404).json({ message: 'Endpoint not found' });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
