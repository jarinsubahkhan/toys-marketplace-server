const express = require('express');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
app.use(cors());
app.use(express.json());

console.log(process.env.DB_USER)

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster01.fjx0jhm.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

const db = client.db("softToys");
const toysCollection = db.collection("toys");

// console.log("database connected")

const indexKeys = { name: 1 };
const indexOptions = { name: "name" };

const result = await toysCollection.createIndex(indexKeys, indexOptions);


app.get("/toyName/:name", async (req, res)=>{
    const searchText = req.params.name;

    const result =await toysCollection.find({
        $or: [
{ name: { $regex:searchText, $options: "i" }},
        ],
    }).toArray();

    res.send(result);
});

app.get('/toys/:id', async(req, res)=>{
    const id = req.params.id;
    const query = {_id: new ObjectId(id)}
    const result = await toysCollection.findOne(query);
    res.send(result)
})

app.patch('/toys/:id', async(req, res) => {
    const id = req.params.id
    const updateToy = req.body;
    const filter = {_id : new ObjectId(id)}
    const updateDoc={
        $set:{
            ...updateToy
        }
    }
    const result = await toysCollection.updateOne(filter, updateDoc)
    res.send(result)
})

app.delete('/toys/:id', async(req, res) => {
    const id = req.params.id;
    const query = { _id: new ObjectId(id) }
    const result = await toysCollection.deleteOne(query);
    res.send(result);
})


app.post("/postToys", async (req, res) => {
    const body = req.body;
    body.createdAt = new Date();

    const result = await toysCollection.insertOne(body);
    console.log(result);
    res.send(result);
});

app.get('/allToys', async(req,res)=>{
    const cursor = toysCollection.find();
    const result = await cursor.toArray();
    res.send(result);
})

app.get("/allToys/:text", async(req, res) =>{
    console.log(req.params.text);
    if(req.params.text == "animal" || req.params.text == "character" || req.params.text == "fantasy"){
        const result = await toysCollection.find({ category: req.params.text }).sort({ createdAt: -1 }).toArray();
        console.log(result)
      return  res.send(result);
    }
     const result = await toysCollection.find({}).sort({ createdAt: -1 }).toArray();
     res.send(result);
});

app.get("/myToys/:email",async(req, res)=>{
console.log(req.params.email);
const result = await toysCollection.find({ email: req.params.email }).toArray();
res.send(result);
});

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res)=>{
    res.send('server is running')
});

app.listen(port, () => {
    console.log(`server is running on port ${port}`)
})