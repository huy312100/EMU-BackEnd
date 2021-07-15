const mongoose= require('mongoose');

const accountSchema=mongoose.Schema(
    {
        _id: mongoose.Schema.Types.ObjectId,
        username: {
            type: String, 
            trim: true,
            require:true,
            unique:true,
            match: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
        },
        password: {type: String, require:true},
        firstsign:{type: Boolean, require:true},
        role:{type: String, require:true},
        tokenNotifition: {type: String, require:true},
        parent: {type:mongoose.Schema.Types.ObjectId},
        tokenReset:{type: String, require:true},
        
    }
);

module.exports= mongoose.model('Account',accountSchema);