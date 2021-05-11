const mongoose= require("mongoose");

const listAssigns=mongoose.Schema({
    name: {type: String, require:true},
    url: {type: String, require:true},
    startDate: {type: String, require:true}
});

const coursesContentSchema= mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    idUser:{type:mongoose.Schema.Types.ObjectId, ref:'Account'},
    IDCourses:{type: String, require:true},
    listAssign:{type: [listAssigns], default:[]}
});

module.exports= mongoose.model('coursesContent',coursesContentSchema);