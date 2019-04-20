const db = require('../../config/db');
const filesystem = require("fs");
const uidGenerator = require('uid-generator');
const uidGen = new uidGenerator(uidGenerator.BASE58,32);
const photoDir = __dirname + "/../user-photos/";

let generateFilename = function (done) {
    uidGen.generate( function (err, filename) {
        // If the filename is already in use or there is an error
        if (err || filesystem.existsSync(photoDir + filename + ".jpeg") ||
            filesystem.existsSync(photoDir + filename + ".png")) {
            // Recursively request another filename
            return generateFilename(done);
        } else {
            return done(filename);
        }
    });
};

exports.getPhoto = function(userId, done) {
    // Call the database to retrieve the filename of the users photo
    db.getPool().query('SELECT profile_photo_filename AS filename FROM User WHERE user_id=?', [userId], function (err, rows) {
        // If the database returns an error or the rows are empty
        if (err || rows.length === 0) {
            // Return the done function with a 404 - Not Found code
            return done(404);
            // Otherwise
        } else {
            // Call the filesystem to read the file
            filesystem.readFile(photoDir + rows[0]["filename"], function (err, data) {
                // If the filesystem returned an error
                if (err) {
                    // Return the done function with a 404 - Not Found code
                    return done(404);
                } else {
                    // Return the done function with a 200 - OK code and the contents of the picture
                    return done(200, data, rows[0]["filename"].split('.')[1]);
                }
            });
        }
    });
};

exports.setPhoto = function(userId, authToken, contentType, picData, done) {
    // If the auth token is missing
    if (authToken === undefined) {
        // Return the done fundtion with a 401 - Unauthorized code
        return done(401);
    }
    // Call the database to retrieve the selected users token
    db.getPool().query("SELECT user_id AS userId, auth_token as authToken, profile_photo_filename AS filename" +
        " FROM User WHERE user_id=?", [userId], function (err, userRows) {
        // If the database returns an error or there is no user with this id
        if (err || userRows.length === 0) {
            // Return the done function with a 404 - Not Found code
            return done(404);
            // If the selected users auth code does not match the current user
        } else if (authToken !== userRows[0]["authToken"]) {
            // Return the done function with a 403 - Forbidden code
            return done(403);
        }
        // If the directory doesn't exist
        if (!filesystem.existsSync(photoDir)) {
            // Create the directory
            filesystem.mkdirSync(photoDir);
        }
        // Create a random filename for the photo
        generateFilename( function(filename) {
            // If the content type is jpeg
            if (contentType === "image/png") {
                // Concatenate '.png' onto the filename
                filename += ".png";
                // If the content type if jpeg
            } else if (contentType === "image/jpeg") {
                // Concatenate '.jpeg' onto the filename
                filename += ".jpeg";
            } else {
                // Return the done function with a 400 - Bad Request code
                return done(400);
            }
            // If the user already has a photo
            if (userRows[0]["filename"] !== null) {
                // Call the filesystem to save the new photo
                filesystem.writeFile(photoDir + filename, picData, function (err) {
                    // If the filesystem does not return an error
                    if (!err) {
                        // Call the filesystem to delete the old file
                        filesystem.unlink(photoDir + userRows[0]["filename"], function () {
                            // Call the database to replace the filename
                            db.getPool().query("UPDATE User SET profile_photo_filename=? WHERE user_id=?", [[filename], [userId]], function () {
                                // Return the done function with a 200 - OK code
                                return done(200);
                            });
                        });
                    }
                });
            } else {
                // Call the filesystem to save the new photo
                filesystem.writeFile(photoDir + filename, picData, function (err) {
                    // If the filesystem does not return an error
                    if (!err) {
                        // Call the database to update the filename
                        db.getPool().query("UPDATE User SET profile_photo_filename=? WHERE user_id=?", [[filename], [userId]], function () {
                            // Return the done function with a 201 - Created code
                            return done(201);
                        });
                    } else {
                        throw err;
                    }

                });
            }
        });
    });
};

exports.deletePhoto = function(userId, authToken, done) {
    // If the auth token is undefined
    if (authToken === undefined) {
        // Return the done function with a 401 - Unauthorized code
        return done(401);
    }
    // Call the database to retrieve the user details
    db.getPool().query("SELECT auth_token AS authToken, profile_photo_filename as filename FROM User WHERE user_id=?", [userId], function (err, userRows) {
        // If the database returned an error or no users or the user has no photo
        if (err || userRows.length === 0 || userRows[0]["filename"] == null) {
            // Return the done function with a 404 - Not Found code
            return done(404);
            // If the selected user is not the curent user
        } else if (authToken !== userRows[0]["authToken"]) {
            // Return the done function with a 403 - Forbidden code
            return done(403);
        } else {
            // Call the filesystem to delete the photo
            filesystem.unlink(photoDir + userRows[0]["filename"], function () {
                // Call the database to delete the photo from the drive
                db.getPool().query("UPDATE User SET profile_photo_filename=? WHERE user_id=?", [[null], [userId]], function () {
                    // Return the done function with a 200 - OK code
                    return done(200);
                });
            });
        }
    });
};