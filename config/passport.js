var LocalStrategy   = require('passport-local').Strategy;
var bcrypt = require('bcrypt');
const saltRounds = 10;
var mysql = require('mysql');
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
};
