const users = require('../controllers/users.controller');

module.exports = function(app) {
    app.route('/users')
        .post(users.register);

    app.route('/users/login')
        .post(users.login);

    app.route('/users/logout')
        .post(users.logout);

    app.route('/users/:id')
        .get(users.getUser)
        .patch(users.updateUser);
};