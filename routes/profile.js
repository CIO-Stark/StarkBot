(function () {
    "use strict";

    module.exports = function (app, modules) {
    	var profile = require("../helpers/profile")(modules);

    //load profile names
        app.get("/profile/load", function(req, res){
            profile.methods.load().then(function(data){
                res.send({
                    status: true,
                    data: data
                });
            }).catch(function(error){
                res.send({
                    status: false,
                    message: error.message
                });
            });
        });

    //get profile
        app.get("/profile/get/:name", function (req, res) {
            var name = req.params.name || false;
            if(name){
                profile.methods.get(name).then(function(data){
                    res.send({
                        status: true,
                        data: data
                    });
                }).catch(function(error){
                    res.send({
                        status: false,
                        message: error.message
                    });
                });
            }
            else{
                res.send({
                    status: false,
                    message: "profile:get -> invalid request"
                })
            }
        });

    //create profile
        app.post("/profile/create", function (req, res) {
            var config = req.body.config || false,
            url = req.body.url || false,
            name = req.body.name || false,
            dom = req.body.dom || false;
            if(config && url && name && dom){
                profile.methods.create({
                    config: config,
                    url: url,
                    name: name,
                    dom: dom
                }).then(function(response){
                    res.send({
                        status: true,
                        data: response
                    });
                }).catch(function(error){
                    res.send({
                        status: false,
                        message: error.message
                    });
                });
            }
            else{
                res.send({
                    status: false,
                    message: "profile:create -> invalid request"
                });
            }
	   	});

    //update profile
        app.post("/profile/update", function (req, res) {
            var config = req.body.config || false,
            url = req.body.url || false,
            name = req.body.name || false,
            dom = req.body.dom || false,
            id = req.body._id || false,
            rev = req.body._rev || false;
            if(config && url && name && dom&& id && rev){
                profile.methods.update({
                    config: config,
                    url: url,
                    name: name,
                    dom: dom,
                    _id: id,
                    _rev: rev
                }, id).then(function(response){
                    res.send({
                        status: true,
                        data: response
                    });
                }).catch(function(error){
                    res.send({
                        status: false,
                        message: error.message
                    });
                });
            }
            else{
                res.send({
                    status: false,
                    message: "profile:update -> invalid request"
                });
            }
        });

    //delete profile
        app.post("/profile/delete", function (req, res) {
            var id = req.body._id || false,
            rev = req.body._rev || false;
            if(id && rev){
                profile.methods.remove(id, rev).then(function(){
                    res.send({
                        status: true
                    });
                }).catch(function(error){
                    res.send({
                        status: false,
                        message: error.message
                    });
                });
            }
            else{
                res.send({
                    status: false,
                    message: "profile:delete -> invalid request"
                });
            }
        });
    };
}());