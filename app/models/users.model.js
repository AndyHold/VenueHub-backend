const db = require('../../config/db');
const uidGenerator = require('uid-generator');
const uidGen = new uidGenerator(uidGenerator.BASE58,32);
const crypt = require("bcrypt");

exports.register = function(values, password, done) {
    // Call crypt to hash the password
    crypt.hash(password, 10, function(err, hash) {
        // If the hash returns an error
        if (err) {
            // Return the done function with code of 400 and a null object
            return done(400, null);
            // Otherwise
        } else {
            // Add the hashed password to the values list
            values.push([hash]);
        }
        // Call the database to add the user with the given credentials
        db.getPool().query('INSERT INTO User (username, email, given_name, family_name, password) VALUES (?, ?, ?, ?, ?)', values, function (err) {
            // If the database returns an error
            if (err) {
                // Return the done function with code of 400 and a null object
                return done(400, null);
                // Otherwise
            } else {
                // Call the database to get the generated user_id for the newly created user.
                db.getPool().query("SELECT user_id FROM User WHERE username = ?", values, function (err, rows) {
                    // If the database returns an error
                    if (err) {
                        // Return the done function with code of 400 and a null object
                        return done(400, null);
                        // Otherwise
                    } else {
                        // Return the done function with code 201 and an object with the user_id
                        return done(201, {"userId": rows[0]["user_id"]})
                    }
                });
            }
        });
    });
};

exports.login = function(values, done) {
    // Call the database to get the users credentials
    db.getPool().query('SELECT * FROM User where username = ?', values, function (err, rows) {
        // If the database returns an error
        if (err) {
            // Return the done function with code of 400 and a null object
            return done(400, null);
            // Otherwise
        } else {
            // Put the users input details into variables for better readability
            let email = values[1][0],
                password = values[2][0];
            // Check that the emails match
            if (rows[0].email === email) {
                // Call crypt to check that the passwords match
                crypt.compare(password, rows[0]["password"], function (err, res) {
                    // If crypt returns an error or false
                    if (err || !res) {
                        // Return the done function with code of 400 and a null object
                        return done(400, null);
                        // Otherwise
                    } else {
                        // Call uidGen to create a random token
                        uidGen.generate((err, uid) => {
                            // If uid generates an error
                            if (err) {
                                // Return the done function with code of 400 and a null object
                                return done(400, null);
                                //Otherwise
                            } else {
                                // Call the database to set the auth token for this user
                                db.getPool().query('UPDATE User SET auth_token = ? WHERE user_id = ?', [[uid], [rows[0].user_id]], function (err) {
                                    // If the database returns an error
                                    if (err) {
                                        // Return the done function with code of 400 and a null object
                                        return done(400, null);
                                        // Otherwise
                                    } else {
                                        // Return the done function with code of 200 and an object containing the userId and token
                                        return done(200, {"userId": rows[0]["user_id"], "token": uid});
                                    }
                                });
                            }
                        });
                    }
                });
            // Otherwise
            } else {
                // Return the done function with code of 400 and a null object
                return done(400, null);
            }
        }
    });
};

exports.logout = function(bearer, done) {
    // If the bearer header type is not undefined
    if (typeof bearer !== 'undefined') {
        // Parse the token from the bearer header
        const token = bearer.split(" ")[1];
        // Call the database to get the user id corresponding to the token.
        db.getPool().query("SELECT user_id FROM User WHERE auth_token = ?", [token], function (err, rows) {
            // If the database returns an error or there are no users with the token
            if (err || rows.length === 0) {
                // Return the done function with code of 401
                return done(401);
                // Otherwise
            } else {
                // Extract the user_id from the database rows
                let userId = rows[0]["user_id"];
                // Call the database to set the auth token to null for the user
                db.getPool().query("UPDATE User SET auth_token = null WHERE user_id = ?", [userId], function (err) {
                    // If the database returns an error
                    if (err) {
                        // Return the done function with code of 401
                        return done(401);
                        // Otherwise
                    } else {
                        // Return the done function with a code of 200
                        return done(200);
                    }
                });
            }
        });
        // Otherwise
    } else {
        // Return the done function with code of 401 and a null object
        return done(401, null);
    }
};

exports.getUser = function(userId, done) {
    // Call the database to get the data from the selected user
    db.getPool().query('SELECT * FROM User WHERE user_id = ?', [[userId]], function (err, rows) {
        // If the database returns an error OR there are no users returned
        if (err || rows.length === 0) {
            // Return the done function with code of 404 and a null object
            return done(404, null)
            // Otherwise
        } else {
            // Create the user object
            let userObj = {
                "username": rows[0]["username"],
                "email": rows[0]["email"],
                "givenName": rows[0]["given_name"],
                "familyName": rows[0]["family_name"]
            };
            // Return the done function with code of 200 and an object defining the user
            return done(200, userObj);
        }
    });
};

exports.updateUser = function(values, bearer, userId, done) {
    // If the bearer header type is not undefined
    if (typeof bearer !== 'undefined') {
        // Parse the token from the bearer header
        const token = bearer.split(" ")[1];
        // Call the database to get the user id corresponding to the token.
        db.getPool().query("SELECT user_id FROM User WHERE auth_token = ?", [token], function (err, rows) {
            // If the database returns an error or there are no users with the token
            if (err || rows.length === 0) {
                // Return the done function with code of 401
                return done(401);
                // Otherwise if the users token matches the user they wish to change
            } else if (userId === rows[0]["user_id"]) {

            } else {
                // Return the done function with code of 401
                return done(401)
            }
        });
        // Otherwise
    } else {
        // Return the done function with a 401 code
        return done(401);
    }

    db.getPool().query('UPDATE User SET username = ?, email = ?, given_name = ?, family_name = ?, password = ? WHERE user_id = ?', [userId], function (err, rows) {

        if (err) return done({"ERROR": "Error selecting"});

        return done(rows)
    });
};