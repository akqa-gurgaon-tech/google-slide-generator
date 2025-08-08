import { MongoClient, ServerApiVersion } from 'mongodb';


const uri = process.env.MONGO_URI!;

export class MongoDBClient {
    private static instance: MongoDBClient;

    private client: MongoClient;

    private constructor() {
        this.client = new MongoClient(uri, {
            serverApi: {
                version: ServerApiVersion.v1,
                strict: true,
                deprecationErrors: true,
                }
            });
        this.run().catch(console.dir);
    }

    public static getInstance(): MongoDBClient {
        if (!MongoDBClient.instance) {
            MongoDBClient.instance = new MongoDBClient();
        }
        return MongoDBClient.instance;
    }

    private async run() {
        try {
            // Connect the client to the server	(optional starting in v4.7)
            await this.client.connect();
            // Send a ping to confirm a successful connection
            await this.client.db("admin").command({ ping: 1 });
            console.log("Pinged your deployment. You successfully connected to MongoDB!");
        } catch (e) {
            console.error("Error connecting to MongoDB:", e);
            this.client.close();
        }
    }

    public async close() {
        if (this.client) {
            await this.client.close();
            console.log("MongoDB connection closed.");
        }
        MongoDBClient.instance = null; // Reset the instance
    }
}