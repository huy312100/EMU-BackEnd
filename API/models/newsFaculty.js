const mongoose = require("mongoose");

const newsFac = mongoose.Schema({
    Title: {type: String, require:true},
    Link: {type: String, require:true},
    Date: {type: String, require:true}
});

const newsFacultySchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    universityCode: {type: String, require:true},
    facultyCode: {type: String, require:true},
    news: {type: [newsFac], default:[]}
});

module.exports= mongoose.model('NewsFaculty',newsFacultySchema);