const express = require("express");
const router = express.Router();

const CalendarController = require("../controllers/calendar");
const check_auth =require("../middleware/check-auth");

router.get("/getthismonth",check_auth,CalendarController.Get_Calendar_This_Month);

router.post("/post",check_auth,CalendarController.Post_Calendar);

router.delete("/delete",check_auth,CalendarController.Delete_Calendar);

module.exports=router;