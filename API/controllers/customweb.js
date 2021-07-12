const mongoose = require("mongoose");
const crypto = require("crypto");
var request = require("request");

const CustomWeb = require("../models/customweb");
const studyCourses = require("../models/studyCourses");
const currentStudyCourses = require("../models/currentStudyCourses");
const Courses = require("../models/courses");

const { resolve } = require("path");
const customweb = require("../models/customweb");
const resizedIV = Buffer.allocUnsafe(16);
const iv = crypto
    .createHash("sha256")
    .update(process.env.Cipheriv)
    .digest();

iv.copy(resizedIV);

const keyPass = crypto
    .createHash("sha256")
    .update(process.env.Key_SHA256_Crypo)
    .digest();

exports.Get_Website_Custom = (req, res, next) => {
    CustomWeb.find({ idUser: req.userData._id })
        .exec()
        .then(user => {
            if (user === null) {
                res.status(404).json({ message: "No Account from custom" });
            }
            else {
                // var decipherUsername = crypto.createDecipheriv("aes256", keyPass, resizedIV);
                // var decodeUsername =decipherUsername.update(user[0].username,"hex","utf-8");
                // decodeUsername+=decipherUsername.final("utf-8");

                // var decipherPassword = crypto.createDecipheriv("aes256", keyPass, resizedIV);
                // var decodePassword =decipherPassword.update(user[0].password,"hex","utf-8");
                // decodePassword+=decipherPassword.final("utf-8");

                // console.log(decodeUsername);
                // console.log(decodePassword);

                res.status(200).json(user);
            }
        })
        .catch(err => {
            res.status(500).json({ error: err });
        });
};

exports.Get_NameWeb_Is_Link =(req,res,next)=>{
    customweb.find({ idUser: req.userData._id })
    .exec()
    .then(re1=>{
        if(re1.length>=1){
            var result =[];
            for(var i=0; i<re1.length;i++){
                var temp ={
                    "Type":re1[i].typeUrl,
                    "Url":re1[i].url
                };
                result.push(temp)
            }
            //console.log(result);
            res.status(200).json(result);
        }
        else{
            res.status(500).json({message:"You dont custom web"})
        }
    })
    .catch(err=>{
        res.status(500).json({ error: err})
    })
}

