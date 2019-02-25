const photos = require('../controllers/venues.photos.controller');

module.exports = function(app) {
    app.route('/venues/:id/photos')
        .post(photos.create);

    app.route('/venues/:id/photos/:photoFilename')
        .get(photos.read)
        .delete(photos.delete);

    app.route('/venues/:id/photos/:photoFilename/setPrimary')
        .post(photos.primary);
};