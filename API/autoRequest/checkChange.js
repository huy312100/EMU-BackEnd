const newsUniversity = require("../models/newsUniversity");
const newsFaculty = require("../models/newsFaculty");
const notification = require("../models/notification");
const Account = require("../models/account");
const Config = require("../dbConfig/rdbconfig");
const coursesContent = require("../models/coursesContent");
const customweb = require("../models/customweb");
const courses = require("../models/courses");
const studyCourses = require("../models/studyCourses");
const currentStudyCourses = require("../models/currentStudyCourses");

const puppeteer = require("puppeteer");
const request = require("request");
const sql = require("mssql");
const mongoose = require("mongoose");
const neo4j = require("neo4j-driver");

exports.check_New_Courses_Graph = async () => {
    var driver = neo4j.driver(process.env.Neo4j_Connect_URI, neo4j.auth.basic(process.env.Neo4j_Username, process.env.Neo4j_Password));
    var session = driver.session();
    //tx = session.begin_transaction()
    function Init() {
        return new Promise(async resolve => {
            await studyCourses.find({})
                .exec()
                .then(async (re1) => {
                    if (re1.length >= 1) {

                        for (var i = 0; i < re1.length; i++) {
                            var temp = re1[i];
                            try {

                                let pool = await sql.connect(Config);

                                let profiles = await pool.request()
                                    .input('ID_Signin', sql.VarChar, temp.idUser)
                                    .query("SELECT i.HoTen,uf.MaKhoa, uf.MaTruong,i.Email FROM [InfoSinhVien] i, [University_Faculty] uf where i.IDTruongKhoa = uf.ID and i.IDSignin =@ID_Signin");

                                if (profiles.recordsets[0]) {
                                    const query = "match (n:Faculty {code:$Ma_Khoa})-[:BELONG_TO]->(u:University{code: $Ma_Truong})" +
                                        "merge (s:STUDENT {name:$Ho_Ten, email:$Email})" +
                                        "MERGE (s)-[:STUDY_AT]->(n)";

                                    var result = await session.writeTransaction(tx => {
                                        return tx.run(query, {
                                            Ma_Khoa: profiles.recordsets[0][0]["MaKhoa"],
                                            Ma_Truong: profiles.recordsets[0][0]["MaTruong"],
                                            Ho_Ten: profiles.recordsets[0][0]["HoTen"],
                                            Email: profiles.recordsets[0][0]["Email"]
                                        })
                                            .then(async re1 => {
                                                //session.close();
                                            })
                                            .catch(err => {
                                                console.log(err);
                                            })
                                    })
                                    for (var j = 0; j < temp.listCourses.length; j++) {
                                        const query1 = "match (s:STUDENT { email:$Email})" +
                                            "merge (c:COURSES {name: $name_courses,code:$IDCourses}) " +
                                            "merge (s)-[:HAVE]->(c) ";

                                        var result1 = await session.writeTransaction(tx => {
                                            return tx.run(query1, {
                                                Email: profiles.recordsets[0][0]["Email"],
                                                name_courses: temp.listCourses[j].name,
                                                IDCourses: temp.listCourses[j].IDCourses
                                            })
                                                .then(async re1 => {
                                                    //session.close();
                                                    console.log("Created")

                                                })
                                                .catch(err => {
                                                    console.log(err);
                                                })
                                        })
                                    }
                                }

                            }
                            catch (error) {
                                console.log(error);
                            }
                        }
                    }
                    return resolve();
                })
                .catch(err => {
                    console.log(err);
                })
        })
    }
    Init().then(() => {
        session.close();
        driver.close();
    })

};

