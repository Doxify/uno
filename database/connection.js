const pgp = require('pg-promise')();

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const connection = pgp(process.env.DATABASE_URL);

module.exports = connection;