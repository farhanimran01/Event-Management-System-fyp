try {
    console.log('Testing authRoutes...');
    require('./src/routes/authRoutes');
    console.log('Testing userRoutes...');
    require('./src/routes/userRoutes');
    console.log('Testing eventRoutes...');
    require('./src/routes/eventRoutes');
    console.log('Testing ticketRoutes...');
    require('./src/routes/ticketRoutes');
    console.log('Testing feedbackRoutes...');
    require('./src/routes/feedbackRoutes');
    console.log('Testing notificationRoutes...');
    require('./src/routes/notificationRoutes');
    console.log('All tests passed!');
} catch (err) {
    console.error('Failed to require route:');
    console.error(err);
}
