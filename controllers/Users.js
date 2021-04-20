const User = require('../database/User');

const Controller = {
    create: (request, response, next) => {
        // TODO: Validate input with more detail (dont just do null check)
        let { username, firstName, lastName, email, password } = request.body;
        

        // Check for unique username and email
        User.getByUsername(username)
            .then((user) => {
                if(user) {
                    return response.json({
                        message: 'A user with that username already exists'
                    })
                }
                return User.getByEmail(email)
            })
            .then((user) => {
                if(user) {
                    return response.json({
                        message: 'A user with that email already exists'
                    })
                }
                // Create the user here...
            })
            .catch((err) => {
                return response.json(err);
            })

    },
    authenticate: (request, response, next) => {
        // TODO: Authenticate user via username and password
    }

}

module.exports = Controller;