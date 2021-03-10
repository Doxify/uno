const pgp = require('pg-promise')();

const connection = pgp(process.env.DATABASE_URL + "?sslmode=require");

module.exports = connection;