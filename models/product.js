const mongoose  = require('mongoose')

const productSchema = mongoose.Schema({
    name:{type:String,required:true},
    description:{type:String,required:true},
    richDescription:{type:String,default:''},
    image:{type:String,default:''},
    images:[{type:String,default:''}],
    brand:{type:String,default:''},
    price:{type:Number,default:0},
    category:{type:mongoose.Schema.Types.ObjectId,ref:'Category'},
    countInStock:{type:Number,require:true,min:0,max:255},
    rating:{type:String,default:''},
    numReviews:{type:Number,default:0},
    isFeatured:{type:Boolean,default:false},
    dateCreated:{type:Date,default:Date.now}

})

//The purpose of virtual id is only to remove _id to change id for database and calling it simple way.
productSchema.virtual('id').get(function (){
    return this._id.toHexString()
})
productSchema.set('toJSON',{
    virtuals:true
})

exports.Product = mongoose.model('Product',productSchema)