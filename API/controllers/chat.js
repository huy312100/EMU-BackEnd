
const Account = require("../models/account");
const chat = require("../models/chat");
const mongoose = require("mongoose");
const awaitMessage = require("../models/awaitMessage");
const Config = require("../middleware/rdbconfig");
const sql = require("mssql");

const customweb = require("../models/customweb");
const coursesContent = require("../models/coursesContent");


const studyCourses = require("../models/studyCourses");
const currentStudyCourses = require("../models/currentStudyCourses");
const courses = require("../models/courses");
exports.FindChatAwait = (req, res, next) => {

    awaitMessage.find({ OwnUser: req.userData.username })
        .exec()
        .then(async (re1) => {
            if (re1.length >= 1) {
                for (var i = 0; i < re1[0].awaittext.length; i++) {
                    try {
                        let pool = await sql.connect(Config);

                        let profiles = await pool.request()
                            .input('ID_Signin', sql.VarChar, re1[0].awaittext[i].from)
                            .query("SELECT [HoTen] FROM [dbo].[InfoSinhVien] where InfoSinhVien.Email = @ID_Signin");

                        //console.log(facultys.recordsets[0]);
                        if (profiles.recordsets[0]) {
                            re1[0].awaittext[i].from = profiles.recordsets[0][0]["HoTen"];
                            console.log(profiles.recordsets[0][0]);
                        }
                        else {
                            res.status(500).json({ err: "err" });
                        }

                    }
                    catch (error) {
                        console.log(error);
                        res.status(500).json(error);
                    }
                    //res.status(200).json(re1[0]);
                }

                res.status(200).json(re1[0]);
            }
            else {
                res.status(200).json({ message: "Message await is Empty" });
            }
        })
        .catch(err => {
            res.status(500).json({ err: err });
        })
};

exports.FindChatUser = (req, res, next) => {

    chat.find({ "User": { $all: [req.userData.username] } })
        .exec()
        .then(async (re1) => {
            if (re1.length >= 1) {
                var results = [];
                //chay vong lap for tung nguoi ma user do da nhan tin
                for (var i = 0; i < re1.length; i++) {
                    var Usertemp;
                    if (re1[i].User[0] === req.userData.username) {
                        Usertemp = re1[i].User[1];
                    }
                    else {
                        Usertemp = re1[i].User[0];
                    }
                    try {
                        let pool = await sql.connect(Config);

                        let profiles = await pool.request()
                            .input('ID_Signin', sql.VarChar, Usertemp)
                            .query("SELECT [HoTen],[AnhSV] FROM [dbo].[InfoSinhVien] where InfoSinhVien.Email = @ID_Signin");

                        //console.log(facultys.recordsets[0]);
                        if (profiles.recordsets[0]) {
                            if (re1[i].chat.length >= 1) {
                                var leng = re1[i].chat.length;
                                var temp = {
                                    "idRoom": re1[i]._id,
                                    "name": profiles.recordsets[0][0]["HoTen"],
                                    "Email": Usertemp,
                                    "Anh": profiles.recordsets[0][0]["AnhSV"],
                                    "TypeRoom": "TwoPeople",
                                    "text": re1[i].chat[leng - 1].text,
                                    "time": parseInt(re1[i].chat[leng - 1].time),
                                    "state": re1[i].chat[leng - 1].state,
                                }
                                if (results !== undefined) {
                                    results.push(temp);
                                }
                                else {
                                    results = temp;
                                }
                                //console.log(results);
                            }
                        }
                        else {
                            res.status(500).json({ err: "err" });
                        }

                    }
                    catch (error) {
                        //console.log(error);
                        res.status(500).json(error);
                    }
                }
                //results.sortBy()
                //var sortedObjs = results.sortBy( results, "time" );
                //console.log(sortedObjs);
                res.status(200).json(results);
            } else {
                res.status(200).json({ message: "Message is Empty" });
            }
        })
        .catch(err => {
            res.status(500).json({ err: err });
        })

    //res.status(200).json(results);
}

