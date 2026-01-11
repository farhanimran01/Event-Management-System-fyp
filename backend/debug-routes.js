const express = require('express');
const app = express();

try {
    app.use('/api/auth', require('./src/routes/authRoutes'));
    app.use('/api/notifications', require('./src/routes/notificationRoutes'));
    app.use('/api/tickets', require('./src/routes/ticketRoutes'));

    function print(path, layer) {
        if (layer.route) {
            layer.route.stack.forEach(print.bind(null, path + layer.route.path))
        } else if (layer.name === 'router' && layer.handle.stack) {
            layer.handle.stack.forEach(print.bind(null, path + (layer.regexp.source || '')))
        } else if (layer.method) {
            console.log('%s /api/%s', layer.method.toUpperCase(), path.split('/api/')[1] || path)
        }
    }

    app._router.stack.forEach(print.bind(null, ''))
} catch (err) {
    console.error(err);
}
