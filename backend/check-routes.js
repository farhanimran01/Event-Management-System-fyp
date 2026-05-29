// Quick test to check if logout route exists
const authRoutes = require('./src/routes/authRoutes');

console.log('Auth Routes Stack:');
authRoutes.stack.forEach((layer) => {
    if (layer.route) {
        const methods = Object.keys(layer.route.methods).join(',').toUpperCase();
        console.log(`${methods} ${layer.route.path}`);
    }
});
