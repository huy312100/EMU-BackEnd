const express = require("express");
const router = express.Router();

const deadlineModdleController =require("../controllers/deadlineMoodle");
const check_auth=require("../middleware/check-auth");

router.get("/month",check_auth,deadlineModdleController.Get_Deadline_This_Month);

router.get("/month/parent",check_auth,deadlineModdleController.Get_Deadline_This_Month_For_Parent);

router.post("/month",check_auth,deadlineModdleController.Get_Deadline_With_MonthID);

router.post("/month/parent",check_auth,deadlineModdleController.Get_Deadline_With_MonthID_For_Parent);

module.exports=router;