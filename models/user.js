var mysql = require('mysql');
var connection  = require('express-myconnection'); 
var pool =  mysql.createPool({
	host : "localhost",
	user : "root",
        database: "enc_search",
	password: ""
  });	

//connection.connect();
//connection.query("use enc_search");
  var strQuery = "select * from user";	
  
  connection.query( strQuery, function(err, rows){
  	if(err)	{
  		throw err;
  	}else{
  		console.log( rows );
  	}
  });
  

module.exports = function(user){
    function all(){
        console.log("calling all");
    }
    function authenticate(name, password){
        console.log("authenticating.");
    }
    
};