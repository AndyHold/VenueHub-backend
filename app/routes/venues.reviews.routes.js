const reviews = require('../controllers/venues.reviews.controller');

module.exports = function(app) {
    app.route(app.rootUrl + '/venues/:id/reviews')
        .get(reviews.listFromVenue)
        .post(reviews.createReview);

    app.route(app.rootUrl + '/isers/:id/reviews')
        .get(reviews.listFromUser);
};