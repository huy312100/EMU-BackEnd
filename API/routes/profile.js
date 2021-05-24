const express = require("express");
const router = express.Router();

const profileController =require("../controllers/profile");
const check_auth =require("../middleware/check-auth");

router.post("/createprofile",check_auth,profileController.Create_Profile);

router.get("/view",check_auth,profileController.View_Profile);

router.post("/edit", check_auth,profileController.Edit_Profile);

router.post("/findname",profileController.Find_name);

router.post("/editprofilepicture",check_auth,profileController.Edit_Profile_Picture);

module.exports=router;