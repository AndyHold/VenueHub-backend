const db = require('../../config/db');
const filesystem = require("fs");
const photoDir = __dirname + "/../venue-photos/";
const uidGenerator = require('uid-generator');
const uidGen = new uidGenerator(uidGenerator.BASE58,32);

let generateFilename = function (done) {
    uidGen.generate( function (err, filename) {
        // If the filename is already in use or there is an error
        if (err || filesystem.existsSync(photoDir + filename + ".jpeg") || filesystem.existsSync(photoDir + filename + ".png")) {
            // Recursively request another filename
            return generateFilename(done);
        } else {
            return done(filename);
        }
    });
};

exports.getPhoto = function(venueId, filename, done) {
    // Call the database to get the photo data
    db.getPool().query("SELECT * FROM VenuePhoto WHERE venue_id=? AND photo_filename=?", [[venueId], [filename]], function (err, rows) {
        // If the rows are empty or the database returns an error
        if (err || rows.length === 0) {
            // Return the done function with a 404 - Not Found code
            return done(404);
        }
        // Call the filesystem to retrieve the photo
        filesystem.readFile(photoDir + filename, function (err, photoData) {
            // If the filesystem returns an error
            if (err) {
                // Return the done function with a 404 - Not Found code
                return done(404);
            } else {
                // Return the done function with a 200 - OK code and the photo data
                return done(200, photoData, filename.split(".")[1]);
            }
        });
    });
};

exports.insert = function(venueId, photoData, photoBody, authToken, done) {
    let insertQuery = "INSERT INTO VenuePhoto (venue_id, photo_filename, is_primary";
    let queryFields = ") VALUES (?, ?, ?";
    let isPrimary = false;
    let values;
    // If the auth token was not sent
    if (authToken === undefined) {
        // return the done function with a 401 - Unauthorized code
        return done(401);
    }
    // Call the database to get the user logged in
    db.getPool().query("SELECT user_id FROM User WHERE auth_token=?", [authToken], function(err, userRows) {
        // If the database returns an error
        if (err) {
            // Return the done function with a 500 - Internal Server Error code
            return done(500);
        }
        // If the userRows are empty
        if (userRows.length === 0) {
            // Return the done function with a 401 - Unauthorized code
            return done(401);
        }
        // If the photo or the description was not included or the description is empty
        if (!photoData || photoBody["description"] === undefined || photoBody["description"].length === 0) {
            // Return the done function with a 400 - Bad Request code
            return done(400);
        }
        // If there is a makePrimary Field included
        if (photoBody["makePrimary"] !== undefined) {
            // If the make primary field is not true or false
            if (photoBody["makePrimary"] !== "true" && photoBody["makePrimary"] !== "false") {
                // Return the done function with a 400 - Bad Request code
                return done(400);
            }
        }
        // Call the database to get the venue data
        db.getPool().query("SELECT admin_id AS adminId, primaryPhoto FROM Venue LEFT JOIN " +
            "(SELECT photo_filename AS primaryPhoto, venue_id FROM VenuePhoto WHERE is_primary) AS PrimaryPhotos " +
            "ON Venue.venue_id=PrimaryPhotos.venue_id WHERE Venue.venue_id=?", [venueId], function (err, venueRows) {
            // If the database returns an error or no venue
            if (err || venueRows.length === 0) {
                // Return the done function with a 404 - Not Found code
                return done(404);
            }
            // Call the database to get the admin's details
            db.getPool().query("SELECT auth_token AS authToken FROM User WHERE user_id=?", [venueRows[0]["adminId"]], function (err, adminRows) {
                // If the admin token doesn't match the user token
                if (adminRows[0]["authToken"] !== authToken) {
                    // Return the done function with a 403 - Forbidden code
                    return done(403);
                }
                // Call uidGen to create a new filename
                generateFilename(function (filename) {
                    let photoType = photoData["mimetype"].split('/')[1];
                    filename += '.' + photoType;
                    // Set the values variable
                    values = [
                        [venueId],
                        [filename]
                    ];
                    // If the venue has a primary photo
                    if (venueRows[0]["primaryPhoto"] !== null) {
                        // If the photo data includes a make_primary boolean
                        if (photoBody["makePrimary"] !== undefined) {
                            // Push isPrimary onto the values list and set it to the isPrimary list
                            values.push([photoBody["makePrimary"]]);
                            isPrimary = photoBody["makePrimary"] === "true";
                        } else {
                            // Push false to the values list as the default is primary value.
                            values.push([false]);
                        }
                    } else {
                        values.push([true]);
                    }
                    // If the photo data includes a description
                    if (photoBody["description"] !== undefined) {
                        // Update the insert query with the description and increase the query fields by 1
                        insertQuery += ", photo_description";
                        queryFields += ", ?";
                        values.push([photoBody["description"]]);
                    }
                    // Finish the insert query
                    insertQuery += queryFields + ")";
                    // If the directory doesn't exist
                    if (!filesystem.existsSync(photoDir)) {
                        // Create the directory
                        filesystem.mkdirSync(photoDir);
                    }
                    // If the photo is to be set to primary
                    if (isPrimary) {
                        // Call the database to set all other photos for this venue to not primary
                        db.getPool().query("UPDATE VenuePhoto SET is_primary=false WHERE venue_id=?", [venueId], function () {
                            // Call the database to insert the photo
                            db.getPool().query(insertQuery, values, function (err) {
                                // If the database returns an error
                                if (err) {
                                    // Return the done function with a 400 - Bad Request code
                                    return done(400);
                                } else {
                                    // Call the filesystem to save the photo
                                    filesystem.writeFile(photoDir + filename, photoData["buffer"], function () {
                                        // Return the done function with a 201 - Created code
                                        return done(201);
                                    });
                                }
                            });
                        });
                    } else {
                        // Call the database to insert the photo
                        db.getPool().query(insertQuery, values, function (err) {
                            // If the database returns an error
                            if (err) {
                                // Return the done function with a 400 - Bad Request code
                                return done(400);
                            } else {
                                // Call the filesystem to save the photo
                                filesystem.writeFile(photoDir + filename, photoData["buffer"], function () {
                                    // Return the done function with a 201 - Created code
                                    return done(201);
                                });
                            }
                        });
                    }
                });
            });
        });
    });
};

