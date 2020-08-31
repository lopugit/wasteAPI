
console.log("Creating database index")

let config = require('config')
// create mongoDB connection to create index
let MongoClient = require('mongodb').MongoClient;
let uri = config.uri
let client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// connect to mongodb connection
client.connect(err => {
  let db = client.db("wastee");
  let items = db.collection("items");

  // creating indexes for name and aliases
  items.createIndex({ name: 1 });
  items.createIndex({ aliases: 1 });
  console.log("Indexes created")
});

client.close()
console.log("client closed...")

