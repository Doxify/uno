const User = require('../database/User');

const Controller = {
    create: (request, response, next) => {
        // TODO: Validate input with more detail (dont just do null check)
        let { username, firstName, lastName, email, password } = request.body;
        
        User.usernameIsUnique(username)
            .then((usernameIsUnique) => {
                if(!usernameIsUnique) {
                    return response.json({
                        message: 'A user with that username already exists'
                    });
                }

                User.emailIsUnique(email)
                    .then((emailIsUnique) => {
                        if(!emailIsUnique) {
                            return response.json({
                                message: 'A user with that email already exists'
                            })
                        }
                        
                        // Attempting to save the user to the database.
                        const newUser = new User(null, username, email, password);
                        
                        newUser.save()
                            .then((userCreated) => {
                                if (!userCreated) { 
                                    return response.json({
                                        message: 'An error occurred while creating this user.'
                                    })
                                }
                                return response.json({
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