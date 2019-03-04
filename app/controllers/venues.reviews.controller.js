const Review = require('../models/venues.reviews.model');

exports.listFromVenue = function(req, res) {
    // Get the venue id from the parameters
    let venueId = parseInt(req.params.id);
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
    let userId = parseInt(req.params.id);
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
    // Get the venue ID from the params
    let venueId = parseInt(req.params.id);
    // Get the review data from the body
    let reviewData = req.body;
    // Get the auth token from the headers
    let authToken = req.headers["x-authorization"];
    // Call the model class to perform the logic and call the database
    Review.insertReview(venueId, reviewData, authToken, function(code) {
        // Send the response code
        res.sendStatus(code);
    });
};