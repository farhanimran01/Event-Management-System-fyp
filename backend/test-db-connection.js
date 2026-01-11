require('dotenv').config();
const mongoose = require('mongoose');

const uri = process.env.MONGODB_URI;

console.log(`Testing Connection to: ${uri.replace(/:([^:@]+)@/, ':****@')}`); // Mask password

async function testConnection() {
    try {
        console.log('Attempting to connect...');
        const conn = await mongoose.connect(uri, {
            serverSelectionTimeoutMS: 5000,
            family: 4
        });
        console.log('✅ Connected successfully!');
        console.log('Host:', conn.connection.host);
        console.log('Database Name:', conn.connection.name);

        // List collections to verify access
        const collections = await conn.connection.db.listCollections().toArray();
        console.log('Collections:', collections.map(c => c.name));

        await mongoose.disconnect();
    } catch (err) {
        console.error('❌ Connection Failed:', err.message);
        if (err.cause) console.error('Cause:', err.cause);
    }
}

testConnection();
