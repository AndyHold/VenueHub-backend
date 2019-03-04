const db = require('../../config/db');

exports.getReviewsFromVenue = function(venueId, done) {
    // Call the database to retrieve the reviews from the given venue
    db.getPool().query('SELECT review_author_id AS reviewAuthor, review_body AS reviewBody, ' +
        'star_rating AS starRating, cost_rating AS costRating, time_posted AS timePosted ' +
        'FROM Review WHERE reviewed_venue_id=? ORDER BY time_posted DESC', [[venueId]], function (err, reviewRows) {
        // If the database returns an error or empty rows
        if (err || reviewRows.length === 0) {
            // Return the done function with a 404 - Not Found code
            return done(404);
        // Otherwise
        } else {
            // For each review
            for (let i = 0; i < reviewRows.length; i++) {
                // Call the database to retrieve the authors details
                db.getPool().query("SELECT user_id AS userId, username FROM User WHERE user_id=?", [reviewRows[i]["reviewAuthor"]], function (err, userRows) {
                    // If the database doesn't return an error
                    if (!err) {
                        // Update the review user in the reviewRows
                        reviewRows[i]["reviewAuthor"] = userRows[0];
                    }
                    // If this is the last review in the list
                    if (i === reviewRows.length - 1) {
                        // Return the done function with a 200 - OK code and the results
                        return done(200, reviewRows);
                    }
                });
            }
        }
    });
};

exports.getReviewsFromUser = function(userId, done) {
    // Call the database to retrieve the reviews from the given user
    db.getPool().query('SELECT review_author_id AS reviewAuthor, review_body AS reviewBody, ' +
        'star_rating AS starRating, cost_rating AS costRating, time_posted AS timePosted, ' +
        'reviewed_venue_id AS venue FROM Review WHERE review_author_id=? ORDER BY time_posted DESC', [userId], function (err, reviewRows) {
        // If the database returns an error or empty rows
        if (err || reviewRows.length === 0) {
            // Return the done function with a 404 - Not Found code
            return done(404);
            // Otherwise
        } else {
            // For each review
            for (let i = 0; i < reviewRows.length; i++) {
                // Call the database to retrieve the authors details
                db.getPool().query("SELECT user_id AS userId, username FROM User WHERE user_id=?", [reviewRows[i]["reviewAuthor"]], function (err, userRows) {
                    // If the database doesn't return an error
                    if (!err) {
                        // Update the review user in the reviewRows
                        reviewRows[i]["reviewAuthor"] = userRows[0];

                    }
                    // Call the database to retrieve the venue data for the review
                    db.getPool().query("SELECT Venue.venue_id AS venueId, venue_name AS VenueName, " +
                        "categoryName, city, short_description AS shortDescription, " +
                        "COALESCE(photo_filename, NULL) AS primaryPhoto FROM Venue LEFT JOIN (SELECT photo_filename, " +
                        "venue_id FROM VenuePhoto WHERE is_primary) AS Photo ON Venue.venue_id=Photo.venue_id JOIN " +
                        "(SELECT category_name AS categoryName, category_id FROM VenueCategory) AS Category ON " +
                        "Venue.category_id=Category.category_id " +
                        "WHERE Venue.venue_id=?", [reviewRows[i]["venue"]], function (err, venueRows) {
                        // If the database doesn't return an error
                        if (!err) {
                            console.log(1);
                            // Update the venue in the reviewRows
                            reviewRows[i]["venue"] = venueRows[0];
                        } else {
                            console.log(err);
                        }
                        // If this is the last review in the list
                        if (i === reviewRows.length - 1) {
                            // Return the done function with a 200 - OK code and the results
                            return done(200, reviewRows);
                        }
                    });
                });
            }
        }
    });
};

exports.insertReview = function(values, done) {

    db.getPool().query('INSERT INTO Review (reviewed_venue_id, review_author_id, review_body, star_rating, cost_rating) VALUES (?, ?, ?, ?, ?', values, function(err, result) {

        if (err) return done(err);

        done(result);
    });
};