const studyCourses = require("../models/studyCourses")
const studyCurrentCourses = require("../models/currentStudyCourses");

exports.Get_ListCoures = (req, res, next)=>{
    studyCourses.find({ idUser: req.userData._id})
    .exec()
    .then(re=>{
        if(re.length>=1){
            res.status(200).json(re[0].listCourses)
        }
        else{
            res.status(500).json({
                message: "No Courses student studied"
            })
        }
    })
    .catch(err=>{
        res.status(500).json({
            error: err
        })
    })
}

exports.Get_CurrentCourses =(req,res,next)=>{
    studyCurrentCourses.find({ idUser: req.userData._id})
    .exec()
    .then(re=>{
        if(re.length>=1){
            res.status(200).json(re[0].listCourses)
        }
        else{
            res.status(500).json({
                message: "No Courses student studied"
            })
        }
    })
    .catch(err=>{
        res.status(500).json({
            error: err
        })
    })
}