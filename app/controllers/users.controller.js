const Users = require('../models/users.model.js');

exports.register = function(req, res) {
    // Get the user data JSON object from the request body
    let userData = req.body;
    // Call the model class to do the database querying and logic
    Users.register(userData, function(code, userId) {
        // If the response code is a success
        if (code === 201) {
            // send the code along with the userId JSON object
            res.status(code).json(userId);
            // If the response code is an error
        } else if (code === 400) {
            // send the response code
            res.sendStatus(code);
        }
    });
};

exports.login = function(req, res) {
    // Get the user data JSON object from the request body
    let userData = req.body;
    // Call the model class to do the database querying and logic
    Users.login(userData, function(code, userToken) {
        // If the response code is a success
        if (code === 200) {
            // Send the code along with the user token object
            res.status(code).json(userToken);
            // If the response code is an error
        } else if (code === 400) {
            // Send the response code
            res.sendStatus(code);
        }
    });
};

exports.logout = function(req, res) {
    // Get the bearer from the request headers
    const authHeader = req.headers["x-authorization"];
    // Call the model class to do the database querying and logic
    Users.logout(authHeader, function(code) {
        // Send the response with the given status code
        res.sendStatus(code);
    })

};

exports.getUser = function(req, res) {
    // // Get the bearer from the request headers
    // const authToken = req.headers["x-authorization"];
    // // Parse the id from the request parameters
    // let id = req.params.id;
    // // Call the model class to do the database querying and logic
    // Users.getUser(id, authToken, function(code, userObj) {
    //     // If the response code is an error
    //     if (code === 404) {
    //         // Send the response code
    //         res.sendStatus(code);
    //         // If the response code is a success
    //     } else if (code === 200) {
    //         // Send the code along with the user object
    //         res.status(code).send(userObj);
    //     }
    // });
    res.status(200).send({"username": req.headers})
};

exports.updateUser = function(req, res) {
    // Get the user data JSON object from the request body
    const userData = req.body;
    // Get the bearer from the request headers
    const bearer = req.headers["authorization"];
    // Parse the id from the request parameters
    const userId = req.params.id;
    // Call the model class to query the database and do the logic
    Users.updateUser(userData, bearer, userId, function(code) {
        // Send the status code in the response
        res.sendStatus(code);
    });
};