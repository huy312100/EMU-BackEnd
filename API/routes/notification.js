const express = require("express");
const router = express.Router();

const check_auth =require("../middleware/check-auth");
const notificationController = require("../controllers/notification");

router.get("/",check_auth,notificationController.Get_Notification);

router.post("/Changestate",check_auth,notificationController.Edit_State);

module.exports=router;