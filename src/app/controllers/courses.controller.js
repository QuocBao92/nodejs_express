const Course = require("../models/course");
const { mongooseToObject } = require("../../ultis/mongoose");
class CoursesController {
  // [GET] /course/:slug
  show = (req, res, next) => {
    Course.findOne({ slug: req.params.slug })
      .then((course) =>
        res.render("courses/show", { course: mongooseToObject(course) }),
      )
      .catch(next);
  };
}

module.exports = new CoursesController();
