// const mongoose= require("mongoose");

// const deadlineMoodleSchema= mongoose.Schema({
//     _id: mongoose.Schema.Types.ObjectId,
//     idUser:{type:mongoose.Schema.Types.ObjectId, ref:'Account'},
//     nameCourses: {type: String, require:true},
//     decription :{type: String, require:true},
//     url: {type: String, require:true},
//     dueDate :{type: String, require:true},
// });

// module.exports= mongoose.model('deadlineMoodle',deadlineMoodleSchema);

class deadlineMoodle{
    constructor(nameCourese,decription,url, duedate){
        this.nameCourese=nameCourese;
        this.decription=decription;
        this.url=url;
        this.duedate=duedate;
    }
};

module.exports=deadlineMoodle;