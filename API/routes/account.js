const express = require("express");
const router = express.Router();

const AccountController = require("../controllers/account");
const check_auth =require("../middleware/check-auth");


router.get("/", AccountController.Get_All_Account);

router.post("/signup", AccountController.Post_Account_Signup);

router.post("/signupparent",check_auth,AccountController.Post_Account_Signup_For_Parents);

router.post("/signin", AccountController.Post_Account_Signin);

router.get("/signout",check_auth,AccountController.Sign_Out);

router.get("/:accountId",AccountController.Get_One_Account);

router.post("/changepassword",check_auth,AccountController.Change_Password);

router.post("/tokennotification",check_auth,AccountController.Post_Token_Notification);

router.post("/forgotpassword",AccountController.Forgot_Password);

router.post("/resetpassword",AccountController.Reset_Password);

router.patch("/:accountId", AccountController.PutAccount);

router.delete("/:username",check_auth,AccountController.Delete_Account);

router.get("/setchangefirst",check_auth,AccountController.Set_Change_First_Signin);

module.exports=router;