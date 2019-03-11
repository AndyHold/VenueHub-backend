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

exports.getReviewsFromUser = function(userId, authToken, done) {
    // If the auth token was not sent
    if (authToken === undefined) {
        // Return the done function with a 401 - Unauthorized code
        return done(401);
    }
    // Call the database to get the users token
    db.getPool().query("SELECT auth_token FROM User WHERE user_id=?", [userId], function (err, userTokenRows) {
        // If the database returns an error, or if the tokens do not match
        if (err || authToken !== userTokenRows[0]["auth_token"]) {
            // Return the done function with a 401 - Unauthorized code
            return done(401);
        }
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
                                // Update the venue in the reviewRows
                                reviewRows[i]["venue"] = venueRows[0];
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
    });
};

exports.insertReview = function(venueId, reviewData, authToken, done) {
    // Parse the values from reviewData
    let values = [
        [reviewData.reviewBody],
        [reviewData.starRating],
        [reviewData.costRating],
        [venueId]
    ];
    let userId;
    // If the data sent in the request is incorrect
    if (!reviewData.hasOwnProperty("reviewBody") || reviewData["reviewBody"].length === 0 || reviewData["reviewBody"].length > 1024 ||
        !reviewData.hasOwnProperty("starRating") || typeof reviewData["starRating"] !== "number" ||
        !reviewData.hasOwnProperty("costRating") || typeof reviewData["costRating"] !== "number") {
        // Return the done function with a 400 - Bad Request code
        return done(400);
    }
    // If the authToken was not sent
    if (authToken === undefined) {
        // Return the done function with a 401 - Forbidden code
        return done(401);
    }
    // Call the database to get the userId logged in with the given token
    db.getPool().query("SELECT user_id as userId FROM User WHERE auth_token=?", [authToken], function (err, userRows) {
        // If the database returns an error
        if (err) {
            // Return the done function with a 400 - Bad Request code
            return done(400);
            // If the database doesn't return a user
        } else if (userRows.length === 0) {
            // Return the done function with a 401 - Forbidden code
            return done(401);
        }
        // Set the userId as that of the logged in user
        userId = userRows[0]["userId"];
        // Add the userId to the values list;
        values.push([userId]);
        // Call the database to get the venue details
        db.getPool().query("SELECT admin_id FROM Venue WHERE venue_id=?", [venueId], function(err, venueRows) {
            // If the database returns an error or the venue doesn't exist (has empty rows)
            if (err || venueRows.length === 0) {
                // Return the done function with a 400 - Bad Request code
                return done(400);
                // If the logged in user is the admin
            } else if (venueRows[0]["admin_id"] === userId){
                // Return the done function with a 403 - Unauthorized code
                return done(403);
            }
            // Call the database to see if the user has already reviewed this venue
            db.getPool().query("SELECT * FROM Review WHERE reviewed_venue_id=? AND review_author_id=?", [[venueId], [userId]], function(err, reviewRows) {
                // If the database returns an error
                if (err) {
                    // Return the done function with a 400 - Bad Request code
                    return done(400);
                    // If the user has already reviewed this venue (rows are not empty)
                } else if (reviewRows.length !== 0) {
                    // Return the done function with a 403 - Unauthorized code
                    return done(403);
                } else {
                    // Call the database to insert the review
                    db.getPool().query("INSERT INTO Review (review_body, star_rating, cost_rating, reviewed_venue_id, review_author_id) VALUES (?, ?, ?, ?, ?)", values, function (err) {
                        // If the database returns an error
                        if (err) {
                            // Return the done function with a 400 - Bad Request code
                            return done(400);
                            // Otherwise
                        } else {
                            // Return the done function with a 201 - Created code
                            return done(200);
                        }
                    });
                }
            });
        });
    });
};