const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./src/models/User');
const Event = require('./src/models/Event');

async function seedDatabase() {
    try {
        // Try to connect to DB with fallback
        let connected = false;

        // Try Cloud MongoDB first
        try {
            await mongoose.connect(process.env.MONGODB_URI, {
                serverSelectionTimeoutMS: 5000,
                family: 4
            });
            console.log('✓ Connected to MongoDB Atlas...');
            connected = true;
        } catch (cloudError) {
            console.log('⚠ Cloud MongoDB unavailable, trying local...');
            
            // Try local MongoDB
            try {
                await mongoose.connect('mongodb://127.0.0.1:27017/event-management', {
                    serverSelectionTimeoutMS: 5000,
                    family: 4
                });
                console.log('✓ Connected to Local MongoDB...');
                connected = true;
            } catch (localError) {
                console.log('⚠ Local MongoDB unavailable, trying in-memory...');
                
                // Try in-memory MongoDB
                try {
                    const { MongoMemoryServer } = require('mongodb-memory-server');
                    const mongod = await MongoMemoryServer.create();
                    const uri = mongod.getUri();
                    await mongoose.connect(uri);
                    console.log('✓ Connected to In-Memory MongoDB...');
                    connected = true;
                } catch (memoryError) {
                    throw new Error('Could not connect to any MongoDB instance');
                }
            }
        }

        if (!connected) {
            throw new Error('Failed to establish database connection');
        }

        console.log('\n📝 Seeding database with admin account...\n');

        // Create Admin User (or skip if exists)
        let adminUser = await User.findOne({ email: 'admin@example.com' });
        if (!adminUser) {
            adminUser = new User({
                name: 'Admin User',
                email: 'admin@example.com',
                password: 'Admin@123',
                role: 'Admin',
                phone: '+1234567890',
                location: 'System Admin',
                verified: true
            });
            await adminUser.save();
            console.log('✓ Admin user created');
        } else {
            console.log('ℹ Admin user already exists');
        }

        console.log('\n✅ Database seeding completed successfully!');
        console.log('\n📝 GETTING STARTED:\n');
        console.log('Admin Account:');
        console.log('  Email: admin@example.com');
        console.log('  Password: Admin@123');
        console.log('  URL: http://localhost:3000/login/admin');
        console.log('\n➡️  Use Admin account to create Organizers and manage the system.');
        console.log('➡️  Organizers can self-register or be created by Admin.');
        console.log('➡️  Users can self-register to book events.');

    } catch (error) {
        console.error('Error seeding database:', error.message);
    } finally {
        await mongoose.connection.close();
        console.log('\nDatabase connection closed');
    }
}

// Run seeder
seedDatabase();
