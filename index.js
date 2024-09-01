// server.js
const express = require('express');
const mongoose = require('mongoose');

const app = express();

// Middleware to parse JSON
app.use(express.json());

// MongoDB URI
const mongoURI = "mongodb://mullamdz0501:abcde@localhost/?replicaSet=atlas-u4ybxx-shard-0&ssl=true&authSource=admin";

// Connect to MongoDB
mongoose.connect(mongoURI, {
  // useNewUrlParser: true,
  // useUnifiedTopology: true
})
    .then(() => console.log('MongoDB connection established'))
    .catch(err => console.error('Mongo connection error:', err));

// Define a simple route
app.get('/', (req, res) => {
  res.send('Hello from the course selling app!');
});

// Define PORT
const PORT = process.env.PORT || 3000;

// Server listening
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
