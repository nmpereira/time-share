// server/index.js

const express = require("express");
const path = require("path");
const logger = require("./routes/logger");
const api = require("./routes/api");
const PORT = process.env.PORT || 3001;

const mongoose = require("mongoose");

mongoose.connect(process.env.dbURI);
const db = mongoose.connection;
db.on("error", (error) => console.error(error));
db.once("open", () => console.error("Connected to db"));

const app = express();
app.set("json spaces", 2);
app.use(express.json());
// Have Node serve the files for our built React app
app.use(express.static(path.resolve(__dirname, "../server/public")));
app.use(logger);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const timer = 60;

app.get("/", (req, res) => {
  res.json({
    message: "Timer App",
  });
});
app.use("/api", api);

// All other GET requests not handled before will return our React app
app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "../server/public", "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
