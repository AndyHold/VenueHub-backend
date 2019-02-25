const db = require('../../config/db');

exports.getAll = function(done) {
    db.get_pool().query('SELECT * FROM Venue', function (err, rows) {

        if (err) return done({"ERROR": "Error selecting"});

        return done(rows)
    });
};

exports.getCats = function(done) {
    db.get_pool().query('SELECT * FROM VenueCategory', function (err, rows) {

        if (err) return done({"ERROR": "Error selecting"});

        return done(rows)
    });
};

exports.getOne = function(venueId, done) {
    db.get_pool().query('SELECT * FROM Venue where venue_id = ?', venueId, function(err, rows) {
        if (err) return done(err);
        done(rows);
    });
};

exports.insert = function(values, done) {

    db.get_pool().query('INSERT INTO Venue (venue_name, category_id, city, short_description, long_description, address, latitude, longitude) VALUES (?, ?, ?, ?, ?, ?, ?, ?', values, function(err, result) {

        if (err) return done(err);

        done(result);
    });
};

exports.alter = function(values, done) {
    db.get_pool().query('UPDATE Venue SET venue_name = ?, category_id = ?, city = ?, short_description = ?, long_description = ?, address = ?, latitude = ?, longitude = ?) WHERE venue_id = ?', values, function(err, result) {

        if (err) return done(err);

        done(result);
    });
};