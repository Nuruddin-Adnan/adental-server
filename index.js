const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const { query } = require('express');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.udttjtr.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

function verifyJWT(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        return res.status(401).send({ message: 'unauthorized access' });
    }
    const token = authHeader.split(' ')[1];

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, function (err, decoded) {
        if (err) {
            return res.status(403).send({ message: 'Forbidden access' });
        }
        req.decoded = decoded;
        next();
    })
}

async function run() {
    try {
        const serviceCollection = client.db('adental').collection('services');
        const reviewCollection = client.db('adental').collection('reviews');

        // jwt
        app.post('/jwt', (req, res) => {
            const user = req.body;
            const token = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' })
            res.send({ token })
        })

        // ############ services api start ############
        app.get('/services', async (req, res) => {
            const query = {};
            const cursor = serviceCollection.find(query).sort({ createdAt: -1 });
            const services = await cursor.toArray();
            res.send(services);
        })

        app.get('/services/limit/:number', async (req, res) => {
            const number = parseInt(req.params.number);
            const query = {};
            const cursor = serviceCollection.find(query).sort({ createdAt: -1 }).limit(number);
            const services = await cursor.toArray();
            res.send(services);
        })

        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const service = await serviceCollection.findOne(query);
            res.send(service)
        })

        app.post('/services', async (req, res) => {
            const data = req.body;
            await serviceCollection.insertOne(data);
            res.send(data);
        })
        // ############ End of services api ############


        // ############ reviews api start ############
        app.get('/reviews', verifyJWT, async (req, res) => {

            const decoded = req.decoded;

            if (decoded.email !== req.query.email) {
                res.status(403).send({ message: 'unauthorized access' })
            }

            let query = {};
            if (req.query.email) {
                query = { email: req.query.email }
            }

            if (req.query.serviceId) {
                query = { serviceId: req.query.serviceId }
            }

            const cursor = reviewCollection.find(query).sort({ createdAt: -1 });
            const reviews = await cursor.toArray();
            res.send(reviews);
        })

        app.get('/serviceReview/:id', async (req, res) => {
            const id = req.params.id;
            const query = { serviceId: id }
            const cursor = reviewCollection.find(query).sort({ createdAt: -1 });
            const reviews = await cursor.toArray();
            res.send(reviews);
        })

        app.get('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await reviewCollection.findOne(query);
            res.send(result);
        })

        app.post('/reviews', async (req, res) => {
            const data = req.body;
            await reviewCollection.insertOne(data);
            res.send(data);
        })

        app.patch('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const review = req.body.review;

            const updatedDoc = {
                $set: {
                    review: review
                }
            }
            const result = await reviewCollection.updateOne(query, updatedDoc);
            res.send(result);
        })

        app.delete('/reviews/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await reviewCollection.deleteOne(query);
            res.send(result);
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