const express = require("express");
const router = express.Router();

const customWebController=require("../controllers/customweb");
const check_auth=require("../middleware/check-auth");

router.get("/getwebsite",check_auth,customWebController.Get_Website_Custom);

router.post("/postaccountcustom",check_auth,customWebController.Post_Account_Custom);

router.delete("/deleteaccount",check_auth,customWebController.Delete_Website);

module.exports=router;