exports.LoadMessage = async (req, res, next) => {
    await chat.find({ _id: req.body.IDRoom })
        .exec()
        .then(async (re1) => {
            if (re1.length >= 1) {
                var results = [];
                var listchat = re1[0].chat;
                var startpage = (re1[0].chat.length - 1) - (20 * parseInt(req.body.page));
                var endpage = (re1[0].chat.length - 1) - (20 ** parseInt(req.body.page)) - 20;

                if (parseInt(listchat.length / 20) < parseInt(req.body.page)) {
                    res.status(500).json({ message: "page not found" });
                }
                //console.log(re1[0].chat.length-1);
                //console.log(startpage);
                //console.log(endpage);
                for (var i = startpage; i > endpage; i--) {
                    if (listchat[i] === undefined) {
                        break;
                    }
                    if (results !== undefined) {
                        results.push(listchat[i]);
                    }
                    else {
                        results = listchat[i];
                    }
                    //console.log(listchat[i]);
                }
                console.log("1");
                res.status(200).json(results);
            } else {
                res.status(200).json({ message: "You dont have message" });
            }
        })
        .catch(err => {
            res.status(500).json({ err: err });
        })
};

const puppeteer = require("puppeteer");
const newsUniversity = require("../models/newsUniversity");
const newsFaculty = require("../models/newsFaculty");
const request = require("request");
const notification = require("../models/notification");

