const Review = require('../models/venues.reviews.model');

exports.listFromVenue = function(req, res) {
    let venueId = req.params.id;

    Review.getReviewsFromVenue(venueId, function(result) {
        res.json(result);
    });
};

exports.listFromUser = function(req, res) {
    let userId = req.params.id;

    Review.getReviewsFromUser(userId, function(result) {
        res.json(result);
    });
};

exports.createReview = function(req, res) {
    let venueId = req.params.id;

    let review_data = req.body;
    let userId = null; // TODO where do i get the user id number from???

    let values = [
        [venueId],
        [userId],
        [review_data.reviewBody],
        [review_data.starRating],
        [review_data.costRating]
    ];
    Review.insertReview(values, function(result) {
        res.json(result);
    });
};