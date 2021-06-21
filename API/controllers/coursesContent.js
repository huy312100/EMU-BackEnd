const mongoose = require("mongoose");
var request = require("request");
const coursesContent = require("../models/coursesContent");
const customweb = require("../models/customweb");
const courses = require("../models/courses");
//const htmlToJson = require("html-to-json");
exports.Get_One_Courses = async (req, res, next) => {
    var urlofCustweb;
    var tokenofCustomweb;
    //console.log("1");
    await customweb.find({ $and: [{ idUser: req.userData._id }, { typeUrl: "Moodle" }] })
        .exec()
        .then((re2) => {
            if (re2.length >= 1) {
                urlofCustweb = re2[0].url;
                tokenofCustomweb = re2[0].token;
            }
        });
    //console.log("2");
    //console.log(urlofCustweb);
    var urlmcontent = urlofCustweb.split(".edu.vn")[0] + ".edu.vn";
    //console.log(urlmcontent);
    await coursesContent.find({ $and: [{ urlm: urlmcontent }, { IDCourses: req.body.IDCourses }] })
        .exec()
        .then((re1) => {
            console.log(re1.length)
            if (re1.length >= 1) {
                res.status(200).json(re1[0]);
            }
            else {
                //console.log("3")
                var CoursesContent = new coursesContent({
                    _id: new mongoose.Types.ObjectId(),
                    IDCourses: req.body.IDCourses,
                    urlm: urlofCustweb.split(".edu.vn")[0] + ".edu.vn",
                    listAssign: []
                });
                //console.log("3")

                var url = urlofCustweb.split(".edu.vn")[0] + ".edu.vn/webservice/rest/server.php?moodlewsrestformat=json&wsfunction=core_course_get_contents&courseid=" + req.body.IDCourses + "&wstoken=" + tokenofCustomweb;
                //console.log(url);
                var options = {
                    "method": "GET",
                    "url": url,
                    "headers": {
                    }
                };

                request(options, async function (error, response) {
                    if (error) {
                        res.status(500).json({ message: error });
                    }
                    else {
                        if (response.statusCode === 200) {
                            var info = JSON.parse(response.body);
                            for (var i = 0; i < info.length; i++) {
                                for (var j = 0; j < info[i].modules.length; j++) {
                                    if (info[i].modules[j].modname === "assign") {
                                        var listAssigns = CoursesContent.listAssign;
                                        if (info[i].modules[j].completion === 1) {
                                            listAssigns = {
                                                IDOfListAssign: info[i].modules[j].id,
                                                name: info[i].modules[j].name,
                                                url: info[i].modules[j].url,
                                                startDate: info[i].modules[j].completiondata.timecompleted
                                            }
                                        } else {
                                            listAssigns = {
                                                IDOfListAssign: info[i].modules[j].id,
                                                name: info[i].modules[j].name,
                                                url: info[i].modules[j].url,
                                                startDate: 0
                                            }
                                        }
                                        //console.log(listAssigns);
                                        if (CoursesContent.listAssign !== undefined) {
                                            CoursesContent.listAssign.push(listAssigns);
                                        } else {
                                            CoursesContent.listAssign = listAssigns;
                                        }
                                    } else if (info[i].modules[j].modname === "label") {
                                        var listLabels = CoursesContent.listLabel

                                        listLabels = {
                                            IDOfListLabel: info[i].modules[j].id,
                                            name: info[i].modules[j].name,
                                            label: info[i].modules[j].description
                                        }

                                        if (CoursesContent.listLabel !== undefined) {
                                            CoursesContent.listLabel.push(listLabels);
                                        } else {
                                            CoursesContent.listLabel = listLabels;
                                        }
                                    } else if (info[i].modules[j].modname === "resource") {
                                        var listresources = CoursesContent.listResource
                                        listresources = {
                                            IDOfListResources: info[i].modules[j].id,
                                            name: info[i].modules[j].name,
                                            url: info[i].modules[j].url
                                        }

                                        if (CoursesContent.listResource !== undefined) {
                                            CoursesContent.listResource.push(listresources);
                                        } else {
                                            CoursesContent.listResource = listresources;
                                        }
                                    } else if (info[i].modules[j].modname === "url") {
                                        var listurls = CoursesContent.listUrl
                                        listurls = {
                                            IDOfListUrl: info[i].modules[j].id,
                                            name: info[i].modules[j].name,
                                            url: info[i].modules[j].url
                                        }

                                        if (CoursesContent.listUrl !== undefined) {
                                            CoursesContent.listUrl.push(listurls);
                                        } else {
                                            CoursesContent.listUrl = listurls;
                                        }
                                    } else if (info[i].modules[j].modname === "folder") {
                                        var listfolders = CoursesContent.listFolder
                                        listfolders = {
                                            IDOfListFolder: info[i].modules[j].id,
                                            name: info[i].modules[j].name,
                                            url: info[i].modules[j].url
                                        }

                                        if (CoursesContent.listFolder !== undefined) {
                                            CoursesContent.listFolder.push(listfolders);
                                        } else {
                                            CoursesContent.listFolder = listfolders;
                                        }
                                    }
                                }
                            }
                            CoursesContent.save()
                                .then(() => {
                                    res.status(200).json(CoursesContent);
                                })
                                .catch(err => {
                                    res.status(500).json({ error: err });
                                })
                            //console.log(CoursesContent);
                        }
                    }
                });
            }
        })
        .catch(err => {
            res.status(500).json({ error: err });
        })
}

