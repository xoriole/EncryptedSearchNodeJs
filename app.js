var express = require('express');
var session = require('express-session');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var app = express();

var mysql = require('mysql'); // node-mysql module
myConnection = require('express-myconnection'); // express-myconnection module
dbOptions = {
      host: 'localhost',
      user: 'root',
      password: '',
      port: 3306,
      database: 'enc_search'
    };

app.use(myConnection(mysql, dbOptions, 'single'));

app.use(session({
    secret: 'HQBDy4KMny#',
    name: 'enc_search',
//    store: sessionStore, // connect-mongo session store
    proxy: true,
    resave: true,
    saveUninitialized: true
}));

var routes = require('./routes/index');
var users = require('./routes/consultant');





// view engine setup
app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'hjs');
app.set('view engine', 'ejs');
// app.set('views', __dirname + '/views');
// app.set('view engine', 'html');
// app.enable('view cache');
// app.engine('html', require('hogan-express'));
// app.set('partials', {head:'partials/head',jsdefaults:'partials/jsdefaults',header:'partials/header',footer:'partials/footer'});


// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(require('less-middleware')(path.join(__dirname, 'public')));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/consultant', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

module.exports = app;
