var express = require('express');
var router = express.Router();
var crypto = require('../models/crypto_');
//var user = require('../models/user');

/* GET home page. */
router.get('/', function (req, res) {
    if (req.session.logged) {
        if(req.session.role=="consultant"){
            res.redirect("/consultant/home");
        }else{
            res.redirect("/client/home");
        }
    } else {
        res.redirect("/login");
    }
});

/* GET login page. */
router.get('/login', function (req, res) {
    console.log(crypto.createHash('admin'));
    console.log(crypto.encryptAES('admin','admin'));
    req.session.username="";
    req.session.role="";
    res.locals.session = req.session;
    res.render('login', {title: 'Login', partials: {nav: 'partials/nav'}, msgs: ["hello"], session:res.locals.session, error:{}});
});

/* POST login page. */
router.post('/login', function (req, res) {
    console.log(req.body);
    var username = req.body.inputUsername;
    var password = req.body.inputPassword;

    req.getConnection(function (err, connection) {
        connection.query("SELECT user.id, user.username, user_login.role FROM user_login, user WHERE user.id=user_login.userId and user.username=? and user_login.password=?", [username, crypto.createHash(password)], function (err, results) {
            if (err)
                console.log(err);
            if (results.length > 0) {
                req.session.logged = true;
                console.log(results);
                req.session.userId = results[0].id;
                req.session.username = results[0].username;
                req.session.role = results[0].role;
                req.session.password = password;
                //console.log(req.session);
                res.redirect("/consultant/home");
            } else {
                error_msg = "Incorrect username or password.";
                res.render('login', {title: 'Login', partials: {nav: 'partials/nav'}, error: {error_msg: error_msg}, msg: ""});
            }
        });
    });
});

/* GET admin key setup page. */
router.get('/key_setup', function (req, res) {
    res.render('key_setup', {title: 'Key Setup', partials: {nav: 'partials/nav'}});
});

/* GET admin key setup page. */
router.get('/insert', function (req, res) {
    res.render('insert', {title: 'Insert new client data', partials: {nav: 'partials/nav'}});
});

/* GET admin key setup page. */
router.get('/search', function (req, res) {
    if(req.session.role=="consultant"){
        res.redirect("/consultant/search");
    }else if(req.session.role=="client"){
        res.redirect("/client/search");
    }else{
        res.redirect("/login");
    }
});

/* GET admin key setup page. */
router.get('/logout', function (req, res) {
    req.session = null;
    res.redirect("/login");
});

module.exports = router;
