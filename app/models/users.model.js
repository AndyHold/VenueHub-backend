const db = require('../../config/db');
const uidGenerator = require('uid-generator');
const uidGen = new uidGenerator(128,UIDGenerator.BASE58,32);

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
            uidGen.generate((err, uid) => {
                if (err) throw err;
                db.get_pool().query('UPDATE User SET auth_token = ? WHERE user_id = ?', [[uid],[rows[0].user_id]], function (err, rows) {
                    return done({"userId":rows[0].user_id, "token":uid});
                });
            });

        }
        return done()
    });
};

exports.logout = function(user_id, done) {
    db.get_pool().query("UPDATE User SET auth_token = null WHERE user_id = ?", user_id, function (err, rows) { //TODO Ask how to identify the currently logged on user.

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