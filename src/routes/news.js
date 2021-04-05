const express = require("express");

const router = express.Router();

const newsController = require("../app/controllers/news.controller");

router.get("/:detail", newsController.detail);

router.get("/", newsController.index);

module.exports = router;

const a = "1";
