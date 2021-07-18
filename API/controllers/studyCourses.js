const studyCourses = require("../models/studyCourses")
const studyCurrentCourses = require("../models/currentStudyCourses");
const customweb = require("../models/customweb");
const Account = require("../models/account");
const listCourses = require("../models/listcourses");
var request = require("request");
const { init } = require("../models/studyCourses");

exports.Get_ListCoures = async (req, res, next) => {
    var urlofCustweb;
    var tokenofCustomweb;
    var iduserMoodle;
    await customweb.find({ $and: [{ idUser: req.userData._id }, { typeUrl: "Moodle" }] })
        .exec()
        .then((re1) => {
            if (re1.length >= 1) {
                urlofCustweb = re1[0].url;
                tokenofCustomweb = re1[0].token;
                iduserMoodle = re1[0].IDUserMoodle;
            }
            else{
                res.status(500).json({message:"No account custoweb"});
            }
        }).catch(err => {
            res.status(500).json({ error: err });
        })
    console.log(urlofCustweb);
    studyCourses.find({ $and: [{ idUser: req.userData._id }, { idUserMoodle: iduserMoodle }] })
        .exec()
        .then(async (re2) => {
            if (re2.length >= 1) {
                var listcours = re2[0].listCourses;
                //console.log(listcours);
                var result = [];
                if (parseInt(listcours.length / 5) < parseInt(req.body.page)) {
                    return res.status(500).json({ message: "Page not Found" });
                }
                var temp = req.body.page;
                for (var j = (temp * 5); j < (temp * 5) + 5; j++) {
                    if (listcours[j] === undefined) {
                        break;
                    }
                    if (re2[0].listCourses[j].teacher.length >=1) {
                        //res.status(200).json(listcours);
                        //console.log(re2[0].listCourses[j].teacher);
                        result.push(re2[0].listCourses[j]);
                    } else {
                        var url = urlofCustweb.split(".edu.vn")[0] + ".edu.vn/webservice/rest/server.php?wstoken=" + tokenofCustomweb + "&wsfunction=core_enrol_get_enrolled_users&moodlewsrestformat=json&courseid=" + listcours[j].IDCourses;
                        //console.log(url);

                        var options = {
                            "method": "GET",
                            "url": url,
                            "headers": {
                            }
                        };
                        function Init() {
                            return new Promise(async resolve => {
                                await request(options, async function (error, response) {
                                    if (error) {
                                        res.status(500).json({ message: error })
                                    } else {
                                        if (response.statusCode === 200) {

                                            var infocoures = JSON.parse(response.body)
                                            var listteacher = [];
                                            for (var i = 0; i < infocoures.length; i++) {
                                                if (infocoures[i].roles[0].roleid === 1 || infocoures[i].roles[0].roleid === 3) {
                                                    //console.log(infocoures[i].fullname);
                                                    // if (oneCoures.teacher.length >= 1) {
                                                    //     await listteacher.push(infocoures[i].fullname);
                                                    // } else {
                                                    //     listteacher = infocoures[i].fullname;
                                                    // }

                                                    await listteacher.push(infocoures[i].fullname);
                                                }
                                            }
                                            var listsamle = studyCourses.listCourses;
                                            listsamle = {
                                                IDCourses: listcours[j].IDCourses,
                                                name: re2[0].listCourses[j].name,
                                                category: re2[0].listCourses[j].category,
                                                startDate: re2[0].listCourses[j].startDate,
                                                teacher: listteacher

                                            }
                                            //console.log(listsamle);
                                            await result.push(listsamle);
                                            //console.log(listcours[j].IDCourses);
                                            await studyCourses.updateOne({
                                                $and: [{ idUser: req.userData._id }, { idUserMoodle: iduserMoodle }],
                                                "listCourses.IDCourses": listcours[j].IDCourses
                                            },
                                                {
                                                    $push: { "listCourses.$.teacher":listteacher} 
                                                });
                                            return resolve(listsamle)
                                        }
                                    }
                                })
                            })
                        }
                        await Init((value)=>{
                            //console.log(value);
                            //result.push(value);
                        })
                        //console.log(listteacher);
                    }
                }
                //console.log(result);
                return res.status(200).json(result);
            } else {
                res.status(500).json({ message: "you dont have customweb service" });
            }
        })
        .catch(err => {
            res.status(500).json({ error: err });
        })
}

