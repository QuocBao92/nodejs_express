const courses = require("../models/course");
const { multiMongoose } = require("../../ultis/mongoose");
class SiteController {
  // [GET] /home
  index(req, res, next) {
    // Call back
    // courses.find({}, (err, courses) => {
    //   if (!err) {
    //     res.json(courses);
    //   } else {
    //     res.status(400).json({ error: "Bad request" });
    //   }
    // });

    // Promise
    courses
      .find({})
      .then((courses) => {
        res.render("home", { courses: multiMongoose(courses) });
      })
      .catch(next);

    // res.render("home");
  }

  // [GET] /search
  search(req, res) {
    res.render("search");
  }
}

module.exports = new SiteController();
