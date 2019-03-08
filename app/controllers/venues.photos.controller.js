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
    //     res.send(result);
    // });
    res.sendStatus(200);
};

exports.delete = function(req, res) {
    // Get the venue Id from the params
    let venueId = req.params.id;
    // Get the filename from the params
    let filename = req.params.photoFileName;
    // Get the auth token from the headers
    let authToken = req.headers["x-authorization"];
    // Call the model class to perform the logic and call the database
    Photo.remove(venueId, filename, authToken, function(code) {
        // Send the code in the response
        res.sendStatus(code);
    });
};

exports.primary = function(req, res) {
    // Get the venue id and the filename from the params
    let venueId = req.params.id;
    let filename = req.params.photoFileName;
    // Get the auth token from the headers
    let authToken = req.headers["x-authorization"];
    // Call the model class to perform the logic and call the database
    Photo.setPrimary(venueId, filename, authToken, function(code) {
        // Send the status code via the response
        res.sendStatus(code);
    });
};