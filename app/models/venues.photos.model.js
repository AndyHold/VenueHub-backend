const db = require('../../config/db');
const photoDir = __dirname + "/venue-photos/";
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

exports.getPhoto = function(values, done) {
    // TODO implement this
};

exports.insert = function(venueId, photoData, authToken, done) {
    let insertQuery = "INSERT INTO VenuePhoto (venue_id, photo_filename, is_primary";
    let queryFields = ") VALUES (?, ?, ?";
    let isPrimary = false;
    let values;
    // If the auth token was not sent
    if (authToken === undefined) {
        // return the done function with a 401 - Unauthorized code
        return done(401);
    }
    // If the photo was not included
    if (!photoData.hasOwnProperty("photo")) {
        // Return the done function with a 400 - Bad Request code
        return done(400);
    }
    // Call the database to get the venue data
    db.getPool().query("SELECT admin_id AS adminId, primaryPhoto FROM Venue LEFT JOIN " +
        "(SELECT photo_filename AS primaryPhoto, venue_id FROM VenuePhoto WHERE is_primary) AS PrimaryPhotos " +
        "ON Venue.venue_id=PrimaryPhotos.venue_id WHERE venue_id=?", [venueId], function (err, venueRows) {
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
                // TODO how is the photo sent where is the file type or name???
                let photoType = ".jpeg"; // TODO get the photo type
                filename += photoType;
                // Set the values variable
                values = [
                    [venueId],
                    [filename]
                ];
                // If the venue has a primary photo
                if (venueRows[0]["isPrimary"]) {
                    // If the photo data includes a is_primary boolean
                    if (photoData.hasOwnProperty("isPrimary")) {
                        // Push isPrimary onto the values list and set it to the isPrimary list
                        values.push(photoData["isPrimary"]);
                        isPrimary = photoData["isPrimary"];
                        console.log(photoData["isPrimary"]); // TODO remove this.
                    } else {
                        // Push false to the values list as the default is primary value.
                        values.push([false]);
                    }
                } else {
                    values.push([true]);
                }
                // If the photo data includes a description
                if (photoData.hasOwnProperty("description")) {
                    // Update the insert query with the description and increase the query fields by 1
                    insertQuery += ", photo_description";
                    queryFields += ", ?";
                    values.push([photoData["description"]]);
                }
                // Finish the insert query
                insertQuery += queryFields + ")";
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
                                filesystem.writeFile(photoDir + filename, photoData["photo"], function () {
                                    // Return the done function with a 201 - Created code
                                    return done(201);
                                });
                            }
                        });
                    });
                }
            });
        });
    });
};

exports.remove = function(values, done) {
    db.get_pool().query('DELETE FROM VenuePhoto WHERE venue_id = ? AND photo_filename = ?', values, function(err, result) {

        if (err) return done(err);

        done(result);
    });
};

exports.setPrimary = function(venueId, filename, done) {
    db.getPool().query("UPDATE VenuePhoto SET is_primary = 0 WHERE venue_id = ?", [[venueId]], function(err) {

        if (err) return done(err);
    });
    db.getPool().query("UPDATE VenuePhoto SET is_primary = 1 WHERE venue_id = ? AND photo_filename = ?", [[venueId], [filename]], function(err, result) {

        if (err) return done(err);

        done(result);
    });
};