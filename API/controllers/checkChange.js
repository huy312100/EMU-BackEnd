const mongoose = require("mongoose");
var request = require("request");

const coursesContent = require("../models/coursesContent");
const CustomWeb = require("../models/customweb");
const studyCourses = require("../models/studyCourses");
const currentStudyCourses = require("../models/currentStudyCourses");

exports.check_Change_New_Courses =(req,res,next)=>{
    console.log("1");
};

exports.Check_Change_Deadline_Moodle =(req,res,next)=>{
    console.log("2");
};

exports.Check_Change_Content_Moodle =(req,res,next)=>{
    console.log("3");
};

exports.Check_Change_News_Unisersity =(req,res,next)=>{
    console.log("4");
};

exports.check_Change_News_Faculty =(req,res,next)=>{
    console.log("5");
};

