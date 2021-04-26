const mongoose= require("mongoose");

const customwebSchema= mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    idUser:{type:mongoose.Schema.Types.ObjectId, ref:'Account'},
    typeUrl: {type: String, require:true},
    url: {type: String, require:true},
    username: {type: String, require:true},
    password: {type: String, require:true},
    token: {type: String, require:true}
});

module.exports= mongoose.model('CustomWeb',customwebSchema);