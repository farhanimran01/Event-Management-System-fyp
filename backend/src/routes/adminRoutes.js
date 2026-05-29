const express = require('express');
const {
    getAllUsers,
    getUserById,
    updateUser,
    updateUserRole,
    deleteUser,
    getSystemAnalytics,
    getAuditLogs,
    getUserActivity,
    createOrganizer
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes require Admin authorization
router.use(protect);
router.use(authorize('Admin'));

router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id', updateUser);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);
router.get('/users/:id/activity', getUserActivity);

router.post('/organizers', createOrganizer);

router.get('/stats', getSystemAnalytics);
router.get('/analytics', getSystemAnalytics);
router.get('/audit-logs', getAuditLogs);

module.exports = router;
