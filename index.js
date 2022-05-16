const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();
const port = process.env.PORT || 5000;

const app = express();

app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.w5rt3.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const fruitCollection = client.db('fruit').collection('item');

        app.get('/fruitItem', async (req, res) => {
            const query = {};
            const cursor = fruitCollection.find(query);
            const fruits = await cursor.toArray();
            res.send(fruits);
        });

        app.get('/fruitItem/:id', async(req, res) =>{
            const id = req.params.id;
            const query={_id: ObjectId(id)};
            const fruit = await fruitCollection.findOne(query);
            res.send(fruit);
            console.log(fruit)
        });

        app.put('/fruitItem/:id', async(req, res)=>{
            const newAmount = req.body;
           const id = req.params.id;
           const filter = {_id:ObjectId(id)};
           const options = { upsert : true };
           const updatedDoc = {
             $set:{amount:newAmount.amount}
           }
           const result = await fruitCollection.updateOne(filter, updatedDoc, options);
           res.send(result)
           console.log(updatedDoc)
          })

          app.delete('/fruitItem/:id', async(req, res)=>{
            const id = req.params.id;
            const query = {_id:ObjectId(id)};
            const result = await fruitCollection.deleteOne(query);
            res.send(result)
          })

        
        app.post('/fruitItem', async(req, res) =>{
            const newItem = req.body;
            const result = await fruitCollection.insertOne(newItem);
            res.send(result);
        });

        // // DELETE
        // app.delete('/service/:id', async(req, res) =>{
        //     const id = req.params.id;
        //     const query = {_id: ObjectId(id)};
        //     const result = await serviceCollection.deleteOne(query);
        //     res.send(result);
        // });

    }
    finally {
        // await client.close();
    }
}

run().catch(console.dir);

app.listen(port, () => {
    console.log('Listening to port', port);
})

app.get('/', async (req, res) => {
    res.send('Running Server');
});