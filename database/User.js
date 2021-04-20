const ActiveRecord = require('./ActiveRecord');

class User extends ActiveRecord {
    static table_name = "User";
    static fields = ['id', 'firstName', 'lastName', 'username', 'email', 'password'];

    #id = '';
    #username = '';
    #firstName = '';
    #lastName = '';
    #email = '';
    #password = '';

    constructor(id, username, firstName, lastName, email, password) {
        super();
        this.#id = id;
        this.#username = username;
        this.#firstName = firstName;
        this.#lastName = lastName;
        this.#email = email;
        this.#password = password;
    }

    get id() {
        return this.#id;
    }

    get username() {
        return this.#username;
    }

    get firstName() {
        return this.#firstName;
    }

    get lastName() {
        return this.#lastName;
    }

    get email() {
        return this.#email;
    }

    get password() {
        return this.#password;
    }

    getById(id, cb) {
        // TODO: Figure out how postgres returns data.
        // TODO: Set instance of User after db returns data.

    }

    getByUsername(username) {
        // TODO: Figure out how postgres returns data.
        // TODO: Set instance of User after db returns data.
    }
    
    // Saves a user to the database with the values from data fields.
    save() {
        const data = { 
            username: this.#username, 
            email: this.#email, 
            password: this.#password 
        };

        // TODO: Validate data before attempting to insert into database..

        return new Promise((resolve, reject) => {
            User.create(data)
                .then((user) => {
                    if(!user) { resolve(null); }
                    this.#id = user.id;
                    resolve(this);
                })
                .catch((err) => { reject(err); })
        })
    }

    // Returns if a user with a given username exists in the database.
    static usernameIsUnique(username) {
        return new Promise((resolve, reject) => {
            this.findBy('username', username)
                .then((user) => {
                    if (!user) { return resolve(true); }
                    return resolve(false);
                })
                .catch((err) => { reject(err); })
        })
    }

    // Returns if a user with a given email exists in the database.
    static emailIsUnique(email) {
        return new Promise((resolve, reject) => {
            this.findBy('email', email)
                .then((user) => {
                    if (!user) { return resolve(true); }
                    return resolve(false);
                })
                .catch((err) => { reject(err); })
        })
    }

};

module.exports = User;