const ActiveRecord = require('./ActiveRecord');

class User extends ActiveRecord {
    static table_name = 'users';
    static fields = ['id', 'firstName', 'lastName', 'username', 'email', 'password'];

    id = '';
    username = '';
    firstName = '';
    lastName = ''
    email = '';
    password = '';

    getById(id, cb) {
        // TODO: Figure out how postgres returns data.
        // TODO: Set instance of User after db returns data.
        // return User.findBy('id', id)

    }

    getByUsername(username, cb) {
        // TODO: Figure out how postgres returns data.
        // TODO: Set instance of User after db returns data.
        // return User.findBy('username', username)
    }
    
    // Saves a user to the database with the values from data fields.
    saveUser() {
        // TODO: Perform some check that data fields are valid.
        // Execute database insert method.
    }

};

module.exports = User;