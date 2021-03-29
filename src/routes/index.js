const newsRoute = require("./news");

route = (app) => {
  app.use("/news", newsRoute);
  app.get("/", (req, res) => res.render("home"));

//   app.get("/news", (req, res) => res.render("news"));

  app.get("/search", (req, res) => {
    return res.render("search");
  });

  app.post("/search", (req, res) => {
    console.log(req.body);
    return res.send("search success");
  });
};

module.exports = route;
