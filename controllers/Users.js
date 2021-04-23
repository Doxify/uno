const User = require('../database/User');
const bcrypt = require('bcrypt');
const validator = require('validator');

const GENERIC_ERROR = function(response) {
    return response.json({
        status: 'failure',
        message: 'An error occurred while creating this user.'
    })
};

const Controller = {
    validate: (username, email, password) => {
        let errors = [];

        // Checking for username, email, and password presence.
        if(!username || !email || !password) {
            errors.push('Form is incomplete.');
        }

        // Validate username
        if(!validator.isLength(username, { min: 1, max: 64 })) {
            
            errors.push('Username must be between 3 and 64 characters.');
        } else if(!validator.isAlphanumeric(username)) {
            errors.push('Username must only contain letters and numbers. (No spaces, special characters, etc...)');
        }

        // Validate email
        if(!validator.isEmail(email)) {
            errors.push('Email field must contain a valid email address.');
        }

        // Validate password
        if(!validator.isLength(password, { min: 8, max: undefined })) {
            errors.push('Password must be at least 8 characters long.');
        }

        if(errors.size = 0) {
            return null;
        } else {
            return errors;
        }

    },
    create: (request, response, next) => {
        const { username, email, password } = request.body;
        const validationErrors = Controller.validate(username, email, password);

        if (validationErrors.size != 0) {
            return response.json({
                status: 'failure',
                message: validationErrors.join('\n\n')
            });
        } else {
            User.usernameIsUnique(username.toLowerCase())
                .then((usernameIsUnique) => {
                    if(!usernameIsUnique) {
                        return response.json({
                            status: 'failure',
                            message: 'A user with that username already exists'
                        });
                    }

                    User.emailIsUnique(email.toLowerCase())
                        .then((emailIsUnique) => {
                            if(!emailIsUnique) {
                                return response.json({
                                    status: 'failure',
                                    message: 'A user with that email already exists'
                                })
                            }
                            

                            // Hashing the password and saving the user to the db.
                            bcrypt.hash(password, 10, (err, hash) => {
                                if(err) return GENERIC_ERROR(res);
                                
                                const newUser = new User(null, username, email, hash);
                            
                                newUser.save()
                                    .then((userCreated) => {
                                        if (!userCreated) return GENERIC_ERROR(res);

                                        return response.json({
                                            status: 'success',
                                            message: 'User successfully created.',
                                            created_user_id: newUser.id
                                        })
                                    })
                            });
                        })
            })
            .catch((err) => {
                console.log(err);
                return response.json(err);
            });
        }
    }
}

module.exports = Controller;