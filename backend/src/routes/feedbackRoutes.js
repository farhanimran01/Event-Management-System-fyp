const express = require('express');
const { submitFeedback, getEventFeedback } = require('../controllers/feedbackController');
const { protect } = require('../middleware/auth');

const router = express.Router();

router.post('/', protect, submitFeedback);
router.get('/event/:eventId', getEventFeedback);

module.exports = router;
