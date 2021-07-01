const forumMoodle = require("../models/forumMoodle");
const customweb = require("../models/customweb");
const mongoose = require("mongoose");
const request = require("request");
exports.Get_Forum_Moodle = async (req, res, next) => {
    var urlofCustweb;
    var tokenofCustomweb;
    await customweb.find({ $and: [{ idUser: req.userData._id }, { typeUrl: "Moodle" }] })
        .exec()
        .then((re1) => {
            if (re1.length >= 1) {
                urlofCustweb = re1[0].url.split(".edu.vn")[0] + ".edu.vn"
                tokenofCustomweb = re1[0].token;
            } else {
                res.status(500).json({ message: "No account customweb" });
            }
        })
        .catch(err => {
            res.status(500).json({ error: err })
        })

    forumMoodle.find({ $and: [{ IDCourses: req.body.IDCourses }, { url: urlofCustweb }] })
        .exec()
        .then(re2 => {
            if (re2.length >= 1) {
                res.status(200).json(re2)
            } else {
                var url1 = urlofCustweb + "/webservice/rest/server.php?moodlewsrestformat=json&wsfunction=mod_forum_get_forums_by_courses&wstoken=" + tokenofCustomweb + "&courseids[0]=" + req.body.IDCourses;
                //console.log(url);
                var options1 = {
                    "method": "GET",
                    "url": url1,
                    "headers": {
                    }
                };

                request(options1, async function (error, response) {
                    if (error) {
                        res.status(500).json({ message: error });
                    }
                    else {
                        if (response.statusCode === 200) {
                            var info = JSON.parse(response.body);
                            idforum = info.filter(el => el.name === "Discussion Forums");
                            if (idforum[0] !== undefined) {

                                var ForumMoodle = new forumMoodle({
                                    _id: new mongoose.Types.ObjectId(),
                                    IDForum: idforum[0].id,
                                    IDCourses: req.body.IDCourses,
                                    url: urlofCustweb,
                                    Forum: []
                                });

                                var url2 = urlofCustweb + "/webservice/rest/server.php?wsfunction=mod_forum_get_forum_discussions_paginated&moodlewsrestformat=json&wstoken=" + tokenofCustomweb + "&forumid=" + idforum[0].id;
                                //console.log(url);
                                var options2 = {
                                    "method": "GET",
                                    "url": url2,
                                    "headers": {
                                    }
                                };
                                function Init() {
                                    return new Promise((resolve) => {
                                        request(options2, async function (error, response) {
                                            if (error) {
                                                res.status(500).json({ message: error });
                                            }
                                            else {
                                                if (response.statusCode === 200) {
                                                    var info2 = JSON.parse(response.body);
                                                    //console.log(info2)
                                                    for (var i = 0; i < info2.discussions.length; i++) {
                                                        //console.log(info2[i])
                                                        var listForum = ForumMoodle.Forum;
                                                        listForum = {
                                                            name: info2.discussions[i].name,
                                                            createDate: info2.discussions[i].created,
                                                            modifiedDate: info2.discussions[i].modified,
                                                            subject: info2.discussions[i].subject,
                                                            message: info2.discussions[i].message,
                                                            fullname: info2.discussions[i].userfullname,
                                                            url: info2.discussions[i].userpictureurl
                                                        }
                                                        if (ForumMoodle.Forum !== undefined) {
                                                            ForumMoodle.Forum.push(listForum);
                                                        } else {
                                                            ForumMoodle.Forum = listForum;
                                                        }
                                                    }
                                                    res.status(200).json(ForumMoodle);
                                                    ForumMoodle
                                                    .save()
                                                    .then()
                                                    .catch(err=>{
                                                        res.status(500).json({ error: err });
                                                    })

                                                    
                                                    return resolve()
                                                }
                                                else{
                                                    res.status(500).json();
                                                }
                                            }
                                        });
                                    })
                                }
                                await Init().then();

                            }
                            else {
                                res.status(500).json({message:"No Forum in Coureses"});
                            }

                        }
                        else {
                            res.status(500).json();
                        }
                    }
                });
            }
        })
        .catch(err => {
            //console.log(err);
            res.status(500).json({ error: err });
        })
};