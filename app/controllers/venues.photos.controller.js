const Photo = require('../models/venues.photos.model');

exports.create = function(req, res) {
    // Get the venue id from the params
    let venueId = req.params.id;
    // Get the photo data from the body
    let photoData = req.file;
    // Get the body from the request
    let photoBody = req.body;
    // Get the auth token from the headers
    let authToken = req.headers["x-authorization"];
    // Call the model class to perform the logic and call the database
    Photo.insert(venueId, photoData, photoBody, authToken, function(code) {
        // Send the status code via the response
        res.sendStatus(code);
    });
};

exports.read = function(req, res) {
    // Get the venue ID from the request params
    let venueId = req.params.id;
    // Get the filename form the request params
    let filename = req.params.photoFileName;
    // Call the model class to perform the logic and call the database
    Photo.getPhoto(venueId, filename, function(code, result, imageType) {
        // If the code is 404 - Not Found
        if (code === 404) {
            // Send the code in the response
            res.sendStatus(code);
        } else {
            // Send the code and the photo data in the response
            res.setHeader("Content-Type", "image/" + imageType);
            res.status(code).send(result);
        }
    });
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