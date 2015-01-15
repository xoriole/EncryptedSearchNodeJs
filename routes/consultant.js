var express = require('express');
var router = express.Router();
var se = require('se');
var crypto = require('../models/crypto_');
//var db = require('../models/db');

router.get('/:kk', function(req,res,next){
    if(req.session.logged!=true){
        res.redirect('/login');
    }else{
        req.getConnection(function (err, connection) {
            var consultantId = req.session.userId;
            var password = req.session.password;
            var _consultantId = crypto.encryptAES(consultantId+"",password)
            connection.query("select id, name, enc_password password from user where consultantId=? and id!=?",
                [_consultantId,consultantId], function (err, results2) {
                if (err) {
                    console.log(err);
                }else{
                    var clientPasswordMap={};
                    var clientNameMap={};
                    var clientReverseMap={};
                    for(var i=0;i<results2.length;i++){
                        var cPassword = crypto.decryptAES(results2[i].password, password);
                        var cName=crypto.decryptAES(results2[i].name,cPassword);
                        clientPasswordMap[results2[i].id]=cPassword;
                        clientNameMap[results2[i].id+""]= cName;
                        clientReverseMap[crypto.encrypt(results2[i].id+"",cPassword)] = results2[i].id;
                    }
                    req.session.clientPasswordMap = clientPasswordMap;
                    req.session.clientNameMap = clientNameMap;
                    req.session.clientReverseMap = clientReverseMap;
                    console.log(req.session.clientReverseMap);
                    console.log(req.session.clientPasswordMap);
                }
            });
            next();
        });
    }
});

/* GET home page. */
router.get('/home', function (req, res) {
    req.getConnection(function (err, connection) {
        var consultantId = req.session.userId;
        var password = req.session.password;

        var _consultantId = crypto.encryptAES(consultantId+"",password);
        connection.query("SELECT * FROM user WHERE consultantId=? and id!=?", [_consultantId,consultantId], function (err, results) {
            if (err) {
                console.log(err);
            }
            var _results=[];
            for(var k=0;k<results.length;k++){
                var _password = crypto.decryptAES(results[k].enc_password,password);
                var row = results[k];
                row['username']=crypto.decryptAES(row['email'],_password);
                row['name']=crypto.decryptAES(row['name'],_password);
                _results.push(row);
            }
            res.render('consultant/consultant', {title: 'Home', error: {}, clients: _results, session: req.session});
        });
    });
});

/* GET client page that consultant see */
router.get('/client/:clientId', function(req,res){
    var consultantId = req.session.userId;
    var consultantPassword = req.session.password;

    var clientId = req.param("clientId");
    var clientInfo = {};
    req.getConnection(function (err, connection) {
        connection.query("select * from user where user.id=?",
                [clientId], function (err, results1) {
            if (err) {
                console.log(err);
            }
            clientInfo = results1[0];
            var clientPassword = crypto.decryptAES(clientInfo['enc_password'],consultantPassword)
            clientInfo['name'] = crypto.decryptAES(clientInfo['name'],clientPassword);
            clientInfo['username'] = crypto.decryptAES(clientInfo['email'],clientPassword);

            console.log("client password: "+clientPassword)
            var _clientId = crypto.encrypt(clientId+"",clientPassword);
            connection.query("select id, clientId, particulars, amount, date from record where clientId = ?",
                    [_clientId], function (err, results2) {
                if (err) {
                    console.log(err);
                }else{
                    var decResult = [];
                    for(var d=0;d<results2.length;d++){
                        var row = results2[d];
                        row.clientId = clientId;
                        row.amount = crypto.decrypt(row.amount, clientPassword);
                        row.date = crypto.decrypt(row.date, clientPassword);
                        row.particulars = crypto.decrypt(row.particulars, clientPassword);
                        decResult.push(row);
                    }
                    res.render('consultant/client', {title: 'Home', clientInfo:clientInfo, error: {}, session: req.session, clientId:clientId, data:decResult});
                }
                
            });
        });
    });
});

