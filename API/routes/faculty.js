const express = require("express");
const router = express.Router();

const facultyController= require("../controllers/faculty");

router.post("/getname",facultyController.Get_Faculty_Of_Univerity);

module.exports=router;;