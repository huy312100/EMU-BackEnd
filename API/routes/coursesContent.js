const express = require("express");
const router = express.Router();

const coursesContentController =require("../controllers/coursesContent");
const check_auth =require("../middleware/check-auth");


router.post("/",check_auth,coursesContentController.Get_One_Courses);

router.post("/check",check_auth,coursesContentController.Check_Change_Courses);

module.exports=router;