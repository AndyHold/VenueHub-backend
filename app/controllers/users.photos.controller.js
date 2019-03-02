const Photos = require('../models/users.photos.model.js');

exports.getPhoto = function(req, res) {
    // let id = req.params.id;
    // // req.accessToken;
    // Photos.getPhoto(id, function(result) {
    //     res.json(result);
    // });
    res.sendStatus(200);
};

exports.setPhoto = function(req, res) {
    res.sendStatus(200);
};

exports.deletePhoto = function(req, res) {
    res.sendStatus(200);
};