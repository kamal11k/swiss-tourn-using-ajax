var LocalStrategy   = require('passport-local').Strategy;
var FacebookStrategy = require('passport-facebook').Strategy;
var GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;
var bcrypt = require('bcrypt');
const saltRounds = 10;
var mysql = require('mysql');
var auth = require('./auth');
var dbconfig = require('./database');
var connection = mysql.createConnection(dbconfig.connection);
connection.query('USE ' + dbconfig.database);
module.exports = function(passport) {

    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
        connection.query("SELECT * FROM user WHERE id = ? ",[id], function(err, rows){
            done(err, rows[0]);
        });
    });



    passport.use(
        'local-signup',
        new LocalStrategy({
            usernameField : 'user_name',
            passwordField : 'pswd',
            passReqToCallback : true
        },
        function(req, user_name, pswd, done) {
            connection.query("SELECT * FROM user WHERE user_name = ?",[user_name], function(err, rows) {
                if (err)
                    return done(err);
                if (rows.length) {
                    return done(null, false, req.flash('signupMessage', 'The username has already been taken.'));
                } else {
                    var date = new Date();
                    var components = [
                        date.getYear(),
                        date.getMonth(),
                        date.getDate(),
                        date.getHours(),
                        date.getMinutes(),
                        date.getSeconds(),
                        date.getMilliseconds()
                    ];
                    var id = components.join("");
                    var name = req.body.name;
                    var newUser = {
                        id,
                        user_name,
                        name,
                        password: bcrypt.hashSync(pswd, saltRounds)
                    };
                    var insertQuery = "INSERT INTO user ( id,user_name,name, password ) values (?,?,?,?)";

                    connection.query(insertQuery,[newUser.id,newUser.user_name,newUser.name,newUser.password],function(err, rows) {

                        return done(null, newUser, req.flash('signupMessage', 'Registration successful!! Log in to continue'));
                    });
                }
            });
        })
    );



    passport.use(
        'local-login',
        new LocalStrategy({
            usernameField : 'user_name',
            passwordField : 'pswd',
            passReqToCallback : true
        },
        function(req, user_name, pswd, done) {
            connection.query("SELECT * FROM user WHERE user_name = ?",[user_name], function(err, rows){
                if (err)
                    return done(err);
                if (!rows.length) {
                    return done(null, false, req.flash('loginMessage', 'No user found.'));
                }
                if (!bcrypt.compareSync(pswd, rows[0].password))
                    return done(null, false, req.flash('loginMessage', 'Oops! Wrong password.'));
                return done(null, rows[0]);
            });
        })
    );

    passport.use(new FacebookStrategy({
        clientID        : auth.facebookAuth.clientID,
        clientSecret    : auth.facebookAuth.clientSecret,
        callbackURL     : auth.facebookAuth.callbackURL,
        profileFields: ['id', 'displayName', 'photos', 'email']
    },
        function(accessToken, refreshToken, profile, done) {
            var stmt = "select * from user where user_name = ?";
            connection.query(stmt, [profile._json.email], function(error, result){
                if(error)
                    throw error;
                else if(result.length > 0){
                    return done(null, result[0]);
                }
                else{
                    var newUser = {
                        id : profile._json.id,
                        name : profile._json.name,
                        user_name : profile._json.email,
                        password : bcrypt.hashSync('secret_password', saltRounds),
                    }
                    var stmt = "Insert into user(id,user_name,name, password) values(?,?,?,?)";
                    connection.query(stmt, [newUser.id,newUser.user_name,newUser.name,newUser.password], function(error, result){
                        if(error)
                            throw error;
                        else{
                            return done(null, newUser);
                        }
                    })
                }
            });
        }
    ));

    passport.use(new GoogleStrategy({
        clientID        : auth.googleOAuth.clientID,
        clientSecret    : auth.googleOAuth.clientSecret,
        callbackURL     : auth.googleOAuth.callbackURL,
        profileFields: ['id', 'displayName', 'photos', 'email']
    },
        function(accessToken, refreshToken, profile, done) {
            var stmt = "select * from user where user_name = ?";
            connection.query(stmt, [profile._json.emails[0].value], function(error, result){
                if(error)
                    throw error;
                else if(result.length){
                    return done(null, result[0]);
                }
                else{
                    var user = new Object();
                    user.user_name = profile._json.emails[0].value;
                    user.password = bcrypt.hashSync('secret_password', saltRounds);
                    user.id = profile._json.id;
                    var stmt = "Insert into user(id,user_name, password) values(?,?,?)";
                    connection.query(stmt, [user.id,user.user_name,user.password], function(error, result){
                        if(error)
                            throw error;
                        else{
                            return done(null, user);
                        }
                    })
                }
            });
        }
    ));
}
