const mongoose = require("mongoose");

const ChatContext = mongoose.Schema({
    from:{type:String, require:true},
    text:{type:String, require:true},
    time:{type:String, require:true},
})

const chatSchema = mongoose.Schema({
    __id: mongoose.Schema.Types.ObjectId,
    User1:  {type:mongoose.Schema.Types.ObjectId, ref:'Account'},
    User2:  {type:mongoose.Schema.Types.ObjectId, ref:'Account'},
    TypeRoom: {type:String, require:true},
    chat:{type:[ChatContext], default:[]}
});

module.exports= mongoose.model('Chat',chatSchema);