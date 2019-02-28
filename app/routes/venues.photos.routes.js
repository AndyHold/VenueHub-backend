const photos = require('../controllers/venues.photos.controller');

module.exports = function(app) {
    app.route(app.rootUrl + '/venues/:id/photos')
        .post(photos.create);

    app.route(app.rootUrl + '/venues/:id/photos/:photoFilename')
        .get(photos.read)
        .delete(photos.delete);

    app.route(app.rootUrl + '/venues/:id/photos/:photoFilename/setPrimary')
        .post(photos.primary);
};