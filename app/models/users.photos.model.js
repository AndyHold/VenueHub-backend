const db = require('../../config/db');
const filesystem = require("fs");

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
            filesystem.readFile("./photos/" + rows[0]["filename"], function (err, data) {
                // If the filesystem returned an error
                if (err) {
                    // Return the done function with a 404 - Not Found code
                    return done(404);
                } else {
                    // Return the done function with a 200 - OK code and the contents of the picture
                    return done(200, data);
                }
            });
        }

        return done({200:filesystem.readFile(rows[0]['profile_photo_filename'])});
    });
};

exports.setPhoto = function(id, photo, done) {
    // TODO Check if the given user has a profile photo already
    // create a random filename instead of the given one as there are security risks.
        // delete it and replace it with the received one
    // else save the new photo
    db.getPool().query('', function (err, rows) {

        if (err) return done({"ERROR": "Error selecting"});

        return done(rows)
    });
};

exports.deletePhoto = function(done) {
    // Check that the userId corresponds with the currently logged in user.
    db.getPool().query('', function (err, rows) {

        if (err) return done({"ERROR": "Error selecting"});

        return done(rows)
    });
};