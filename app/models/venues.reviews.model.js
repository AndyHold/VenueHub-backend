const db = require('../../config/db');

exports.getReviewsFromVenue = function(venueId, done) {
    db.get_pool().query('SELECT * FROM Review WHERE reviewed_venue_id = ?', [[venueId]], function (err, rows) {

        if (err) return done({"ERROR": "Error selecting"});

        return done(rows)
    });
};

exports.getReviewsFromUser = function(userId, done) {
    db.get_pool().query('SELECT * FROM Review WHERE reviewed_author_id = ?', [[userId]], function (err, rows) {

        if (err) return done({"ERROR": "Error selecting"});

        return done(rows)
    });
};

exports.insertReview = function(values, done) {

    db.get_pool().query('INSERT INTO Review (reviewed_venue_id, review_author_id, review_body, star_rating, cost_rating) VALUES (?, ?, ?, ?, ?', values, function(err, result) {

        if (err) return done(err);

        done(result);
    });
};