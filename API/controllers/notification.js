const mongoose = require("mongoose");

const notification = require("../models/notification");


exports.Get_Notification = (req, res, next) => {
    notification.find({ IDUser: req.userData._id})
    .exec()
    .then(re1=>{
        if(re1.length>=1){
            res.status(200).json(re1[0].notification);
        }
        else{
            res.status(500).json({message:"Dont have notification"});
        }
    })
    .catch(err => {
        //console.log(err);
        res.status(500).json({
            error: err
        });
    });
}

exports.Edit_State = (req, res, next) => {
    notification.find({ IDUser: req.userData._id,"notification._id":req.body.IDNotification})
    .exec()
    .then(re1=>{
        if(re1.length>=1){
            notification.updateOne({
                "IDUser": req.userData._id,
                "notification._id": req.body.IDNotification
            },
                {
                    $set: { "notification.$.State": "true" }
                }
                , (err, doc) => {
                    if (err) {
                        //console.log("err", err);
                       res.status(500).json({error:err})
                    } else {
                        //console.log("doc:", doc);
                        res.status(200).json({message:"Updated State"});
                    }
                });
            
        }
        else{
            res.status(500).json({message:"Dont have notification"});
        }
    })
    .catch(err => {
        //console.log(err);
        res.status(500).json({
            error: err
        });
    });
}