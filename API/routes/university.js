const express = require("express");
const router = express.Router();
//const bcrypt = require("bcrypt");
//const jwt =require("jsonwebtoken");

const universityController =require("../controllers/university");

router.get("/getallinfo",universityController.Get_All_Info);

router.get("/getname", universityController.Get_Name);

module.exports=router;
