const mongoose = require("mongoose");

const ChatContext = mongoose.Schema({
    from:{type:String, require:true},
    text:{type:String, require:true},
    time:{type:String, require:true},
    state:{type:Boolean, default:false}
})

const chatSchema = mongoose.Schema({
    __id: mongoose.Schema.Types.ObjectId,
    OwnUser:  {type:String, require:true},
    idChatRoom: {type:mongoose.Schema.Types.ObjectId, ref:'Chat'},
    awaittext:{type:[ChatContext], default:[]}
});

module.exports= mongoose.model('AwaitMessage',chatSchema);