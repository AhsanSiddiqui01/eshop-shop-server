const express      = require('express')
const app          = express()
const bodyParse    = require('body-parser')
const morgan       = require('morgan')
const mongoose     = require('mongoose')
const authJwt      = require('./helpers/jwt')
const errorHandler = require('./helpers/error-handler')
const cors         = require('cors')
//get can take two parameters first one is route and second one is call back
require('dotenv/config')

app.use(cors())
app.options('*',cors())

const api           = process.env.API_URL
const connectString = process.env.CONNECTION_STRING

//middleware
app.use(bodyParse.json())
app.use(morgan('tiny'))
app.use(authJwt())
app.use(errorHandler)
app.use('/public/uploads',express.static(__dirname + '/public/uploads'))

// app.use((err,req,res,next)=>{
//     if(err){
//         res.status(500).json({message:err})
//     }
// })

//middleware

//Routes
const productsRoutes   = require('./routers/products')
const categoriesRoutes = require('./routers/categories')
const usersRoutes      = require('./routers/users')
const ordersRoutes     = require('./routers/orders')

//Routes

//Routers
app.use(`${api}/products`,productsRoutes)
app.use(`${api}/categories`,categoriesRoutes)
app.use(`${api}/users`,usersRoutes)
app.use(`${api}/orders`,ordersRoutes)
//Routers

//Database Connection
mongoose.connect(connectString)
.then(()=>{
    console.log('MongoDB is connected Successfully..')
})
.catch((err)=>{
    console.log('Not Connected',err)
})

// app.listen(3000)

// Development
app.listen(3000, ()=>{
    console.log("SERVER IS RUNNING NOW")
})

//Production
var server = app.listen(process.env.PORT || 3000, function () {
    var port  = server.address().port
    console.log('Express is working on port' + port)
})