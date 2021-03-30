const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
//const bodyParse =require("body-parser");
const bcrypt = require("bcrypt");
const jwt =require("jsonwebtoken");
const Account = require("../models/account");
const AccountController = require("../controllers/account");
const check_auth =require("../middleware/check-auth");


router.get("/", AccountController.Get_All_Account);

router.post("/signup", AccountController.Post_Account_Signup);

router.post("/signin", AccountController.Post_Account_Signin);

router.get("/:accountId",AccountController.Get_One_Account);

router.patch("/:accountId", AccountController.PutAccount);

router.delete("/:username",check_auth,AccountController.Delete_Account);

module.exports=router;