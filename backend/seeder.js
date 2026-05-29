const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./src/models/User');
const Event = require('./src/models/Event');
const Ticket = require('./src/models/Ticket');

dotenv.config();

const seedData = async () => {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to MongoDB for seeding...');

        // Clear existing data (optional but recommended for clean seed)
        await User.deleteMany({ email: { $ne: 'np03cs4a230270@heraldcollege.edu.np' } }); // Keep the user's primary account if any, or just clear all
        await Event.deleteMany({});
        await Ticket.deleteMany({});

        console.log('Existing data cleared (except primary user).');

        // 1. Create Organizer
        const organizer = await User.create({
            name: 'Sample Organizer',
            email: 'organizer@example.com',
            password: 'password123',
            role: 'Organizer',
            phone: '9800000000',
            location: 'Kathmandu'
        });

        // 2. Create attendee with User role (User role only)
        const attendee = await User.create({
            name: 'Sample Test User',
            email: 'testuser@example.com',
            password: 'TestUser@123',
            role: 'User',
            phone: '9800000001',
            location: 'Lalitpur'
        });

        console.log('Sample test user created.');

        // 3. Create Events
        const events = await Event.insertMany([
            {
                title: 'Tech Summit 2026',
                description: 'A grand tech event for developers and innovators.',
                date: new Date('2026-05-15'),
                time: '10:00 AM',
                location: 'Everest Hotel, Kathmandu',
                category: 'Technology',
                organizer: organizer._id,
                capacity: 100,
                ticketTypes: [
                    { name: 'Early Bird', price: 50, quantity: 20, sold: 0 },
                    { name: 'General', price: 100, quantity: 80, sold: 0 }
                ],
                status: 'upcoming'
            },
            {
                title: 'Music Festival 2026',
                description: 'Experience the best local and international bands.',
                date: new Date('2026-06-20'),
                time: '4:00 PM',
                location: 'Tundikhel, Kathmandu',
                category: 'Entertainment',
                organizer: organizer._id,
                capacity: 500,
                ticketTypes: [
                    { name: 'VIP', price: 500, quantity: 50, sold: 0 },
                    { name: 'General', price: 150, quantity: 450, sold: 0 }
                ],
                status: 'upcoming'
            },
            {
                title: 'Business Networking Night',
                description: 'Connect with top industry leaders and entrepreneurs.',
                date: new Date('2026-04-10'),
                time: '6:30 PM',
                location: 'Soaltee Crowne Plaza',
                category: 'Business',
                organizer: organizer._id,
                capacity: 50,
                ticketTypes: [
                    { name: 'Networking Pass', price: 200, quantity: 50, sold: 0 }
                ],
                status: 'upcoming'
            }
        ]);

        console.log('Sample events created.');

        // 4. Create a Sample Ticket for the attendee
        const techEvent = events[0];
        const ticket = await Ticket.create({
            event: techEvent._id,
            user: attendee._id,
            ticketType: {
                name: 'Early Bird',
                price: 50
            },
            paymentStatus: 'paid',
            qrCode: `QR-${techEvent._id}-${attendee._id}-${Date.now()}`
        });

        // Update event registered users and sold count
        techEvent.registeredUsers.push(attendee._id);
        techEvent.ticketTypes[0].sold += 1;
        techEvent.budget.total += 50;
        await techEvent.save();

        console.log('Sample ticket created.');

        console.log('--- SEEDING COMPLETE ---');
        await mongoose.disconnect();
    } catch (err) {
        console.error('Seeding Error:', err);
        process.exit(1);
    }
};

seedData();
