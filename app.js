var express = require("express");
const bodyParser = require('body-parser');
const cors = require('cors');
var app = express();

app.use(cors());

// Configuring body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.listen(3000, () => {
 console.log("Server running on port 3000");
});

var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://127.0.0.1:27017";

MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  console.log("Database created!");
  db.close();
});



app.get("/url", (req, res, next) => {
    res.json(["Tony","Lisa","Michael","Ginger","Food"]);
   });

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


app.post("/createUser",  (req, res, next) => {
  MongoClient.connect(url, async function(err, db) {
    console.log(req);
    var user_id = req.body.user_id;
    var name = req.body.user_name;
    var password = req.body.password;
    var status = req.body.status;
    console.log(req.body);
    console.log(`user ID : ${user_id} , name: ${name} , password:${password} , status:${status}`);
    var dbo = db.db("testdb");
    const collection = dbo.collection("login_users");
    // create a document to be inserted
    const doc = { user_id: user_id, password: password , name: name, status:status};
    const result = await collection.insertOne(doc);
    console.log(
      `${result.insertedCount} documents were inserted with the _id: ${result.insertedId}`,
    );

    res.status(200).send(`${result.insertedCount} documents were inserted with the _id: ${result.insertedId}`);
  });
})