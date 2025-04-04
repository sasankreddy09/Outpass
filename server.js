
const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// Set EJS as the templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Route to render login.ejs
app.get('/login', (req, res) => {
    res.render('login');
});

// Start the server
app.listen(PORT, () => {
    console.log("Server is running on http://localhost:${PORT}");
});