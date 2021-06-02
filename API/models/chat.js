const mongoose = require("mongoose");

const ChatContext = mongoose.Schema({
    from:{type:String, require:true},
    text:{type:String, require:true},
    time:{type:String, require:true},
    state:{type:Boolean, default:false}
})

const chatSchema = mongoose.Schema({
    __id: mongoose.Schema.Types.ObjectId,
    User:  {type:[String], default:[]},
    //User2:  {type:mongoose.Schema.Types.ObjectId, ref:'Account'},
    TypeRoom: {type:String, require:true},
    chat:{type:[ChatContext], default:[]}
});

module.exports= mongoose.model('Chat',chatSchema);