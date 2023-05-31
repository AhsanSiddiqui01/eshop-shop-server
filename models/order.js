const mongoose  = require('mongoose')

const orderSchema = mongoose.Schema({
    orderItems:[{type:mongoose.Schema.Types.ObjectId,ref:'orderItems',required:true}],
    shippingAddress1:{type:String,required:true},
    shippingAddress2:{type:String},
    city:{type:String,required:true},
    zip:{type:String,required:true},
    country:{type:String,required:true},
    phone:{type:String,required:true},
    status:{type:String,required:true,default:'Pending'},
    totalPrice:{type:Number},
    user:{type:mongoose.Schema.Types.ObjectId,ref:'User'},
    date:{type:Date,default:Date.now}
})

//The purpose of virtual id is only to remove _id to change id for database and calling it simple way.
orderSchema.virtual('id').get(function (){
    return this._id.toHexString()
})
orderSchema.set('toJSON',{
    virtuals:true
})

exports.Order = mongoose.model('Order',orderSchema)