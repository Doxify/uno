const User = require('../database/User');

const Controller = {
    create: (request, response, next) => {
        let { username, email, password } = request.body;

        // TODO: Validate input with more detail (dont just do null check)
        if (!username || !email || !password ) {
            return response.json({
                status: 'failure',
                message: 'Form is incomplete.'
            });
        }
        
        User.usernameIsUnique(username)
            .then((usernameIsUnique) => {
                if(!usernameIsUnique) {
                    return response.json({
                        status: 'failure',
                        message: 'A user with that username already exists'
                    });
                }

                User.emailIsUnique(email)
                    .then((emailIsUnique) => {
                        if(!emailIsUnique) {
                            return response.json({
                                status: 'failure',
                                message: 'A user with that email already exists'
                            })
                        }
                        
                        // Attempting to save the user to the database.
                        const newUser = new User(null, username, email, password);
                        newUser.save()
                            .then((userCreated) => {
                                if (!userCreated) { 
                                    return response.json({
                                        status: 'failure',
                                        message: 'An error occurred while creating this user.'
                                    })
                                }
                                return response.json({
                                    status: 'success',
                                    message: 'User successfully created.',
                                    id: newUser.id
                                })
                            })
                    })
            })
            .catch((err) => {
                return response.json(err);
            });
    }
}

module.exports = Controller;