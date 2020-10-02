const express = require("express");
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const mongoose = require("mongoose");
const firebase = require("firebase/app");
require('dotenv').config({path: __dirname + '/.env'});
// Import dotenv before firebase_auth due to dependecies on env
const firebase_auth = require("../node_api/auth/auth");

// Add the Firebase products that you want to use
const firebase_admin = require('firebase-admin');
require("firebase/auth");
// require("firebase/firestore");

const ENV_VAR = process.env;

const firebaseConfig = {
  apiKey: ENV_VAR.FIREBASE_API_KEY,
  authDomain: ENV_VAR.FIREBASE_AUTH_DOMAIN,
  databaseURL: ENV_VAR.FIREBASE_DB_URL,
  projectId: ENV_VAR.FIREBASE_PROJECT_ID,
  storageBucket: ENV_VAR.FIREBASE_STORAGE_BUCKET,
  messagingSenderId: ENV_VAR.FIREBASE_MSG_SENDER_ID,
  appId: ENV_VAR.FIREBASE_APP_ID
};

firebase.initializeApp(firebaseConfig);


app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const url = ENV_VAR.MONGO_URL;

app.listen(ENV_VAR.NODE_PORT, () => {
 console.log(`Node server running on port ${ENV_VAR.NODE_PORT}`);
});

const MongoClient = require('mongodb').MongoClient;

app.post("/sign_in", (req, res) => {
  firebase.auth().signInWithEmailAndPassword(req.body.email, req.body.password)
   .then(function(firebaseUser) {
       console.log(firebaseUser);
       res.status(200).send(firebaseUser);
   })
  .catch(function(error) {
       // Error Handling
       console.log('error in authenticating user');
      console.log(error)
      res.status(401).send(error);
  });
})

app.get("/mongo", firebase_auth.validateFirebaseToken,(req, res) => {
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("testdb");
        dbo.collection("TestCollection").find({}).toArray(function(err, result) {
          if (err) throw err;
          console.log(result);
          res.json(result);
          db.close();
        });
      });
});   

app.get("/get_messages", (req, res, next) => {
  MongoClient.connect(url, function(err, db) {
    if(err) {
      throw err;
    }
    let dbo = db.db("testdb");
    dbo.collection("messages").aggregate([{$group : {_id : "$user_id", num_messages : {$sum : 1}}}]).toArray((err, result) => {
      if(err) throw err;
      res.status(200).json(result);
      db.close();

    })
  });
})

app.post('/insert_mongo', (req, res) => {

  MongoClient.connect(url, function(err, db) {
    console.log(req.body.user_id);
    console.log((req.body.name));
    if (err) res.status(500).json(err);
    const dbo = db.db("testdb");
    const myobj = { name: req.body.name, user_id: req.body.user_id};
    dbo.collection("TestCollection").insertOne(myobj, function(err, result) {
      console.log(result.ops);
      if (err) res.status(500).json(err);
      console.log("1 document inserted");
      res.status(200).json(result.ops[0]);
      db.close();
    });
  });

})

app.post('/get_schedule', (req, res) => {

  MongoClient.connect(url, function(err, db) {
    console.log(new Date(req.body.date));
    console.log(new Date(req.body.date).setDate(1));
    console.log(new Date(req.body.date).setDate(31));
    if (err) res.status(500).json(err);
    const dbo = db.db("testdb");
    let before = new Date(new Date(req.body.date).setHours(00, 00, 00));
    let after = new Date(new Date(req.body.date).setHours(23, 59, 59));
    before.setDate(1);
    after.setDate(31);
    before.setMonth(before.getMonth()-1);
    after.setMonth(after.getMonth()+1);
    dbo.collection("user_schedule").find({"date":{$gte: before
      ,$lt: after}}).toArray(function(err, result) {
      if (err) res.status(500).json(err);
      console.log(result);
      res.json(result);
      db.close();
    });
  });

})

app.post('/insert_schedule', (req, res) => {

  MongoClient.connect(url, function(err, db) {
    console.log(req.body);
    console.log(new Date(req.body.date));
    console.log((req.body.name));
    console.log((req.body.label));
    if (err) res.status(500).json(err);
    const dbo = db.db("testdb");
    let myobj = { date: new Date(req.body.date), name: req.body.name, label: req.body.label};
    dbo.collection("user_schedule").insertOne(myobj, function(err, result) {
      console.log(result);
      if (err) res.status(500).json(err);
      console.log("1 document inserted");
      res.status(200).json(result);
      db.close();
    });
  });

})

