class NewsController {
  // Get /news
  index(req, res) {
    res.render("news");
  }
}

module.exports = new NewsController();
