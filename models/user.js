const mongoose  = require('mongoose')

const userSchema = mongoose.Schema({
    name:{type:String,required:true},
    email:{type:String,required:true},
    passwordHash:{type:String,required:true},
    phone:{type:String,required:true},
    isAdmin:{type:Boolean,default:false},
    street:{type:String,default:''},
    apartment:{type:String,default:''},
    zip:{type:String,default:''},
    city:{type:String,default:''},
    country:{type:String,default:''},
})

//The purpose of virtual id is only to remove _id to change id for database and calling it simple way.
userSchema.virtual('id').get(function (){
    return this._id.toHexString()
})
userSchema.set('toJSON',{
    virtuals:true
})

exports.User = mongoose.model('User',userSchema)
exports.userSchema = userSchema