const studyCourses = require("../models/studyCourses")
const studyCurrentCourses = require("../models/currentStudyCourses");
const customweb = require("../models/customweb");
const listCourses = require("../models/listcourses");
var request = require("request");

exports.Get_ListCoures = async(req, res, next) => {
    var urlofCustweb;
    var tokenofCustomweb;
    await customweb.find({ $and: [{ idUser: req.userData._id }, { typeUrl: "Moodle" }] })
        .exec()
        .then((re1) => {
            if (re1.length >= 1) {
                urlofCustweb = re1[0].url;
                tokenofCustomweb = re1[0].token;
            }
        })
    await studyCourses.find({ idUser: req.userData._id })
        .exec()
        .then(async (re) => {
            if (re.length >= 1) {
                var list = re[0].listCourses;
                var result = [];
                async function init() {
                    console.log(parseInt(list.length/5));
                    if(parseInt(list.length/5)<parseInt(req.body.page))
                    {
                        return res.status(500).json({message:"Page not Found"});
                    }
                    var temp =req.body.page;
                    for (var j = (temp*5); j < (temp*5)+5; j++) {
                        if(list[j] ===undefined){
                            break;
                        }
                        var url = urlofCustweb.split(".edu.vn")[0] + ".edu.vn/webservice/rest/server.php?wstoken=" + tokenofCustomweb + "&wsfunction=core_enrol_get_enrolled_users&moodlewsrestformat=json&courseid=" + list[j].IDCourses;
                        //console.log(url);
                        var options = {
                            "method": "GET",
                            "url": url,
                            "headers": {
                            }
                        };

                        var oneCoures = new listCourses(
                            list[j].IDCourses,
                            list[j].name,
                            "",
                            list[j].startDate,
                            []
                        );
                        function Init2() {
                            return new Promise(async (resolve) => {
                                await request(options, async function (error, response) {
                                    if (error) {
                                        res.status(500).json({ message: error })
                                    } else {
                                        if (response.statusCode === 200) {

                                            var infocoures = JSON.parse(response.body)
                                            var listteacher = [];
                                            async function Init3() {
                                                
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
                                            }
                                            await Init3();
                                            oneCoures.teacher = listteacher;
                                            //console.log(listteacher);
                                            
                                        }
                                        
                                    }
                                    //console.log(oneCoures.teacher);
                                    resolve(oneCoures);
                                });
                            })
                        }

                        await Init2().then((va) => {
                            //console.log(va);
                            result.push(va);
                        })
                    };
                }
                await init();
                res.status(200).json(result);
            }
            else {
                res.status(500).json({
                    message: "No Courses student studied"
                })
            }
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        })
}

exports.Get_CurrentCourses = async (req, res, next) => {
    var urlofCustweb;
    var tokenofCustomweb;
    await customweb.find({ $and: [{ idUser: req.userData._id }, { typeUrl: "Moodle" }] })
        .exec()
        .then((re1) => {
            if (re1.length >= 1) {
                urlofCustweb = re1[0].url;
                tokenofCustomweb = re1[0].token;
            }
        })
    await studyCurrentCourses.find({ idUser: req.userData._id })
        .exec()
        .then(async (re) => {
            if (re.length >= 1) {
                var list = re[0].listCourses;
                var result = [];
                async function init() {
                    for (var j = 0; j < list.length; j++) {
                        var url = urlofCustweb.split(".edu.vn")[0] + ".edu.vn/webservice/rest/server.php?wstoken=" + tokenofCustomweb + "&wsfunction=core_enrol_get_enrolled_users&moodlewsrestformat=json&courseid=" + list[j].IDCourses;
                        //console.log(url);
                        var options = {
                            "method": "GET",
                            "url": url,
                            "headers": {
                            }
                        };

                        var oneCoures = new listCourses(
                            list[j].IDCourses,
                            list[j].name,
                            "",
                            list[j].startDate,
                            []
                        );
                        function Init2() {
                            return new Promise(async (resolve) => {
                                await request(options, async function (error, response) {
                                    if (error) {
                                        res.status(500).json({ message: error })
                                    } else {
                                        if (response.statusCode === 200) {

                                            var infocoures = JSON.parse(response.body)
                                            var listteacher = [];
                                            async function Init3() {
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
                                            }
                                            await Init3();
                                            oneCoures.teacher = listteacher;
                                            //console.log(listteacher);
                                            
                                        }
                                        
                                    }
                                    //console.log(oneCoures.teacher);
                                    resolve(oneCoures);
                                });
                            })
                        }

                        await Init2().then((va) => {
                            //console.log(va);
                            result.push(va);
                        })
                    };
                }
                await init();
                res.status(200).json(result);
            }
            else {
                res.status(500).json({
                    message: "No Courses student studied"
                })
            }
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        })
}