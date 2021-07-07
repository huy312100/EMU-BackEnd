const express = require("express");
const router = express.Router();

const check_auth =require("../middleware/check-auth");
const infoAndNewsController =require("../controllers/infoAndnews");

router.get("/getinfo",check_auth,infoAndNewsController.Get_Info_University);

router.get("/getinfo/parent",check_auth,infoAndNewsController.Get_Info_University_For_Parent);

router.get("/newsuniversity",check_auth,infoAndNewsController.Get_News_University);

router.get("/newsuniversity/parent",check_auth,infoAndNewsController.Get_News_University_For_Parent);

router.get("/newsfaculty",check_auth,infoAndNewsController.Get_News_Faculty);

router.get("/newsfaculty/parent",check_auth,infoAndNewsController.Get_News_Faculty_For_Parent);

module.exports=router;