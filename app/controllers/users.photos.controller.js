const Photos = require('../models/users.photos.model.js');

exports.getPhoto = function(req, res) {
    let id = req.params.id;
    // req.accessToken;
    Photos.getPhoto(id, function(result) {
        res.json(result);
    });
    return null;
};

exports.setPhoto = function(req, res) {
    return null;
};

exports.deletePhoto = function(req, res) {
    return null;
};