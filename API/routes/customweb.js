const express = require("express");
const router = express.Router();

const customWebController=require("../controllers/customweb");
const check_auth=require("../middleware/check-auth");

router.get("/getwebsite",check_auth,customWebController.Get_Website_Custom);

router.get("/getcustomlink",check_auth,customWebController.Get_NameWeb_Is_Link);

router.post("/postaccountcustom",check_auth,customWebController.Post_Account_Custom);

router.delete("/deleteaccount",check_auth,customWebController.Delete_Website);

router.delete("/deleteaccountportal",check_auth,customWebController.Delete_Website_Portal);

module.exports=router;