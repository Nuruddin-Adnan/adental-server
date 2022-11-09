const express = require('express');
var cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.udttjtr.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        const serviceCollection = client.db('adental').collection('services');
        const reviewCollection = client.db('adental').collection('reviews');

        // ############ services api start ############
        app.get('/services', async (req, res) => {
            const query = {};
            const cursor = serviceCollection.find(query);
            const services = await cursor.toArray();
            res.send(services);
        })

        app.get('/services/limit/:number', async (req, res) => {
            const number = parseInt(req.params.number);
            const query = {};
            const cursor = serviceCollection.find(query).limit(number);
            const services = await cursor.toArray();
            res.send(services);
        })

        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const service = await serviceCollection.findOne(query);
            res.send(service)
        })
        // ############ End of services api ############


        // ############ reviews api start ############
        app.get('/reviews', async (req, res) => {
            const query = {};
            const cursor = reviewCollection.find(query).sort({ createdAt: -1 });
            const reviews = await cursor.toArray();
            res.send(reviews);
        })
        app.post('/reviews', async (req, res) => {
            const data = req.body;
            await reviewCollection.insertOne(data);
            res.send(data);
        })
        // ############ End of reviews api ############


        // ############ ? api start ############
        // ############ End of ? api ############
    }
    finally {

    }
}
run().catch(err => console.error(err))


app.get('/', (req, res) => {
    res.send('Hello Adental!')
})

app.listen(port, () => {
    console.log(`Adental app listening on port ${port}`)
})