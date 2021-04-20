const ActiveRecord = require('./ActiveRecord');

class User extends ActiveRecord {
    static table_name = "User";
    static fields = ['id', 'firstName', 'lastName', 'username', 'email', 'password'];

    id = '';
    username = '';
    firstName = '';
    lastName = ''
    email = '';
    password = '';

    constructor(id, username, firstName, lastName, email, password) {
        this.id = id;
        this.username = username;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.password = password;
    }

    getById = function (id, cb) {
        // TODO: Figure out how postgres returns data.
        // TODO: Set instance of User after db returns data.
        // return User.findBy('id', id)

    }

    static getByUsername = function(username) {
        // TODO: Figure out how postgres returns data.
        // TODO: Set instance of User after db returns data.
        return new Promise((resolve, reject) => {
            this.findBy('username', username).then((user) => {
                if(!user) { return resolve(null); };
                resolve(user);
            });
        })
    }
    
    // Saves a user to the database with the values from data fields.
    saveUser = function() {
        // TODO: Perform some check that data fields are valid.
        // Execute database insert method.
    }

};

module.exports = User;