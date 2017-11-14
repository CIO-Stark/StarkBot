(function () {
    "use strict";
    var cloudant = require("cloudant");
    var credentials = {};

    if(process.env.VCAP_SERVICES){
        var vcap = JSON.parse(process.env.VCAP_SERVICES);
        credentials = vcap["cloudantNoSQLDB"][0].credentials;
    }
    else{
        credentials = {
            username: "",
            password: "",
            host: ""
        }
    }

    module.exports = cloudant({
        host: credentials.host,
        account: credentials.username,
        password: credentials.password
    });
}());