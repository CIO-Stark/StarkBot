(function () {
    "use strict";
    var Cloudant = require("../setups/cloudant");

    module.exports = function (collectionName) {
        var db = Cloudant.db.use(collectionName);
        return {
            "create": function (payload) {
                return new Promise(function (resolve, reject) {
                    db.insert(payload, function(err, data) {
                        if (err) {
                            reject(err);
                        }
                        resolve(data);
                    });
                });
            },
            "update": function(payload, key){
                return new Promise(function(resolve, reject){
                    db.get(key, function (err, existing) { 
                        if(!err){
                            payload._rev = existing._rev;
                        };
                        db.insert(payload, key, function(err, data){
                            if(err){
                                reject(err);
                            }
                            resolve(data);
                        });
                    });
                });
            },
            "get": function (query) {
                return new Promise(function (resolve, reject) {
                    if (!query) {
                        return reject("Invalid query");
                    }
                    db.find(query, function (err, items) {
                        if (err) {
                            reject(err);
                        }
                        resolve(items);
                    });
                });
            },
            "getAll": function (params) {
                return new Promise(function (resolve, reject) {
                    db.list(params, function (err, data) {
                        if (err) {
                            reject(err);
                        } else {
                            resolve(data);
                        }
                    });
                });
            },
            "delete": function (docId, docRev) {
                return new Promise(function (resolve, reject) {
                    db.destroy(docId, docRev, function (err) {
                        if (err) {
                            reject(err);
                        }
                        resolve(true);
                    });
                });
            },
            "bulkInsert": function (docs) {
                return new Promise(function (resolve, reject) {
                    if (typeof docs !== "object") {
                        return reject("invalid payload");
                    }
                    db.bulk(docs, function (err) {
                        if (err) {
                            reject(err);
                        }
                        resolve(true);
                    });
                });
            }
        };
    };
}());