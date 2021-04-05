const express = require("express");
const morgan = require("morgan");
const path = require("path");
const handlebars = require("express-handlebars");

const app = express();
const port = 3000;

// HTTP Logger
// app.use(morgan("combined"));

// Template engine
app.engine(
  "hbs",
  handlebars({
    extname: "hbs",
  }),
);

app.set("views", path.join(__dirname, "resources", "views"));
app.set("view engine", "hbs");

// static file
app.use(express.static(path.join(__dirname, "public")));

// middleware
app.use(
  express.urlencoded({
    extended: true,
  }),
);
app.use(express.json());

// Routes init
const route = require("./routes");
route(app);

// Connect to DB
const db = require("./config/db");
db.connect();

app.listen(port, () => console.log(`Listen in port ${port}`));
