const pgp = require('pg-promise')();

const connection = pgp(process.env.DATABASE_URL + "sslrequire=true");

module.exports = connection;