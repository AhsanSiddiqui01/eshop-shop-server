const express    = require('express')
const router     = express.Router()
const {Product}  = require('../models/product')
const {Category} = require('../models/category')
const mongoose   = require('mongoose')
const multer     = require('multer')

const FILE_TYPE_MAP = {
    'image/png':'png',
    'image/jpg':'jpg',
    'image/jpeg':'jpeg',
}


//multer function to upload files 
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      const isValid = FILE_TYPE_MAP[file.mimetype]
      let uploadError = new Error('Invalid image type')
      if(isValid){
        uploadError = null
      }
      cb(uploadError, 'public/uploads')
    },
    filename: function (req, file, cb) {
        const extension = FILE_TYPE_MAP[file.mimetype]
        const fileName  = file.originalname.replace(' ','-')
      cb(null,`${fileName}-${Date.now()}.${extension}`)
    }
  })
  const uploadOptions = multer({ storage: storage })

router.get(`/`,async (req,res)=>{
    let filter = {}
    if(req.query.categories)
    {
        filter = {category:req.query.categories.split(',')}
    }
    const productList = await Product.find(filter).populate('category')
    if(!productList)
    {
        res.status(500).json({success:false})
    }
    res.send(productList)
})

router.get(`/:id`,async (req,res)=>{
    const product = await Product.findById(req.params.id).populate('category')
    if(!product)
    {
        res.status(500).json({success:false})
    }
    res.send(product)
})

router.post(`/`,uploadOptions.single('image'), async(req,res)=>{
    let category = await Category.findById(req.body.category)
    if(!category) return res.status(400).send('Invalid Category')

    const file = req.file;
    if (!file) return res.status(400).send('No image in the request');
    const fileName = req.file.filename
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`
    
    const product = new Product({
        name:req.body.name,
        description:req.body.description,
        richDescription:req.body.richDescription,
        image:`${basePath}${fileName}`,
        brand:req.body.brand,
        price:req.body.price,
        category:req.body.category,
        countInStock:req.body.countInStock,
        rating:req.body.rating,
        numReviews:req.body.numReviews,
        isFeatured:req.body.isFeatured,
    })
    // product = await product.save()
    // if(!product)
    // return res.status(500).send('Product cant be created')
    // res.send(product)    
    product.save().then((createProduct=>{
        res.status(201).json(createProduct)
    }))
    .catch((err)=>{
        console.log('error:',err)
        res.status(500).json({
            error:err,
            success:false
        })
    })
})

//UPDATE PRODUCT
router.put('/:id',uploadOptions.single('image'),async (req,res)=>{
    if(!mongoose.isValidObjectId(req.params.id)){
        res.status(400).send('Invalid Product Id')
    }
    
    const category = await Category.findById(req.body.category)
    if(!category) return res.status(400).send('Invalid Category')
     
    const product = await Category.findById(req.params.id)
    if(!product) return res.status(400).send('Invalid Product!')

    const file = req.file
    let imagepath;
    if(file)
    {
        const fileName = req.file.filename
        const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`
        imagepath      = `${basePath}${fileName}`
    }
    else
    {
        imagepath = product.image
    }
    const updatedproduct = await Product.findByIdAndUpdate(req.params.id,{
        name:req.body.name,
        description:req.body.description,
        richDescription:req.body.richDescription,
        image:imagepath,
        brand:req.body.brand,
        price:req.body.price,
        category:req.body.category,
        countInStock:req.body.countInStock,
        rating:req.body.rating,
        numReviews:req.body.numReviews,
        isFeatured:req.body.isFeatured,
    },
    {new:true})
    if(!updatedproduct)
    return res.status(500).send("The product can't be created!")
    res.send(updatedproduct)
})

//DELETE PRODUCT
router.delete('/:id',(req,res)=>{
    Product.findByIdAndDelete(req.params.id)
    .then(product => {
        if(product)
        {
            return res.status(200).json({success:true,message:'The product is deleted successfully'})
        }
        else
        {
            return res.status(404).json({success:false,message:'product not found'})
        }
    }).catch(err=>{
        return res.status(500).json({success:false,error:err})
    })
})

//GET PRODUCT COUNT
router.get('/get/count',async (req,res)=>{
    const productCount = await Product.countDocuments()
    if(!productCount)
    {
        res.status(500).json({success:false})
    }
    res.send({productCount:productCount})
})

//GET FEATURED
router.get('/get/featured/:count',async (req,res)=>{
    const count = req.params.count? req.params.count:0
    const productFeatured = await Product.find({isFeatured:true}).limit(+count)
    if(!productFeatured)
    {
        res.status(500).json({success:false})
    }
    res.send(productFeatured)
})

//GALLERY IMAGES
router.put('/gallery-images/:id', uploadOptions.array('images', 10), async (req, res) => {
    if (!mongoose.isValidObjectId(req.params.id)) {
        return res.status(400).send('Invalid Product Id');
    }
    const files = req.files;
    let imagesPaths = [];
    const basePath = `${req.protocol}://${req.get('host')}/public/uploads/`;

    if (files) {
        files.map((file) => {
            imagesPaths.push(`${basePath}${file.filename}`);
        });
    }

    const product = await Product.findByIdAndUpdate(
        req.params.id,
        {
            images: imagesPaths
        },
        { new: true }
    );

    if (!product) return res.status(500).send('the gallery cannot be updated!');

    res.send(product);
});
module.exports = router