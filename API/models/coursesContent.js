const mongoose= require("mongoose");

const listAssigns=mongoose.Schema({
    IDOfListAssign: {type: String, require:true},
    name: {type: String, require:true},
    url: {type: String, require:true},
    startDate: {type: String, require:true}
});

const listLabels = mongoose.Schema({
    name: {type: String, require:true},
    label: {type: Object, require:true}
});

const listResources = mongoose.Schema({
    name: {type: String, require:true},
    url: {type: String, require:true}
});

const listUrls = mongoose.Schema({
    name: {type: String, require:true},
    url: {type: String, require:true}
});

const listFolders = mongoose.Schema({
    name: {type: String, require:true},
    url: {type: String, require:true}
});

const coursesContentSchema= mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    IDCourses:{type: String, require:true},
    urlm:{type: String, require:true},
    listLabel: {type:[listLabels], default:[]},
    listResource: {type:[listResources], default:[]},
    listAssign:{type: [listAssigns], default:[]},
    listUrl:{type:[listUrls],default:[]},
    listFolder: {type:[listFolders],default:[]},
});

module.exports= mongoose.model('coursesContent',coursesContentSchema);