const express = require("express");
const router = express.Router();

const studycouresController=require("../controllers/studyCourses");
const check_auth=require("../middleware/check-auth");

router.post("/allcourses",check_auth,studycouresController.Get_ListCoures);

router.post("/allcourses/parent",check_auth,studycouresController.Get_ListCoures_For_Parents);

router.get("/currentcourses",check_auth,studycouresController.Get_CurrentCourses);

router.get("/currentcourses/parent",check_auth,studycouresController.Get_CurrentCourses_For_Parent);

module.exports=router;