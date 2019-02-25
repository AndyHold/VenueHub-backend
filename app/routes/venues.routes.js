const venues = require('../controllers/venues.controller');

module.exports = function(app) {
    app.route('/venues')
        .get(venues.list)
        .post(venues.create);

    app.route('/venues/:Id')
        .get(venues.read)
        .patch(venues.update);

    app.route('/categories')
        .get(venues.catList);
};