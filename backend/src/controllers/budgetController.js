const Event = require('../models/Event');

// @desc    Get system-wide financial analytics (Admin)
// @route   GET /api/analytics/admin
// @access  Private (Admin)
exports.getAdminAnalytics = async (req, res, next) => {
    try {
        const events = await Event.find().select('budget ticketTypes');

        let totalIncome = 0;
        let totalExpenses = 0;

        events.forEach(event => {
            // Income from tickets sold
            if (event.ticketTypes) {
                event.ticketTypes.forEach(type => {
                    totalIncome += (type.sold * type.price);
                });
            }

            // Expenses from budget
            if (event.budget && event.budget.total) {
                // Assuming budget.total tracks expenses or we sum expenes array
                // If we have detailed expenses array
                if (event.budget.expenses) {
                    event.budget.expenses.forEach(exp => {
                        totalExpenses += exp.amount;
                    });
                }
            }
        });

        res.status(200).json({
            success: true,
            data: {
                totalIncome,
                totalExpenses,
                profit: totalIncome - totalExpenses,
                totalEvents: events.length
            }
        });
    } catch (err) {
        next(err);
    }
};

// @desc    Get organizer analytics
// @route   GET /api/analytics/organizer
// @access  Private (Organizer)
exports.getOrganizerAnalytics = async (req, res, next) => {
    try {
        const events = await Event.find({ organizer: req.user.id }).select('budget ticketTypes title date');

        let totalIncome = 0;
        let totalExpenses = 0;
        const eventStats = [];

        events.forEach(event => {
            let eventIncome = 0;
            let eventExpenses = 0;

            if (event.ticketTypes) {
                event.ticketTypes.forEach(type => {
                    eventIncome += (type.sold * type.price);
                });
            }

            if (event.budget && event.budget.expenses) {
                event.budget.expenses.forEach(exp => {
                    eventExpenses += exp.amount;
                });
            }

            totalIncome += eventIncome;
            totalExpenses += eventExpenses;

            eventStats.push({
                eventId: event._id,
                title: event.title,
                date: event.date,
                income: eventIncome,
                expenses: eventExpenses,
                profit: eventIncome - eventExpenses
            });
        });

        res.status(200).json({
            success: true,
            data: {
                totalIncome,
                totalExpenses,
                profit: totalIncome - totalExpenses,
                events: eventStats
            }
        });

    } catch (err) {
        next(err);
    }
};
