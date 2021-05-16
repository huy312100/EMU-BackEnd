const mongoose= require("mongoose");

const listInfoCurrentCourses=mongoose.Schema({
    IDCourses: {type: String, require:true},
    name: {type: String, require:true},
    startDate: {type: String, require:true},
    teacher:{type:[String], default:[]}
});

const currentStudyCoursesSchema= mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    idUser:{type:mongoose.Schema.Types.ObjectId, ref:'Account'},
    idUserMoodle: {type: String, require:true},
    listCourses:{type: [listInfoCurrentCourses], default:[]}
});

module.exports= mongoose.model('currentStudyCourses',currentStudyCoursesSchema);