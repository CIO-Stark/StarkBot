(function () {
    "use strict";

    module.exports = function(modules){
        var db = modules.cloudant("profile");

        return {
            db: db
        };
    };
}());