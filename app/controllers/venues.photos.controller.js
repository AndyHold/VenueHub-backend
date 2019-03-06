const Photo = require('../models/venues.photos.model');

exports.create = function(req, res) {
    // Get the venue id from the params
    let venueId = req.params.id;
    // Get the photo data from the body
    let photoData = req.body;
    console.log(photoData);
    // Get the auth token from the headers
    let authToken = req.headers["x-authorization"];
    // Call the model class to perform the logic and call the database
    Photo.insert(venueId, photoData, authToken, function(code) {
        // Send the status code via the response
        res.sendStatus(code);
    });
};

exports.read = function(req, res) {
    // let venueId = req.params.id,
    //     filename = req.params.photoFileName;
    //
    // let values = [
    //     [venueId],
    //     [filename]
    // ];
    //
    // Photo.getPhoto(values, function(result) {
    //     res.send(result); // TODO is this correct?
    // });
    res.sendStatus(200);
};

exports.delete = function(req, res) {
    // let venueId = req.params.id,
    //     filename = req.params.photoFileName;
    //
    // let values = [
    //     [venueId],
    //     [filename]
    // ];
    //
    // Photo.remove(values, function(result) {
    //     res.json(result);
    // });
    res.sendStatus(200);
};

exports.primary = function(req, res) {
    // let venueId = req.params.id,
    //     filename = req.params.photoFileName;
    //
    // Photo.setPrimary(venueId, filename, function(result) {
    //     res.json(result);
    // });
    res.sendStatus(200);
};