exports.Get_ListCoures_For_Parents = async (req, res, next) => {
    var urlofCustweb;
    var tokenofCustomweb;
    var iduserMoodle;
    var IDUserStudentFromParent;
    await Account.find({parent:req.userData._id})
    .exec()
    .then(user=>{
        if(user.length>=1){
            IDUserStudentFromParent = user[0]._id;
        }
        else{
            res.status(500).json({message: "No Account Your Student"});
        }
    })

    await customweb.find({ $and: [{ idUser: IDUserStudentFromParent }, { typeUrl: "Moodle" }] })
        .exec()
        .then((re1) => {
            if (re1.length >= 1) {
                urlofCustweb = re1[0].url;
                tokenofCustomweb = re1[0].token;
                iduserMoodle = re1[0].IDUserMoodle;
            }
            else{
                res.status(500).json({message:"No account custoweb"});
            }
        }).catch(err => {
            res.status(500).json({ error: err });
        })
    console.log(urlofCustweb);
    studyCourses.find({ $and: [{ idUser: IDUserStudentFromParent }, { idUserMoodle: iduserMoodle }] })
        .exec()
        .then(async (re2) => {
            if (re2.length >= 1) {
                var listcours = re2[0].listCourses;
                //console.log(listcours);
                var result = [];
                if (parseInt(listcours.length / 5) < parseInt(req.body.page)) {
                    return res.status(500).json({ message: "Page not Found" });
                }
                var temp = req.body.page;
                for (var j = (temp * 5); j < (temp * 5) + 5; j++) {
                    if (listcours[j] === undefined) {
                        break;
                    }
                    if (re2[0].listCourses[j].teacher.length >=1) {
                        //res.status(200).json(listcours);
                        //console.log(re2[0].listCourses[j].teacher);
                        result.push(re2[0].listCourses[j]);
                    } else {
                        var url = urlofCustweb.split(".edu.vn")[0] + ".edu.vn/webservice/rest/server.php?wstoken=" + tokenofCustomweb + "&wsfunction=core_enrol_get_enrolled_users&moodlewsrestformat=json&courseid=" + listcours[j].IDCourses;
                        //console.log(url);

                        var options = {
                            "method": "GET",
                            "url": url,
                            "headers": {
                            }
                        };
                        function Init() {
                            return new Promise(async resolve => {
                                await request(options, async function (error, response) {
                                    if (error) {
                                        res.status(500).json({ message: error })
                                    } else {
                                        if (response.statusCode === 200) {

                                            var infocoures = JSON.parse(response.body)
                                            var listteacher = [];
                                            for (var i = 0; i < infocoures.length; i++) {
                                                if (infocoures[i].roles[0].roleid === 1 || infocoures[i].roles[0].roleid === 3) {
                                                    //console.log(infocoures[i].fullname);
                                                    // if (oneCoures.teacher.length >= 1) {
                                                    //     await listteacher.push(infocoures[i].fullname);
                                                    // } else {
                                                    //     listteacher = infocoures[i].fullname;
                                                    // }

                                                    await listteacher.push(infocoures[i].fullname);
                                                }
                                            }
                                            var listsamle = studyCourses.listCourses;
                                            listsamle = {
                                                IDCourses: listcours[j].IDCourses,
                                                name: re2[0].listCourses[j].name,
                                                category: re2[0].listCourses[j].category,
                                                startDate: re2[0].listCourses[j].startDate,
                                                teacher: listteacher

                                            }
                                            //console.log(listsamle);
                                            await result.push(listsamle);
                                            //console.log(listcours[j].IDCourses);
                                            await studyCourses.updateOne({
                                                $and: [{ idUser: IDUserStudentFromParent }, { idUserMoodle: iduserMoodle }],
                                                "listCourses.IDCourses": listcours[j].IDCourses
                                            },
                                                {
                                                    $push: { "listCourses.$.teacher":listteacher} 
                                                });
                                            return resolve(listsamle)
                                        }
                                    }
                                })
                            })
                        }
                        await Init((value)=>{
                            //console.log(value);
                            //result.push(value);
                        })
                        //console.log(listteacher);
                    }
                }
                //console.log(result);
                return res.status(200).json(result);
            } else {
                res.status(500).json({ message: "you dont have customweb service" });
            }
        })
        .catch(err => {
            res.status(500).json({ error: err });
        })
}

