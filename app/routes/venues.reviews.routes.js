const reviews = require('../controllers/venues.reviews.controller');

module.exports = function(app) {
    app.route('/venues/:id/reviews')
        .get(reviews.listFromVenue)
        .post(reviews.createReview);

    app.route('/isers/:id/reviews')
        .get(reviews.listFromUser);
};