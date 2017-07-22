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
        console.log(id, "jdkajdk");
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
                    return done(null, false, req.flash('signupMessage', 'That username is already taken.'));
                } else {
                    var newUserMysql = {
                        username: user_name,
                        password: bcrypt.hashSync(pswd, saltRounds)
                    };
                    var insertQuery = "INSERT INTO user ( user_name, password ) values (?,?)";

                    connection.query(insertQuery,[newUserMysql.username, newUserMysql.password],function(err, rows) {
                        newUserMysql.id = rows.insertId;

                        return done(null, newUserMysql);
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
            console.log("asuchi be")
            connection.query("SELECT * FROM user WHERE user_name = ?",[user_name], function(err, rows){
                if (err)
                    return done(err);
                if (!rows.length) {
                    return done(null, false);
                }
                if (!bcrypt.compareSync(pswd, rows[0].password))
                    return done(null, false);
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
            console.log("inside facebook auth", profile._json.email);
            var stmt = "select * from user where user_name = ?";
            connection.query(stmt, [profile._json.email], function(error, result){
                console.log("are eita facebook re");
                if(error)
                    throw error;
                else if(result.length > 0){
                    return done(null, result[0]);
                }
                else{
                        console.log(profile._json.email, "email");
                        var user = new Object();
                        user.name = profile._json.name
                        user.email = profile._json.email;
                        user.password = 'lalalala';
                        user.id = profile._json.id;
                        console.log(profile._json, "useeeer");
                        var stmt = "Insert into user(id,user_name,name, password) values(?,?,?,?)";
                        connection.query(stmt, [user.id,user.email,user.name,user.password], function(error, result){
                            if(error)
                                throw error;
                            else{
                                console.log(result, "useeeerlalallalala");
                                return done(null, user);
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
                console.log("inside kkkiioojfsf");
                if(error)
                    throw error;
                else if(result.length){
                    return done(null, result[0]);
                }
                else{
                        console.log(profile._json.email, "email");
                        var user = new Object();
                        user.user_name = profile._json.emails[0].value;
                        user.password = '308ab220';
                        user.id = profile._json.id;
                        console.log(profile._json.emails[0].value, "useeeer");
                        var stmt = "Insert into user(id,user_name, password) values(?,?, ?)";
                        connection.query(stmt, [user.id,user.user_name, user.password], function(error, result){
                            if(error)
                                throw error;
                            else{
                                console.log(result, "Hiiiihkhgsdkjfh");
                                return done(null, user);
                            }
                        })
                    }
            });
        }
    ));
}