exports.Post_Account_Custom = async (req, res, next) => {
    CustomWeb.find({ $and: [{ typeUrl: req.body.typeUrl }, { idUser: req.userData._id }] })
        .exec()
        .then(user => {
            if (user.length >= 1) {
                return res.status(409).json({
                    message: "account exists"
                });
            } else {
                //web custom is moodle
                if (req.body.typeUrl == "Moodle") {
                    //encode username
                    var cipherUsername = crypto.createCipheriv("aes256", keyPass, resizedIV);
                    var encodeUsername = cipherUsername.update(req.body.username, "utf-8", "hex");
                    encodeUsername += cipherUsername.final('hex');
                    //encode password
                    var cipherPassword = crypto.createCipheriv("aes256", keyPass, resizedIV);
                    var encodePassword = cipherPassword.update(req.body.password, "utf-8", "hex");
                    encodePassword += cipherPassword.final("hex");

                    //get token moodle => authentified
                    var Urllogin = req.body.url.split(".edu.vn")[0];
                    Urllogin += ".edu.vn/login/token.php";

                    var UrlFetch = Urllogin + "?service=moodle_mobile_app&username=" + req.body.username + "&password=" + req.body.password;

                    var options = {
                        "method": "GET",
                        "url": UrlFetch,
                        "headers": {
                        },
                        form: {

                        }
                    };
                    request(options, function (error, response) {
                        if (error) {
                            res.status(500).json({ message: error })
                        } else {
                            if (response.statusCode === 200) {
                                var infouser = JSON.parse(response.body)
                                if (infouser.token !== undefined) {
                                    var urlFindUserID = req.body.url.split(".edu.vn")[0] + ".edu.vn/webservice/rest/server.php?wstoken=" + infouser.token + "&wsfunction=core_user_get_users_by_field&field=username&values[0]=" + req.body.username + "&moodlewsrestformat=json";
                                    //console.log(urlFindUserID);
                                    var optionsFindUserID = {
                                        "method": "GET",
                                        "url": urlFindUserID,
                                        "headers": {
                                        }
                                    };

                                    request(optionsFindUserID, async function (error, response) {
                                        if (error) {
                                            res.status(500).json({ message: error });
                                        }
                                        else {
                                            if (response.statusCode === 200) {
                                                var infoIDUser = JSON.parse(response.body);
                                                if (infoIDUser[0].id != undefined) {

                                                    const customweb = new CustomWeb({
                                                        _id: new mongoose.Types.ObjectId(),
                                                        idUser: req.userData._id,
                                                        typeUrl: req.body.typeUrl,
                                                        url: req.body.url,
                                                        username: req.body.username,
                                                        //password: encodePassword,
                                                        token: infouser.token,
                                                        IDUserMoodle: infoIDUser[0].id
                                                    });

                                                    const studycourses = new studyCourses({
                                                        _id: new mongoose.Types.ObjectId(),
                                                        idUser: req.userData._id,
                                                        idUserMoodle: infoIDUser[0].id,
                                                        listCourses: []
                                                    });

                                                    var UrlFindListCourses = req.body.url.split(".edu.vn")[0] + ".edu.vn/webservice/rest/server.php?moodlewsrestformat=json&wsfunction=core_enrol_get_users_courses&wstoken=" + infouser.token + "&userid=" + infoIDUser[0].id;

                                                    var optionsFindListCourses = {
                                                        "method": "GET",
                                                        "url": UrlFindListCourses,
                                                        "headers": {
                                                        }
                                                    };

                                                    function Init() {
                                                        return new Promise(resolve => {

                                                            request(optionsFindListCourses, function (error, response) {
                                                                if (error) {
                                                                    res.status(500).json({ message: error });
                                                                }
                                                                else {
                                                                    if (response.statusCode === 200) {
                                                                        //var results = [].concat(studyCourses.listCourses)
                                                                        var infoListCourses = JSON.parse(response.body);
                                                                        for (var k = 0; k < infoListCourses.length; k++) {

                                                                            var listCoursess = studyCourses.listCourses;
                                                                            listCoursess =
                                                                            {
                                                                                IDCourses: infoListCourses[k].id,
                                                                                name: infoListCourses[k].fullname,
                                                                                category: infoListCourses[k].category,
                                                                                startDate: infoListCourses[k].startdate
                                                                            };
                                                                            if (studycourses.listCourses !== undefined) {
                                                                                studycourses.listCourses.push(listCoursess);
                                                                            }
                                                                            else {
                                                                                studycourses.listCourses = listCoursess;
                                                                            }

                                                                        }
                                                                    }
                                                                }
                                                                return resolve();
                                                            })
                                                        })

                                                    }
                                                    Init().then(async () => {
                                                        //console.log(studycourses.listCourses);
                                                        const StudyCurrentCourses = new currentStudyCourses({
                                                            _id: new mongoose.Types.ObjectId(),
                                                            idUser: req.userData._id,
                                                            idUserMoodle: infoIDUser[0].id,
                                                            listCourses: []
                                                        });

                                                        for (var l = 0; l < studycourses.listCourses.length; l++) {
                                                            if (studycourses.listCourses[l].category === studycourses.listCourses[0].category) {
                                                                var ListCurrentCourses = StudyCurrentCourses.listCourses;
                                                                ListCurrentCourses = {
                                                                    IDCourses: studycourses.listCourses[l].IDCourses,
                                                                    name: studycourses.listCourses[l].name,
                                                                    startDate: studycourses.listCourses[l].startDate
                                                                };
                                                                if (StudyCurrentCourses.listCourses !== undefined) {
                                                                    StudyCurrentCourses.listCourses.push(ListCurrentCourses);
                                                                } else {
                                                                    StudyCurrentCourses.listCourses = ListCurrentCourses;
                                                                }
                                                            } else {
                                                                break;
                                                            }
                                                        }

                                                        //console.log(StudyCurrentCourses.listCourses[0].IDCourses);

                                                        var urlcourses = req.body.url.split(".edu.vn")[0] + ".edu.vn";

                                                        var couresess = []
                                                        function SaveCoures() {
                                                            StudyCurrentCourses.listCourses.forEach(element => {
                                                                Courses.find({ $and: [{ IDCourses: element.IDCourses }, { url: urlcourses }] })
                                                                    .exec()
                                                                    .then(async re => {
                                                                        if (re.length >= 1) {
                                                                            // re[0].listStudent.push({IDUser:req.userData._id,IDUserMoodle:infoIDUser[0].id});
                                                                            // re.save()
                                                                            // .then()
                                                                            // .catch(err => {
                                                                            //     res.status(500).json({
                                                                            //         error: err
                                                                            //     });
                                                                            // });
                                                                            await Courses.updateOne({
                                                                                _id: re[0]._id
                                                                                //$and: [{ IDCourses: element.IDCourses }, { url: urlcourses }]
                                                                            },
                                                                                {
                                                                                    $push: { listStudent: { IDUser: req.userData._id, IDUserMoodle: infoIDUser[0].id } }
                                                                                });
                                                                        } else {
                                                                            if (element.IDCourses !== undefined) {
                                                                                const courses = new Courses({
                                                                                    _id: new mongoose.Types.ObjectId(),
                                                                                    IDCourses: element.IDCourses,
                                                                                    url: urlcourses,
                                                                                    IDUser: req.userData._id,
                                                                                    IDUserInstead: infoIDUser[0].id,
                                                                                    listStudent: { IDUser: req.userData._id, IDUserMoodle: infoIDUser[0].id }
                                                                                });
                                                                                courses.save()
                                                                                    .then()
                                                                                    .catch(err => {
                                                                                        res.status(500).json({
                                                                                            error: err
                                                                                        });
                                                                                    });
                                                                                //couresess.push(courses)
                                                                                //console.log(courses)
                                                                            }
                                                                        }
                                                                    })
                                                                    .catch(err => {
                                                                        res.status(500).json({
                                                                            error: err
                                                                        });
                                                                    })
                                                            });
                                                            console.log(couresess);
                                                        }

                                                        function saveCustomWeb() {
                                                            //console.log(customweb);
                                                            customweb.save()
                                                                .then()
                                                                .catch(err => {
                                                                    res.status(500).json({
                                                                        error: err
                                                                    });
                                                                });
                                                        };

                                                        function saveStudyCoures() {
                                                            //console.log(studyCourses);

                                                            studycourses.save()
                                                                .then()
                                                                .catch(err => {
                                                                    res.status(500).json({
                                                                        error: err
                                                                    });
                                                                });
                                                        };

                                                        function saveCurrentCoures() {
                                                            //console.log( StudyCurrentCourses);
                                                            StudyCurrentCourses.save()
                                                                .then()
                                                                .catch(err => {
                                                                    res.status(500).json({
                                                                        error: err
                                                                    });
                                                                });
                                                        };

                                                        Promise.all([saveCustomWeb(), saveStudyCoures(), saveCurrentCoures(), SaveCoures()])
                                                            .then(([re1, re2, re3, re4]) => {
                                                                res.status(201).json({
                                                                    message: "account Moodle custom created"
                                                                });
                                                            })
                                                    })//catch of init()
                                                } else {
                                                    res.status(500).json({ message: "Invalid fill your information" });
                                                }
                                            }
                                        }
                                    });

                                } else {
                                    res.status(500).json({ message: "Invalid fill your information" });
                                }
                            } else {
                                res.status(500).json({ message: "Have error custom" });
                            }
                        }

                    });
                }
                //web custom is portal and save to DB not login equal username and password
                else if (req.body.typeUrl == "Portal") {
                    const customweb = new CustomWeb({
                        _id: new mongoose.Types.ObjectId(),
                        idUser: req.userData._id,
                        typeUrl: req.body.typeUrl,
                        url: req.body.url,
                    });

                    //save into database
                    customweb.save()
                        .then(results => {
                            res.status(201).json({
                                message: "account portal custom created"
                            });
                        })
                        .catch(err => {
                            res.status(500).json({
                                error: err
                            });
                        });
                }
                else if (req.body.typeUrl == "Classroom") {

                    res.status(201).json({
                        message: "account custom created (Classroom) dont insert to DB"
                    });
                }
                else if (req.body.typeUrl == "Trello") {
                    res.status(201).json({
                        message: "account custom created (Trello) dont insert to DB"
                    });
                }
                else if (req.body.typeUrl == "Slack") {
                    res.status(201).json({
                        message: "account custom created (Slack) dont insert to DB"
                    });
                } else {
                    return res.status(409).json({
                        message: "account doesnt custom"
                    });
                };

            }
        })
        .catch(err => {
            //console.log(err);
            res.status(500).json({
                error: err
            });
        });
};



