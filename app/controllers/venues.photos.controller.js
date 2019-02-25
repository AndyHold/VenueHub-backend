const Photo = require('../models/venues.photos.model');

exports.create = function(req, res) {
    let venueId = req.params.id,
        filename = req.params.photoFileName;
    let photo_data = req.body;

    let photo = photo_data.photo; // TODO What do I do with this?????

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
        res.json(result); // TODO is this correct?
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