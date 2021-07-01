const mongoose = require("mongoose");

const Forums = mongoose.Schema({
    name: {type: String, require:true},
    createDate: {type: String, require:true},
    modifiedDate: {type: String, require:true},
    subject: {type: String, require:true},
    message: {type: String, require:true},
    fullname: {type: String, require:true},
    url:{type: String, require:true}
});

const forumMoodleSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    IDForum: {type: String, require:true},
    IDCourses: {type: String, require:true},
    url:{type: String, require:true},
    Forum: {type: [Forums], default:[]}
});

module.exports= mongoose.model('ForumMoodle',forumMoodleSchema);