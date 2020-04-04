"use strict";
// Node imports
const fs = require("fs");
const path = require("path");

// Node 3rd party imports
const express = require("express");
const logger = require("morgan");
const bodyParser = require("body-parser");
const userAgent = require("express-useragent").express();

// Node user defined imports
let routesDir = path.join(__dirname, "routes");
const userRoutes = require(path.join(routesDir, "userRoutes"));
const postRoutes = require(path.join(routesDir, "postRoutes"))
const { loginRequired, checkPermissions } = require("./middleware/middleware");

// Global declarations
let app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
const addCustomInfoToReq = (req, resp, next) => {
  req.ts = new Date();
  resp.push = (success = false, message = "", data = {}) => {
    resp.json({ success, message, data });
  };
  next();
};
logger.token("ts", req => req.ts); // Here we need to register if we need to add any key to logger or check doc for more info
const logFormat = ":method :url :status :res[content-length] - :response-time ms [:ts]";
const writeLogToFile = fs.createWriteStream(path.join(__dirname, "access.log"), { flags: "a" });

app.use(userAgent);
app.use(addCustomInfoToReq);
app.use(logger(logFormat)); // log to console
app.use(logger(logFormat, { format: logFormat, stream: writeLogToFile })); // log to file
app.use(bodyParser.json({ limit: "5mb" }));
app.use(bodyParser.urlencoded({ extended: false }));
app.use("/uploads/users", express.static(path.join(__dirname, "/uploads/users"))); //Exposing static files for file view

// Routes
app.use("/users", userRoutes);
app.use("/posts", loginRequired, postRoutes);

app.use((req, resp) =>
  resp.status(404).json({ success: false, message: "Invalid route" })
);
app.use((error, req, resp, next) => {
  resp
    .status(error.status || 500)
    .push(false, error.message || "Internal server error", null);
});

// Run server
const server = app.listen(PORT, () => {
  let { address, port } = server.address();
  let msg = `Server running on ${address}:${port}`;
  console.log(msg);
});

// on exiting the server/process
process.on("exit", code => console.log(`About to exit with code: ${code}`));
process.on("SIGINT", function() {
  console.log("Caught interrupt signal");
  process.exit();
});
module.exports = app;




