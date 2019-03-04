const Photos = require('../models/users.photos.model.js');

exports.getPhoto = function(req, res) {
    // Get the user id from the params
    let userId = parseInt(req.params.id);
    // Call the model class to do the logic and call the database
    Photos.getPhoto(id, function(code, result) {
        // If the code is 404
        if (code === 404) {
            // Send the code via the response
            res.sendStatus(code);
            // Otherwise
        } else {
            // Send the code and the resulting object
            res.status(code).send(result); // TODO not sure if this is correct...?
        }
    });
};

exports.setPhoto = function(req, res) {
    res.sendStatus(200);
};

exports.deletePhoto = function(req, res) {
    res.sendStatus(200);
};