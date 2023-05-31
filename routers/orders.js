const express = require('express')
const router  = express.Router()
const {Order} = require('../models/order')
const { OrderItem } = require('../models/orderItem')

//GET MULTIPLE ORDERS LIST
router.get(`/`,async (req,res)=>{
    //sort method in this case is the newest order to oldest order
    const orderList = await Order.find().populate('user','name').sort({'date':-1})
    if(!orderList)
    {
        res.status(500).json({success:false})
    }
    res.send(orderList)
})

//GET SINGLE ORDER DETAIL
router.get(`/:id`,async (req,res)=>{
    const order = await Order.findById(req.params.id)
    .populate('user','name')
    .populate({
        path:'orderItems',populate:{
            path:'product',populate:'category'}
        })

    if(!order)
    {
        res.status(500).json({success:false})
    }
    res.send(order)
})

//GET TOTAL ORDERS 
router.get('/get/totalsales',async (req,res)=>{
    //aggregate we can join all tables and document to one and get
    //one of field that table $sum reserved word by mongoose
    const totalSales = await Order.aggregate([
        {
            //here $group and $sum is the reserved word in mongoose
            $group:{_id:null,totalsales:{$sum:'$totalPrice'}}
        }
    ])
    if(!totalSales)
    {
        return res.status(400).send("The order sales cannot be generated")
    }
    res.send({totalSales:totalSales.pop().totalsales})
})

//GET TOTAL PRODUCTS
router.get('/get/count',async (req,res)=>{
    const orderCount = await Order.countDocuments()
    if(!orderCount)
    {
        res.status(500).json({success:false})
    }
    res.send({orderCount:orderCount})
})

//GET USER ORDER HISTORY
router.get(`/get/userorders/:userId`,async (req,res)=>{
    //sort method in this case is the newest order to oldest order
    const userOrderList = await Order.find({user:req.params.userId})
    .populate({
        path:'orderItems',populate:{
            path:'product',populate:'category'}
        })
    .sort({'date':-1})
    if(!userOrderList)
    {
        res.status(500).json({success:false})
    }
    res.send(userOrderList)
})

//POST ORDER
router.post('/',async(req,res)=>{
    const orderItemsIds  = Promise.all(req.body.orderItems.map(async orderItem => {
        let newOrderItem = new OrderItem({
            quantity:orderItem.quantity,
            product:orderItem.product
        })
        newOrderItem = await newOrderItem.save()
        return newOrderItem._id
    }))
    const orderItemsIdsResolved = await orderItemsIds
    // GET TOTAL PRICE OF SINGLE ORDER BY USER OR CUSTOMER
        const totalPrices       = await Promise.all(orderItemsIdsResolved.map(async (orderItemsId)=>{
        const orderItem         = await OrderItem.findById(orderItemsId).populate('product','price')
        const totalPrice        = orderItem.product.price * orderItem.quantity
        return totalPrice
    }))
    const totalPrice = totalPrices.reduce((a,b)=> a+b,0)
    // GET TOTAL PRICE OF SINGLE ORDER BY USER OR CUSTOMER

    // console.log(totalPrice)
    let order = new Order({
        orderItems:orderItemsIdsResolved,
        shippingAddress1:req.body.shippingAddress1,
        shippingAddress2:req.body.shippingAddress2,
        city:req.body.city,
        zip:req.body.zip,
        country:req.body.country,
        phone:req.body.phone,
        status:req.body.status,
        totalPrice:totalPrice,
        user:req.body.user,
    })
    order = await order.save();
    if(!order)
    
        return res.status(404).send("The order can't be created!")
        res.send(order)
})

//UPDATE ORDER
router.put('/:id',async (req,res)=>{
    const order = await Order.findByIdAndUpdate(req.params.id,{
        status:req.body.status,
    },
    {new:true})
    if(!order)
    return res.status(404).send("The order can't be created!")
    res.send(order)
})


//DELETE CATEGORY
router.delete('/:id',(req,res)=>{
    Order.findByIdAndDelete(req.params.id)
    .then(async order => {
        if(order)
        {
            await order.orderItems.map(async orderItem => {
                await OrderItem.findByIdAndRemove(orderItem)
            })
            return res.status(200).json({success:true,message:'The order is deleted successfully'})
        }
        else
        {
            return res.status(404).json({success:false,message:'order not found'})
        }
    }).catch(err=>{
        return res.status(400).json({success:false,error:err})
    })
})
module.exports = router