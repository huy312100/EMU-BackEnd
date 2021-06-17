const express = require("express");
const router = express.Router();

const chatController = require("../controllers/chat");
const check_auth =require("../middleware/check-auth");

router.get("/findchat",check_auth,chatController.FindChatUser);

router.get("/findchatawait",check_auth,chatController.FindChatAwait);

router.post("/loadmessage",check_auth,chatController.LoadMessage);

router.get("/test",chatController.Test_Noti);

module.exports=router;