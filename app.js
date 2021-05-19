const express = require("express");
//const bodyParser = require('body-parser');

const app = express();
const mongoose = require("mongoose");
const morgan = require("morgan");
const cors = require("cors");

const accountRoutes = require("./API/routes/account");
const universityRouter = require("./API/routes/university");
const facultyRouter = require("./API/routes/faculty");
const profileRouter = require("./API/routes/profile");
const webcustomRouter = require("./API/routes/customweb");
const deadlineMoodleRouter = require("./API/routes/deadlineMoodle");
const CheckAuthRouter = require("./API/routes/checkauth");
const StudyCoursesRouter = require("./API/routes/studyCourses");
const coursesContentRouter = require("./API/routes/coursesContent");
const calendarRouter =require("./API/routes/calendar");

//mongoose.connect("mongodb+srv://EMU:appEMU@cluster0.oktkb.mongodb.net/myFirstDatabase?retryWrites=true&w=majority",
mongoose.connect("mongodb+srv://EMU:appEMU@cluster0.oktkb.mongodb.net/EMU?retryWrites=true&w=majority",
  {
    useMongoClient: true
  });



// var i = 0;
// while (i < 100) {
//   (function (i) {
//     setTimeout(function () {
//      console.log(i);
//     }, 30000 * i)
//   })(i++)
// }


app.use(morgan('dev'));


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/account", accountRoutes);
app.use("/university", universityRouter);
app.use("/faculty", facultyRouter);
app.use("/profile", profileRouter);
app.use("/web", webcustomRouter);
app.use("/deadlinemoodle", deadlineMoodleRouter);
app.use("/checktoken", CheckAuthRouter);
app.use("/studycourses", StudyCoursesRouter);
app.use("/coursescontent",coursesContentRouter);
app.use("/calendar",calendarRouter);

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
    return res.status(200).json({});
  }
  next();
});

app.use((req, res, next) => {
  const error = new Error("Not found");
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message,
    }
  });
});

module.exports = app;
