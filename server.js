const mongoose = require("mongoose");
const app = require('./app');
require('dotenv').config();

const mongoURI = process.env.MONGO_URI;

mongoose.connect(mongoURI)
    .then(() => console.log('MongoDB connection established'))
    .catch(err => console.error('Mongo connection error:', err));

app.listen(3000, () => {
    console.log(`Server running on port 3000`);
});
