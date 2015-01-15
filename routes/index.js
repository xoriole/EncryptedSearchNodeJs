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

    var _username=crypto.encryptAES(username,password);
    var _password=crypto.createHash(password);

    req.getConnection(function (err, connection) {
        connection.query("SELECT * FROM user WHERE email=? and password=?", [_username, _password], function (err, results) {
            if (err){
                console.log(err);
            }
            if (results.length > 0) {
                console.log(results);
                req.session.logged = true;
                req.session.userId = results[0].id; //int
                req.session.username = crypto.decryptAES(results[0].email,password);                 
                req.session.role = crypto.decryptAES(results[0].role,password); //encrypted
                req.session.name = crypto.decryptAES(results[0].name, password); 
                //console.log("name:"+req.session.name);
                req.session.consultantId = crypto.decryptAES(results[0].consultantId+"", password);
                req.session.password = password;
                //req.session.role = crypto.decryptAES(results[0].role,password);
                //console.log(req.session.role);
                if(req.session.role=="consultant"){
                    //select all clients of consultant and their key
                    res.redirect("/consultant/home");
                }else{
                    req.session.consultantName=crypto.decryptAES(results[0].consultant_name,password);
                    res.redirect("/client/home");
                }
                
            } else {
                error_msg = "Incorrect username or password.";
                res.render('login', {title: 'Login', error: {error_msg: error_msg}, msg: ""});
            }
        });
    });
});

router.get('/register',function(req,res){
    res.render('register',{title: 'Key Setup',error:{}})
});

router.post('/register',function(req,res){
    var _name = req.body.inputName;
    var _username = req.body.inputUsername;
    var _password = req.body.inputPassword;

    req.getConnection(function (err, connection) {
        var username=crypto.encryptAES(_username,_password);
        var password=crypto.createHash(_password);
        var enc_password = crypto.encryptAES(_password,_password);
        var role=crypto.encryptAES("consultant",_password);
        var name=crypto.encryptAES(_name,_password);
        var consultantId=crypto.encryptAES("0",_password); // dummy id for now
        var consultantName=crypto.encryptAES(_name,_password);


        var sql = "insert into user(email, name, consultantId, consultant_name, password, enc_password, role) values(?,?,?,?,?,?,?)";
        connection.query(sql,
                [username, name, consultantId, consultantName, password ,enc_password, role], function (err, results) {
            if (err) {
                console.log("error inserting user_login");
                console.log("username:" + username + ", password:" + password);
                console.log(err);
                error = true;
            }else{
                // find consultant id
                var _consultantId = 0;
                connection.query("select id from user where email=?",[username],function(err2,results2){
                    if(!err2){
                        _consultantId=results2[0].id;
                        // update consultant id in user table
                        var __consultantId=crypto.encryptAES(_consultantId+"",_password);
                        console.log("updated consultant id:"+__consultantId);
                        connection.query("update user set consultantId=? where id=?",[__consultantId,_consultantId],function(err3,results3){
                            if(err3){
                                console.log(err3);
                            }else{
                                console.log("updated consultant id");
                            }
                        });
                    }
                });

                res.locals.msg = "Consultant added successfully.";
                res.redirect("/login");
            }
        });
    });

    //res.render('register',{title: 'Key Setup',error:{}})
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
    var text = "teset to bank";
  
    var cipher = crypto.encrypt(text,key)
  
    //var e_keyword = se.encrypt_word(key, 'deposit')
    var e_keyword = crypto.encryptQuery('teset to',key)
    //var e_keyword = se.encrypt_word(key,'deposit')
    console.log("deposit to bank:"+se.search(cipher, e_keyword));
  
    //var e_keyword = se.encrypt_word(key, 'bank')
    var e_keyword = crypto.encryptQuery('bank',key)
    console.log("bank:"+se.search(cipher, e_keyword));

    var q = "04980f1d2edaeae25f914c98d8b689db";
    var tex="6b9293d868c2337775d33ccec1145a9e918207f804d3f3e604b1d49e3c260b95bf3b30a9b19b2f10ec615cf99fe300e15764570bc796d0de765fe813c0c1f1dc";
    //var tex="6b9293d868c2337775d33ccec1145a9e918207f804d3f3e604b1d49e3c260b95bf3b30a9b19b2f10ec615cf99fe300e15764570bc796d0de765fe813c0c1f1dc";

    console.log("match:"+se.search(tex,q));
    console.log("match2:"+crypto.search(tex,tex));

    console.log("======================================")
    password = "sandip";
    console.log(crypto.createHash(password)+"/"+ crypto.encryptAES(password, password));
    console.log("role:"+crypto.encryptAES("consultant",password));
    console.log("consultant id:"+crypto.encryptAES("1",password));
    res.send("result:"+result);
});

router.get('/admin_test',function(req,res){
    var id=1;
    var _password="sandip";
    var username=crypto.createHash(_password);
    var password=crypto.createHash(_password);
    var enc_password = crypto.encryptAES(_password,_password);
    var role=crypto.encryptAES("consultant",_password);
    var name=crypto.encryptAES("Sandip Pandey",_password);
    var consultantId=crypto.encryptAES(id+"",_password);
    var consultantName=crypto.encryptAES("Sandip Pandey",_password);

    console.log("======================================")
    console.log("id: "+id);
    console.log("username: "+username);
    console.log("password: "+password);
    console.log("enc_password: "+enc_password);
    console.log("role: "+role);
    console.log("name: "+name);
    console.log("consultantId: "+consultantId);
    console.log("consultantName: "+consultantName);

    //two login
    // sandip/sandip
    // phoenix/phoenix
    res.send("result:"+id);
});
module.exports = router;
