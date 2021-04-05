class NewsController {
  // [GET] /news
  index(req, res) {
    res.render("news");
  }

  // [GET] /news/:detail
  detail(req, res) {
    res.send("Detail: Bao dep trai")
  }
}

module.exports = new NewsController;
