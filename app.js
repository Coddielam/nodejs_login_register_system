const express = require("express");

// init express app
const app = express();

// serving static files
// app.use(express.static("./public"));

app.set("view engine", "ejs");

// Body Parser
app.use(express.urlencoded({ extended: false }));

// using a router to handle
app.use("/", require("./routes/page"));

app.listen(5000, console.log("Server listening on port 5000..."));