exports.Delete_Website = (req, res, next) => {

    function RemovethreeCollection() {
        return new Promise(async(resolve) => {
            await CustomWeb.find({ $and: [{ typeUrl: req.body.typeUrl }, { idUser: req.userData._id }] })
                .exec()
                .then(async(re1) => {
                    if (re1.length >= 1) {
                        //1. remove studycoures
                        var IDUserMooodleFind=re1[0].IDUserMoodle;
                        var urlcoures = re1[0].url.split(".edu.vn")[0] + ".edu.vn";
                        studyCourses.remove({ $and: [{ idUser: req.userData._id }, { idUserMoodle: IDUserMooodleFind }] })
                            .exec()
                            .then()
                            .catch(err => {
                                //console.log(err);
                                res.status(500).json({
                                    error: err
                                });
                            });

                        //2. remove courses
                        await currentStudyCourses.find({ $and: [{ idUser: req.userData._id }, { idUserMoodle: IDUserMooodleFind }] })
                            .exec()
                            .then((re2) => {
                                if (re2.length >= 1) {
 
                                     re2[0].listCourses.forEach(( element) => {
                                        
                                        Courses.find({ $and: [{ url: urlcoures }, { IDCourses: element.IDCourses }] })
                                            .exec()
                                            .then(async (re3) => {
                                                if (re3.length >= 1) {
                                                    var re3IDUser = re3[0].IDUser;

                                                    if (re3[0].listStudent.length === 1) {
                                                        //co 1 SV trong DS mon hoc
                                                        Courses.remove({ $and: [{ url: urlcoures }, { IDCourses: element.IDCourses }] })
                                                            .exec()
                                                            .then()
                                                            .catch(err => {
                                                                //console.log(err);
                                                                res.status(500).json({
                                                                    error: err
                                                                });
                                                            });
                                                    } else {
                                                        //co nhieu hon 1 SV
                                                        //xem thu SV do dang phai la user dai dien khong
                                                        
                                                        if (re3IDUser.toString() === req.userData._id.toString()) {
                                                            var IDUserUpdate2 = re3[0].listStudent[1].IDUser;
                                                            var IDMoodleUpdate2 = re3[0].listStudent[1].IDUserMoodle;
                                                            await Courses.updateOne({
                                                                _id: re3[0]._id
                                                            },
                                                                {
                                                                    $pull: { listStudent: { IDUser: req.userData._id, IDUserMoodle: IDUserMooodleFind } }
                                                                });
                                                           
                                                            await Courses.updateOne({
                                                                _id: re3[0]._id
                                                            },
                                                                {
                                                                    $set: { IDUser: IDUserUpdate2, IDUserInstead: IDMoodleUpdate2 }
                                                                });
                                                        } else {
                                                            
                                                            await Courses.updateOne({
                                                                _id: re3[0]._id
                                                            },
                                                                {
                                                                    $pull: { listStudent: { IDUser: req.userData._id, IDUserMoodle: IDUserMooodleFind } }
                                                                });
                                                        }

                                                    }
                                                }
                                                else {
                                                    res.status(500).json({
                                                        message: "No account need deleted"
                                                    });
                                                }
                                            })
                                            .catch(err => {
                                                //console.log(err);
                                                res.status(500).json({
                                                    error: err
                                                });
                                            });

                                    });


                                }
                                else {
                                    //khong co danh sach mon hoc hien tai
                                    res.status(500).json({
                                        message: "No account need deleted"
                                    });
                                }
                            })
                            .catch(err => {
                                //console.log(err);
                                res.status(500).json({
                                    message: "No account need deleted"
                                });
                            });
                        
                        //3. remove current coures
                        currentStudyCourses.remove({ $and: [{ idUser: req.userData._id }, { idUserMoodle: IDUserMooodleFind }] })
                        .exec()
                        .then()
                        .catch(err => {
                            //console.log(err);
                            res.status(500).json({
                                error: err
                            });
                        });
                    } else {

                    }
                })
                .catch(err => {
                    console.log(err);
                    res.status(500).json({
                        error: err
                    });
                });
            resolve("done");
        })

    };

    
    RemovethreeCollection().then((value)=>{
        if(value==="done"){
            
            CustomWeb.remove({ $and: [{ typeUrl: req.body.typeUrl }, { idUser: req.userData._id }] })
        .exec()
        .then(re=>{
            res.status(200).json({
                message:"account custom deleted"
            })
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
        }

    })
    .catch(err=>{
        res.status(500).json({
            error:err
        })
    })
};