exports.check_Change_New_Courses = () => {
    console.log("new courses");

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

exports.Check_Change_Deadline_Moodle = async () => {
    console.log("new deadline");
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
                                .catch(err => {

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
        for (var x = 0; x < change.length; x++) {
            results = {
                "Title": "Deadline Môn học",
                "Data": change[x].name,
                "ListUser": []
            };
            //console.log("IDUSER:")
            function Init5() {
                return new Promise(async (resolve) => {
                    for (var j = 0; j < listUser[x].length; j++) {
                        //console.log(listUser[x][j].IDUser);
                        await Account.find({ _id: listUser[x][j].IDUser })
                            .exec()
                            .then(async(re2) => {
                                if (re2.length >= 1) {
                                    //console.log(re2[0].tokenNotifition)
                                    if (re2[0].tokenNotifition !== undefined) {
                                        //console.log("1")
                                        var temp2 = {
                                            "tokenNotifition": re2[0].tokenNotifition,
                                            "IDUser": listUser[x][j].IDUser
                                        }
                                        if (results.ListUser !== undefined) {
                                            results.ListUser.push(temp2);
                                        } else {
                                            results.ListUser = temp2;
                                        }
                                    }
                                    if (re2[0].parent !== undefined) {
                                        await Account.find({ _id: re2[0].parent })
                                            .exec()
                                            .then(re8 => {
                                                if (re8.length >= 1) {
                                                    if (re2[0].tokenNotifition !== undefined) {
                                                        //console.log("1")
                                                        if (results.ListUser !== undefined) {
                                                            var temp2 = {
                                                                "tokenNotifition": re2[0].tokenNotifition,
                                                                "IDUser": temp[j].IDSignin
                                                            }
                                                            results.ListUser.push(temp2);
                                                        } else {
                                                            results.ListUser = temp2;
                                                        }
                                                    }
                                                }
                                            })
                                            .catch(err => {

                                            })
                                    }
                                }
                                //console.log(results);
                            })
                            .catch(err => {

                            })
                    }
                    return resolve();


                })
            };
            await Init5().then();

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

            //console.log(results);
            //console.log(results.ListUser);
            // console.log(results.ListUser[0].tokenNotifition);
            // console.log(results.ListUser[0].IDUser);

            if (results.ListUser.length >= 1) {
                for (var z = 0; z < results.ListUser.length; z++) {
                    //console.log(results.ListUser[z].tokenNotifition);
                    //console.log(results.ListUser[z].IDUser);
                    const idusertemp = results.ListUser[z].IDUser;
                    sendPushNotification(results.ListUser[z].tokenNotifition, results.Title, results.Data);
                    await notification.find({ IDUser: idusertemp })
                        .exec()
                        .then(async (re3) => {
                            const currentDate = new Date();
                            const timestamp = currentDate.getTime();
                            if (re3.length >= 1) {
                                console.log("1");
                                //console.log(results.Title);
                                //console.log(results.Data);
                                notification.updateOne({
                                    _id: re3[0]._id
                                },
                                    {
                                        $push: { notification: { $each: [{ Title: results.Title, Data: results.Data, Date: timestamp }], $position: 0 } }
                                        //$push: { notification: { Title: results.Title, Data: results.Data, Date: timestamp } }
                                    }, (err, doc) => {
                                        if (err) {

                                        }
                                        else {

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

    }
    else {
        console.log("No change");
    }
};

exports.Check_Change_Content_Moodle = async () => {
    console.log("change content");
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
                    var IDUserMoodles;
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
                                        IDUserMoodles = re2[0].IDUserMoodle;
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
                                                    var countLabel = 0;
                                                    var countResource = 0;
                                                    var countUrl = 0;
                                                    var countFolder = 0;
                                                    var count = info.filter(value => {
                                                        countLabel += value.modules.filter(value2 => value2.modname === "label").length;
                                                        countResource += value.modules.filter(value2 => value2.modname === "resource").length;
                                                        countUrl += value.modules.filter(value2 => value2.modname === "url").length;
                                                        countFolder += value.modules.filter(value2 => value2.modname === "folder").length;
                                                    }).length

                                                    if (countLabel !== re2[0].listLabel.length || countResource !== re2[0].listResource.length || countUrl !== re2[0].listUrl.length || countFolder !== re2[0].listFolder.length) {
                                                        var sayyes = re2[0].listLabel;
                                                        var sayyes1 = re2[0].listResource;
                                                        var sayyes2 = re2[0].listUrl;
                                                        var sayyes3 = re2[0].listFolder;
                                                        //console.log(sayyes);
                                                        for (var i = 0; i < info.length; i++) {
                                                            for (var j = 0; j < info[i].modules.length; j++) {
                                                                if (info[i].modules[j].modname === "label") {
                                                                    const LabelExist = sayyes.some(users => users.IDOfListLabel.toString() === info[i].modules[j].id.toString())
                                                                    if (!LabelExist) {
                                                                        //var listAssigns = coursesContent.listAssign;
                                                                        //console.log(deadlineExist)
                                                                        listLabels = {
                                                                            IDOfListLabel: info[i].modules[j].id,
                                                                            name: info[i].modules[j].name,
                                                                            label: info[i].modules[j].description
                                                                        }

                                                                        await coursesContent.updateOne({
                                                                            _id: re2[0]._id
                                                                        },
                                                                            {
                                                                                $push: { listLabel: listLabels }
                                                                            });

                                                                        //change = "changed";
                                                                    }
                                                                } else if (info[i].modules[j].modname === "resource") {
                                                                    const ResourceExist = sayyes1.some(users => users.IDOfListResources.toString() === info[i].modules[j].id.toString())
                                                                    if (!ResourceExist) {
                                                                        //var listAssigns = coursesContent.listAssign;
                                                                        //console.log(deadlineExist)
                                                                        listresources = {
                                                                            IDOfListResources: info[i].modules[j].id,
                                                                            name: info[i].modules[j].name,
                                                                            url: info[i].modules[j].url
                                                                        }

                                                                        await coursesContent.updateOne({
                                                                            _id: re2[0]._id
                                                                        },
                                                                            {
                                                                                $push: { listResource: listresources }
                                                                            });

                                                                        //change = "changed";
                                                                    }
                                                                } else if (info[i].modules[j].modname === "url") {
                                                                    const UrlExist = sayyes2.some(users => users.IDOfListUrl.toString() === info[i].modules[j].id.toString())
                                                                    if (!UrlExist) {
                                                                        //var listAssigns = coursesContent.listAssign;
                                                                        //console.log(deadlineExist)
                                                                        listurls = {
                                                                            IDOfListUrl: info[i].modules[j].id,
                                                                            name: info[i].modules[j].name,
                                                                            url: info[i].modules[j].url
                                                                        }

                                                                        await coursesContent.updateOne({
                                                                            _id: re2[0]._id
                                                                        },
                                                                            {
                                                                                $push: { listUrl: listurls }
                                                                            });

                                                                        //change = "changed";
                                                                    }
                                                                }
                                                                else if (info[i].modules[j].modname === "folder") {
                                                                    const FolderExist = sayyes3.some(users => users.IDOfListFolder.toString() === info[i].modules[j].id.toString())
                                                                    if (!FolderExist) {
                                                                        //var listAssigns = coursesContent.listAssign;
                                                                        //console.log(deadlineExist)
                                                                        listfolders = {
                                                                            IDOfListFolder: info[i].modules[j].id,
                                                                            name: info[i].modules[j].name,
                                                                            url: info[i].modules[j].url
                                                                        }

                                                                        await coursesContent.updateOne({
                                                                            _id: re2[0]._id
                                                                        },
                                                                            {
                                                                                $push: { listFolder: listfolders }
                                                                            });

                                                                        //change = "changed";
                                                                    }
                                                                }
                                                            }
                                                        }
                                                        await studyCourses.find({ idUserMoodle: IDUserMoodles })
                                                            .exec()
                                                            .then(re5 => {
                                                                if (re5.length >= 1) {
                                                                    for (var d = 0; d < re5[0].listCourses.length; d++) {
                                                                        if (element.IDCourses === re5[0].listCourses[d].IDCourses) {
                                                                            change.push(re5[0].listCourses[d].name);
                                                                        }
                                                                    }
                                                                }
                                                            });

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
        //console.log("change:",change, listUser);
        for (var x = 0; x < change.length; x++) {
            results = {
                "Title": "Nội dung môn học",
                "Data": change[x],
                "ListUser": []
            };
            //console.log("IDUSER:")
            function Init5() {
                return new Promise(async (resolve) => {
                    for (var j = 0; j < listUser[x].length; j++) {
                        //console.log(listUser[x][j].IDUser);
                        await Account.find({ _id: listUser[x][j].IDUser })
                            .exec()
                            .then(re2 => {
                                if (re2.length >= 1) {
                                    //console.log(re2[0].tokenNotifition)
                                    if (re2[0].tokenNotifition !== undefined) {
                                        //console.log("1")
                                        var temp2 = {
                                            "tokenNotifition": re2[0].tokenNotifition,
                                            "IDUser": listUser[x][j].IDUser
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
                    }
                    return resolve();


                })
            };
            await Init5().then();

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

            //console.log(results);
            //console.log(results.ListUser);
            // console.log(results.ListUser[0].tokenNotifition);
            // console.log(results.ListUser[0].IDUser);

            if (results.ListUser.length >= 1) {
                for (var z = 0; z < results.ListUser.length; z++) {
                    //console.log(results.ListUser[z].tokenNotifition);
                    //console.log(results.ListUser[z].IDUser);
                    const idusertemp = results.ListUser[z].IDUser;
                    sendPushNotification(results.ListUser[z].tokenNotifition, results.Title, results.Data);
                    await notification.find({ IDUser: idusertemp })
                        .exec()
                        .then(async (re3) => {
                            const currentDate = new Date();
                            const timestamp = currentDate.getTime();
                            if (re3.length >= 1) {
                                console.log("1");
                                //console.log(results.Title);
                                //console.log(results.Data);
                                notification.updateOne({
                                    _id: re3[0]._id
                                },
                                    {
                                        $push: { notification: { $each: [{ Title: results.Title, Data: results.Data, Date: timestamp }], $position: 0 } }
                                        //$push: { notification: { Title: results.Title, Data: results.Data, Date: timestamp } }
                                    }, (err, doc) => {
                                        if (err) {

                                        }
                                        else {

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
    }
    else {
        console.log("No change");
    }
};

module.exports.Check_Change_News_Unisersity = () => {
    async function autoScroll(page, finishTime) {
        await page.evaluate(async (finishTime) => {

            await new Promise((resolve, reject) => {
                var totalHeight = 0;
                var distance = 100;
                var timer = setInterval(() => {
                    var scrollHeight = document.body.scrollHeight;
                    window.scrollBy(0, distance);
                    totalHeight += distance;

                    if (totalHeight >= scrollHeight || new Date().getTime() > finishTime) {

                        clearInterval(timer);
                        resolve();
                    }

                }, 120);
            });
        }, finishTime);
    }

    async function getMainPageNews(url) {
        list_page = ['hcmut.edu.vn', 'hcmus.edu.vn', 'hcmussh.edu.vn', 'hcmiu.edu.vn', 'uit.edu.vn', 'uel.edu.vn', 'agu.edu.vn']
        let index = 0;
        for (var i = 0; i < list_page.length; i++) {
            if (url.includes(list_page[i])) {
                index = i;
                break;
            }
        }
        selector_url = "";
        selector_date = "";
        switch (index) {
            case 0:
                selector_url = ".style1_ex1"
                selector_date = ".date"
                {
                    const browser = await puppeteer.launch({
                        headless: true,
                        args: [
                            '--no-sandbox',
                            '--disable-setuid-sandbox',
                        ],
                        ignoreHTTPSErrors: true
                    });
                    const page = await browser.newPage()
                    await page.goto(url)
                    let articles = []
                    let urls = await page.evaluate(async ({ selector_url, selector_date }) => {
                        let items = await document.querySelectorAll(selector_url)
                        let links = []
                        for (var i = 0; i < items.length; ++i) {
                            let head = items[i].getAttribute("href")
                            links.push({
                                link: head,
                                selector_date: selector_date
                            });
                        };
                        return links
                    }, { selector_url, selector_date })
                    let pagePromise = (link, selector_date) => new Promise(async (resolve) => {
                        let dataObj = {}
                        let newPage = await browser.newPage()
                        await newPage.goto(link)
                        let date = await newPage.evaluate(({ selector_date }) => {
                            let element = document.querySelector(selector_date)
                            if (element) {
                                return element.innerText
                            }
                            return ''
                        }, { selector_date })
                        date = date.split(" ")[3] + " " + date.split(" ")[4].slice(0, -1)
                        dataObj['Title'] = await newPage.title()
                        dataObj['Link'] = await newPage.url()
                        dataObj['Date'] = await date
                        resolve(dataObj)
                        await newPage.close();
                    }, { selector_date })
                    for (var i = 0; i < urls.length; i++) {
                        let currentPageData = await pagePromise(urls[i].link, urls[i].selector_date);
                        articles.push(
                            {
                                Title: currentPageData.Title,
                                Link: currentPageData.Link,
                                Date: currentPageData.Date
                            });
                    }
                    await page.close()
                    await browser.close()
                    return articles
                }
            case 1:
                selector_url = ".mod-articles-category-title"
                selector_date = ".mod-articles-category-date"
                {
                    const browser = await puppeteer.launch({
                        headless: true,
                        args: [
                            '--no-sandbox',
                            '--disable-setuid-sandbox',
                        ],
                        ignoreHTTPSErrors: true
                    });
                    const page = await browser.newPage()
                    await page.goto(url)
                    const articles = await page.evaluate(({ selector_url, selector_date }) => {
                        let items = document.querySelectorAll(selector_url)
                        let dates = document.querySelectorAll(selector_date)
                        let links = []
                        for (var i = 0, j = 0; i < items.length, j < dates.length, i <= 15, j <= 15; i++, j++) {
                            title_post = items[i].innerText
                            url_post = "https://hcmus.edu.vn" + items[i].getAttribute("href");
                            date_post = dates[j].innerText.split(" ")[1].slice(0, -1)
                            links.push({
                                Title: title_post,
                                Link: url_post,
                                Date: date_post
                            })
                        }
                        return links;
                    }, { selector_url, selector_date })
                    await page.close()
                    await browser.close()
                    console.log(articles)
                    return articles;
                }
            case 2:
                selector_url = ".d-flex.flex-column.justify-content-between"
                {
                    const browser = await puppeteer.launch({
                        headless: true,
                        args: [
                            '--no-sandbox',
                            '--disable-setuid-sandbox',
                        ],
                        ignoreHTTPSErrors: true
                    });
                    const page = await browser.newPage()
                    await page.goto(url)
                    await page.waitForTimeout(2000)
                    const finishTime = new Date().getTime() + (10 * 1000)
                    await autoScroll(page, finishTime)
                    const articles = await page.evaluate(({ selector_url }) => {
                        let items = document.querySelectorAll(selector_url)
                        let links = []
                        for (var i = 0; i < items.length, i <= 10; i++) {
                            title_post = items[i].querySelector("div.text.mb-2 > a > h4").innerText
                            url_post = "https://hcmussh.edu.vn/" + items[i].querySelector("div.text.mb-2 > a").getAttribute("href")
                            date_post = items[i].querySelector("div:nth-child(3) > a").innerText.trimStart()
                            links.push({
                                Title: title_post,
                                Link: url_post,
                                Date: date_post
                            });
                        }
                        return links
                    }, { selector_url })
                    await page.close()
                    await browser.close()
                    console.log(articles)
                    return articles
                }
            case 3:
                selector_url = "div.item-content h3 a"
                selector_date = "div.date-block.main-color-2-bg.dark-div"
                {
                    const browser = await puppeteer.launch({
                        headless: true,
                        args: [
                            '--no-sandbox',
                            '--disable-setuid-sandbox',
                        ],
                        ignoreHTTPSErrors: true
                    });
                    const page = await browser.newPage()
                    await page.goto(url)
                    const articles = await page.evaluate(({ selector_url, selector_date }) => {
                        let items = document.querySelectorAll(selector_url)
                        let dates = document.querySelectorAll(selector_date)
                        let links = []
                        for (var i = 0, j = 0; i < items.length, j < dates.length; i++, j++) {
                            title_post = items[i].innerText
                            url_post = items[i].getAttribute("href")
                            date_post = dates[j].querySelector("div.month").innerText + " " + dates[j].querySelector("div.day").innerText
                            links.push({
                                Title: title_post,
                                Link: url_post,
                                Date: date_post
                            })
                        }
                        return links;
                    }, { selector_url, selector_date })
                    await page.close()
                    await browser.close()
                    return articles;
                }
            case 4:
                selector_url = "div.post-title h2 a";
                selector_date = ".post-date";
                {
                    const browser = await puppeteer.launch({
                        headless: true,
                        args: [
                            '--no-sandbox',
                            '--disable-setuid-sandbox',
                        ],
                        ignoreHTTPSErrors: true
                    });
                    const page = await browser.newPage();
                    await page.goto(url, { waitUntil: 'networkidle2' });
                    const articles = await page.evaluate(({ url, selector_url, selector_date }) => {
                        let items = document.querySelectorAll(selector_url);
                        let dates = document.querySelectorAll(selector_date);
                        let links = [];
                        for (var i = 0, j = 0; i < items.length, j < dates.length; i++, j++) {
                            title_post = items[i].innerText
                            url_post = items[i].getAttribute("href")
                            date_post = dates[j].innerText.trimStart()
                            links.push({
                                Title: title_post,
                                Link: url_post,
                                Date: date_post
                            });
                        }
                        return links;
                    }, { url, selector_url, selector_date });
                    await page.close();
                    await browser.close();
                    console.log(articles)
                    return articles;
                }
            case 5:
                selector_url = ".title_topicdisplay"
                selector_date = "h4 > span"
                {
                    const browser = await puppeteer.launch({
                        headless: true,
                        args: [
                            '--no-sandbox',
                            '--disable-setuid-sandbox',
                        ],
                        ignoreHTTPSErrors: true
                    });
                    const page = await browser.newPage()
                    await page.goto(url, { waitUntil: 'networkidle2' })
                    const articles = await page.evaluate(({ selector_url, selector_date }) => {
                        let items = document.querySelectorAll(selector_url)
                        let dates = document.querySelectorAll(selector_date)
                        let links = []
                        for (var i = 0, j = 0; i < items.length, j < dates.length; i++, j++) {
                            title_post = items[i].innerText
                            url_post = "https://www.uel.edu.vn/" + items[i].getAttribute("href")
                            date_post = dates[j].innerText.slice(0, -1).substring(1);
                            links.push({
                                Title: title_post,
                                Link: url_post,
                                Date: date_post
                            });
                        }
                        return links
                    }, { selector_url, selector_date })
                    await page.close()
                    await browser.close()
                    console.log(articles)
                    return articles;
                }
            case 6:
                selector_url = ".blog-details h4 a"
                selector_date = ".blog-meta"
                {
                    const browser = await puppeteer.launch({
                        headless: true,
                        args: [
                            '--no-sandbox',
                            '--disable-setuid-sandbox',
                        ],
                        ignoreHTTPSErrors: true
                    });
                    const page = await browser.newPage();
                    await page.goto(url, { waitUntil: 'networkidle2' });
                    const articles = await page.evaluate(({ url, selector_url, selector_date }) => {
                        let items = document.querySelectorAll(selector_url);
                        let dates = document.querySelectorAll(selector_date);
                        let links = [];
                        for (var i = 0, j = 0; i < items.length, j < dates.length; i++, j++) {
                            title_post = items[i].innerText
                            url_post = "https://www.agu.edu.vn/" + items[j].getAttribute("href")
                            date_post = dates[j].innerText
                            links.push({
                                Title: title_post,
                                Link: url_post,
                                Date: date_post
                            });
                        }
                        return links;
                    }, { url, selector_url, selector_date });
                    await page.close();
                    await browser.close();
                    //console.log(articles)
                    return articles;
                }
        }
    }


    try {
        newsUniversity.find({})
            .exec()
            .then(async (re1) => {
                if (re1.length >= 1) {
                    for (var i = 0; i < re1.length; i++) {
                        try {
                            let pool = await sql.connect(Config);
                            let facultys = await pool.request()
                                .input('Ma_Truong', sql.VarChar, re1[i].universityCode)
                                .query("select i.IDSignin, u.news from InfoSinhVien i, University_Faculty uf, University u where i.IDTruongKhoa = uf.ID and uf.MaTruong = u.MaTruong and u.MaTruong = @Ma_Truong")
                            if (facultys.recordsets[0]) {
                                //console.log(facultys.recordsets[0][0].news);
                                const temp = facultys.recordsets[0]
                                var a = await getMainPageNews(facultys.recordsets[0][0].news);
                                if (a !== undefined) {

                                    var results;
                                    // console.log(a[0].Link);
                                    // console.log(re1[i].news[0].Link);
                                    for (var m = 0; m < a.length; m++) {
                                        const fromuserleng = re1[i].news.some(el => el.Link === a[m].Link);


                                        //a[0].Link !== re1[i].news[0].Link
                                        if (!fromuserleng) {
                                            results = {
                                                "Title": "Tin Tức Trường",
                                                "Data": a[m].Title,
                                                "Url": a[m].Link,
                                                "ListUser": []
                                            };

                                            function Init() {
                                                return new Promise(async (resolve) => {
                                                    for (var j = 0; j < temp.length; j++) {
                                                        await Account.find({ _id: temp[j].IDSignin })
                                                            .exec()
                                                            .then(async(re2) => {
                                                                if (re2.length >= 1) {
                                                                    //console.log(re2[0].tokenNotifition)
                                                                    if (re2[0].tokenNotifition !== undefined) {
                                                                        //console.log("1")
                                                                        var temp2 = {
                                                                            "tokenNotifition": re2[0].tokenNotifition,
                                                                            "IDUser": temp[j].IDSignin
                                                                        }
                                                                        if (results.ListUser !== undefined) {
                                                                            results.ListUser.push(temp2);
                                                                        } else {
                                                                            results.ListUser = temp2;
                                                                        }
                                                                    }

                                                                    if (re2[0].parent !== undefined) {
                                                                        await Account.find({ _id: re2[0].parent })
                                                                            .exec()
                                                                            .then(re8 => {
                                                                                if (re8.length >= 1) {
                                                                                    if (re8[0].tokenNotifition !== undefined) {
                                                                                        //console.log("1")
                                                                                        if (results.ListUser !== undefined) {
                                                                                            var temp2 = {
                                                                                                "tokenNotifition": re8[0].tokenNotifition,
                                                                                                "IDUser": temp[j].IDSignin
                                                                                            }
                                                                                            results.ListUser.push(temp2);
                                                                                        } else {
                                                                                            results.ListUser = temp2;
                                                                                        }
                                                                                    }
                                                                                }
                                                                            })
                                                                            .catch(err => {

                                                                            })
                                                                    }
                                                                }
                                                                //console.log(results);
                                                            })
                                                            .catch(err => {

                                                            })
                                                    }
                                                    return resolve();
                                                })
                                            };
                                            await Init().then();
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
                                            // console.log(results);
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
                                                                        $push: { notification: { $each: [{ Title: results.Title, Data: results.Data, Date: timestamp, Url: results.Url }], $position: 0 } }
                                                                        //$push: { notification: { Title: results.Title, Data: results.Data, Date: timestamp } }
                                                                    }, (err, doc) => {
                                                                        if (err) {

                                                                        }
                                                                        else {

                                                                        }
                                                                    });
                                                            } else {
                                                                Notifications = new notification({
                                                                    _id: new mongoose.Types.ObjectId(),
                                                                    IDUser: idusertemp,
                                                                    notification: { Title: results.Title, Data: results.Data, Date: timestamp, Url: results.Url }
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

                                            newsUniversity.updateOne({
                                                _id: re1[i]._id
                                            },
                                                {
                                                    $set: { news: a }
                                                }, (err, doc) => {
                                                    if (err) {
                                                    
                                                    }
                                                    else {

                                                    }
                                                });
                                            break;
                                        }

                                    }
                                }
                            }

                        } catch (error) {
                        }
                    }
                }
            })
            .catch(err => {
            })

    } catch (error) {
    }
};

module.exports.check_Change_News_Faculty = () => {
    async function autoScroll(page, finishTime) {
        await page.evaluate(async (finishTime) => {

            await new Promise((resolve, reject) => {
                var totalHeight = 0;
                var distance = 100;
                var timer = setInterval(() => {
                    var scrollHeight = document.body.scrollHeight;
                    window.scrollBy(0, distance);
                    totalHeight += distance;

                    if (totalHeight >= scrollHeight || new Date().getTime() > finishTime) {

                        clearInterval(timer);
                        resolve();
                    }

                }, 120);
            });
        }, finishTime);
    }
    async function UI(url) {
        const browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
            ],
            ignoreHTTPSErrors: true
        });
        const page = await browser.newPage();
        await page.goto(url);
        selector_url = "";
        selector_date = "";
        if (url.includes("https")) {
            if (url.includes("bs.hcmiu")) { selector_url = ".news-list-header" }
            else { selector_url = ".entry-title a"; }
            if (url.includes("bt.hcmiu") || url.includes("it.hcmiu") || url.includes("math")) {
                selector_date = ".entry-date";
            }
            else if (url.includes("bm.hcmiu")) { selector_date = ".td-post-date" }
            else if (url.includes("iem.hcmiu") || (url.includes("ev.hcmiu"))) { selector_date = ".entry-date.published"; }
            else if (url.includes("bs.hcmiu")) { selector_date = ".new-date" }
        }
        else if (url.includes("see.hcmiu")) {
            selector_url = ".list-title a";
            selector_date = ".list-date.small";
        }
        else {
            selector_url = ".Title";
            selector_date = ".Date";
        }
        const articles = await page.evaluate(({ url, selector_url, selector_date }) => {
            let items = document.querySelectorAll(selector_url);
            let dates = document.querySelectorAll(selector_date);
            let links = [];

            for (var i = 0, j = 0; i < items.length, j < dates.length; i++, j++) {
                if (items[i].hasAttribute("href") == false || dates[j].innerText == null) {
                    i++;
                    j++;
                }
                title_post = items[i].innerText;
                url_post = "";
                if (items[i].getAttribute("href").includes("edu.vn") == false) {
                    if (url.includes("bs.hcmiu")) {
                        url_post = url;
                    }
                    else {
                        url_post = url + items[i].getAttribute("href");
                    }
                }
                else {
                    url_post = items[i].getAttribute("href");
                }
                date_post = ""
                if (url.includes("it.hcmiu") || url.includes("math.hcmiu")) {
                    date_post = dates[j].querySelector(".day").innerText + "/" + dates[j].querySelector(".month").innerText + "/" + dates[j].querySelector(".year").innerText;
                }
                else {
                    date_post = dates[j].innerText;
                }
                links.push({
                    Title: title_post,
                    Link: url_post,
                    Date: date_post
                });
            }
            return links;
        }, { url, selector_url, selector_date });
        await page.close();
        await browser.close();
        return articles;
    }
    async function UT(url) {
        var has_date = ['fme.hcmut', 'che.hcmut', 'fenr.hcmut', 'cse.hcmut', 'fas.hcmut', 'iut.hcmut'];
        var non_date = ['geopet.hcmut', 'dee.hcmut', 'sim.edu', 'fmt.hcmut', 'dte.hcmut', 'pfiev.hcmut', 'fce.hcmut'];

        data_ut = has_date.concat(non_date);
        var selector_url = "";
        var selector_date = "";
        var head_data = url.split(".")
        var search = "";
        var selector_title = "";
        if (url.includes("www")) {
            search = head_data[1] + "." + head_data[2];
        }
        else {
            search = head_data[0].substring(head_data[0].indexOf('//') + 2) + "." + head_data[1];
        }
        index = data_ut.indexOf(search);
        switch (index) {
            case 0:
                selector_url = ".entry-title a"
                selector_date = ".entry-date.published"
                break;
            case 1:
                selector_url = ".heading.mt-3 a"
                selector_date = ".meta.mb-3 div:nth-child(1)"
                break;
            case 2:
                selector_url = ".no-padding"
                break;
            case 3:
                selector_url = ".post-title.justify-content a"
                selector_date = ".post-date"
                break;
            case 4:
                selector_url = ".heading.mt-3 a"
                selector_date = ".meta.mb-3"
                break;
            case 5:
                selector_url = ".entry-title.td-module-title a"
                selector_date = ".td-post-date"
                break;
            case 6:
                selector_url = ".title_post a"
                selector_date = ".date"
                break;
            case 7:
                selector_url = ".button1"
                selector_date = ".ngaydang"
                break;
            case 8:
                selector_url = ".blogsection";
                selector_date = ".createdate"
                break;
            case 9:
                selector_url = ".latestnews";
                selector_date = ".createdate"
                break;
            case 10:
                selector_url = ".title";
                selector_date = ".date";
                selector_title = ".tin_title"
                break;
            case 11:
                selector_url = ".title";
                selector_date = ".date";
                selector_title = ".tin_title"
                break;
        }
        if (url.includes("geopet") || url.includes("dee") || url.includes("sim.edu") || url.includes("fmt.hcmut") ||
            url.includes("dte.hcmut") || url.includes("pfiev.hcmut")) {
            const browser = await puppeteer.launch({
                headless: true,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                ],
                ignoreHTTPSErrors: true
            });
            const page = await browser.newPage();
            await page.goto(url);
            let articles = [];
            let urls = await page.evaluate(async ({ selector_url, selector_date, selector_title, url }) => {
                let items = await document.querySelectorAll(selector_url);

                let links = [];
                for (var i = 0; i < items.length && i < 10; ++i) {
                    if (!items[i].hasAttribute("href")) { i++; }
                    let head = items[i].getAttribute("href");
                    if (head.includes("edu.vn") == false) {
                        let head_url = url.split(".");
                        head = "";
                        if (url.includes("sim.edu")) {
                            head = "http://www.sim.edu.vn/" + items[i].getAttribute("href");
                        }
                        else if (url.includes("dte.hcmut")) {
                            head = "http://www.dte.hcmut.edu.vn/dte/" + items[i].getAttribute("href");
                        }
                        else if (url.includes("pfiev")) {
                            head = "http://www.pfiev.hcmut.edu.vn/pfiev/" + items[i].getAttribute("href");
                        }
                        else {
                            head = head_url[0] + "." + head_url[1] + "." + head_url[2] + ".edu.vn" + items[i].getAttribute("href");
                        }
                    }
                    links.push({
                        link: head,
                        selector_date: selector_date,
                        selector_title: selector_title
                    });
                };
                return links;
            }, { selector_url, url, selector_date });
            for (var i = 0; i < urls.length; i++) {
                if (urls[i].link.includes("vnnull")) {
                    urls.splice(i, 1);
                    i--;
                }
            }
            let pagePromise = (link, selector_date, selector_title) => new Promise(async (resolve) => {
                let dataObj = {};
                let newPage = await browser.newPage();
                await newPage.goto(link);
                const date = await newPage.evaluate(({ selector_date }) => {
                    let element = document.querySelector(selector_date)
                    if (element) {
                        return element.innerText
                    }
                    return '';
                }, { selector_date })
                let title = "";
                if (link.includes("dte.hcmut") || link.includes("pfiev")) {
                    title = await newPage.evaluate(({ selector_title }) => {
                        let element = document.querySelector(selector_title)
                        if (element) {
                            return element.innerText
                        }
                        return '';
                    }, { selector_title })
                }
                else {
                    title = await newPage.title();
                }

                dataObj['Title'] = await title;
                dataObj['Link'] = await newPage.url();
                dataObj['Date'] = await date;
                resolve(dataObj);
                await newPage.close();
            }, { selector_date, selector_title });
            for (var i = 0; i < urls.length && i < 10; i++) {
                let currentPageData = await pagePromise(urls[i].link, urls[i].selector_date, selector_title);
                date = currentPageData.Date;
                if (url.includes("geopet")) { date = date.split(" ")[3] }
                articles.push(
                    {
                        Title: currentPageData.Title,
                        Link: currentPageData.Link,
                        Date: date
                    });
            }
            await page.close();
            await browser.close();

            return articles;
        }
        else if (url.includes("che.hcmut") || url.includes("fas.hcmut")) {
            const browser = await puppeteer.launch({
                headless: true,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                ],
                ignoreHTTPSErrors: true
            });
            const page = await browser.newPage();
            await page.goto(url);
            await page.waitForTimeout(2 * 1000);
            let finishTime = new Date().getTime() + (15 * 1000);
            await autoScroll(page, finishTime);
            const articles = await page.evaluate(async ({ url, selector_url, selector_date }) => {
                let items = document.querySelectorAll(selector_url);
                let dates = document.querySelectorAll(selector_date);
                let links = [];
                head_url = url.split("/")[0] + "/" + url.split("/")[1];
                for (var i = 0, j = 0; i < items.length, j < dates.length; i++, j++) {
                    title_post = items[i].innerText;
                    url_post = head_url + items[i].getAttribute("href");
                    date_post = dates[j].innerText;
                    if (date_post.includes("edu.vn") == false) {
                        date_post = date_post.split(" ")[0] + " " + date_post.split(" ")[1] + " " + date_post.split(" ")[2] + " " + date_post.split(" ")[3]
                    }
                    links.push({
                        Title: title_post,
                        Link: url_post,
                        Date: date_post
                    });
                }
                return links;
            }, { selector_url, selector_date, url });
            for (var i = 0; i < articles.length; i++) {
                if (articles[i].Title == "" || articles[i].Date == "") {
                    articles.splice(i, 1);
                    i--;
                }
            }
            await page.close();
            await browser.close();
            return articles;
        }
        else if (url.includes("fenr.hcmut")) {
            const browser = await puppeteer.launch({
                headless: true,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                ],
                ignoreHTTPSErrors: true
            });
            const page = await browser.newPage();
            await page.goto("http://fenr.hcmut.edu.vn/hl57/tin-tuc");
            const articles = await page.$eval("#wrapper > div > div > div > div > div.list_baiviet > ul",
                (ul, url) => {
                    let links = [];
                    for (let i = 0; i < ul.children.length; i++) {
                        links.push({
                            Title: ul.children[i].querySelector("a").innerText,
                            Link: "http://fenr.hcmut.edu.vn/" + ul.children[i].querySelector("a").getAttribute("href"),
                            Date: ul.children[i].querySelector("span").innerText
                        });
                    }
                    return links;
                }, url);
            await page.close();
            await browser.close();
            return articles;
        }
        else {
            const browser = await puppeteer.launch({
                headless: true,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                ],
                ignoreHTTPSErrors: true
            });
            const page = await browser.newPage();
            await page.goto(url);
            const articles = await page.evaluate(({ url, selector_url, selector_date }) => {
                let items = document.querySelectorAll(selector_url);
                let dates = document.querySelectorAll(selector_date);
                let links = [];
                for (var i = 0, j = 0; i < items.length, j < dates.length; i++, j++) {
                    var title_post = items[i].innerText;
                    var url_post = "";
                    if (items[i].getAttribute("href").includes("edu.vn") == false) {
                        url_post = url + items[i].getAttribute("href");
                    }
                    else {
                        url_post = items[i].getAttribute("href");
                    }

                    var date_post = ""
                    if (url.includes("cse.hcmut")) {
                        date_post = dates[j].querySelector("span.post-date-day").innerText + " - " + dates[j].querySelector("span.post-date-month").innerText
                    }
                    else {
                        date_post = dates[j].innerText;
                    }
                    links.push({
                        Title: title_post,
                        Link: url_post,
                        Date: date_post.slice(0, 18)
                    });
                }
                return links;
            }, { url, selector_url, selector_date });
            await page.close();
            await browser.close();
            return articles;
        }
    }
    async function US(url) {
        data = ['phys', 'geology', 'math', 'fit', 'fetel', 'mst', 'chemistry', 'fbb', 'environment', 'www.hcmus.edu.vn'];
        selector_url = "";
        selector_date = "";
        head_data = url.split(".")
        let index;
        for (var i = 0; i < data.length; i++) {
            if (url.includes(data[i])) {
                index = i;
                break;
            }
        }
        switch (index) {
            case 0:
                selector_url = ".blogpost.shadow-2.light-gray-bg.bordered header h2 a"
                selector_date = ".day"
                break;
            case 1:
                selector_url = ".sppb-articles-scroller-content a"
                selector_date = ".sppb-articles-scroller-meta-date-left"
                break;
            case 2:
                selector_url = ".mod-articles-category-title"
                selector_date = ".mod-articles-category-date"
                break;
            case 3:
                selector_url = ".post_title a"
                selector_date = ".day_month"
                break;
            case 4:
                selector_url = ".entry-title a"
                selector_date = ".entry-date.published"
                break;
            case 5:
                selector_url = ".show"
                selector_date = ".h5"
                break;
            case 6:
                selector_url = ".ns2-title"
                break
            case 7:
                selector_url = ".news_info";
                break;
            case 8:
                selector_url = ".name";
                break;
            case 9:
                selector_url = ".mod-articles-category-title";
                selector_date = ".mod-articles-category-date"
                break;
        }
        // const browser = await puppeteer.launch({
        //     ignoreHTTPSErrors: true
        // });
        const browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
            ],
            ignoreHTTPSErrors: true
        });

        const page = await browser.newPage();
        await page.goto(url);
        if (url.includes("mst")) {
            let articles = [];
            let urls = await page.evaluate(async ({ selector_url, url }) => {
                let items = await document.querySelectorAll(selector_url);

                let links = [];
                for (var i = 0; i < items.length; ++i) {
                    let head = items[i].getAttribute("href");
                    let head_url = url.split(".");
                    head = head_url[0] + "." + head_url[1] + "." + head_url[2] + ".edu.vn" + head;
                    links.push(head);
                };
                return links;
            }, { selector_url, url });
            let pagePromise = (link) => new Promise(async (resolve) => {
                let dataObj = {};
                let newPage = await browser.newPage();
                await newPage.goto(link);
                const elementTextContent = await newPage.evaluate(() => {
                    const element = document.querySelector('.h5')
                    if (element) {
                        return element.textContent
                    }
                    return '';
                })
                dataObj['Title'] = await newPage.title();
                dataObj['Link'] = await newPage.url();
                dataObj['Date'] = await elementTextContent;
                resolve(dataObj);
                await newPage.close();
            });
            for (link in urls) {
                let currentPageData = await pagePromise(urls[link]);
                articles.push(
                    {
                        Title: currentPageData.Title,
                        Link: currentPageData.Link,
                        Date: currentPageData.Date.split(" ")[3]
                    });
            }
            await page.close();
            await browser.close();
            return articles;
        }
        else if (url.includes("chemistry") || url.includes("environment") || url.includes("fbb")) {
            const articles = await page.evaluate(async ({ selector_url, url }) => {
                let items = await document.querySelectorAll(selector_url);

                let links = [];
                for (var i = 0; i < items.length; ++i) {
                    let title;
                    if (url.includes("environment") || url.includes("chemistry")) {
                        title = items[i].querySelector("a").innerText
                    }
                    else { title = items[i].querySelector("h3 a").innerText }
                    if (!items[i].querySelector("span") && (url.includes("environment") || url.includes("chemistry"))) { i++ }
                    let head;
                    if (url.includes("fbb")) {
                        head = items[i].querySelector("h3 a").getAttribute("href");
                    }
                    else { head = items[i].querySelector("a").getAttribute("href"); }
                    if (!head.includes("edu.vn")) {
                        let head_url = url.split(".");
                        head = head_url[0] + "." + head_url[1] + "." + head_url[2] + ".vn" + head;
                    }
                    let time;
                    if (url.includes("environment") || url.includes("chemistry")) { time = items[i].querySelector("span").innerText }
                    else { time = items[i].querySelector('div.news_dc div.date_news').innerText.slice(7, 17) }
                    if (url.includes("chemistry")) {
                        time = time.split(" ")[1]
                    }
                    else if (url.includes("environment")) {
                        time = time.split(" ")[0].slice(1);
                    }
                    links.push({
                        Title: title,
                        Link: head,
                        Date: time
                    });
                };
                return links;
            }, { selector_url, url });
            await page.close();
            await browser.close();
            return articles;
        }
        else {
            const articles = await page.evaluate(({ url, selector_url, selector_date }) => {
                let items = document.querySelectorAll(selector_url);
                let dates = document.querySelectorAll(selector_date);
                let links = [];
                for (var i = 0, j = 0; i < items.length, j < dates.length; i = i + 1, j = j + 1) {
                    var url_post = "";
                    url_post = items[i].getAttribute("href");
                    if (url_post.includes("edu.vn") == false) {

                        if (url.includes("geology")) {
                            url_post = url.split(".")[0] + "." + url.split(".")[1] + "." + url.split(".")[2] + ".vn" + url_post;
                        }
                        else if (url.includes("fit")) {
                            url_post = url.split(".")[0] + "." + url.split(".")[1] + "." + url.split(".")[2] + "." + url.split(".")[3] + ".vn/vn/" + url_post;
                        }
                        else {
                            url_post = url + url_post;
                        }
                    }

                    var title_post = "";
                    if (url.includes("geology")) {
                        title_post = items[i].querySelector("div > div.sppb-articles-scroller-date-left-content > div.sppb-addon-articles-scroller-title").innerText;
                    }
                    else {
                        title_post = items[i].innerText;
                    }

                    var date_post = "";
                    if (url.includes("phys")) {
                        date_post = (dates[j].innerText);
                        date_post = date_post.split(" ")[0];
                    }
                    else if (url.includes("geology")) {
                        date_post = dates[j].querySelector("span.sppb-articles-scroller-day").innerText + "/" + dates[j].querySelector("span.sppb-articles-scroller-month").innerText + "/2021";
                    }
                    else {
                        date_post = dates[j].innerText;
                    }
                    links.push({
                        Title: title_post,
                        Link: url_post,
                        Date: date_post
                    });
                }
                return links;
            }, { url, selector_url, selector_date });
            await page.close();
            await browser.close();
            return articles;
        }
    }
    async function USSH(url) {
        data = ['baochi', 'dulich', 'dongphuong', 'managementscience', 'luutru', 'nhh', 'lichsu', 'nhanhoc', 'fir', 'tamly',
            'lib', 'triethoc', 'khoavanhoc', 'vns', 'xhh', 'tttongiao', '']
        var selector_url = "";
        var selector_date = "";
        let index;
        for (var i = 0; i < data.length; i++) {
            if (url.includes(data[i])) {
                index = i;
                break;
            }
        }
        switch (index) {
            case 0:
                selector_url = ".title_topicdisplay"
                break;
            case 1:
                selector_url = ".title_topicdisplay"
                break;
            case 2:
                selector_url = ".title_topicdisplay"
                break;
            case 3:
                selector_url = ".title_tt a";
                selector_date = ".datetime";
                break;
            case 4:
                selector_url = ".title_topicdisplay"
                break;
            case 5:
                selector_url = ".title_topicdisplay"
                break;
            case 6:
                selector_url = ".title_topicdisplay"
                break;
            case 7:
                selector_url = ".title_topicdisplay"
                break;
            case 8:
                selector_url = ".title_topicdisplay"
                break;
            case 9:
                selector_url = ".title_topicdisplay"
                break;
            case 10:
                selector_url = ".title_topicdisplay"
                break;
            case 11:
                selector_url = ".text.p-4.d-block a"
                selector_date = ".meta.mb-3 div:nth-child(1) a";
                break;
            case 12:
                selector_url = ".entry-header h2 a";
                selector_date = ".create time";
                break;
            case 13:
                selector_url = ".page-header h2 a";
                selector_date = ".published.hasTooltip time";
                break;
            case 14:
                selector_url = ".title_topicdisplay"
                break;
            case 15:
                selector_url = ".title_topicdisplay"
                break;

        }
        if (index = 11) {
            const browser = await puppeteer.launch({
                headless: true,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                ],
                ignoreHTTPSErrors: true
            });
            const page = await browser.newPage();
            await page.goto(url, { waitUntil: 'networkidle2' });
            await page.waitForTimeout(2000);
            const finishTime = new Date().getTime() + (11 * 1000);
            await autoScroll(page, finishTime);
            const articles = await page.evaluate(({ selector_url, selector_date }) => {
                let items = document.querySelectorAll(selector_url);
                let dates = document.querySelectorAll(selector_date);
                let links = [];
                for (var i = 0, j = 0; i < items.length, j < dates.length; i += 2, j += 2) {
                    title_post = items[i].querySelector("h3").innerText;
                    url_post = "https://hcmussh.edu.vn" + items[i].getAttribute("href");
                    date_post = dates[j].innerText;
                    links.push({
                        Title: title_post,
                        Link: url_post,
                        Date: date_post
                    });
                }
                return links;
            }, { selector_url, selector_date });
            await page.close();
            await browser.close();
            return articles;
        }
        else if (index in [0, 1, 2, 4, 5, 6, 7, 8, 9, 10, 14, 15]) {
            const browser = await puppeteer.launch({
                headless: true,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                ],
                ignoreHTTPSErrors: true
            });
            const page = await browser.newPage();
            await page.goto(url);
            const articles = await page.evaluate(async ({ url, selector_url }) => {
                let items = document.querySelectorAll(selector_url);
                let links = [];
                for (var i = 0; i < items.length; i++) {

                    var title_post = items[i].innerText;
                    var url_post = "";
                    if (items[i].getAttribute("href").includes("edu.vn") == false) {
                        url_post = url.split("/")[0] + "/" + url.split("/")[1] + "/" + url.split("/")[2] + items[i].getAttribute("href");
                    }
                    else {
                        url_post = items[i].getAttribute("href");
                    }
                    links.push({
                        Title: title_post,
                        Link: url_post,
                        Date: ""
                    });
                }
                return links;
            }, { url, selector_url });
            await page.close();
            await browser.close();
            return articles;
        }
        else if (index == 3 || index == 12 || index == 13) {
            const browser = await puppeteer.launch({
                headless: true,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                ],
                ignoreHTTPSErrors: true
            });
            const page = await browser.newPage();
            await page.goto(url, { waitUntil: 'networkidle2' });
            const articles = await page.evaluate(({ url, selector_url, selector_date }) => {
                let items = document.querySelectorAll(selector_url);
                let dates = document.querySelectorAll(selector_date);
                let links = [];
                for (var i = 0, j = 0; i < items.length, j < dates.length; i++, j++) {
                    title_post = items[i].innerText;
                    url_post = url + items[i].getAttribute("href");
                    date_post = dates[j].innerText;
                    links.push({
                        Title: title_post,
                        Link: url_post,
                        Date: date_post
                    });
                }
                return links;
            }, { url, selector_url, selector_date });
            await page.close();
            await browser.close();
            return articles;
        }
    }

    async function UIT(url) {
        data = ['fit', 'httt', 'cs', 'se', 'ktmt', 'nc', 'ecommerce']
        var selector_url = "";
        var selector_date = "";
        let index;
        for (var i = 0; i < data.length; i++) {
            if (url.includes(data[i])) {
                index = i;
                break;
            }
        }
        switch (index) {
            case 0:
                selector_url = ".title a";
                selector_date = ".meta time"
                break;
            case 1:
                selector_url = ".thumb.thumb-lay-two.cat-3 h3 a";
                selector_date = ".thumb.thumb-lay-two.cat-3 span";
                break;
            case 2:
                selector_url = ".entry-header > a";
                selector_date = ".entry-date > a"
                break;
            case 3:
                selector_url = ".gn_static.gn_static_1 > span > a";
                selector_date = ".gn_static.gn_static_1";
                break;
            case 4:
                selector_url = ".list-title a";
                selector_date = ".list-date";
                break;
            case 5:
                selector_url = ".entry-title.td-module-title a";
                selector_date = ".entry-date.updated.td-module-date"
                break;
            case 6:
                selector_url = ".entry-title a";
                selector_date = ".entry-date.published"
                break;
        }
        if (index in [0, 1, 2, 3, 4, 5, 6]) {
            const browser = await puppeteer.launch({
                headless: true,
                args: [
                    '--no-sandbox',
                    '--disable-setuid-sandbox',
                ],
                ignoreHTTPSErrors: true
            });
            const page = await browser.newPage();
            await page.goto(url, { waitUntil: 'networkidle2' });
            const articles = await page.evaluate(({ url, selector_url, selector_date }) => {
                let items = document.querySelectorAll(selector_url);
                let dates = document.querySelectorAll(selector_date);
                let links = [];
                head = url.split(".")[0] + "." + url.split(".")[1] + "." + url.split(".")[2] + ".vn"
                for (var i = 0, j = 0; i < items.length, j < dates.length; i++, j++) {
                    title_post = "";
                    if (url.includes("cs")) {
                        title_post = items[i].querySelector("h1").innerText;
                    }
                    else {
                        title_post = items[i].innerText;
                    }
                    url_post = items[i].getAttribute("href");
                    if (url_post.includes("edu.vn") == false) {
                        url_post = head + url_post;
                    }
                    date_post = dates[j].innerText;
                    if (url.includes("se")) {
                        date_post = date_post.slice(-13).replace("\n", "");
                    }
                    links.push({
                        Title: title_post,
                        Link: head + url_post,
                        Date: date_post
                    });
                }
                return links;
            }, { url, selector_url, selector_date });
            for (var i = 0; i < articles.length; i++) {
                if (articles[i].Title == "") {
                    articles.splice(i, 1);
                    i--;
                }
            }
            await page.close();
            await browser.close();
            return articles;
        }

    }

    async function UEL(url) {
        data = ['//kt.uel', 'ktdn', 'fb.uel', 'ktkt', 'is', 'qtkd', 'law', 'lkt', 'maths']


        var selector_url = "";
        var selector_date = "";
        let index;
        for (var i = 0; i < data.length; i++) {
            if (url.includes(data[i])) {
                index = i;
                break;
            }
        }
        switch (index) {
            case 0:
                selector_url = "a.title_topicdisplay";
                selector_date = "h4 > span";
                break;
            case 1:
                selector_url = "a.title_topicdisplay";
                selector_date = "h4 > span";
                break;
            case 2:
                selector_url = ".title_topicdisplay";
                selector_date = "h4 > span"
                break;
            case 3:
                selector_url = ".title_topicdisplay";
                selector_date = "h4 > span"
                break;
            case 4:
                selector_url = ".title_topicdisplay";
                selector_date = "h4 > span"
                break;
            case 5:
                selector_url = ".title_topicdisplay";
                selector_date = "h4 > span"
                break;
            case 6:
                selector_url = ".title_topicdisplay";
                selector_date = "h4 > span"
                break;
            case 7:
                selector_url = ".title_topicdisplay";
                selector_date = "h4 > span"
                break;
            case 8:
                selector_url = ".title_topicdisplay";
                selector_date = "h4 > span"
                break;
        }
        const browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
            ],
            ignoreHTTPSErrors: true
        });
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'networkidle2' });
        const articles = await page.evaluate(({ url, selector_url, selector_date }) => {
            let items = document.querySelectorAll(selector_url);
            let dates = document.querySelectorAll(selector_date);
            let links = [];
            //head = url.split(".")[0]+ "." + url.split(".")[1] + "." +url.split(".")[2]+ ".vn"
            for (var i = 0, j = 0; i < items.length, j < dates.length; i++, j++) {
                title_post = items[i].innerText;
                url_post = url.split(".")[0] + "." + url.split(".")[1] + "." + url.split(".")[2] + ".vn" + items[i].getAttribute("href");
                date_post = dates[j].innerText;
                links.push({
                    Title: title_post,
                    Link: url_post,
                    Date: date_post
                });
            }
            return links;
        }, { url, selector_url, selector_date });

        await page.close();
        await browser.close();
        return articles;
    }

    async function MEDVNU(url) {
        var selector_url = ".news-title a";
        var selector_date = ".date";
        const browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
            ],
            ignoreHTTPSErrors: true
        });
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'networkidle2' });
        const articles = await page.evaluate(({ url, selector_url, selector_date }) => {
            let items = document.querySelectorAll(selector_url);
            let dates = document.querySelectorAll(selector_date);
            let links = [];
            for (var i = 0, j = 0; i < items.length, j < dates.length; i++, j++) {
                title_post = items[i].innerText;
                url_post = items[i].getAttribute("href");
                date_post = dates[j].innerText;
                links.push({
                    Title: title_post,
                    Link: url_post,
                    Date: date_post
                });
            }
            return links;
        }, { url, selector_url, selector_date });

        await page.close();
        await browser.close();
        return articles;
    }

    async function AGU(url) {
        data = ['agri', 'tech', 'fit', 'peda', 'feba', 'fpe', 'ffl', 'fac']


        var selector_url = "";
        var selector_date = "";
        let index;
        for (var i = 0; i < data.length; i++) {
            if (url.includes(data[i])) {
                index = i;
                break;
            }
        }
        switch (index) {
            case 0:
                selector_url = ".entry-title a";
                selector_date = ".entry-date.published";
                break;
            case 1:
                selector_url = ".title a";
                selector_date = ".meta_date";
                break;
            case 2:
                selector_url = ".post-entry-meta-title > h2 > a";
                selector_date = ".post-date"
                break;
            case 3:
                selector_url = ".blog-details > h4 > a";
                selector_date = ".blog-meta"
                break;
            case 4:
                selector_url = ".feba-postheader span a";
                selector_date = ".art-postdateicon"
                break;
            case 5:
                selector_url = ".node.node-article.node-promoted.node-teaser.clearfix  > header > h4 > a";
                selector_date = ".submitted > span:nth-child(2)"
                break;
            case 6:
                selector_url = "h2.title > a";
                selector_date = "span.submitted > span"
                break;
            case 7:
                selector_url = ".art-postheader a";
                selector_date = ".art-postheadericons.art-metadata-icons"
                break;
        }
        const browser = await puppeteer.launch({
            headless: true,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
            ],
            ignoreHTTPSErrors: true
        });
        const page = await browser.newPage();
        await page.goto(url, { waitUntil: 'networkidle2' });
        const articles = await page.evaluate(({ url, selector_url, selector_date }) => {
            let items = document.querySelectorAll(selector_url);
            let dates = document.querySelectorAll(selector_date);
            let links = [];
            head = url.split(".")[0] + "." + url.split(".")[1] + "." + url.split(".")[2] + ".vn"
            for (var i = 0, j = 0; i < items.length, j < dates.length; i++, j++) {
                title_post = "";
                if (url.includes("feba")) {
                    title_post = items[i].getAttribute("title");
                }
                else {
                    title_post = items[i].innerText;
                }
                url_post = items[i].getAttribute("href");
                if (title_post.includes("edu.vn") == false) {
                    url_post = head + url_post;
                }
                date_post = dates[j].innerText;
                if (url.includes("ffl")) {
                    date_post = date_post.slice(-18);
                }
                else if (url.includes("fac")) {
                    date_post = date_post.slice(0, -7);
                }
                links.push({
                    Title: title_post,
                    Link: url_post,
                    Date: date_post
                });
            }
            return links;
        }, { url, selector_url, selector_date });

        await page.close();
        await browser.close();
        return articles;
    }

    async function Crawl_Data(url) {
        let articles = [];
        if (url.includes("hcmut") || url.includes("www.sim.edu.vn")) {
            articles = await UT(url);
        }
        else if (url.includes("hcmus")) {
            articles = await US(url)
        }
        else if (url.includes("hcmussh") || url.includes("www.managescience.edu") || url.includes("www.khoahoc-ngonngu.edu.vn") || url.includes("vns.edu.vn")) {
            articles = await USSH(url);
        }
        else if (url.includes("hcmui")) {
            articles = await UI(url);
        }
        else if (url.includes("uit")) {
            articles = await UIT(url);
        }
        else if (url.includes("uel")) {
            articles = await UEL(url);
        }
        else if (url.includes("medvnu")) {
            articles = await MEDVNU(url);
        }
        else if (url.includes("agu.edu.vn")) {
            articles = await AGU(url);
        }
        //console.log(articles);
        return articles;

    }


    try {
        newsFaculty.find({})
            .exec()
            .then(async (re1) => {
                if (re1.length >= 1) {
                    for (var i = 0; i < re1.length; i++) {
                        try {
                            let pool = await sql.connect(Config);
                            let facultys = await pool.request()
                                .input('Ma_Truong', sql.VarChar, re1[i].universityCode)
                                .input('Ma_Khoa', sql.VarChar, re1[i].facultyCode)
                                .query("select i.IDSignin, uf.news from InfoSinhVien i, University_Faculty uf, University u where i.IDTruongKhoa = uf.ID and uf.MaTruong = u.MaTruong and u.MaTruong =@Ma_Truong and uf.MaKhoa =@Ma_Khoa")
                            if (facultys.recordsets[0]) {
                                //console.log(facultys.recordsets[0][0].news);
                                const temp = facultys.recordsets[0]
                                var a = await Crawl_Data(facultys.recordsets[0][0].news);
                                if (a !== undefined) {

                                    var results;
                                    for (var m = 0; m < a.length; m++) {
                                        const fromuserleng = re1[i].news.some(el => el.Link === a[m].Link);
                                        if (!fromuserleng) {
                                            results = {
                                                "Title": "Tin Tức Khoa",
                                                "Data": a[m].Title,
                                                "Url": a[m].Link,
                                                "ListUser": []
                                            };

                                            function Init() {
                                                return new Promise(async (resolve) => {
                                                    for (var j = 0; j < temp.length; j++) {
                                                        await Account.find({ _id: temp[j].IDSignin })
                                                            .exec()
                                                            .then(async (re2) => {
                                                                if (re2.length >= 1) {
                                                                    //console.log(re2[0].tokenNotifition)
                                                                    if (re2[0].tokenNotifition !== undefined) {
                                                                        //console.log("1")
                                                                        if (results.ListUser !== undefined) {
                                                                            var temp2 = {
                                                                                "tokenNotifition": re2[0].tokenNotifition,
                                                                                "IDUser": temp[j].IDSignin
                                                                            }
                                                                            results.ListUser.push(temp2);
                                                                        } else {
                                                                            results.ListUser = temp2;
                                                                        }
                                                                    }
                                                                    if (re2[0].parent !== undefined) {
                                                                        await Account.find({ _id: re2[0].parent })
                                                                            .exec()
                                                                            .then(re8 => {
                                                                                if (re8.length >= 1) {
                                                                                    if (re8[0].tokenNotifition !== undefined) {
                                                                                        //console.log("1")
                                                                                        if (results.ListUser !== undefined) {
                                                                                            var temp2 = {
                                                                                                "tokenNotifition": re8[0].tokenNotifition,
                                                                                                "IDUser": temp[j].IDSignin
                                                                                            }
                                                                                            results.ListUser.push(temp2);
                                                                                        } else {
                                                                                            results.ListUser = temp2;
                                                                                        }
                                                                                    }
                                                                                }
                                                                            })
                                                                            .catch(err => {

                                                                            })
                                                                    }
                                                                }
                                                                //console.log(results);
                                                            })
                                                            .catch(err => {

                                                            })
                                                    }
                                                    return resolve();
                                                })
                                            };
                                            await Init().then();
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
                                            //console.log(results);
                                            if (results.ListUser.length >= 1) {
                                                for (var z = 0; z < results.ListUser.length; z++) {
                                                    //console.log("send",results.ListUser[z]);
                                                    sendPushNotification(results.ListUser[z].tokenNotifition, results.Title, results.Data);
                                                    const idusertemp = results.ListUser[z].IDUser;
                                                    notification.find({ IDUser: idusertemp })
                                                        .exec()
                                                        .then(re3 => {
                                                            const currentDate = new Date();
                                                            const timestamp = currentDate.getTime();
                                                            if (re3.length >= 1) {

                                                                notification.updateOne({
                                                                    _id: re3[0]._id
                                                                },
                                                                    {
                                                                        $push: { notification: { $each: [{ Title: results.Title, Data: results.Data, Date: timestamp, Url: results.Url }], $position: 0 } }
                                                                        //$push: { notification: { Title: results.Title, Data: results.Data, Date: timestamp } }
                                                                    }, (err, doc) => {
                                                                        if (err) {

                                                                        }
                                                                        else {

                                                                        }
                                                                    });
                                                            } else {
                                                                Notifications = new notification({
                                                                    _id: new mongoose.Types.ObjectId(),
                                                                    IDUser: idusertemp,
                                                                    notification: { Title: results.Title, Data: results.Data, Date: timestamp, Url: results.Url }
                                                                });

                                                                Notifications.save()
                                                                    .then(() => {
                                                                        console.log("save");
                                                                    })
                                                                    .catch(err => {

                                                                    })
                                                            }
                                                        })
                                                        .catch(err => {

                                                        })
                                                }

                                            }

                                            newsFaculty.updateOne({
                                                _id: re1[i]._id
                                            },
                                                {
                                                    $set: { news: a }
                                                }, (err, doc) => {
                                                    if (err) {

                                                    }
                                                    else {

                                                    }
                                                });
                                            break;
                                        }
                                    }
                                }
                            }

                        } catch (error) {
                        }
                    }
                }
            })
            .catch(err => {
            })
        res.status(200).json();
    } catch (error) {
    }
};