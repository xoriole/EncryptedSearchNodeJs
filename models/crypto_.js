var crypto = require('crypto'),algorithm = 'aes-256-ctr';
var se = require('se');

module.exports = {
	createHash: function(text){
		var shasum = crypto.createHash('sha1');
        shasum.update(text);
        return shasum.digest('hex')
	},

	encryptAES: function(plaintext, key){
	  var cipher = crypto.createCipher(algorithm,key)
	  var crypted = cipher.update(plaintext,'utf8','hex')
	  crypted += cipher.final('hex');
	  return crypted;
	},
	 
	decryptAES: function(ciphertext, key){
	  var decipher = crypto.createDecipher(algorithm,key)
	  var dec = decipher.update(ciphertext,'hex','utf8')
	  dec += decipher.final('utf8');
	  return dec;
	},

	encrypt: function(plaintext, key){
		return se.encrypt(key, plaintext);
	},

	encryptQuery: function(query, key){
		return se.encrypt_word(key, query);
	},

	decrypt: function(ciphertext, key){
		return se.decrypt(key, ciphertext);
	},

	search: function(ciphertext, enc_query){
		return se.search(ciphertext, enc_query);
	}

}