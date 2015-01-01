var express = require('express');
var router = express.Router();
var crypto = require('../models/crypto_');
var se = require('se');
//var user = require('../models/user');

/* GET home page. */
router.get('/', function (req, res) {
    if (req.session.logged) {
        if(req.session.role=="consultant"){
            res.redirect("/consultant/home");
        }else if(req.session.role=="client"){
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
        connection.query("SELECT user.id, user.name, user.username, user_login.role, user.consultantId FROM user_login, user WHERE user.id=user_login.userId and user.username=? and user_login.password=?", [username, crypto.createHash(password)], function (err, results) {
            if (err)
                console.log(err);
            if (results.length > 0) {
                req.session.logged = true;
                req.session.userId = results[0].id;
                req.session.username = results[0].username;
                req.session.role = results[0].role;
                req.session.name = results[0].name;
                req.session.consultantId = results[0].consultantId;
                req.session.password = password;
                //console.log(req.session);
                if(results[0].role=="consultant"){
                    //select all clients of consultant and their key
                    //connection.query("SELECT user.id, user.name, user.username, user_login.role, user.consultantId FROM user_login, user WHERE user.id=user_login.userId and user.username=? and user_login.password=?", [username, crypto.createHash(password)], function (err, results) {
        

                    res.redirect("/consultant/home");
                }else{
                    res.redirect("/client/home");
                }
                
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

router.get('/test',function(req,res){
    var particulars = "deposit to bank";
    var query = "deposit";
    var encPart = crypto.encrypt(particulars,"password");
    var encQuery = crypto.encrypt(query, "password");
    var result = crypto.search(encPart,encQuery);
    console.log(result);

    var key = "sdiovjq387ghafivna";
    var text = "deposit to bank";
  
    var cipher = crypto.encrypt(text,key)
  
    //var e_keyword = se.encrypt_word(key, 'deposit')
    var e_keyword = crypto.encryptQuery('deposit',key)
    //var e_keyword = se.encrypt_word(key,'deposit')
    console.log("deposit:"+se.search(cipher, e_keyword));
  
    //var e_keyword = se.encrypt_word(key, 'bank')
    var e_keyword = crypto.encryptQuery('bank',key)
    console.log("bank:"+se.search(cipher, e_keyword));

    var q = "04980f1d2edaeae25f914c98d8b689db";
    var tex="6b9293d868c2337775d33ccec1145a9e918207f804d3f3e604b1d49e3c260b95bf3b30a9b19b2f10ec615cf99fe300e15764570bc796d0de765fe813c0c1f1dc";

    console.log("match:"+se.search(tex,q));
    console.log("match2:"+crypto.search(tex,q));
    res.send("result:"+result);
});

module.exports = router;