exports.Get_CurrentCourses = async (req, res, next) => {
    var urlofCustweb;
    var tokenofCustomweb;
    var iduserMoodle;
    await customweb.find({ $and: [{ idUser: req.userData._id }, { typeUrl: "Moodle" }] })
        .exec()
        .then((re1) => {
            if (re1.length >= 1) {
                urlofCustweb = re1[0].url;
                tokenofCustomweb = re1[0].token;
                iduserMoodle = re1[0].IDUserMoodle;
            }
            else{
                res.status(500).json({message:"No account custoweb"});
            }
        })
        .catch(err=>{
            res.status(500).json({error:err});
        })
    console.log(urlofCustweb);
    studyCurrentCourses.find({ $and: [{ idUser: req.userData._id }, { idUserMoodle: iduserMoodle }] })
        .exec()
        .then(async (re2) => {
            if (re2.length >= 1) {
                var listcours = re2[0].listCourses;
                //console.log(listcours);
                var result = [];
                if (parseInt(listcours.length / 5) < parseInt(req.body.page)) {
                    return res.status(500).json({ message: "Page not Found" });
                }
                for (var j = 0; j < listcours.length; j++) {
                    if (listcours[j] === undefined) {
                        break;
                    }
                    if (re2[0].listCourses[j].teacher.length >=1) {
                        //res.status(200).json(listcours);
                        //console.log(re2[0].listCourses[j].teacher);
                        result.push(re2[0].listCourses[j]);
                    } else {
                        var url = urlofCustweb.split(".edu.vn")[0] + ".edu.vn/webservice/rest/server.php?wstoken=" + tokenofCustomweb + "&wsfunction=core_enrol_get_enrolled_users&moodlewsrestformat=json&courseid=" + listcours[j].IDCourses;
                        //console.log(url);

                        var options = {
                            "method": "GET",
                            "url": url,
                            "headers": {
                            }
                        };
                        function Init() {
                            return new Promise(async resolve => {
                                await request(options, async function (error, response) {
                                    if (error) {
                                        res.status(500).json({ message: error })
                                    } else {
                                        if (response.statusCode === 200) {

                                            var infocoures = JSON.parse(response.body)
                                            var listteacher = [];
                                            for (var i = 0; i < infocoures.length; i++) {
                                                if (infocoures[i].roles[0].roleid === 1 || infocoures[i].roles[0].roleid === 3) {
                                                    //console.log(infocoures[i].fullname);
                                                    // if (oneCoures.teacher.length >= 1) {
                                                    //     await listteacher.push(infocoures[i].fullname);
                                                    // } else {
                                                    //     listteacher = infocoures[i].fullname;
                                                    // }

                                                    await listteacher.push(infocoures[i].fullname);
                                                }
                                            }
                                            var listsamle = studyCurrentCourses.listCourses;
                                            listsamle = {
                                                IDCourses: listcours[j].IDCourses,
                                                name: re2[0].listCourses[j].name,
                                                startDate: re2[0].listCourses[j].startDate,
                                                teacher: listteacher

                                            }
                                            //console.log(listsamle);
                                            await result.push(listsamle);
                                            //console.log(listcours[j].IDCourses);
                                            await studyCurrentCourses.updateOne({
                                                $and: [{ idUser: req.userData._id }, { idUserMoodle: iduserMoodle }],
                                                "listCourses.IDCourses": listcours[j].IDCourses
                                            },
                                                {
                                                    $push: { "listCourses.$.teacher":listteacher} 
                                                });
                                            return resolve(listsamle)
                                        }
                                    }
                                })
                            })
                        }
                        await Init((value)=>{
                            //console.log(value);
                            //result.push(value);
                        })
                        //console.log(listteacher);
                    }
                }
                //console.log(result);
                return res.status(200).json(result);
            } else {
                res.status(500).json({ message: "you dont have customweb service" });
            }
        })
        .catch(err => {
            res.status(500).json({ error: err });
        })
}

