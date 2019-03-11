const photos = require('../controllers/users.photos.controller');
bodyparser = require("body-parser");

module.exports = function(app) {
    app.route(app.rootUrl + '/users/:id/photo')
        .get(photos.getPhoto)
        .put(bodyparser.raw({type: 'image/jpeg', limit: '5mb'}, {type: 'image/png', limit: '5mb'}), photos.setPhoto)
        .delete(photos.deletePhoto);
};