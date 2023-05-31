const express = require('express')
const router  = express.Router()
const {User}  = require('../models/user')
const bcrypt  = require('bcryptjs')
const jwt     = require('jsonwebtoken')

const secret = process.env.SECRET

//GET USERS
router.get(`/`,async (req,res)=>{
    const userList = await User.find().select('-passwordHash')
    if(!userList)
    {
        res.status(500).json({success:false})
    }
    res.send(userList)
})

//GET SINGLE USER
router.get('/:id',async(req,res)=>{
    const user = await User.findById(req.params.id).select('-passwordHash')
    if(!user)
    {
        res.status(500).json({message:'The category with the given id was not found'})
    }
    res.status(200).send(user)
})


//POST NEW USER WITH Encrypted Password
// router.post('/',async(req,res)=>{
//     let user = new User({
//         name:req.body.name,
//         email:req.body.email,
//         passwordHash:bcrypt.hashSync(req.body.password,10),
//         phone:req.body.phone,
//         isAdmin:req.body.isAdmin,
//         apartment:req.body.apartment,
//         zip:req.body.zip,
//         city:req.body.city,
//         country:req.body.country
//     })
//     user = await user.save();
//     if(!user)
    
//         return res.status(404).send("The user can't be created!")
//         res.send(user)
// })

//LOGIN USER WITH EMAIL AND PASSWORD AND GET TOKEN AFTER SUCCESS
router.post('/login',async(req,res)=>{
    const user = await User.findOne({email:req.body.email})
    if(!user)
    {
        return res.status(400).send('The user is not found')
    }
    if(user && bcrypt.compareSync(req.body.password,user.passwordHash))
    {
        const token = jwt.sign({
            userId:user.id,
            isAdmin:user.isAdmin,
        },
        secret,
        {
            expiresIn:'1d'
        }
        )
        res.status(200).send({
            user:user.email,token:token
        })
    }
    else
    {
        res.status(400).send('Password Not Match')
    }
})

router.post('/register',async(req,res)=>{
    let user = new User({
        name:req.body.name,
        email:req.body.email,
        passwordHash:bcrypt.hashSync(req.body.password,10),
        phone:req.body.phone,
        isAdmin:req.body.isAdmin,
        apartment:req.body.apartment,
        zip:req.body.zip,
        city:req.body.city,
        country:req.body.country
    })
    user = await user.save();
    if(!user)
    
        return res.status(404).send("The user can't be created!")
        res.send(user)
})

//GET USERS COUNT
router.get('/get/count',async (req,res)=>{
    const userCount = await User.countDocuments()
    if(!userCount)
    {
        res.status(500).json({success:false})
    }
    res.send({userCount:userCount})
})

//DELETE USER
router.delete('/:id',(req,res)=>{
    User.findByIdAndDelete(req.params.id)
    .then(user => {
        if(user)
        {
            return res.status(200).json({success:true,message:'The user is deleted successfully'})
        }
        else
        {
            return res.status(404).json({success:false,message:'user not found'})
        }
    }).catch(err=>{
        return res.status(500).json({success:false,error:err})
    })
})
module.exports = router