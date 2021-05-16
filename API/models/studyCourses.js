const mongoose= require("mongoose");

const listInfoCourses=mongoose.Schema({
    IDCourses: {type: String, require:true},
    name: {type: String, require:true},
    category: {type: String, require:true},
    startDate: {type: String, require:true},
    teacher:{type:[String], default:[]}
});

const studyCoursesSchema= mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    idUser:{type:mongoose.Schema.Types.ObjectId, ref:'Account'},
    idUserMoodle: {type: String, require:true},
    listCourses:{type: [listInfoCourses], default:[]}
});

module.exports= mongoose.model('studyCourses',studyCoursesSchema);