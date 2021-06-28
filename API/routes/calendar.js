const express = require("express");
const router = express.Router();

const CalendarController = require("../controllers/calendar");
const check_auth =require("../middleware/check-auth");

router.post("/getthismonth",check_auth,CalendarController.Get_Calendar_This_Month);

router.post("/getthismonthwithout",check_auth,CalendarController.Get_Calendar_withoutdealine_This_Month);

router.post("/post",check_auth,CalendarController.Post_Calendar);

router.post("/edit",check_auth, CalendarController.Edit_Calendar);

router.delete("/delete",check_auth,CalendarController.Delete_Calendar);

module.exports=router;