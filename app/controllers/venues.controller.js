const Venue = require('../models/venues.model');

exports.list = function(req, res) {
    Venue.getAll(function(result) {
        res.json(result);
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