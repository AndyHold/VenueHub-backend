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
    Venue.getCats(function(result) {
        res.json(result);
    });
};

exports.create = function(req, res) {
    let venue_data = req.body;

    let values = [
        [venue_data.venueName],
        [venue_data.categoryId],
        [venue_data.city],
        [venue_data.shortDescription],
        [venue_data.longDescription],
        [venue_data.address],
        [venue_data.latitude],
        [venue_data.longitude]
    ];

    Venue.insert(values, function(result) {
        res.json(result);
    });
};

exports.read = function(req, res) {
    let id = req.params.id;
    Venue.getOne(id, function(result) {
        res.json(result);
    });
};

exports.update = function(req, res) {
    let id = req.params.id;

    let venue_data = req.body;

    let values = [
        [venue_data.venueName],
        [venue_data.categoryId],
        [venue_data.city],
        [venue_data.shortDescription],
        [venue_data.longDescription],
        [venue_data.address],
        [venue_data.latitude],
        [venue_data.longitude],
        [id]
    ];

    Venue.alter(values, function(result) {
        res.json(result);
    });
};