const mongoose = require("mongoose");

const notifi = mongoose.Schema({
    Title: {type: String, require:true},
    Data: {type: String, require:true},
    Date: {type: String, require:true},
    State: {type: Boolean, default:false}
});

const notificationSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    IDUser: {type:mongoose.Schema.Types.ObjectId},
    notification: {type: [notifi], default:[]}
});

module.exports= mongoose.model('Notification',notificationSchema);