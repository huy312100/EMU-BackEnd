const express = require("express");
const router = express.Router();
//const bcrypt = require("bcrypt");
//const jwt =require("jsonwebtoken");

const forumMoodleController =require("../controllers/forumMoodle");
const check_auth =require("../middleware/check-auth");

router.post("/",check_auth, forumMoodleController.Get_Forum_Moodle);

module.exports=router;