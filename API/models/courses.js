const mongoose= require("mongoose");

const studentStudy=mongoose.Schema({
    IDUser: {type:mongoose.Schema.Types.ObjectId, ref:'Account'},
    IDUserMoodle:  {type: String, require:true}
});

const coursesSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    IDCourses: {type: String, require:true},
    url: {type: String, require:true},
    IDUser: {type:mongoose.Schema.Types.ObjectId, ref:'Account'},
    IDUserInstead: {type: String, require:true},
    listStudent: {type: [studentStudy], default:[]}
});

module.exports= mongoose.model('Courses',coursesSchema);