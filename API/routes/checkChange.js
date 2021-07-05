// const express = require("express");
// const router = express.Router();

const checkChangeController = require("../controllers/checkChange");

// router.get("/newcourses",checkChangeController.check_Change_New_Courses);

// router.get("/deadlinemoodle",checkChangeController.Check_Change_Deadline_Moodle);

// router.get("/contentmoodle",checkChangeController.Check_Change_Content_Moodle);

// router.get("/newsunisersity",checkChangeController.Check_Change_News_Unisersity);

// router.get("/newsfaculty",checkChangeController.check_Change_News_Faculty);

// module.exports=router;

module.exports.Check_Change_News = async()=>{
    await checkChangeController.Check_Change_News_Unisersity();
    await checkChangeController.check_Change_News_Faculty();
};

module.exports.Check_Change_Courses = ()=>{
    checkChangeController.Check_Change_Content_Moodle();
    checkChangeController.check_Change_New_Courses();
};

module.exports.Check_Change_Deadline = ()=>{
    checkChangeController.Check_Change_Deadline_Moodle();
};

module.exports.Check_Courses_Graph = ()=>{
    checkChangeController.check_New_Courses_Graph();
};