const express = require("express");
const router = express.Router();

const AccountController = require("../controllers/account");
const check_auth =require("../middleware/check-auth");


router.get("/", AccountController.Get_All_Account);

router.post("/signup", AccountController.Post_Account_Signup);

router.post("/signin", AccountController.Post_Account_Signin);

router.get("/:accountId",AccountController.Get_One_Account);

router.post("/changepassword",check_auth,AccountController.Change_Password);

router.post("/forgotpassword",AccountController.Forgot_Password);

router.patch("/:accountId", AccountController.PutAccount);

router.delete("/:username",check_auth,AccountController.Delete_Account);

module.exports=router;