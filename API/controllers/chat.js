
const Account = require("../models/account");
const chat = require("../models/chat");
const mongoose = require("mongoose");
const awaitMessage = require("../models/awaitMessage");
const Config = require("../middleware/rdbconfig");
const sql = require("mssql");
const courses = require("../models/courses");
const customweb = require("../models/customweb");
const coursesContent = require("../models/coursesContent");
const currentStudyCourses = require("../models/currentStudyCourses");


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

exports.Test_Noti = async (req, res, next) => {
    var change = [];
    var listUser = [];
    async function Init2() {
        await courses.find({})
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
                                })
                                .catch(err=>{

                                })

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
                            }
                        })
                        .catch(err => {
                        })
                };
            })
            .catch(err => {
            });
    };
    var a = await Init2();

    if (change.length >= 1) {
        
        res.status(200).json({ message: "change", listAssignChange: change, listUserChange: listUser });
    }
    else {
        res.status(200).json({ message: "No change" });
    }


};