exports.Check_Change_Courses = async (req, res, next) => {
    console.log("ga")
    var change = [];
    var listUser = [];
    async function Init2() {
        await courses.find()
            .exec()
            .then(async (re1) => {
                for (var k = 0; k < re1.length; k++) {
                    //re1.forEach(async (element) => {
                    var element = re1[k];
                    var tokenofCustomweb;
                    var urlofCustweb;
                    //console.log("51");
                    function Init4() {
                        return new Promise(async (resolve) => {
                            await customweb.find({ $and: [{ idUser: element.IDUser }, { typeUrl: "Moodle" }] })
                                .exec()
                                .then((re2) => {
                                    if (re2.length >= 1) {
                                        urlofCustweb = re2[0].url;
                                        tokenofCustomweb = re2[0].token;
                                        return resolve();
                                    }
                                });

                        });
                    };

                    await Init4().then(() => {
                        //console.log("5");
                    });

                    var url = element.url + "/webservice/rest/server.php?moodlewsrestformat=json&wsfunction=core_course_get_contents&courseid=" + element.IDCourses + "&wstoken=" + tokenofCustomweb;
                    var options = {
                        "method": "GET",
                        "url": url,
                        "headers": {
                        }
                    };

                    //console.log("31")
                    await coursesContent.find({ $and: [{ urlm: element.url }, { IDCourses: element.IDCourses }] })
                        .exec()
                        .then(async (re2) => {
                            if (re2.length >= 1) {
                                async function Init() {
                                    return new Promise((resolve) => {
                                        request(options, async function (error, response) {
                                            if (error) {
                                                res.status(500).json({ message: error });
                                            }
                                            else {

                                                if (response.statusCode === 200) {
                                                    var info = JSON.parse(response.body);
                                                    var counttotal = 0;
                                                    var count = info.filter(value => {
                                                        counttotal += value.modules.filter(value2 => value2.modname === "assign").length;
                                                    }).length

                                                    if (counttotal !== re2[0].listAssign.length) {
                                                        var sayyes = re2[0].listAssign;
                                                        //console.log(sayyes);
                                                        for (var i = 0; i < info.length; i++) {
                                                            for (var j = 0; j < info[i].modules.length; j++) {
                                                                if (info[i].modules[j].modname === "assign") {

                                                                    const deadlineExist = sayyes.some(users => users.IDOfListAssign.toString() === info[i].modules[j].id.toString())
                                                                    if (!deadlineExist) {
                                                                        //var listAssigns = coursesContent.listAssign;
                                                                        //console.log(deadlineExist)
                                                                        var listAssigns = {
                                                                            IDOfListAssign: info[i].modules[j].id,
                                                                            name: info[i].modules[j].name,
                                                                            url: info[i].modules[j].url,
                                                                            startDate: info[i].modules[j].completiondata.timecompleted
                                                                        }

                                                                        await coursesContent.updateOne({
                                                                            _id: re2[0]._id
                                                                        },
                                                                            {
                                                                                $push: { listAssign: listAssigns }
                                                                            });

                                                                        change.push(listAssigns)
                                                                    }
                                                                }
                                                            }
                                                        }
                                                        //console.log("2");
                                                        await courses.find({ $and: [{ url: element.url }, { IDCourses: element.IDCourses }] })
                                                            .exec()
                                                            .then(re3 => {
                                                                if (re3.length >= 1) {
                                                                    if (listUser !== undefined) {
                                                                        listUser.push(re3[0].listStudent);
                                                                    } else {
                                                                        listUser = re3[0].listStudent;
                                                                    }
                                                                }
                                                            })
                                                        return resolve()
                                                    }
                                                    return resolve();
                                                }
                                            }
                                        });
                                    });
                                }
                                await Init();
                            } else {
                                var CoursesContent = new coursesContent({
                                    _id: new mongoose.Types.ObjectId(),
                                    IDCourses: element.IDCourses,
                                    urlm: urlofCustweb.split(".edu.vn")[0] + ".edu.vn",
                                    listAssign: []
                                });

                                request(options, async function (error, response) {
                                    if (error) {
                                        res.status(500).json({ message: error });
                                    }
                                    else {
                                        if (response.statusCode === 200) {
                                            var info = JSON.parse(response.body);
                                            console.log("6");
                                            for (var i = 0; i < info.length; i++) {
                                                for (var j = 0; j < info[i].modules.length; j++) {
                                                    if (info[i].modules[j].modname === "assign") {
                                                        var listAssigns = CoursesContent.listAssign;
                                                        listAssigns = {
                                                            IDOfListAssign: info[i].modules[j].id,
                                                            name: info[i].modules[j].name,
                                                            url: info[i].modules[j].url,
                                                            startDate: info[i].modules[j].completiondata.timecompleted
                                                        }
                                                        //console.log(listAssigns);
                                                        if (CoursesContent.listAssign !== undefined) {
                                                            CoursesContent.listAssign.push(listAssigns);
                                                        } else {
                                                            CoursesContent.listAssign = listAssigns;
                                                        }
                                                    }
                                                }
                                            }

                                            CoursesContent.save()
                                                .then()
                                                .catch(err => {
                                                    res.status(500).json({ error: err });
                                                })
                                            //console.log(CoursesContent);
                                        }
                                    }
                                });
                            }
                        })
                        .catch(err => {
                            res.status(500).json({ error: err });
                        })

                };


                //console.log("3")
            })
            .catch(err => {
                res.status(500).json({ error: err })
            });
    };
    var a = await Init2();

    //console.log("4");

    if (change.length >= 1) {
        res.status(200).json({ message: "change", listAssignChange: change, listUserChange: listUser });
    }
    else {
        res.status(200).json({ message: "No change" });
    }

}