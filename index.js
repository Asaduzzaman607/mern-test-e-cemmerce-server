const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs-extra');
const fileUpload = require('express-fileupload')
const MongoClient = require('mongodb').MongoClient;
const ObjectId = require('mongodb').ObjectId;
require('dotenv').config()
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.hia2w.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const app = express()

app.use(bodyParser.json());
app.use(cors());
app.use(express.static('services'));
app.use(fileUpload());

const port = 5000;


const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  console.log("db connected")
  const productsCollection = client.db("testEcommerce").collection("allProducts");

  // perform actions on the collection object
  const promoCodesCollection = client.db("testEcommerce").collection("promoCodes");


   // add products to show them in the home page
app.post('/addProduct', (req, res) => {
  const file = req.files.file
  const encImg = file.data.toString('base64')
  const image = {
      contentType: file.mimetype,
      size: file.size,
      img: Buffer.from(encImg, 'base64')
  }
  const { name, shipping, size, color, price,discount, status, condition } = req.body
  productsCollection.insertOne({ name, shipping, size, color, price,discount, status,image, condition })
      .then(result => {
          return res.send(result.insertedCount > 0)
      })
})

//  to get products in the client side conditionally
app.get('/getProducts', (req, res) => {
  productsCollection.find({ condition: 'true'})
      .toArray((err, documents) => {
        res.send(documents)
      })
  })

  //  to get  products following the order status

  app.get("/getCondProduct", (req, res) => {
    const condition = parseInt(req.query.status) ;
    let filtered = {} ;
    if(condition){
      filtered = {
        status: condition
      }
    }
    productsCollection
      .find(filtered)
      .toArray((err, documents) => {
        res.send(documents);
      });
  });


    //to read the products
    app.get("/searchedProducts", (req, res) => {
      const search = req.query.search;
      console.log(search)
      productsCollection
        .find({ name: { $regex: search } })
        .toArray((err, documents) => {
          res.send(documents);
        });
    });

// adding promo code
  
app.post('/addPromoCode', (req, res) => {
  const startingTime = req.body;
  const endingTime = req.body;
  const { name, useTime, discount } = req.body
  promoCodesCollection.insertOne({  name, useTime, startingTime, endingTime, discount })
      .then(result => {
          return res.send(result.insertedCount > 0)
      })
})

//  to get promo codes  conditionally
app.get('/getPromoCodes', (req, res) => {
  promoCodesCollection.find({})
      .toArray((err, documents) => {
        res.send(documents)
      })
  })

  // for updating order status

  app.patch('/updateOrder', (req, res) => {
    console.log(req.body)
    productsCollection.updateOne({ _id:ObjectId(req.body.id) },
        {
            $set: { status: req.body.status }
        })
        .then(result => {
            console.log(result)
            res.send(result)
        })
})



});

app.get('/', (req, res) => {
    res.send("hello from db it's working working")
})

app.listen(process.env.PORT || port)