exports.Test_Noti = async (req, res, next) => {
    studyCourses.find({})
        .exec()
        .then(async (re1) => {
            if (re1.length >= 1) {
                for (var i = 0; i < re1.length; i++) {
                    var element = re1[i];
                    var tokenofCustomweb;
                    var IDAccount;
                    var urlofCustweb;
                    //console.log("51");
                    function Init4() {
                        return new Promise(async (resolve) => {
                            await customweb.find({ $and: [{ idUser: element.idUser }, { typeUrl: "Moodle" }] })
                                .exec()
                                .then((re2) => {
                                    if (re2.length >= 1) {
                                        urlofCustweb = re2[0].url;
                                        tokenofCustomweb = re2[0].token;
                                        IDAccount = re2[0].idUser;
                                        return resolve();
                                    }
                                })
                                .catch(err => {

                                })

                        });
                    };

                    await Init4().then(() => {
                        //console.log("5");
                    });

                    var urlcourses = urlofCustweb.split(".edu.vn")[0] + ".edu.vn";
                    var url = urlcourses + "/webservice/rest/server.php?moodlewsrestformat=json&wsfunction=core_enrol_get_users_courses&wstoken=" + tokenofCustomweb + "&userid=" + element.idUserMoodle;
                    var options = {
                        "method": "GET",
                        "url": url,
                        "headers": {
                        }
                    };
                    console.log(url);
                    async function Init() {
                        return new Promise((resolve) => {
                            request(options, async function (error, response) {
                                if (error) {
                                }
                                else {
                                    if (response.statusCode === 200) {
                                        var info = JSON.parse(response.body);
                                        console.log(element.idUserMoodle);
                                        console.log(info.length);
                                        console.log(element.listCourses.length);

                                        if (info.length !== element.listCourses.length) {
                                            var leng = parseInt(info.length) - parseInt(element.listCourses.length);
                                            function Init6() {
                                                return new Promise(async (resolve) => {
                                                    for (var j = leng - 1; j >= 0; j--) {
                                                        //push vao dau studycourses
                                                        var results = {
                                                            "Title": "Môn học mới",
                                                            "Data": info[j].fullname,
                                                            "ListUser": []
                                                        };
                                                        var IDCouresesNew = info[j].id;

                                                        var newcourses = {
                                                            IDCourses: IDCouresesNew,
                                                            name: info[j].fullname,
                                                            category: info[j].category,
                                                            startDate: info[j].startdate
                                                        };
                                                        studyCourses.updateOne({
                                                            _id: element._id
                                                        },
                                                            {
                                                                $push: { listCourses: { $each: [newcourses], $position: 0 } }
                                                                //$push: { listCourses: newcourses, $position: 0 },

                                                            }, (err, doc) => {
                                                                if (err) {

                                                                }
                                                                else {

                                                                }
                                                            });

                                                        if (info[j].category !== element.listCourses[0].category) {
                                                            //mon hoc moi trong hoc ki moi
                                                            //set lai currentStudyCourses
                                                            currentStudyCourses.updateOne({
                                                                idUser: IDAccount
                                                            },
                                                                {
                                                                    $set: { listCourses: newcourses }
                                                                }, (err, doc) => {
                                                                    if (err) {

                                                                    }
                                                                    else {

                                                                    }
                                                                });
                                                        }
                                                        else {
                                                            // mon hoc moi trong hoc ki cu
                                                            //push vao currentStudyCourses
                                                            currentStudyCourses.updateOne({
                                                                idUser: IDAccount
                                                            },
                                                                {
                                                                    $push: { listCourses: { $each: [newcourses], $position: 0 } }
                                                                    //$push: { listCourses: newcourses ,$position: 0}
                                                                }, (err, doc) => {
                                                                    if (err) {

                                                                    }
                                                                    else {

                                                                    }
                                                                });
                                                        }
                                                        //add colection courses
                                                        courses.find({ IDCourses: IDCouresesNew, url: urlcourses })
                                                            .exec()
                                                            .then(re3 => {
                                                                if (re3.length >= 1) {
                                                                    courses.updateOne({
                                                                        _id: re3[0]._id
                                                                    },
                                                                        {
                                                                            $push: { listStudent: { IDUser: IDAccount, IDUserMoodle: element.idUserMoodle } }
                                                                        }, (err, doc) => {
                                                                            if (err) {

                                                                            }
                                                                            else {

                                                                            }
                                                                        });
                                                                } else {
                                                                    const courses2 = new courses({
                                                                        _id: new mongoose.Types.ObjectId(),
                                                                        IDCourses: IDCouresesNew,
                                                                        url: urlcourses,
                                                                        IDUser: IDAccount,
                                                                        IDUserInstead: element.idUserMoodle,
                                                                        listStudent: { IDUser: IDAccount, IDUserMoodle: element.idUserMoodle }
                                                                    });
                                                                    courses2.save()
                                                                        .then()
                                                                        .catch(err => {
                                                                            console.log(err);
                                                                        });

                                                                    //couresess.push(courses)
                                                                    //console.log(courses)


                                                                }
                                                            })

                                                        //add coleection coursescontent
                                                        coursesContent.find({ $and: [{ urlm: urlcourses }, { IDCourses: info[j].id }] })
                                                            .exec()
                                                            .then((re4) => {
                                                                console.log(re4.length)
                                                                if (re4.length >= 1) {

                                                                }
                                                                else {
                                                                    //console.log("3")
                                                                    var CoursesContent = new coursesContent({
                                                                        _id: new mongoose.Types.ObjectId(),
                                                                        IDCourses: IDCouresesNew,
                                                                        urlm: urlcourses,
                                                                        listAssign: []
                                                                    });
                                                                    //console.log("3")

                                                                    var url2 = urlcourses + "/webservice/rest/server.php?moodlewsrestformat=json&wsfunction=core_course_get_contents&courseid=" + IDCouresesNew + "&wstoken=" + tokenofCustomweb;
                                                                    //console.log(url);
                                                                    var options2 = {
                                                                        "method": "GET",
                                                                        "url": url2,
                                                                        "headers": {
                                                                        }
                                                                    };

                                                                    request(options2, async function (error, response) {
                                                                        if (error) {

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

                                                                                    })
                                                                                    .catch(err => {

                                                                                    })
                                                                                //console.log(CoursesContent);
                                                                            }
                                                                        }
                                                                    });
                                                                }
                                                            })
                                                            .catch(err => {
                                                                console.log(err);
                                                                //res.status(500).json({ error: err });
                                                            })

                                                        //push thong bao
                                                        function Init7() {
                                                            return new Promise(async (resolve) => {
                                                                //console.log(listUser[x][j].IDUser);
                                                                await Account.find({ _id: IDAccount })
                                                                    .exec()
                                                                    .then(re2 => {
                                                                        if (re2.length >= 1) {
                                                                            //console.log(re2[0].tokenNotifition)
                                                                            if (re2[0].tokenNotifition !== undefined) {
                                                                                //console.log("1")
                                                                                var temp2 = {
                                                                                    "tokenNotifition": re2[0].tokenNotifition,
                                                                                    "IDUser": IDAccount
                                                                                }
                                                                                if (results.ListUser !== undefined) {
                                                                                    results.ListUser.push(temp2);
                                                                                } else {
                                                                                    results.ListUser = temp2;
                                                                                }
                                                                            }
                                                                        }
                                                                        //console.log(results);
                                                                    })
                                                                    .catch(err => {

                                                                    })

                                                                return resolve();
                                                            })
                                                        };
                                                        await Init7().then();

                                                        async function sendPushNotification(expoPushToken, titleparams, bodyparams) {
                                                            const message = {
                                                                to: expoPushToken,
                                                                sound: 'default',
                                                                title: titleparams,
                                                                body: bodyparams,
                                                                data: {},
                                                            };

                                                            var options = {
                                                                "method": "POST",
                                                                "url": "https://exp.host/--/api/v2/push/send",
                                                                "headers": {
                                                                    "Accept": "application/json",
                                                                    "Accept-encoding": "gzip, deflate",
                                                                    "Content-Type": "application/json",
                                                                },
                                                                body: JSON.stringify(message),
                                                            };
                                                            request(options, function (error, response) {
                                                                if (error) {
                                                                } else {
                                                                    console.log("suss");
                                                                }
                                                            });

                                                        }
                                                        console.log(results);
                                                        // console.log(results.ListUser);
                                                        // console.log(results.ListUser[0].tokenNotifition);
                                                        // console.log(results.ListUser[0].IDUser);
                                                        if (results.ListUser.length >= 1) {
                                                            for (var z = 0; z < results.ListUser.length; z++) {
                                                                // console.log(results.ListUser[z].tokenNotifition);
                                                                // console.log(results.ListUser[z].IDUser);
                                                                const idusertemp = results.ListUser[z].IDUser;
                                                                sendPushNotification(results.ListUser[z].tokenNotifition, results.Title, results.Data);
                                                                notification.find({ IDUser: idusertemp })
                                                                    .exec()
                                                                    .then(re3 => {
                                                                        const currentDate = new Date();
                                                                        const timestamp = currentDate.getTime();
                                                                        if (re3.length >= 1) {
                                                                            console.log("1");

                                                                            notification.updateOne({
                                                                                _id: re3[0]._id
                                                                            },
                                                                                {
                                                                                    $push: { notification: { $each: [{ Title: results.Title, Data: results.Data, Date: timestamp }], $position: 0 } }
                                                                                    //$push: { notification: { Title: results.Title, Data: results.Data, Date: timestamp } ,$position: 0}
                                                                                }, (err, doc) => {
                                                                                    if (err) {
                                                                                        //console.log(err);
                                                                                    }
                                                                                    else {
                                                                                        //console.log(doc)
                                                                                    }
                                                                                });
                                                                        } else {
                                                                            Notifications = new notification({
                                                                                _id: new mongoose.Types.ObjectId(),
                                                                                IDUser: idusertemp,
                                                                                notification: { Title: results.Title, Data: results.Data, Date: timestamp }
                                                                            });
                                                                            console.log(Notifications);
                                                                            Notifications.save()
                                                                                .then(() => {
                                                                                    console.log("save");
                                                                                })
                                                                                .catch(err => {
                                                                                    console.log(err);
                                                                                })
                                                                        }
                                                                    })
                                                                    .catch(err => {
                                                                        console.log(err);
                                                                    })
                                                            }
                                                        }
                                                    }
                                                    return resolve();
                                                })
                                            }
                                            await Init6().then(() => {
                                                //console.log("5");
                                            });
                                        } else {
                                            console.log("No change");
                                        }
                                    }

                                }
                                return resolve();
                            });
                        })
                    }
                    await Init().then(() => {
                        //console.log("5");
                    });
                    //

                }
                //res.status(200).json({});
            }
        })
        .catch(err => {

        })
};