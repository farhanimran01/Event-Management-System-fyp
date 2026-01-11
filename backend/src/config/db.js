const mongoose = require('mongoose');

// Global variable to prevent GC of MongoMemoryServer
let mongod = null;

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            serverSelectionTimeoutMS: 5000,
            family: 4 // Use IPv4, skip IPv6
        });

        console.log(`MongoDB Connected: ${conn.connection.host} `);
    } catch (error) {
        console.error(`Cloud DB Error: ${error.message} `);
        console.log("Attempting to connect to local MongoDB...");

        try {
            // Ensure previous connection is closed
            await mongoose.disconnect();

            const conn = await mongoose.connect("mongodb://127.0.0.1:27017/event-management", {
                serverSelectionTimeoutMS: 5000,
                family: 4
            });
            console.log(`MongoDB Connected(Local): ${conn.connection.host} `);
        } catch (localError) {
            console.error(`Local DB Error: ${localError.message} `);

            console.log("Attempting to start In-Memory MongoDB...");
            try {
                // Ensure previous connection is closed
                await mongoose.disconnect();

                const { MongoMemoryServer } = require('mongodb-memory-server');
                mongod = await MongoMemoryServer.create();
                const uri = mongod.getUri();

                const conn = await mongoose.connect(uri);
                console.log(`MongoDB Connected(In - Memory): ${conn.connection.host} `);
                console.log("⚠️ WARNING: Using In-Memory Database. Data will be lost on restart.");
            } catch (memoryError) {
                console.error(`In - Memory DB Error: ${memoryError.message} `);
                process.exit(1);
            }
        }
    }
};

module.exports = connectDB;
