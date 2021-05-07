const express = require("express");
const router = express.Router();

const check_auth =require("../middleware/check-auth");
const checkauthController =require("../controllers/checkAuth");

router.get("/",check_auth,checkauthController.CheckToken);

module.exports=router;