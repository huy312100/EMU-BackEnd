const express = require("express");
const router = express.Router();

const forumController= require("../controllers/forum");
const checkauth = require("../middleware/check-auth");
const neo4jSessionCleanup = require("../middleware/neo4jSessionCleanup");

router.use(neo4jSessionCleanup);

router.post("/post",checkauth,forumController.Create_Post );

router.post("/like",checkauth, forumController.Like_Post);

router.post("/cmt",checkauth,forumController.Comment_Post);

router.post("/view",checkauth,forumController.View_Post);

router.post("/viewlike",forumController.View_List_User_Liked);

router.post("/viewcmt",forumController.View_List_User_Commented);

router.post("/delete",checkauth,forumController.Delete_Post);

router.post("/deletecmt",checkauth,forumController.Delete_Comment);

module.exports=router;