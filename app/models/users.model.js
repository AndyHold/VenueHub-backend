const db = require('../../config/db');
const uidGenerator = require('uid-generator');
const uidGen = new uidGenerator(uidGenerator.BASE58,32);
const crypt = require("bcrypt");

exports.register = function(userData, done) {
    // If any of the expected values were empty or absent or too long
    if (!userData.hasOwnProperty("username") ||
        !userData.hasOwnProperty("email") ||
        !userData.hasOwnProperty("givenName") ||
        !userData.hasOwnProperty("familyName") ||
        !userData.hasOwnProperty("password") ||
        userData["username"].length === 0 || userData["username"].length > 64 ||
        userData["email"].length === 0 || userData["email"].length > 128 ||
        userData["givenName"].length === 0 || userData["givenName"].length > 128 ||
        userData["familyName"].length === 0 || userData["familyName"].length > 128 ||
        userData["password"].length === 0) {
        // Return the done function with a 400 - Bad Request code
        return done(400);
        // Otherwise
    } else {
        // Extract the email from userData
        let email = userData["email"].split("@");
        // If the email does not have exactly 1 @ symbol surrounded by text
        if (email.length !== 2) {
            // Return the done function with a 400 - Bad Request code
            return done(400);
            // Otherwise
        } else {
            // Extract the domain and local from the email
            let domain = email[1].split(".");
            let localPart = email[0];
            // If the domain does not have at least one dot or the space between dots does not contain text or the local part is empty
            if (localPart.length === 0 || domain.length < 2 ||
                function () { // Called imediately
                    // Iterate through each section of the domain
                    for (let i = 0; i < domain.length; i++) {
                        // If that section is empty
                        if (domain[i].length === 0) {
                            // Return true
                            return true;
                        }
                    }
                    // At the end return false because none of the sections were empty.
                    return false;
                }()) {
                // Return the done function with a 400 - Bad Request code
                return done(400);
                // Otherwise
            } else {
                // Extract the password from the userData
                let password = userData["password"];
                // Extract the userData object into a values list that can be used in the database request
                let values = [
                    [userData['username']],
                    [userData["email"]],
                    [userData["givenName"]],
                    [userData["familyName"]]
                ];
                // Call crypt to hash the password
                crypt.hash(password, 10, function (err, hash) {
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
                                    return done(201, {"userId": rows[0]["user_id"]});
                                }
                            });
                        }
                    });
                });
            }
        }
    }
};