exports.Get_CurrentCourses_For_Parent = async (req, res, next) => {
    var urlofCustweb;
    var tokenofCustomweb;
    var iduserMoodle;

    var IDUserStudentFromParent;
    await Account.find({parent:req.userData._id})
    .exec()
    .then(user=>{
        if(user.length>=1){
            IDUserStudentFromParent = user[0]._id;
        }
        else{
            res.status(500).json({message: "No Account Your Student"});
        }
    })

    await customweb.find({ $and: [{ idUser: IDUserStudentFromParent }, { typeUrl: "Moodle" }] })
        .exec()
        .then((re1) => {
            if (re1.length >= 1) {
                urlofCustweb = re1[0].url;
                tokenofCustomweb = re1[0].token;
                iduserMoodle = re1[0].IDUserMoodle;
            }
            else{
                res.status(500).json({message:"No account custoweb"});
            }
        })
        .catch(err=>{
            res.status(500).json({error:err});
        })
    console.log(urlofCustweb);
    studyCurrentCourses.find({ $and: [{ idUser: IDUserStudentFromParent }, { idUserMoodle: iduserMoodle }] })
        .exec()
        .then(async (re2) => {
            if (re2.length >= 1) {
                var listcours = re2[0].listCourses;
                //console.log(listcours);
                var result = [];
                if (parseInt(listcours.length / 5) < parseInt(req.body.page)) {
                    return res.status(500).json({ message: "Page not Found" });
                }
                for (var j = 0; j < listcours.length; j++) {
                    if (listcours[j] === undefined) {
                        break;
                    }
                    if (re2[0].listCourses[j].teacher.length >=1) {
                        //res.status(200).json(listcours);
                        //console.log(re2[0].listCourses[j].teacher);
                        result.push(re2[0].listCourses[j]);
                    } else {
                        var url = urlofCustweb.split(".edu.vn")[0] + ".edu.vn/webservice/rest/server.php?wstoken=" + tokenofCustomweb + "&wsfunction=core_enrol_get_enrolled_users&moodlewsrestformat=json&courseid=" + listcours[j].IDCourses;
                        //console.log(url);

                        var options = {
                            "method": "GET",
                            "url": url,
                            "headers": {
                            }
                        };
                        function Init() {
                            return new Promise(async resolve => {
                                await request(options, async function (error, response) {
                                    if (error) {
                                        res.status(500).json({ message: error })
                                    } else {
                                        if (response.statusCode === 200) {

                                            var infocoures = JSON.parse(response.body)
                                            var listteacher = [];
                                            for (var i = 0; i < infocoures.length; i++) {
                                                if (infocoures[i].roles[0].roleid === 1 || infocoures[i].roles[0].roleid === 3) {
                                                    //console.log(infocoures[i].fullname);
                                                    // if (oneCoures.teacher.length >= 1) {
                                                    //     await listteacher.push(infocoures[i].fullname);
                                                    // } else {
                                                    //     listteacher = infocoures[i].fullname;
                                                    // }

                                                    await listteacher.push(infocoures[i].fullname);
                                                }
                                            }
                                            var listsamle = studyCurrentCourses.listCourses;
                                            listsamle = {
                                                IDCourses: listcours[j].IDCourses,
                                                name: re2[0].listCourses[j].name,
                                                startDate: re2[0].listCourses[j].startDate,
                                                teacher: listteacher

                                            }
                                            //console.log(listsamle);
                                            await result.push(listsamle);
                                            //console.log(listcours[j].IDCourses);
                                            await studyCurrentCourses.updateOne({
                                                $and: [{ idUser: IDUserStudentFromParent }, { idUserMoodle: iduserMoodle }],
                                                "listCourses.IDCourses": listcours[j].IDCourses
                                            },
                                                {
                                                    $push: { "listCourses.$.teacher":listteacher} 
                                                });
                                            return resolve(listsamle)
                                        }
                                    }
                                })
                            })
                        }
                        await Init((value)=>{
                            //console.log(value);
                            //result.push(value);
                        })
                        //console.log(listteacher);
                    }
                }
                //console.log(result);
                return res.status(200).json(result);
            } else {
                res.status(500).json({ message: "you dont have customweb service" });
            }
        })
        .catch(err => {
            res.status(500).json({ error: err });
        })
}