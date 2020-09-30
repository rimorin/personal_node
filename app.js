const express = require("express");
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const mongoose = require("mongoose");

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const url = "mongodb://127.0.0.1:27017/testdb";
// const connection = mongoose.createConnection("mongodb://127.0.0.1:27017/testdb");
// const UserSchema = new mongoose.Schema({
//     username: String,
//     hash: String,
//     salt: String
// });
// const user_schema = mongoose.model('User', UserSchema);

// const user_01 = new user_schema({username:"john"});

// mongoose.connect(url, { useNewUrlParser: true }).then(console.log(`MongoDB connected ${url}`)).catch(err => console.log(err));

app.listen(3000, () => {
 console.log("Node server running on port 3000");
});

const MongoClient = require('mongodb').MongoClient;

app.get("/mongo", (req, res, next) => {
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