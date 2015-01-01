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
            }else{
                var clientId = req.session.userId;
                var consultantInfo = {};
                req.getConnection(function (err, connection) {
                    connection.query("select * from user, user_login where user.id = user_login.userId and user.id=?",
                            [req.session.consultantId], function (err, results1) {
                        if (err) {
                            console.log(err);
                        }
                        consultantInfo = results1[0];
                    
                        var __clientId = crypto.encrypt(clientId+"",req.session.password);
                        connection.query("select id, clientId, particulars, amount, date from record where clientId = ?",
                                [__clientId], function (err, results2) {
                            if (err) {
                                console.log(err);
                            }
                            var decResult = [];
                            for(var d=0;d<results2.length;d++){
                                var row = results2[d];
                                row.clientId = clientId;
                                row.amount = crypto.decrypt(row.amount, req.session.password);
                                row.date = crypto.decrypt(row.date, req.session.password);
                                row.particulars = crypto.decrypt(row.particulars, req.session.password);
                                decResult.push(row);
                            }
                            console.log("result:"+decResult);
                            res.render('client/home', {title: 'Home', consultantInfo:consultantInfo, clients:results, error: {}, session: req.session, clientId:clientId, data:results2});
                        });
                    });
                });
            }
        });
    });
});


/* POST consultant add data page. */
router.post('/add_data', function (req, res) {
    var clientId = req.session.userId;
    var date = req.body.date;
    var particulars = req.body.particulars;
    var amount = req.body.amount;
    var authorId = req.session.userId;
    var summary = "date : "+date+" | particulars: "+particulars+" | amount : "+amount+" clientId : "+clientId

    

    //get password of the client
    var password=req.session.password;
    console.log(crypto.encrypt(particulars,password));
    console.log(crypto.decrypt(crypto.encrypt(particulars,password),password));
    req.getConnection(function (err, connection) {
        var _clientId = crypto.encrypt(clientId+"",password);
        var _date = crypto.encrypt(date+"",password);
        var _particulars = crypto.encrypt(particulars+"",password);
        var _amount = crypto.encrypt(amount+"",password);
        var _authorId = crypto.encrypt(authorId+"",password);
        var _summary = crypto.encrypt(summary,password);
        connection.query("INSERT INTO `record` (`clientId`, `particulars`, `amount`, `authorId`, `summary`, date) VALUES (?, ?, ?, ?, ?,?);",
                [_clientId, _particulars, _amount, _authorId, _summary, _date], function (err, results) {
            if (err) {
                console.log(err);
                error = true;
                return;
            }
            res.redirect('/client/home');
        });

    });
});


router.get('/search', function(req,res){
    res.render('client/search',{
        title: 'Home',  
        error: {}, 
        query: {},
        data:[],
        clients: [],
        session: req.session
    });
});

router.post('/search', function(req,res){
    var query = req.body;
    var clientId = req.session.userId;
    var __clientId = crypto.encrypt(clientId+"",req.session.password);
    var date = req.body.date;
    var particulars = req.body.particulars;
    var amount = req.body.amount;

    var sql="select * from record where clientId='"+__clientId+"'";

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
        connection.query(sql,[], function (err2, results2) {
            if(err2){
                console.log(err2);
            }else{
                var decResult = [];
                var enc_particular = "deposit";
                if(particulars!=undefined && particulars!=""){
                    enc_particular = crypto.encryptQuery(particulars,req.session.password);  
                    for(var d=0;d<results2.length;d++){
                        var row = results2[d];
                        if(crypto.search(row.particulars,enc_particular)){
                            row.clientId = clientId;
                            row.amount = crypto.decrypt(row.amount, req.session.password);
                            row.date = crypto.decrypt(row.date, req.session.password);
                            row.particulars = crypto.decrypt(row.particulars, req.session.password);
                            decResult.push(row); 
                        }
                    }   
                }else{
                    for(var d=0;d<results2.length;d++){
                        var row = results2[d];
                        row.clientId = clientId;
                        row.amount = crypto.decrypt(row.amount, req.session.password);
                        row.date = crypto.decrypt(row.date, req.session.password);
                        row.particulars = crypto.decrypt(row.particulars, req.session.password);
                        decResult.push(row); 
                    }
                }
                

                res.render('client/search',{
                    title: 'Home',  
                    error: {}, 
                    query:query,
                    data:decResult,
                    clients: [],
                    session: req.session
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
