const db = require('../../config/db');

exports.register = function(values, done) {
    db.get_pool().query('INSERT INTO user (username, email, given_name, family_name, password) VALUES ?, ?, ?, ?, ?', values, function (err, rows) {

        if (err) return done({"ERROR": "Error selecting"});

        return done(rows)
    });
};

exports.login = function(values, done) {
    db.get_pool().query('SELECT * FROM User where username = ?', [values[0]], function (err, rows) {
        if (err) return done({"ERROR": "Error selecting"});
        let username = values[0][0],
            email = values[0][1],
            password = values[0][2];
        if (rows[0].username === username && rows[0].email === email && rows[0].password === password) {
            return done(rows); //TODO implement successful login.
        }
        return done()
    });
};

exports.logout = function(done) {
    db.get_pool().query('', function (err, rows) {

        if (err) return done({"ERROR": "Error selecting"});

        return done(rows)
    });
};

exports.getUser = function(userId, done) {
    db.get_pool().query('SELECT * FROM user where user_id = ?', [[userId]], function (err, rows) {

        if (err) return done({"ERROR": "Error selecting"});

        return done(rows)
    });
};

exports.updateUser = function(values, done) {
    db.get_pool().query('UPDATE User SET username = ?, email = ?, given_name = ?, family_name = ?, password = ? WHERE user_id = ?', values, function (err, rows) {

        if (err) return done({"ERROR": "Error selecting"});

        return done(rows)
    });
};