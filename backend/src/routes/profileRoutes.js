const express = require('express');
const {
    getProfile,
    updateProfile,
    updatePassword
} = require('../controllers/profileController');
const { protect } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Multer storage
const storage = multer.diskStorage({
    destination(req, file, cb) {
        cb(null, 'uploads/');
    },
    filename(req, file, cb) {
        cb(
            null,
            `${file.fieldname}-${req.user.id}-${Date.now()}${path.extname(file.originalname)}`
        );
    }
});

function checkFileType(file, cb) {
    const filetypes = /jpg|jpeg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);

    if (extname && mimetype) {
        return cb(null, true);
    } else {
        cb('Images only!');
    }
}

const upload = multer({
    storage,
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    }
});

const router = express.Router();

router.use(protect); // All profile routes protected

router.get('/', getProfile);
router.put('/update', updateProfile);
router.put('/change-password', updatePassword);
router.post('/upload', protect, upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ success: false, error: 'No file uploaded' });
    }
    const publicPath = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
    res.status(200).json({
        success: true,
        data: publicPath
    });
});

module.exports = router;
