const passport = require('passport');
const Strategy = require('passport-local').Strategy;
const User     = require('../database/User');

// Utilizing the passport local strategy.
// 
// NOTE: Does this even encrypt passwords??? 
passport.use(new Strategy((username, password, cb) => {
    User.getByUsername(username, (err, user) => {
        if (err) { return cb(err); }
        if (!user) { return cb(null, false); }
        if (user.password != password) { return cb(null, false); }
        return cb(null, user);
    });
}));

// Configuring the passport session persistence.
passport.serializeUser((user, cb) => {
    cb(null, user.id);
});

passport.deserializeUser((id, cb) => {
    User.getById(id, (err, user) => {
        if (err) { return cb(err); }
        cb(null, user);
    });
});

module.exports = passport;