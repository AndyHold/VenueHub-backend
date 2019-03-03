const Venue = require('../models/venues.model');

exports.list = function(req, res) {
    // Get the queries from the request
    let queries = req.query;
    // Call the model function to query the database and perform the logic
    Venue.getVenues(queries, function(code, results) {
        // If the code is 200
        if (code === 200) {
            // Send the code with the results
            res.status(code).json(results);
            // Otherwise
        } else {
            // Send the given status code
            res.sendStatus(code);
        }
    });
};

exports.catList = function(req, res) {
    // Call the model class to perform the logic and query the database
    Venue.getCats(function(result) {
        // Respond with the result from the database
        res.status(200).send(result);
    });
};

exports.create = function(req, res) {
    // Get the auth from the request headers
    const authToken = req.headers["x-authorization"];
    // Get the venue data from the request body
    let venueData = req.body;
    // Call the model class to perform the logic and update the database
    Venue.insert(authToken, venueData, function(code, result) {
        // If the code returned is 201 - Created
        if (code === 201) {
            // Respond with the code and the venueId
            res.status(code).send(result);
        // Otherwise
        } else {
            // Respond with just the code
            res.sendStatus(code);
        }
    });
};

exports.read = function(req, res) {
    // Get the id from the request params
    let id = req.params.id;
    // Call the model class to perform the logic and call the database
    Venue.getOne(id, function(code, result) {
        // If the response code is 404 - Not Found
        if (code === 404) {
            // Send the code in the response
            res.sendStatus(code);
        // Otherwise
        } else {
            // Send the code with the results from the database
            res.status(code).json(result);
        }
    });
};

exports.update = function(req, res) {
    // const id = req.params.id;
    // // Get the auth from the request headers
    // const authToken = req.headers["authorization"];
    //
    // let venueData = req.body;
    //
    // Venue.alter(authToken, venueData, id, function(result) {
    //     res.json(result);
    // });
    res.sendStatus(200);
};