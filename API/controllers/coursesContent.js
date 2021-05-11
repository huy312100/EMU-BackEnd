const mongoose = require("mongoose");
var request = require("request");
const coursesContent = require("../models/coursesContent");
const customweb = require("../models/customweb");

exports.Get_One_Courses = async(req, res, next) => {
    var urlofCustweb;
    var tokenofCustomweb;
    
    await customweb.find({ $and: [{ idUser: req.userData._id }, { typeUrl: "Moodle" }] })
        .exec()
        .then((re2) => {
            if (re2.length >= 1) {
                urlofCustweb = re2[0].url;
                tokenofCustomweb = re2[0].token;
            }
        });

    //console.log(urlofCustweb);
    coursesContent.find({ $and: [{ idUser: req.userData._id }, { IDCourses: req.body.IDCourses }] })
        .exec()
        .then((re1) => {
            //console.log(re1)
            if (re1.length >= 1) { 
                res.status(200).json(re1[0]);
            }
            else {
                
                var CoursesContent = new coursesContent({
                    _id: new mongoose.Types.ObjectId(),
                    idUser: req.userData._id,
                    IDCourses: req.body.IDCourses,
                    listAssign: []
                });
                
                
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
                                        listAssigns = {
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
                            .then(()=>{
                                res.status(200).json(CoursesContent);
                            })
                            .catch(err=>{
                                res.status(500).json({error: err});
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