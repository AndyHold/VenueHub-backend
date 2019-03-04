const db = require('../../config/db');
const filesystem = require("fs");

exports.getPhoto = function(id, done) {
    db.get_pool().query('SELECT profile_photo_filename FROM User WHERE user_id = ?', [id], function (err, rows) {

        if (err || !rows[0].hasOwnProperty("profile_photo_filename")) return done({404: "Not Found"});

        return done({200:filesystem.readFile(rows[0]['profile_photo_filename'])});
    });
};

exports.setPhoto = function(id, photo, done) {
    // TODO Check if the given user has a profile photo already
    // create a random filename instead of the given one as there are security risks.
        // delete it and replace it with the received one
    // else save the new photo
    db.get_pool().query('', function (err, rows) {

        if (err) return done({"ERROR": "Error selecting"});

        return done(rows)
    });
};

exports.deletePhoto = function(done) {
    // Check that the userId corresponds with the currently logged in user.
    db.get_pool().query('', function (err, rows) {

        if (err) return done({"ERROR": "Error selecting"});

        return done(rows)
    });
};