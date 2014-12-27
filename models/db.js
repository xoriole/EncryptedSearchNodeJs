var crypto = require('./crypto_');

module.exports = {
	getClientPassword: function(clientId, connection, err){
		var encPassword = "";
		connection.query("select enc_password from user_login where userId=?", [clientId], function (err, results) {
            if (err) {
                console.log(err);
            }else{
            	console.log("results:"+results[0].enc_password);
            	encPassword = results[0].enc_password;
            }
        });
        console.log("db enc pass:"+encPassword)
        return encPassword;
	},

	getClientData: function(clientId, connection, err){
		var data = [];
		connection.query("select id, clientId, particulars, amount, date from record where clientId = ?",
                [clientId], function (err, results) {
                    console.log("result:"+results);
            if (err) {
                console.log(err);
            }
            data = results;
        });
        return data;
	},

	getClientInfo: function(clientId, connection, err){
		var clientInfo = {};
		connection.query("select * from user, user_login where user.id = user_login.userId and user.id=?",
                [clientId], function (err, results) {
            if (err) {
                console.log(err);
            }
            clientInfo = results[0];
            return clientInfo;
        });
        console.log(clientInfo);
        return clientInfo;
	},

	getClients: function(consultantId, connection, err){
		var clients = [];
		connection.query("select id, username, name from user join user_login on user.id=user_login.userId where role='client' and consultantId=?",
                [consultantId], function (err, results) {
            if (err) {
                console.log(err);
            }else{
            	clients=results;
            }
            console.log("client in db:"+clients);
            return clients;
        });
	}
}