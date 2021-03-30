const { Timestamp } = require("bson");
const { date } = require("joi");
const  mongoose=require("mongoose");
const { schema } = require("./account");

const calendarSchema=mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    AccountId:{
        type: String,
        unique: true,
        require:true},
    Title:{type: String, require:true},
    Date: {type: Date, require:true},
    StartHour:{type: Timestamp, require:true},
    EndHour: {type: Timestamp, require:true},
    Decription: {type: String, require:true},
    Color: {type: String, require:true},
    Notification: {type: String, require:true}
    
})