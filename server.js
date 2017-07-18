var express = require('express');
var path = require('path');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var swiss = require ('./lib/swisstourney.js');

var passport = require('passport');
require('./config/passport')(passport);
var flash    = require('connect-flash');

var host = 'localhost';
    port = 8000;

var app = express();


var handlebars = require('express-handlebars')
                .create({
                    extname  : '.hbs'
                });

app.engine('.hbs', handlebars.engine);
app.set('view engine', '.hbs');
app.use(morgan('dev'));
var session = require('express-session');
var fileStore = require('session-file-store')(session);

var file = {
    path: "./tmp/session",
    useAsync: true,
    reapInterval: 5000,
    maxAge: 100000
}

app.use(session({
    store: new fileStore(file),
    secret: 'kamalrocks',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());

var cookieParser = require('cookie-parser');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser('12345-54321-67890-09876'));//secret key
app.use('/',express.static(path.join(__dirname ,'/views')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash());
var pass = require("./app/route.js");
pass(app, passport);

app.listen(port,host,function(){
    console.log('Server is running');
})
