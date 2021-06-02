const express = require("express");
const router = express.Router();

const chatController = require("../controllers/chat");
const check_auth =require("../middleware/check-auth");

router.get("/",chatController.User_connect);

router.get("/chat",chatController.Client_Socket);

router.post("/test",check_auth, chatController.Test);

module.exports=router;