var express = require('express');
var router = express.Router();
var se = require('se');
var crypto = require('../models/crypto_');
var db = require('../models/db');

router.get('/', function(req,res,next){
    if(req.session.logged!=true){
        res.redirect('/login');
    }
    next();
});

/* GET home page. */
router.get('/home', function (req, res) {
    req.getConnection(function (err, connection) {
        connection.query("SELECT id, name, username FROM `user_login`, user WHERE user_login.userId=user.id and consultantId=? and role='client'", [req.session.userId ? req.session.userId : 1], function (err, results) {
            if (err) {
                console.log(err);
            }
            res.render('consultant/consultant', {title: 'Home', partials: {nav: 'partials/nav'}, error: {}, clients: results, session: req.session});
        });
    });
});

/* GET client page that consultant see */
router.get('/client/:clientId', function(req,res){
    var clientId = req.param("clientId");
    var clientInfo = {};
    req.getConnection(function (err, connection) {
        connection.query("select * from user, user_login where user.id = user_login.userId and user.id=?",
                [clientId], function (err, results1) {
            if (err) {
                console.log(err);
            }
            clientInfo = results1[0];
        
            connection.query("select id, clientId, particulars, amount, date from record where clientId = ?",
                    [clientId], function (err, results2) {
                if (err) {
                    console.log(err);
                }
                res.render('consultant/client', {title: 'Home', clientInfo:clientInfo, error: {}, session: req.session, clientId:clientId, data:results2});
            });
        });
    });
});

/* POST add client. */
router.post('/add_client', function (req, res) {
    var name = req.body.inputName;
    var username = req.body.inputUsername;
    var password = req.body.inputPassword;


    error = false;
    msg = "success";
    req.getConnection(function (err, connection) {
        // insert into user table
        connection.query("insert into user(username, name, isClient, consultantId) values(?,?,?,?)",
                [username, name, true, req.session.userId], function (err, results) {
            if (err) {
                console.log(err);
                error = true;
            }
        });

        //get user id; set password; insert into user_login table
        connection.query("select id from user where username=?",
                [username], function (err, results) {
            if (err) {
                console.log(err);
                error = true;
            }
            var clientId = results[0].id;

            connection.query("insert into user_login(userId, password, role, enc_password) values(?,?,'client',?)", 
                [clientId, crypto.createHash(password), crypto.encrypt(password, req.session.password)], function (err, results) {
                if (err) {
                    console.log("error inserting user_login");
                    console.log("clientId:" + clientId + ", password:" + password);
                    console.log(err);
                    error = true;
                }
            });
        });

        if (!error) {
            res.locals.msg = "Client added successfully.";
        }
        res.redirect("/consultant/home");
    });
    
});

/* GET delete client */
router.get('/del_client/:clientId', function (req, res) {
    var clientId = req.param("clientId");
    console.log("id: "+clientId);


    error = false;
    msg = "success";
    req.getConnection(function (err, connection) {
        // insert into user table
        connection.query("delete from user_login where userId=?",
                [clientId], function (err, results) {
            if (err) {
                console.log(err);
                error = true;
            }
        });

        //get user id; set password; insert into user_login table
        connection.query("delete from user where id=?",
                [clientId], function (err, results) {
            if (err) {
                console.log(err);
                error = true;
            }
           
        });

        if (!error) {
            res.locals.msg = "Client deleted successfully.";
        }
    });
    res.redirect("/consultant/home");
});

/* POST consultant add data page. */
router.post('/add_data/:clientId', function (req, res) {
    var clientId = req.param("clientId");
    var date = req.body.date;
    var key ="hello world";
    var particulars = se.encrypt(key,req.body.particulars);
    var amount = req.body.amount;
    var authorId = req.session.userId?req.session.userId:1;

    //get password of the client
    var password=null;
    req.getConnection(function (err, connection) {

        connection.query("select enc_password from user_login where userId=?", [clientId], function (err, results) {
            if (err) {
                console.log(err);
            }else{
                password = crypto.decryptAES(results[0].enc_password,req.session.password);

                var summary = crypto.encrypt("Just testing now",password);
                connection.query("INSERT INTO `enc_search`.`record` (`clientId`, `particulars`, `amount`, `authorId`, `summary`, date) VALUES (?, ?, ?, ?, ?,?);",
                        [clientId, particulars, amount, authorId, summary, date], function (err, results) {
                    if (err) {
                        console.log(err);
                        error = true;
                        return;
                    }
                    res.redirect('/consultant/client/'+clientId);
                });
            }
        }); 
    });
});


router.get('/search', function(req,res){
    req.getConnection(function (err, connection) {
        connection.query("select id, username, name from user join user_login on user.id=user_login.userId where role='client' and consultantId=?",
                [req.session.userId], function (err, results) {
            if (err) {
                console.log(err);
            }else{
                console.log("clients:"+results)
                res.render('consultant/search',{
                title: 'Home',  
                error: {}, 
                query: {},
                data:[],
                clients: results,
                session: req.session
                });
            }
           
        });
        
    });
});

router.post('/search', function(req,res){
    var query = req.body;
    var clientId = req.body.clientId;
    var date = req.body.date;
    var particulars = req.body.particulars;
    var amount = req.body.amount;

    var sql="select * from record where";
    if(clientId!=0){
        sql+=" clientId="+clientId;
    }else{
        sql+=" clientId in (select id from user where consultantId = "+req.session.userId+" and isClient=1)";
    }

    if(date!=undefined&& date!=""){
        sql+=" and date='"+date+"'";
    }

    if(amount!=undefined&& amount!=""){
        sql+=" and amount="+amount;
    }

    // sort in descending order
    sql+=" order by id desc";
    console.log(sql);

    req.getConnection(function (err, connection) {
        connection.query("select id, username, name from user join user_login on user.id=user_login.userId where role='client' and consultantId=?",
                [req.session.userId], function (err, results1) {
            if (err) {
                console.log(err);
            }else{
                var clients = results1;
                if(clientId==0){
                    query.client = "All";
                }else{
                    query.client = "N/A";
                    for(var k=0;k<clients.length;k++){
                        if(clients[k].id==clientId){
                            query.client=clients[k].name;
                            break;
                        }
                    }
                }
                connection.query(sql,[], function (err2, results2) {
                    if(err2){
                        console.log(err2);
                    }else{
                        res.render('consultant/search',{
                            title: 'Home',  
                            error: {}, 
                            query:query,
                            data:results2,
                            clients: results1,
                            session: req.session
                        });
                    }
                });
            }
        });
    });

});

/* GET admin key setup page. */
router.get('/logout', function (req, res) {
    req.session = null;
    res.redirect("/login");
});

module.exports = router;
