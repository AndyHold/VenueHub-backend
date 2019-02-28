const Photo = require('../models/venues.photos.model');
const fileSystem = require("fs");

exports.create = function(req, res) {
    let venueId = req.params.id,
        filename = req.params.photoFileName;
    let photo_data = req.body;

    let photo = photo_data.photo; // TODO Does this work?
    fileSystem.writeFile("venue_photos\\" + venueId + "\\" + filename, photo, function(err) {
        if (err) throw err;
    });

    let values = [
        [venueId],
        [filename],
        [photo_data.description],
        [photo_data.makePrimary]
    ];

    Photo.insert(values, function(result) {
        res.json(result);
    });
};

exports.read = function(req, res) {
    let venueId = req.params.id,
        filename = req.params.photoFileName;

    let values = [
        [venueId],
        [filename]
    ];

    Photo.getPhoto(values, function(result) {
        res.send(result); // TODO is this correct?
    });
};

exports.delete = function(req, res) {
    let venueId = req.params.id,
        filename = req.params.photoFileName;

    let values = [
        [venueId],
        [filename]
    ];

    Photo.remove(values, function(result) {
        res.json(result);
    });
};

exports.primary = function(req, res) {
    let venueId = req.params.id,
        filename = req.params.photoFileName;

    Photo.setPrimary(venueId, filename, function(result) {
        res.json(result);
    });
};