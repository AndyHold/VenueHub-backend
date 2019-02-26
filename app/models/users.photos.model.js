const db = require('../../config/db');

exports.getPhoto = function(done) {
    db.get_pool().query('', function (err, rows) {

        if (err) return done({"ERROR": "Error selecting"});

        return done(rows)
    });
};

exports.setPhoto = function(done) {
    db.get_pool().query('', function (err, rows) {

        if (err) return done({"ERROR": "Error selecting"});

        return done(rows)
    });
};

exports.deletePhoto = function(done) {
    db.get_pool().query('', function (err, rows) {

        if (err) return done({"ERROR": "Error selecting"});

        return done(rows)
    });
};