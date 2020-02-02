var customFunctions = {};

customFunctions.verifyPassword = (pass1, pass2)=>{
    if(pass1===pass2)
        return true;
    return false;
}



module.exports = customFunctions;