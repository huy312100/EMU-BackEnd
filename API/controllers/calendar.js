const mongoose= require("mongoose");
const calendar = require("../models/calendar");

exports.Get_Calendar_This_Month = (req, res, next)=>{
    calendar.find({$and:[{IDUser: req.userData._id},{Date:{month:req.body.month,year:req.body.year}}]})
    .exec()
    .then(re1=>{
        if(re1.length>=1){
            re1.status(200).json(re1);
        }else{
            res.status(500).json({message: "No calendar this month"});
        }
    })
    .catch(err=>{
        res.status(500).json({error:err});
    })
};

exports.Post_Calendar = (req, res,next)=>{
    calendar.find({$and:[{IDUser: req.userData._id},{Title:req.body.Title},{Date:{month:req.body.month,year:req.body.year, day:req.body.day}}]})
    .exec()
    .then(re1=>{
        if(re1.length>=1){
            res.status(200).json({message:"your tilte is exist"});
        }else{
            Calendar = new calendar({
                idUser: req.userData._id,
                Title: req.body.Title,
                TypeEvent:req.body.TypeEvent,
                Date:{year:req.body.year,month: req.body.month, day:req.body.day},
                StartHour:req.body.StartHour,
                EndHour:req.body.EndHour,
                Decription: {text:req.body.desciptionText,underLine:req.body.UnderLine,italic:req.body.Italic,bold:req.body.Bold, url: req.body.url},
                Color:req.body.Color,
                Notification:req.body.Notification
            });
        
            Calendar.save()
            .exec()
            .then(()=>{
                res.status(200).json({message:"Calendar is created"});
            }).catch(err=>{
                res.status(500).json({error: err})
            });
        }
    })
    .catch(err=>{
        res.status(500).json({error: err})
    });
};

exports.Delete_Calendar = async (req, res, next)=>{
    //const IDCalendar;
    await calendar.findOneAndRemove({$and:[{IDUser: req.userData._id},{Title:req.body.Title},{Date:req.body.Date}]})
    .exec()
    .then(re1=>{
        if(re1.length>=1){
            res.status(200).json({message:"your Calendar is removed"});
        }else{
            res.status(500).json({message:"your calendar is not exist"});
        }
    })
    .catch(err=>{
        res.status(500).json({error: err})
    });
};