exports.remove = function(venueId, filename, authToken, done) {
    // If the token was not sent in the headers
    if (authToken === undefined) {
        // Return the done function with a 401 - Unauthorized code
        return done(401);
    }
    // Call the database to retrieve the venue data
    db.getPool().query("SELECT admin_id, photo_filename FROM Venue JOIN VenuePhoto " +
        "ON Venue.venue_id=VenuePhoto.venue_id WHERE venue_id=?", [venueId], function (err, venueRows) {
        // If the database returned an error or empty rows
        if(err || venueRows.length === 0) {
            // return the done function with a 404 - Not Found code
            return done(404);
        }
        // Call the database to get the admin users token
        db.getPool().query("SELECT auth_token FROM User WHERE user_id=?"
            , [venueRows[0]["admin_id"]], function (err, adminRows) {
            // If the admin token does not match the current users token
            if (authToken !== adminRows[0]["auth_token"]) {
                // Return the done function with a 403 - Forbidden code
                return done(403);
            }
            // Call the database to get the photo's details
            db.getPool().query("SELECT is_primary FROM VenuePhoto WHERE photo_filename=?"
                , [filename], function (err, photoRows) {
                // If the database returns an error or the rows are empty
                if (err || photoRows.length === 0) {
                    // Return the done function with a 404 - Not Found error
                    return done(404);
                    // If the photo is primary and there are more than one photo for this venue
                }
                // Call the database to delete the photo
                db.getPool().query("DELETE FROM VenuePhoto WHERE photo_filename=?", [filename], function () {
                    // If the photo was primary and there was more than one photo for this venue
                    if (photoRows[0]["is_primary"] || venueRows.length > 1) {
                        // Call the database to select a random photo from this venue
                        db.getPool().query("SELECT photo_filename FROM VenuePhoto WHERE venue_id=? ORDER BY RAND() LIMIT 1", [venueId], function (err, randomPhoto) {
                            // Call the database to set the value of this photo to primary
                            db.getPool().query("UPDATE VenuePhoto SET is_primary=true WHERE photo_filename=?", [randomPhoto[0]["photo_filename"]], function () {
                                // Call the filesystem to delete the old photo
                                filesystem.unlink(photoDir + filename, function () {
                                    // Return the done function with a 200 - OK code
                                    return done(200);
                                });
                            });
                        });
                    }
                });
            });
        });
    });
};

exports.setPrimary = function(venueId, filename, authToken, done) {
    // If there is no auth token
    if (authToken === undefined) {
        // Return the done function with a 401 - Unauthorized code
        return done(401);
    }
    // Call the database to get the venue and admin details.
    db.getPool().query("SELECT auth_token AS authToken FROM Venue JOIN User ON user_id=admin_id WHERE venue_id=?", [venueId], function (err, adminRows) {
        // If the database returns an error or empty rows
        if (err || adminRows.length === 0) {
            // Return the done function with a 404 - Not Found code
            return done(404);
            // If the auth token doesn't match the users token
        } else if (authToken !== adminRows[0]["authToken"]) {
            // Return the done function with a 403 - Forbidden code
            return done(403);
        }
        // Call the database to get the photo details
        db.getPool().query("SELECT * FROM VenuePhoto WHERE venue_id=? AND photo_filename=?", [[venueId], [filename]], function (err, photoRows) {
            // If the database returns an error or the rows are empty
            if (err || photoRows.length === 0) {
                // Return the done function with a 404 - Not Found code
                return done(404);
            }
            // Call the database to set all the venues photos to not primary
            db.getPool().query("UPDATE VenuePhoto SET is_primary=false WHERE venue_id=?", [venueId], function () {
                // Call the database to set the selected file to primary
                db.getPool().query("UPDATE VenuePhoto SET is_primary=true WHERE venue_id=? AND photo_filename=?", [[venueId], [filename]], function () {
                    // Return the done function with a 200 - OK code
                    return done(200);
                });
            });
        });
    });
};