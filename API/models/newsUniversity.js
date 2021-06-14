const mongoose = require("mongoose");

const newsUni = mongoose.Schema({
    Title: {type: String, require:true},
    Link: {type: String, require:true},
    Date: {type: String, require:true}
});

const newsUniversitySchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    universityCode: {type: String, require:true},
    news: {type: [newsUni], default:[]}
});

module.exports= mongoose.model('NewsUniversity',newsUniversitySchema);