const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
const fileUpload = require('express-fileupload')
const ObjectId = require('mongodb').ObjectID
const fs = require('fs-extra')
const app = express()
const port = 5505


// { limit: '50mb', extended: true }

require('dotenv').config()

app.use(bodyParser.json())
app.use(cors())
app.use(express.static('service'));
app.use(fileUpload())
const MongoClient = require('mongodb').MongoClient;
const uri = process.env.DB_URI;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const orderBookingCollection = client.db("mrHandy").collection("orderBooking");
  const serviceCollection = client.db("mrHandy").collection("services");
  const reviewCollection = client.db("mrHandy").collection("allReview");
  const adminCollection = client.db("mrHandy").collection("admin");
  console.log('db connection successfully')

  app.post('/admin', (req, res) => {
    const email = req.body.email;
    adminCollection.find({ email: email })
      .toArray((err, result) => {
        res.send(result.length > 0);
      })
  })

  app.post('/customerBooking', (req, res) => {
    const email = req.body.email;
    adminCollection.find({ email: email })
      .toArray((err, result) => {
        if (result.length > 0) {
          orderBookingCollection.find({})
            .toArray((err, result) => {
              res.send(result);
            })
        }
        else {
          orderBookingCollection.find({ email: email })
            .toArray((err, result) => {
              res.send(result);
            })
        }
      })
  })

  app.post('/customerReview', (req, res) => {
    const file = req.files.file;
    const name = req.body.name;
    const description = req.body.description;
    const city = req.body.city;
    const newImg = file.data;
    const encImg = newImg.toString('base64')

    var image = {
      contentType: file.mimetype,
      size: file.size,
      img: Buffer.from(encImg, 'base64')
    }

    reviewCollection.insertOne({ name, description, city, image })
      .then(result => {
        res.send(result.insertedCount > 0)
      })

  })

  app.get('/allReview', (req, res) => {
    reviewCollection.find({})
      .toArray((err, result) => {
        res.json(result)
      })
  })

  app.post("/orderBooking", (req, res) => {
    orderBookingCollection.insertOne(req.body)
      .then(result => {
        res.json(result.insertedCount > 0)
      })
  })
  app.get('/allBooking', (req, res) => {
    orderBookingCollection.find({})
      .toArray((err, result) => {
        res.json(result)
      })
  })

  app.get('/booking/:id', (req, res) => {
    console.log(req.params.id)
    serviceCollection.find({ _id: ObjectId(req.params.id) })
      .toArray((err, result) => {
        res.json(result[0])
      })
  })

  app.delete('/deleteService/:deleteId', (req, res) => {
    console.log('delete id', req.params.deleteId)
    serviceCollection.deleteOne({ _id: ObjectId(req.params.deleteId) })
      .then((err, result) => {
        res.json(result.deletedCount > 0)
      })
  })

  app.get('/allService', (req, res) => {
    serviceCollection.find({})
      .toArray((err, result) => {
        // console.log(result)
        res.send(result)
      })
  })

  app.post('/addService', (req, res) => {
    const file = req.files.file;
    const serviceName = req.body.serviceName;
    const description = req.body.description;
    const price = req.body.price;

    const newImg = file.data;
    const encImg = newImg.toString('base64')

    var image = {
      contentType: file.mimetype,
      size: file.size,
      img: Buffer.from(encImg, 'base64')
    }

    serviceCollection.insertOne({ serviceName, description, price, image })
      .then(result => {
        res.send(result.insertedCount > 0)
      })

  });

});

  app.get('/', (req, res) => {
    res.send('Welcome Mr.Handy Server!')
  })

  app.listen(process.env.PORT || port)