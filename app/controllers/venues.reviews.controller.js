const Review = require('../models/venues.reviews.model');

exports.listFromVenue = function(req, res) {
    // let venueId = req.params.id;
    //
    // Review.getReviewsFromVenue(venueId, function(result) {
    //     res.json(result);
    // });

    res.sendStatus(200);
};

exports.listFromUser = function(req, res) {
    // let userId = req.params.id;
    //
    // Review.getReviewsFromUser(userId, function(result) {
    //     res.json(result);
    // });
    res.sendStatus(200);
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