const photos = require('../controllers/users.photos.controller');

module.exports = function(app) {
    app.route(app.rootUrl + '/users/:id/photo')
        .get(photos.getPhoto)
        .put(photos.setPhoto)
        .delete(photos.deletePhoto);
};