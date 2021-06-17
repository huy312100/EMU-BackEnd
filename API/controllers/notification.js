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