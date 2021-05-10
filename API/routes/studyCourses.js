const express = require("express");
const router = express.Router();

const studycouresController=require("../controllers/studyCourses");
const check_auth=require("../middleware/check-auth");

router.get("/allcourses",check_auth,studycouresController.Get_ListCoures);

router.get("/currentcourses",check_auth,studycouresController.Get_CurrentCourses);

module.exports=router;