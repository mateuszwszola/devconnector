const express = require('express');
require('./config');
const connectDB = require('./config/db');

const app = express();

// Connect to the DB
connectDB();

app.get('/', (req, res) => res.send('API is running'));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
