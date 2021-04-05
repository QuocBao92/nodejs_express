const mongoose = require("mongoose")

connect = async () => {
  try {
    await mongoose.connect("mongodb://127.0.0.1:27017/baonq_education_dev", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connect DB Successfully!!!");
  } catch (error) {
    console.log("Connect DB Failure!!");
  }
};

module.exports = { connect };
