const bcrypt = require('bcrypt');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const JWTStrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;

const Public = require('./models/public');

//bcrypt salt rounds
const BCRYPT_SALT_ROUNDS = 12;

module.exports = () => {
    //local strategy for registering a new user
    passport.use('register', new LocalStrategy({
        usernameField: 'phoneNumber',
        userEmailField: 'email',
        passwordField: 'password',
        session: false
    }, (username, email, password, done) => {
        console.log(`${username}\n${email}`);
        Public.findOne(username)
            .then(user => {
                if (user) {
                    console.log(`username already taken`);
                    return done(null, false, {
                        message: `${user.username} is already taken`
                    });
                }else{
                    Public.findOne(email)
                    .then(user=>{
                        console.log(``)
                    })
                }
            })
    }))
};