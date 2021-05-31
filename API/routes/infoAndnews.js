const express = require("express");
const router = express.Router();

const check_auth =require("../middleware/check-auth");
const infoAndNewsController =require("../controllers/infoAndnews");

router.get("/getinfo",check_auth,infoAndNewsController.Get_Info_University);

router.get("/newsuniversity",check_auth,infoAndNewsController.Get_News_University);

router.get("/newsfaculty",check_auth,infoAndNewsController.Get_News_Faculty);

module.exports=router;