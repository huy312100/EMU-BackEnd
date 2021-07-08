const express = require("express");
const router = express.Router();

const profileController =require("../controllers/profile");
const check_auth =require("../middleware/check-auth");

router.post("/createprofile",check_auth,profileController.Create_Profile);

router.get("/view",check_auth,profileController.View_Profile);

router.get("/view/parent",check_auth,profileController.View_Profile_For_Parent);

router.post("/edit", check_auth,profileController.Edit_Profile);

router.post("/editparent",check_auth,profileController.Edit_Profile_For_Parent);

router.post("/findname",check_auth,profileController.Find_name);

router.post("/findinfofromfullname",check_auth,profileController.Find_Info_From_Full_Name);

router.post("/uploadimg",check_auth,profileController.Post_Profile_Picture);

router.post("/deleteimg",check_auth,profileController.Delete_Profile_Picture);

router.post("/uploadimgparent",check_auth,profileController.Post_Profile_Picture_For_Parent);

router.post("/deleteimgparent",check_auth,profileController.Delete_Profile_Picture_For_Parent);

module.exports=router;