const Users = require('../models/users.model.js');

exports.register = function() {
    let user_data = req.body;
    let values = [
        [user_data.username],
        [user_data.email],
        [user_data.givenName],
        [user_data.familyName],
        [user_data.password]
    ];
    Users.register(values, function(result) {
        res.json(result);
    });
};

exports.login = function() {
    let user_data = req.body;

    let values = [
        [user_data.username],
        [user_data.email],
        [user_data.password]
    ];

    Users.login(values, function(result) {
        res.json(result);
    });
};

exports.logout = function() {
    let user_data = req.body;
    return null;
};

exports.getUser = function() {
    let id = req.params.id;

    Users.getUser(id, function(result) {
        res.json(result);
    });
};

exports.updateUser = function() {
    let userId = req.params.id,
        user_data = req.body;

    let values = [
        [user_data.username],
        [user_data.email],
        [user_data.givenName],
        [user_data.familyName],
        [user_data.password],
        [userId]
    ];

    Users.updateUser(values, function(result) {
        res.json(result);
    });
};