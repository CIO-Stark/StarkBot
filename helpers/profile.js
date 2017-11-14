(function () {
    "use strict";

    module.exports = function(modules){
        var profile = require("../setups/profile")(modules);

    //profile management backbone
        var p = {
            load: function(){},
            get: function(name){},
            create: function(data){},
            update: function(data, id){},
            remove: function(id, rev){}
        };

    //load profiles
        p.load = function(){
            var selectors = {
                "selector": {
                    "_id": {
                        "$gt": null
                    }
                }
            };
            return new Promise(function(resolve, reject){
                profile.db.get(selectors).then(function(data){
                    resolve(data.docs);
                }).catch(function(error){
                    reject(error);
                });
            });
        };

    //get profile data
        p.get = function(name){
            return new Promise(function(resolve, reject){
                p.load().then(function(data){
                    data.forEach(function(doc){
                        if(doc.name === name){
                            resolve(doc);
                        }
                    });
                    reject(false);
                }).catch(function(error){
                    reject(error);
                });
            });
        };

    //create profile
        p.create = function(data){
            return new Promise(function(resolve, reject){
                profile.db.create(data).then(function(response){
                    resolve(response);
                }).catch(function(error){
                    reject(error);
                });
            });
        };

    //update profile
        p.update = function(data, id){
            return new Promise(function(resolve, reject){
                profile.db.update(data, id).then(function(response){
                    resolve(response);
                }).catch(function(error){
                    reject(error);
                });
            });
        };

    //delete profile
        p.remove = function(id, rev){
            return new Promise(function(resolve, reject){
                profile.db.delete(id, rev).then(function(status){
                    resolve(status);
                }).catch(function(error){
                    reject(error);
                });
            });
        };
        
        return {
            methods: p,
            db: profile.db
        }; 
     };   
}());