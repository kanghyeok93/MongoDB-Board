var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');

var Schema = mongoose.Schema({
    id : String,
    email : String,
    nickname : String,
    writer : String,
    password : String,
    title : String,
    contents : String,
    comments : [{
        name : String,
        memo : String,
        date : { type : Date, default : Date.now() }
    }],
    count : { type : Number , default : 0 },
    date : { type : Date, default : Date.now() },
    updated : [{ contents : String }],
    deleted : { type : Boolean , default : false }
});

Schema.methods.createHash = function(password){
    return bcrypt.hashSync(password,bcrypt.genSaltSync(10))
};

Schema.methods.comPassword = function(password){
    return bcrypt.compareSync(password,this.password);
};

Schema.static('findById', function(id, callback){
    return this.find({id:id}, callback);
});

module.exports = mongoose.model('Board',Schema);