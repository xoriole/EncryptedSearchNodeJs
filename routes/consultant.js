var express = require('express');
var router = express.Router();
var se = require('se');
var crypto = require('../models/crypto_');
var db = require('../models/db');

router.get('/:kk', function(req,res,next){
    if(req.session.logged!=true){
        res.redirect('/login');
    }else{
        next();
    }
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
                }else{
                    connection.query("select enc_password from user_login where userId=?", [clientId], function (err, results) {
                        if (err) {
                            console.log(err);
                        }else{
                            password = crypto.decrypt(results[0].enc_password,req.session.password);
                            console.log("password:"+password);

                            for(var d=0;d<results2.length;d++){
                                var row = results2[d];
                                row.particulars = crypto.decrypt(row.particulars, password);
                            }
                            res.render('consultant/client', {title: 'Home', clientInfo:clientInfo, error: {}, session: req.session, clientId:clientId, data:results2});
                        }
                    });
                }
                
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
            }else{
                
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
                        }else{
                            res.locals.msg = "Client added successfully.";
                            res.redirect("/consultant/home");
                        }
                    });
                });
            }
        });
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
    var particulars = req.body.particulars;
    var amount = req.body.amount;
    var authorId = req.session.userId;
    var summary = "date : "+date+" | particulars: "+particulars+" | amount : "+amount+" clientId : "+clientId

    //get password of the client
    var password=null;
    req.getConnection(function (err, connection) {

        connection.query("select enc_password from user_login where userId=?", [clientId], function (err, results) {
            if (err) {
                console.log(err);
            }else{
                password = crypto.decrypt(results[0].enc_password,req.session.password);
                console.log("password:"+password);
                summary = crypto.encrypt(summary,password);
                connection.query("INSERT INTO `enc_search`.`record` (`clientId`, `particulars`, `amount`, `authorId`, `summary`, date) VALUES (?, ?, ?, ?, ?,?);",
                        [clientId, crypto.encrypt(particulars,password), amount, authorId, summary, date], function (err, results) {
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
        connection.query("select id, username, name, enc_password from user join user_login on user.id=user_login.userId where role='client' and consultantId=?",
                [req.session.userId], function (err, results1) {
            if (err) {
                console.log(err);
            }else{
                var clients = results1;
                var passwordMap = [];
                for(var k=0;k<clients.length;k++){
                    passwordMap[clients[k].id]=crypto.decrypt(clients[k].enc_password,req.session.password);
                }

                if(clientId==0){
                    query.client = "All";
                }else{
                    query.client = "N/A";
                    for(var k=0;k<clients.length;k++){
                        if(clients[k].id==clientId){
                            query.client=clients[k].name;
                            //passwordMap[clients[k].id]=crypto.decrypt(clients[k].enc_password,req.session.password);
                            break;
                        }
                    }
                }
                console.log(passwordMap);
                connection.query(sql,[], function (err2, results2) {
                    if(err2){
                        console.log(err2);
                    }else{
                        // Apply particular filter here
                        // var filteredResults = [];
                        // if(particulars!=undefined&& amount!=""){   
                        //     for(var count = 0;count<results2.length;count++){
                        //         var _clientId = results2[count].clientId;
                        //         var _particulars = crypto.encrypt(particulars,passwordMap[_clientId]);
                        //         if(crypto.search(results2[count].particulars,_particulars)){
                        //             results2[count].particulars = crypto.decrypt(results2[count].particulars,passwordMap[_clientId]);
                        //             filteredResults.push(results2[count]);
                        //         }
                        //     }
                        // }
                        
                        for(var count = 0;count<results2.length;count++){
                            var _clientId = results2[count].clientId;
                            //console.log(_clientId);
                            //console.log(passwordMap[_clientId]);
                            console.log(particulars);
                            var _particulars = crypto.encrypt(particulars,passwordMap[_clientId]);
                            console.log(_particulars);
                            
                            if(crypto.search(results2[count].particulars,_particulars)){
                                console.log("match found");
                                results2[count].particulars = crypto.decrypt(results2[count].particulars,passwordMap[_clientId]);
                                console.log(results2[count].particulars);
                                // filteredResults.push(results2[count]);
                            }
                        }

                        res.render('consultant/search',{
                            title: 'Home',  
                            error: {}, 
                            query:query,
                            data:results2,
                            // data:filteredResults,
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
