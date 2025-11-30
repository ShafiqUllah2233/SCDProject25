require('dotenv').config();
const { MongoClient } = require('mongodb');

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017";
const DB_NAME = process.env.DB_NAME || "vaultDB";
const COLLECTION_NAME = process.env.COLLECTION_NAME || "records";

let db;
let client;
let isConnected = false;

async function connectMongo() {
    try {
        client = new MongoClient(MONGO_URI, {
            serverSelectionTimeoutMS: 3000,
            connectTimeoutMS: 3000
        });
        await client.connect();
        db = client.db(DB_NAME);
        isConnected = true;
        console.log("✅ Connected to MongoDB successfully");
        return db;
    } catch (error) {
        console.log("⚠️  MongoDB not available. Using JSON file storage instead.");
        isConnected = false;
        return null;
    }
}

function getCollection() {
    if (!db || !isConnected) {
        return null;
    }
    return db.collection(COLLECTION_NAME);
}

async function closeMongo() {
    if (client && isConnected) {
        await client.close();
        isConnected = false;
    }
}

function isMongoConnected() {
    return isConnected;
}

module.exports = {
    connectMongo,
    getCollection,
    closeMongo,
    isMongoConnected
};