/* POST add client. */
router.post('/add_client', function (req, res) {
    var _name = req.body.inputName;
    var _username = req.body.inputUsername;
    var _password = req.body.inputPassword;


    error = false;
    msg = "success";
    req.getConnection(function (err, connection) {
        var consultantPassword = req.session.password;
        var consultantId = req.session.userId;
        var consultantName = req.session.name;

        var username=crypto.encryptAES(_username,_password);
        var password=crypto.createHash(_password);
        var enc_password = crypto.encryptAES(_password,consultantPassword);
        var role=crypto.encryptAES("client",_password);
        var name=crypto.encryptAES(_name,_password);
        var consultantId=crypto.encryptAES(consultantId+"",consultantPassword);
        var consultantName=crypto.encryptAES(consultantName,_password);

        // insert into user table
        var sql = "insert into user(email, name, consultantId, consultant_name, password, enc_password, role) values(?,?,?,?,?,?,?)";
        connection.query(sql,
            [username, name, consultantId, consultantName, password ,enc_password, role], function (err, results) {
                if (err) {
                    console.log("error inserting user_login");
                    console.log("username:" + username + ", password:" + password);
                    console.log(err);
                    error = true;
                }else{
                    res.locals.msg = "Client added successfully.";
                    res.redirect("/consultant/home");
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

        connection.query("select enc_password from user where id=?", [clientId], function (err, results) {
            if (err) {
                console.log(err);
            }else{
                password = crypto.decryptAES(results[0].enc_password,req.session.password);
                console.log("password:"+password);

                var _clientId = crypto.encrypt(clientId+"",password);
                var _date = crypto.encrypt(date+"",password);
                var _particulars = crypto.encrypt(particulars+"",password);
                var _amount = crypto.encrypt(amount+"",password);
                var _authorId = crypto.encrypt(authorId+"",password);
                var _summary = crypto.encrypt(summary,password);

                connection.query("INSERT INTO record (`clientId`, `particulars`, `amount`, `authorId`, `summary`, date) VALUES (?, ?, ?, ?, ?,?);",
                        [_clientId, _particulars, _amount, _authorId, _summary, _date], function (err, results) {
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
        var password = req.session.password;
        var consultantId = req.session.userId;
        var _consultantId = crypto.encryptAES(consultantId+"",password)
        connection.query("select id, email, name, enc_password from user where consultantId=? and id!=?",
                [_consultantId,consultantId], function (err, results) {
            if (err) {
                console.log(err);
            }else{
                for(var i=0;i<results.length;i++){
                    var cPassword = crypto.decryptAES(results[i].enc_password,password);
                    //results[i].name= crypto.decryptAES(results[i].name,cPassword);
                    results[i].name = req.session.clientNameMap[results[i].id];
                }
                console.log("clients:"+results)
                res.render('consultant/search',{
                title: 'Home',  
                error: {}, 
                query: {},
                data:[],
                clients: results,
                clientNameMap: req.session.clientNameMap,
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
        sql+=" clientId='"+crypto.encrypt(clientId+"",req.session.clientPasswordMap[clientId])+"' ";
    }else{
        var inQuery="";
        for(var keys in req.session.clientReverseMap){
            inQuery+="\'"+keys+"\',";
        }
        inQuery=inQuery.substr(0,inQuery.length-1);
        sql+=" clientId in ("+inQuery+")";
    }

    console.log("date:"+date);
    if(date!=undefined&& date!=""){

        if(clientId!=0){
            sql+=" and date='"+crypto.encrypt(date,req.session.clientPasswordMap[clientId])+"'";
        }else{
            var dateQuery = "";
            for(var keys in req.session.clientPasswordMap){
                dateQuery+="\'"+crypto.encrypt(date,req.session.clientPasswordMap[keys])+"\',";
            }
            dateQuery=dateQuery.substr(0,dateQuery.length-1);
            sql+=" and date in ("+dateQuery+")";
        }
        
    }

    console.log("amount:"+amount);
    if(amount!=undefined&& amount!=""){

        if(clientId!=0){
            sql+=" and amount='"+crypto.encrypt(amount+"",req.session.clientPasswordMap[clientId])+"'";
        }else{
            var amountQuery = "";
            for(var keys in req.session.clientPasswordMap){
                console.log("keys:"+keys);
                console.log("amount:"+amount);
                console.log("client pass:"+req.session.clientPasswordMap[keys]);
                amountQuery+="\'"+crypto.encrypt(amount+"",req.session.clientPasswordMap[keys])+"\',";
            }
            amountQuery=amountQuery.substr(0,amountQuery.length-1);
            sql+=" and amount in ("+amountQuery+")";
        }
        
    }

    // sort in descending order
    sql+=" order by id desc";
    console.log(sql);

    var filteredResults=[];
    req.getConnection(function (err, connection) {
        if(clientId==0){
            query.client = "All";
        }else{
            query.client = req.session.clientNameMap[clientId];
        }

        connection.query(sql,[], function (err2, results2) {
            if(err2){
                console.log(err2);
            }else{
                console.log("Found results: "+results2.length);
                for(var count = 0;count<results2.length;count++){
                    var _clientId = results2[count].clientId; // encrypted client Id
                    var __clientId = req.session.clientReverseMap[_clientId]; // plain client id (integer)
                    var __password = req.session.clientPasswordMap[__clientId]; // plain password of client

                    if(particulars!="" && particulars!=undefined){
                        var match = false;
                        var _parts = particulars.match(/(\w+)/g);
                        for(var index in _parts){
                            var _query = _parts[index];
                            var _particulars = crypto.encryptQuery(_query,__password);
                            match=crypto.search(results2[count].particulars,_particulars);
                            if(match==false) break;
                        }
                        if(match){
                            results2[count].date=crypto.decrypt(results2[count].date,__password);
                            results2[count].particulars=crypto.decrypt(results2[count].particulars,__password);
                            results2[count].amount=crypto.decrypt(results2[count].amount,__password);
                            filteredResults.push(results2[count]);
                        }
                    }else{
                        results2[count].date=crypto.decrypt(results2[count].date,__password);
                        results2[count].particulars=crypto.decrypt(results2[count].particulars,__password);
                        results2[count].amount=crypto.decrypt(results2[count].amount,__password);
                        filteredResults.push(results2[count]);
                    }
                    
                }

                res.render('consultant/search',{
                    title: 'Home',  
                    error: {}, 
                    query:query,
                    //data:results2,
                    data:filteredResults,
                    clientNameMap: req.session.clientNameMap,
                    // data:filteredResults,
                    // clients: results,
                    session: req.session
                });
            }
        });
    });

});

/* GET admin logout page. */
router.get('/logout', function (req, res) {
    req.session = null;
    res.redirect("/login");
});

module.exports = router;
