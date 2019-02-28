const venues = require('../controllers/venues.controller');

module.exports = function(app) {
    app.route(app.rootUrl + '/venues')
        .get(venues.list)
        .post(venues.create);

    app.route(app.rootUrl + '/venues/:Id')
        .get(venues.read)
        .patch(venues.update);

    app.route(app.rootUrl + '/categories')
        .get(venues.catList);
};