const crypto = require('crypto');
var customFunctions = {};

customFunctions.verifyPassword = (enteredPass, storedPass,salt)=>{
    
    const password = crypto.pbkdf2Sync(enteredPass,salt,100,128,'sha512').toString('hex');

    if( storedPass==password)
        return true;
    return false;
}



module.exports = customFunctions;