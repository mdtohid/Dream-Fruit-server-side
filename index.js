const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { query } = require('express');
require('dotenv').config();
var jwt = require('jsonwebtoken');
const port = process.env.PORT || 5000;

const app = express();

app.use(cors());
app.use(express.json());

function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;
    // console.log('inside verify jwt', authHeader);
    if (!authHeader) {
        res.status(401).send({ message: 'Unauthorized access' })
    }
    const token = authHeader.split(' ')[1];
    // console.log(token);
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            res.status(403).send({ message: 'Forbidden access' })

        }
        // console.log('decoded', decoded)
        req.decoded = decoded;
        next()
    })
}


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.frhp1j5.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const productCollection = client.db('productsList').collection('product');

        const myItemCollection = client.db('myItemList').collection('myItem');


        app.listen(port, () => {
            console.log('Listening to port', port);
        })

        app.get('/', async (req, res) => {
            res.send('Running Server');
        });

        app.get('/manageInventory', async (req, res) => {
            const query = {};
            const cursor = productCollection.find(query);
            const products = await cursor.toArray();
            // console.log(products);
            res.send(products);
        })

        app.get('/inventory', async (req, res) => {
            const query = {};
            const cursor = productCollection.find(query);
            const products = await cursor.toArray();
            // console.log(products);
            res.send(products);
        })

        app.post('/inventory', async (req, res) => {
            // console.log(req.body);
            const product = req.body;
            const result = productCollection.insertOne(product);
            res.send(result);
        })

        app.get('/inventory/:id', async (req, res) => {
            const id = req.params;
            const query = { _id: new ObjectId(id) };
            // console.log(query);
            const product = await productCollection.findOne(query);
            // console.log(product);
            res.send(product);
        })

        app.put('/inventory/:id', async (req, res) => {
            const id = req.params;
            const newQuantity = await req.body.newQuantity;
            // console.log(newQuantity);
            const filter = { _id: new ObjectId(id) };
            const options = { upsert: true };
            const updateNewQuantity = {
                $set: {
                    quantity: newQuantity
                },
            };
            const result = await productCollection.updateOne(filter, updateNewQuantity, options);
            res.send(result);
        })

        app.delete('/inventory/:id', async (req, res) => {
            const id = req.params.id;
            // console.log(id);
            const query = { _id: new ObjectId(id) };
            const result = await productCollection.deleteOne(query);
            res.send(result);
        });

        app.get('/myItem', verifyJWT, async (req, res) => {
            const email = req?.query?.email;
            const decodedEmail = req?.decoded?.email;
            console.log(email);
            console.log(decodedEmail);
            if (email === decodedEmail) {
                const query = {};
                const cursor = myItemCollection.find(query);
                const result = await cursor.toArray();
                // console.log(result);
                res.send(result);
            }
            else {
                res.status(403).send('Forbidden access')
            }
        })

        app.post('/myItem/:id', async (req, res) => {
            // console.log(req.params);
            const id = req.params;
            const query = { _id: ObjectId(id) };
            const product = await productCollection.findOne(query);
            const myItem = await myItemCollection.findOne(query);
            const productId = String(product?._id);
            const myItemId = String(myItem?._id);
            if (productId !== myItemId) {
                const result = myItemCollection.insertOne(product);
                res.send(result);
            }
            else {
                console.log('Already added in myItem');
                res.send('Already added in myItem');
            }
        })

        app.delete('/myItem/:id', async (req, res) => {
            const id = req.params.id;
            // console.log(id);
            const query = { _id: new ObjectId(id) };
            const result = await myItemCollection.deleteOne(query);
            const query1 = {};
            const cursor = myItemCollection.find(query1);
            const result1 = await cursor.toArray();
            console.log({result, result1});
            // console.log(result1);
            // res.send(result1);
            res.send({result, result1});
        });

        app.post('/login', async (req, res) => {
            const user = req.body;
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' });
            // console.log(process.env.ACCESS_TOKEN_SECRET);
            // console.log(accessToken);
            // console.log({accessToken});
            res.send({ accessToken });
        })



        // app.get('/fruitItem', async (req, res) => {
        //     const query = {};
        //     const cursor = fruitCollection.find(query);
        //     const fruits = await cursor.toArray();
        //     res.send(fruits);
        // });

        // app.get('/fruitItem/:id', async (req, res) => {
        //     const id = req.params.id;
        //     const query = { _id: ObjectId(id) };
        //     const fruit = await fruitCollection.findOne(query);
        //     res.send(fruit);
        //     console.log(fruit)
        // });

        // app.put('/fruitItem/:id', async (req, res) => {
        //     const newAmount = req.body;
        //     const id = req.params.id;
        //     const filter = { _id: ObjectId(id) };
        //     const options = { upsert: true };
        //     const updatedDoc = {
        //         $set: { amount: newAmount.amount }
        //     }
        //     const result = await fruitCollection.updateOne(filter, updatedDoc, options);
        //     res.send(result)
        //     console.log(updatedDoc)
        // })

        // app.delete('/fruitItem/:id', async (req, res) => {
        //     const id = req.params.id;
        //     const query = { _id: ObjectId(id) };
        //     const result = await fruitCollection.deleteOne(query);
        //     res.send(result)
        // })


        // app.post('/fruitItem', async (req, res) => {
        //     const newItem = req.body;
        //     const result = await fruitCollection.insertOne(newItem);
        //     res.send(result);
        // });

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



