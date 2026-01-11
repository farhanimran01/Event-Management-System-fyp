const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const checkData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        const dbName = mongoose.connection.db.databaseName;
        console.log(`Current Database: ${dbName}`);

        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('Collections in DB:');
        for (const col of collections) {
            const count = await mongoose.connection.collection(col.name).countDocuments();
            console.log(`- ${col.name}: ${count}`);
        }
        await mongoose.disconnect();
    } catch (err) {
        console.error('Error:', err.message);
    }
};

checkData();
