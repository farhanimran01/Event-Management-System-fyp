const Vendor = require('../models/Vendor');
const User = require('../models/User');

// @desc    Get all vendors
// @route   GET /api/vendors
// @access  Public
exports.getVendors = async (req, res, next) => {
    try {
        const vendors = await Vendor.find().populate('user', 'name email location phone');

        res.status(200).json({
            success: true,
            count: vendors.length,
            data: vendors
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Create/Update Vendor Profile
// @route   POST /api/vendors
// @access  Private (Vendor)
exports.updateVendorProfile = async (req, res, next) => {
    try {
        req.body.user = req.user.id;

        // Upsert
        const vendor = await Vendor.findOneAndUpdate(
            { user: req.user.id },
            req.body,
            { new: true, upsert: true, runValidators: true }
        );

        res.status(200).json({
            success: true,
            data: vendor
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get Vendor Profile (Me)
// @route   GET /api/vendors/me
// @access  Private
exports.getMe = async (req, res, next) => {
    try {
        const vendor = await Vendor.findOne({ user: req.user.id }).populate('user', 'name email');

        if (!vendor) {
            return res.status(404).json({ success: false, error: 'Vendor profile not found' });
        }

        res.status(200).json({
            success: true,
            data: vendor
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Add contract to vendor (Organizer)
// @route   POST /api/vendors/:id/contract
// @access  Private (Organizer)
exports.addContract = async (req, res, next) => {
    try {
        const vendor = await Vendor.findById(req.params.id);

        if (!vendor) {
            return res.status(404).json({ success: false, error: 'Vendor not found' });
        }

        const contract = {
            event: req.body.eventId,
            amount: req.body.amount,
            terms: req.body.terms,
            status: 'Draft'
        };

        vendor.contracts.push(contract);
        await vendor.save();

        res.status(200).json({
            success: true,
            data: vendor
        });

    } catch (err) {
        next(err);
    }
};
