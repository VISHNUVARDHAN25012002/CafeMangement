require('dotenv').config();
const app = require('./index');
const http = require('http');

const port = process.env.PORT || 3000;

// Create HTTP server and pass the app
const server = http.createServer(app);

// Start listening on the specified port
server.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
