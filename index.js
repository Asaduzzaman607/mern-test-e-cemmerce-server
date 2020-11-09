const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs-extra');
const fileUpload = require('express-fileupload')
const MongoClient = require('mongodb').MongoClient;
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
  const productsCollection = client.db("testEcommerce").collection("allProducts");
  // perform actions on the collection object
  const ordersCollection = client.db("testEcommerce").collection("orders");
  const promoCodesCollection = client.db("testEcommerce").collection("promoCodes");
  const reviewCollection = client.db("testEcommerce").collection("reviews");
   


app.post('/addProduct', (req, res) => {
  const file = req.files.file
  const encImg = file.data.toString('base64')
  const image = {
      contentType: file.mimetype,
      size: file.size,
      img: Buffer.from(encImg, 'base64')
  }
  const { name, shipping, size, color, price,discount, status } = req.body
  productsCollection.insertOne({ name, shipping, size, color, price,discount, status,image })
      .then(result => {
          return res.send(result.insertedCount > 0)
      })
})

app.get('/getProducts', (req, res) => {
  productsCollection.find({})
      .toArray((err, documents) => {
        res.send(documents)
      })
  })
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


  app.patch('/updateOrder', (req, res) => {
    console.log(req.body)
    ordersCollection.updateOne({ _id:ObjectId(req.body.id) },
        {
            $set: { status: req.body.status }
        })
        .then(result => {
            console.log(result)
            res.send(result)
        })
})
// app.patch('/updateOrder/:id', (req, res) => {
//     ordersCollection.updateOne({ _id: ObjectId(req.params.id) },
//       {
//         $set: { status: req.body.status }
//       })
//       .then(result => {
//         console.log(result)
//         res.send(result.modifiedCount > 0)
//       })
//   });

app.get('/userOrder/:email', (req, res) => {
  const email = req.params.email;
  ordersCollection.find({ email })
      .toArray((err, documents) => {
          res.send(documents)
      })
})




});

app.get('/', (req, res) => {
    res.send("hello from db it's working working")
})

app.listen(process.env.PORT || port)
