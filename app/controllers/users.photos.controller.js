const Photos = require('../models/users.photos.model.js');

exports.getPhoto = function(req, res) {
    // Get the user id from the params
    let userId = parseInt(req.params.id);
    // Call the model class to do the logic and call the database
    Photos.getPhoto(userId, function(code, result, imgtype) {
        // If the code is 404
        if (code === 404) {
            // Send the code via the response
            res.sendStatus(code);
            // Otherwise
        } else {
            // Send the code and the resulting object with the type header
            res.setHeader("Content-Type", "image/" + imgtype);
            res.status(code).send(result);
        }
    });
};

exports.setPhoto = function(req, res) {
    // Get the user id from the params
    let userId = parseInt(req.params.id);
    // Get the auth token from the headers
    let authToken = req.headers["x-authorization"];
    // Get the content type from the headers
    let contentType = req.headers["content-type"];
    // Get the picture data from the body
    let picData = req.body;
    // Call the model class to perform the logic and call the database
    Photos.setPhoto(userId, authToken, contentType, picData, function (code) {
        // Return the result code via the response
        res.sendStatus(code);
    });
};

exports.deletePhoto = function(req, res) {
    // Get the user id from the params
    let userId = parseInt(req.params.id);
    // Get the auth token from the headers
    let authToken = req.headers["x-authorization"];
    // Call the model class to perform the logic and call the database
    Photos.deletePhoto(userId, authToken, function (code) {
        // Return the result code via the response
        res.sendStatus(code);
    });
};