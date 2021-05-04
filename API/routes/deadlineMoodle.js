const express = require("express");
const router = express.Router();

const deadlineModdleController =require("../controllers/deadlineMoodle");
const check_auth=require("../middleware/check-auth");

router.get("/month",check_auth,deadlineModdleController.Get_Deadline_This_Month);

router.post("/month",check_auth,deadlineModdleController.Get_Deadline_With_MonthID);

module.exports=router;