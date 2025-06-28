const express = require("express");
const app = express();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const cors = require("cors");

app.use(express.json());
app.use(cors());

require('dotenv').config();
const mongoURI = process.env.MONGO_URI;

const port = process.env.SERVER_PORT

const secretKey = process.env.SECRET_KEY


mongoose.connect(mongoURI);

app.get("/", (req, res) => {
    res.send("Express App is Running");
});


const storage = multer.diskStorage({
    destination: './upload/images',
    filename: (req, file, cb) => {
        cb(null, `${file.fieldname}_${Date.now()}${path.extname(file.originalname)}`)
    }
})

const upload = multer({ storage: storage })

app.use('/images', express.static('upload/images'))

app.post("/upload", upload.array('product', 10), (req, res) => {
    const imageUrls = req.files.map(file => ({
        url: `http://localhost:${port}/images/${file.filename}`,
        filename: file.filename
    }));
    res.json({
        success: 1,
        image_urls: imageUrls
    });
});


const Product = mongoose.model("Product", {
    id: {
        type: Number,
        required: true,
        unique: true
    },
    name: {
        type: String,
        required: true
    },
    image: [{
        url: {
            type: String,
            required: true
        },
        filename: {
            type: String,
            required: true
        }
    }],
    category: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    deal_price: {
        type: Number,
        default: 0,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    available: {
        type: Boolean,
        default: true
    },
    date: {
        type: Date,
        default: Date.now
    },
    quantity: {
        type: Number,
        default: 1
    }
})

const User = mongoose.model("Users", {
    name: {
        type: 'String'
    },
    email: {
        type: 'String',
        unique: true
    },
    password: {
        type: 'String'
    },
    phoneNumber: {
        type: 'String'
    },
    cartData: {
        type: "Object",
        default: {}
    },
    date: {
        type: Date,
        default: Date.now
    }
})

app.post("/signup", async (req, res) => {

    console.log(req.body)

    let check = await User.findOne({ email: req.body.email })

    if (check) {
        return res.status(400).json({
            success: false,
            error: "Exsiting User found with Same Email Address"
        })
    }

    let cart = {};


    const user = new User({
        name: req.body.name,
        email: req.body.email,
        phoneNumber: req.body.phoneNumber,
        password: req.body.password,
        cartData: {}
    });

    await user.save();

    const data = {
        user: {
            id: user.id
        }
    }

    const token = jwt.sign(data, secretKey)

    res.json({
        success: true,
        token
    })

})


app.post('/login', async (req, res) => {

    let user = await User.findOne({ email: req.body.email })

    if (user) {
        const passCompare = req.body.password === user.password ? true : false
        if (passCompare) {
            const data = {
                user: {
                    id: user.id
                }
            }

            const token = jwt.sign(data, secretKey)

            res.json({
                success: true,
                token
            })
        } else {
            res.json({
                success: false,
                error: "Wrong Password"
            })
        }
    } else {
        res.json({
            success: false,
            error: "User not found!"
        })
    }
})


// app.post('/addproduct', async (req, res) => {

//     let products = await Product.find({});
//     let id;
//     if (products.length > 0) {
//         let last_product = products[products.length - 1];
//         id = last_product.id + 1;
//     } else {
//         id = 1;
//     }
//     const product = new Product({
//         id: id,
//         name: req.body.name,
//         image: req.body.image,
//         category: req.body.category,
//         price: req.body.price,
//         deal_price: req.body.deal_price,
//         description: req.body.description,
//         quantity: req.body.quantity
//     });
//     console.log(product);
//     await product.save();
//     console.log("Saved");
//     res.json({
//         success: true,
//         name: req.body.name,
//         image: req.body.image,
//     });
// });

app.post('/addproduct', async (req, res) => {
    let products = await Product.find({});
    let id = products.length > 0 ? products[products.length - 1].id + 1 : 1;

    const product = new Product({
        id: id,
        name: req.body.name,
        image: [{
            url: req.body.image.url,
            filename: req.body.image.filename
        }],
        category: req.body.category,
        price: req.body.price,
        deal_price: req.body.deal_price,
        description: req.body.description,
        quantity: req.body.quantity
    });

    await product.save();
    res.json({ success: true, product });
});

app.post('/addproducts', async (req, res) => {
    const products = req.body.products;

    let existing = await Product.find({});
    let nextId = existing.length > 0 ? existing[existing.length - 1].id + 1 : 1;

    const newProducts = products.map((p, index) => ({
        id: nextId + index,
        name: p.name,
        image: [{
            url: p.image[0].url,
            filename: p.image[0].filename
        }],
        category: p.category,
        price: p.price,
        deal_price: p.deal_price,
        description: p.description,
        quantity: p.quantity
    }));

    await Product.insertMany(newProducts);
    res.json({ success: true, count: newProducts.length });
});

app.post('/removeproduct', async (req, res) => {
    await Product.findOneAndDelete({
        id: req.body.id
    })
    console.log("Removed", req.body.id)
    res.json({
        success: true,
        name: req.body.name
    })
})


app.get('/allproducts', async (req, res) => {
    let products = await Product.find({})
    console.log("All Products Fetched")
    res.send(products)
})

const fetchUser = async (req, res, next) => {
    const token = req.header('auth-token')
    if (token == null || !token) {
        return res.status(401).send({ error: "Please Authenticate with valid token" })
    } else {
        try {
            const data = jwt.verify(token, secretKey);
            req.user = data.user
            next()
        } catch (error) {
            res.status(401).send({ error: "Invalid Token or Expired!" })
        }
    }
}

app.post('/addUserCart', fetchUser, async (req, res) => {
    try {
        let userData = await User.findOne({ _id: req.user.id });
        userData.cartData = {
            ...userData.cartData,
            [req.body.itemId]: req.body.quantity
        };
        await User.findOneAndUpdate({ _id: req.user.id }, { cartData: userData.cartData });
        res.json({
            success: true,
        })
    } catch (err) {
        console.log("Error in adding User Cart Items", err);
    }
})

app.post('/removeUserCart', fetchUser, async (req, res) => {
    try {
        let userData = await User.findOne({ _id: req.user.id });

        delete userData.cartData[req.body.itemId]

        await User.findOneAndUpdate({ _id: req.user.id }, { cartData: userData.cartData });
        res.json({
            success: true,
        })
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal server error" });
    }
})

app.post('/getUserCart', fetchUser, async (req, res) => {
    try {
        let userData = await User.findOne({ _id: req.user.id })
        res.json({
            success: true,
            cartData: userData.cartData
        })
    } catch (err) {
        res.json({
            success: false,
            msg: err
        })
    }
})

app.get('/getUserDetails', fetchUser, async (req, res) => {
    try {
        let userData = await User.findOne({ _id: req.user.id })

        res.json({
            success: true,
            userName: userData.name
        })
    } catch (err) {
        res.json({
            success: false,
            msg: err
        })
    }
})
app.listen(port, (error) => {
    if (!error) console.log("Server Running on port: ", port)
    else console.log("Error: ", error);
})