exports.login = function(userData, done) {
    // Define the variables username, email, and password
    let username;
    let email;
    let password;
    // If there was no password
    if (!userData.hasOwnProperty("password")) {
        // Return the done function with a 400 - Bad Request code
        return done(400);
    } else {
        // Set the password variable
        password = userData["password"];
    }
    // Set the query template
    let queryString = "SELECT * FROM User WHERE ";
    // If the username was entered
    if (userData.hasOwnProperty("username")) {
        // Add the username to the username variable
        username = userData["username"];
        // Add the username to the query
        queryString += "username=" + "'" + username + "'";
    // If the email was entered
    }
    if (userData.hasOwnProperty("email")) {
        // Add the email to the email variable
        email = userData["email"];
        // if the username isn't set
        if (!username) {
            // Add the email to the query
            queryString += "email=" + "'" + email + "'";
        }
    }
    // If no username or email was sent
    if (!userData.hasOwnProperty("username") && !userData.hasOwnProperty("email")) {
        // Return the done function with a 400 - Bad Request code
        return done(400);
    }
    // Call the database to get the users credentials
    db.getPool().query(queryString, function (err, rows) {
        // If the database returns an error or no user
        if (err || rows.length === 0) {
            // Return the done function with a 400 - Bad Request code
            return done(400);
            // Otherwise
        } else {
            // If both the username and the email were sent
            if (email && username) {
                // If the emails don't match
                if (!rows[0].email === email) {
                    // Return the done function with a 400 - Bad Request code
                    return done(400);
                }
            }
            // Call crypt to check that the passwords match
            crypt.compare(password, rows[0]["password"], function (err, res) {
                // If crypt returns an error or false
                if (err || !res) {
                    // Return the done function with a 400 - Bad Request code
                    return done(400);
                    // Otherwise
                } else {
                    // Call uidGen to create a random token
                    uidGen.generate((err, uid) => {
                        // If uid generates an error
                        if (err) {
                            // Return the done function with code of 400 and a null object
                            return done(400);
                            //Otherwise
                        } else {
                            // Call the database to set the auth token for this user
                            db.getPool().query('UPDATE User SET auth_token=? WHERE user_id=?', [[uid], [rows[0].user_id]], function (err) {
                                // If the database returns an error
                                if (err) {
                                    // Return the done function with code of 400 and a null object
                                    return done(400);
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
        }
    });
};

exports.logout = function(authHeader, done) {
    // If the auth header type is not undefined
    if (authHeader !== undefined) {
        // Call the database to get the user id corresponding to the token.
        db.getPool().query("SELECT user_id FROM User WHERE auth_token='" + authHeader + "'", function (err, rows) {
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
        return done(401);
    }
};

exports.getUser = function(userId, authToken, done) {
    let userQuery = "SELECT username";
    // If the auth header type is not undefined
    if (authToken === undefined) {
        // Parse the token from the auth header
        authToken = "";
    }
    // Call the database to get the user id corresponding to the token.
    db.getPool().query("SELECT user_id AS userId FROM User WHERE auth_token=?", [authToken], function (err, rows) {
        // If the database returns an error
        if (err) {
            // Set rows to an empty array
            rows = [];
            // Otherwise
        }
        // If the database returns a user and it matches the requested user
        if (rows.length !== 0 && rows[0]["userId"] === userId) {
            // Add the email option to the user query along with the rest of the options
            userQuery += ", email, given_name AS givenName, family_name AS familyName FROM User WHERE user_id=?"
        } else {
            // Finish the query with the rest of the options
            userQuery += ", given_name AS givenName, family_name AS familyName FROM User WHERE user_id=?"
        }
        // Call the database to get the data from the selected user
        db.getPool().query(userQuery, [userId], function (err, rows) {
            // If the database returns an error OR there are no users returned
            if (err || rows.length === 0) {
                // Return the done function with a 404 - Not Found code
                return done(404)
                // Otherwise
            } else {
                // Return the done function with a 200 - OK code and an object defining the user
                rows["email"] = authToken;
                return done(200, rows[0]);
            }
        });
    });
};

exports.updateUser = function(userData, authToken, userId, done) {
    // If the auth header type is undefined
    if (authToken === undefined) {
        // Return the done function with a 401 - Unauthorized code
        return done(401);
    } else {
        // Call the database to get the users information
        db.getPool().query("SELECT * FROM User WHERE user_id=?", [userId], function (err, rows) {
            // if the database returns an error or an empty row set
            if (err || rows.length === 0) {
                // Return the done function with a 404 - Not Found code
                return done(404);
            // If the tokens do not match
            } else if (authToken !== rows[0]["auth_token"]) {
                // Return the done function with a 403 - Forbidden code
                return done(403);
            // If one or more of the required fields are missing, or incorrect
            } else if (!userData.hasOwnProperty("givenName") || userData["givenName"].length === 0 ||
                !userData.hasOwnProperty("familyName") || userData["familyName"].length === 0 ||
                !userData.hasOwnProperty("password") || userData["password"].length === 0) {
                // Return the done function with a 400 - Bad Request code
                return done(403);
            } else {
                // Call crypt to encrypt the new password
                crypt.hash(userData["password"], 10, function (err, hash) {
                    // If crypt returns an error
                    if (err) {
                        // Return the done function with a 400 - Bad Request code
                        return done(400);
                    } else {
                        // Call the database to update the users records
                        db.getPool().query("UPDATE User SET given_name=?, family_name=?, password=?, WHERE user_id=?", [[userData["givenName"]], [userData["familyName"]], [hash], [userId]], function (err) {
                            // If the database returns an error
                            if (err) {
                                // Return the done function with a 400 - Bad Request code
                                return done(400);
                            } else {
                                // Return the done function with a 200 - OK code
                                return done(200);
                            }
                        });
                    }
                });
            }
        });
    }
};