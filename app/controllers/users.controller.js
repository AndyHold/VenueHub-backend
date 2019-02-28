const Users = require('../models/users.model.js');

exports.register = function(req, res) {
    // Get the user data JSON object from the request body
    let user_data = req.body;
    // Parse the object into a values list that can be used in the database request
    let values = [
        [user_data['username']],
        [user_data["email"]],
        [user_data["givenName"]],
        [user_data["familyName"]]
    ];
    // Call the model class to do the database querying and logic
    Users.register(values, user_data["password"], function(code, userId) {
        // If the response code is a success
        if (code === 201) {
            // send the code along with the userId JSON object
            res.status(code).send(userId);
            // If the response code is an error
        } else if (code === 400) {
            // send the response code
            res.sendStatus(code);
        }
    });
};

exports.login = function(req, res) {
    // Get the user data JSON object from the request body
    let user_data = req.body;
    // Parse the object into a values list that can be used in the database request
    let values = [
        [user_data['username']],
        [user_data['email']],
        [user_data['password']]
    ];
    // Call the model class to do the database querying and logic
    Users.login(values, function(code, userToken) {
        // If the response code is a success
        if (code === 200) {
            // Send the code along with the user token object
            res.status(code).send(userToken);
            // If the response code is an error
        } else if (code === 400) {
            // Send the response code
            res.sendStatus(code);
        }
    });
};

exports.logout = function(req, res) {
    // Get the bearer from the request headers
    const bearer = req.headers["authorization"];
    // Call the model class to do the database querying and logic
    Users.logout(bearer, function(code) {
        // Send the response with the given status code
        res.sendStatus(code);
    })

};

exports.getUser = function(req, res) {
    // Parse the id from the request parameters
    let id = req.params.id;
    // Call the model class to do the database querying and logic
    Users.getUser(id, function(code, userObj) {
        // If the response code is an error
        if (code === 404) {
            // Send the response code
            res.sendStatus(code);
            // If the response code is a success
        } else if (code === 200) {
            // Send the code along with the user object
            res.status(code).send(userObj);
        }
    });
};

exports.updateUser = function(req, res) {
    // Parse the id from the request parameters
    const userId = req.params.id;
    // Get the user data JSON object from the request body
    const userData = req.body;
    // Get the bearer from the request headers
    const bearer = req.headers["authorization"];
    // Call the model class to query the database and do the logic
    Users.updateUser(userData, bearer, userId, function(code) {
        // Send the status code in the response
        res.sendStatus(code);
    });
};