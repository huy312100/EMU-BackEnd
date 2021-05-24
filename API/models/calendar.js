const  mongoose=require("mongoose");

const descriptionCalendar = mongoose.Schema({
    text: {type:String, require:true},
    underLine: {type: Boolean, default:false},
    italic: {type: Boolean, default:false},
    bold: {type: Boolean, default:false},
    url: {type:String, default:""}
});

const Guest = mongoose.Schema({
    Email: {type:String, require:true},
    name: {type:String, require:true}

})

const calendarSchema=mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    IDUser: {type:mongoose.Schema.Types.ObjectId, ref:'Account'},
    TypeCalendar:{type: String, default:"custom"},
    Title:{type: String, require:true},
    TypeEvent :{type:String,require:true},
    Date: {year:{type:String, require:true},month:{type:String, require:true},day:{type:String, require:true}},
    StartHour:{type: String, require:true},
    EndHour: {type: String, require:true},
    Decription: {type: descriptionCalendar, default:[]},
    ListGuest:{ type: [Guest], default:[]},
    Color: {type: String, require:true},
    Notification: {type: String, default:""}    
});

module.exports= mongoose.model('Calendar',calendarSchema);