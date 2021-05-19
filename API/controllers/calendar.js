const mongoose = require("mongoose");
const calendar = require("../models/calendar");

exports.Get_Calendar_This_Month = (req, res, next) => {
    //listcalendar
    //calendar.find({$and:[{"IDUser": req.userData._id},{Date:{$macth:[{year:req.body.year},{month:req.body.month}]}}]})
    calendar.find({ $and: [{ IDUser: req.userData._id }, { "Date.year": req.body.year }, { "Date.month": req.body.month }] })
        .exec()
        .then(re1 => {
            if (re1.length >= 1) {
                res.status(200).json(re1);
            } else {
                res.status(500).json({ message: "No calendar this month" });
            }
        })
        .catch(err => {
            res.status(500).json({ error: err });
        })
};

exports.Post_Calendar = (req, res, next) => {
    calendar.find({ $and: [{ IDUser: req.userData._id }, { Title: req.body.Title }, { "Date.year": req.body.year }, { "Date.month": req.body.month }, { "Date.day": req.body.day }] })
        .exec()
        .then(re1 => {
            if (re1.length >= 1) {
                res.status(200).json({ message: "your tilte is exist" });
            } else {

                Calendars = new calendar({
                    _id: new mongoose.Types.ObjectId(),
                    IDUser: req.userData._id,
                    Title: req.body.Title,
                    TypeEvent: req.body.TypeEvent,
                    Date: { year: req.body.year, month: req.body.month, day: req.body.day },
                    StartHour: req.body.StartHour,
                    EndHour: req.body.EndHour,
                    Decription: { text: req.body.desciptionText, underLine: req.body.UnderLine, italic: req.body.Italic, bold: req.body.Bold, url: req.body.url },
                    Color: req.body.Color,
                    Notification: req.body.Notification
                });
                console.log("1");
                Calendars.save()
                    .then(() => {
                        res.status(200).json({ message: "Calendar is created" });
                    }).catch((err) => {
                        console.log(err);
                        res.status(500).json({ error: err })
                    });
            }
        })
        .catch(err => {
            res.status(500).json({ error: err })
        });
};

exports.Edit_Calendar = async(req, res, next) => {

    var newcalendar = new calendar({
        Title: req.body.newTitle,
        TypeEvent: req.body.TypeEvent,
        Date: { year: req.body.newyear, month: req.body.newmonth, day: req.body.newday },
        StartHour: req.body.StartHour,
        EndHour: req.body.EndHour,
        Decription: { text: req.body.desciptionText, underLine: req.body.UnderLine, italic: req.body.Italic, bold: req.body.Bold, url: req.body.url },
        Color: req.body.Color,
        Notification: req.body.Notification
    })
    //console.log(newcalendar);
    await calendar.findOneAndUpdate({ $and: [{ IDUser: req.userData._id }, { Title: req.body.Title }, { "Date.year": req.body.year }, { "Date.month": req.body.month }, { "Date.day": req.body.day }] },
    newcalendar, { upsert: false }, function (err, doc) {
            if (err) {
                res.status(500).json({ error: err });
            } else {
                if(doc){
                    res.status(200).json({ message: "your calendar is updated" });
                }else{
                    res.status(500).json({message:"No your calendar in db"});
                }
            }
        }).catch(err => {
            res.status(500).json({ error: err })
        })
    ///console.log(doc);
};

exports.Delete_Calendar = async (req, res, next) => {
    //const IDCalendar;
    await calendar.findOneAndRemove({ $and: [{ IDUser: req.userData._id }, { Title: req.body.Title }, { "Date.year": req.body.year }, { "Date.month": req.body.month }, { "Date.day": req.body.day }] })
        .exec()
        .then(re1 => {
            res.status(200).json({ message: "your Calendar is removed" });

        })
        .catch(err => {
            res.status(500).json({ error: err })
        });
};

