const crypto = require('crypto');


var customFunctions = {};

customFunctions.verifyPassword = (enteredPass, storedPass,salt)=>{
    
    if(!salt || !storedPass)
        return false;

    const password = crypto.pbkdf2Sync(enteredPass,salt,100,128,'sha512').toString('hex');

    if( storedPass==password)
        return true;
    return false;
}

customFunctions.verifyLength = (inp,len)=>{
    if(inp.length == len)
        return true;
    else return false;
}

customFunctions.verifyCategory = (inp,cat)=>{
    if(cat.includes(inp))
        return true;
    else return false;
}

customFunctions.checkProgress = (inp,old)=>{
    if(old=="to do"){
        if(inp == "in progress" || inp=="completed")
            return true;
    }else if(old=="in progress"){
        if(inp=="completed")
            return true;
    }else 
        return false;
}

module.exports = customFunctions;