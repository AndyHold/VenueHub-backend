const db = require('../../config/db');

exports.getPhoto = function(values, done) {
    // TODO implement this
};

exports.insert = function(values, done) {
    db.get_pool().query('INSERT INTO VenuePhoto (venue_id, photo_filename, photo_description, is_primary) VALUES (?, ?, ?, ?)', values, function(err, result) {

        if (err) return done(err);

        done(result);
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