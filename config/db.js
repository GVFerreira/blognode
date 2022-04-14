const { MongoClient, ServerApiVersion } = require('mongodb');
const uri = "mongodb+srv://gust4v0:rWe8qg8cwWoQ2gJw@blognode.5k7cp.mongodb.net/blognode?retryWrites=true&w=majority";
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
client.connect(err => {
  const collection = client.db("test").collection("devices");
  // perform actions on the collection object
  client.close();
});