const fs = require("fs");
const https = require("https");
const app = require("./app");

const PORT = process.env.PORT || 4000;

// Read SSL certificates
const privateKey = fs.readFileSync("path/to/private.pem", "utf8");
const certificate = fs.readFileSync("path/to/certificate.pem", "utf8");
const credentials = { key: privateKey, cert: certificate };

// Create HTTPS server
https.createServer(credentials, app).listen(PORT, () => {
  console.log(`Server is running on https://localhost:${PORT}`);
});
