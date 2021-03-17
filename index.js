const express = require("express");
const app = express();
const port = 3000;

app.get("/", (req, res) => res.send("Hello Bao"));

app.listen(port, () => console.log(`Listen in port ${port}`));
