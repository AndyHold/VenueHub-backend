const Review = require('../models/venues.reviews.model');

exports.listFromVenue = function(req, res) {
    // Get the venue id from the parameters
    let venueId = req.params.id;
    // Call the model class to perform the logic and call the database.
    Review.getReviewsFromVenue(venueId, function(code, result) {
        // If the return code is 404 - Not Found
        if (code === 404) {
            // Respond with the code
            res.sendStatus(code);
        // Otherwise
        } else {
            // Respond with the code and the results
            res.status(code).send(result);
        }
    });
};

exports.listFromUser = function(req, res) {
    // Get the user id from the parameters
    let userId = req.params.id;
    // Call the model class to perform the logic and call the database.
    Review.getReviewsFromUser(userId, function(code, result) {
        // If the return code is 404 - Not Found
        if (code === 404) {
            // Respond with the code
            res.sendStatus(code);
            // Otherwise
        } else {
            // Respond with the code and the results
            res.status(code).send(result);
        }
    });
};

exports.createReview = function(req, res) {
    // let venueId = req.params.id;
    //
    // let review_data = req.body;
    // let userId = null;
    //
    // let values = [
    //     [venueId],
    //     [userId],
    //     [review_data.reviewBody],
    //     [review_data.starRating],
    //     [review_data.costRating]
    // ];
    // Review.insertReview(values, function(result) {
    //     res.json(result);
    // });
    res.sendStatus(200);
};