(function () {
    "use strict";

    module.exports = function (app, modules) {
        var cm = require("../helpers/crawler")(modules);

    //get crawled data
    	app.post("/crawler/data", function (req, res) {
            var entity = req.body.entity || false;
            if(entity){
                cm.getData(entity).then(function(docs){
                    res.send({
                        status: true,
                        data: docs
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
                    message: "crawler:data error -> invalid request"
                });
            }
    	});

    //get data betweeen dates
        app.post("/crawler/dump", function (req, res) {
            var start = req.body.start || false,
            end = req.body.end || false;
            if(start && end){
                cm.getDataPeriod(start, end).then(function(data){
                    res.send({
                        status: true,
                        dataLength: data.length,
                        //data: data
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
                    message: "crawler:dump error -> invalid request"
                });
            }
        });

	//check crawlers
		app.get("/crawler/status", function (req, res) {
			res.send({
                status: true,
                data: cm.status()
            });
		});

    //add and start crawler
        app.post("/crawler/crawl", function (req, res) {
            cm.add(req.body.name).then(function(){
                cm.start(req.body.name);
                res.send({
                    status: true,
                    data: cm.status()
                });
            }).catch(function(error){
                res.send({
                    status: false,
                    data: error.message
                });
            });
        });

	//add crawler worker instance
		app.post("/crawler/add", function (req, res) {
        	cm.add(req.body.name).then(function(){
                res.send({
                    status: true,
                    instances: cm.status()
                });  
            }).catch(function(error){
                res.send({
                    status: false,
                    message: error.message
                });
            });
		});
 
    //start crawling
        app.post("/crawler/start", function (req, res) {
            cm.start(req.body.name);
            res.send({
                status: true,
                instances: cm.status()
            });
	   	});
 
    //start all crawlers
        app.post("/crawler/startAll", function (req, res) {
            cm.startAll();
            res.send({
                status: true,
                instances: cm.status()
            });
        });
 
    //start crawling
        app.post("/crawler/start", function (req, res) {
            cm.start(req.body.name);
            res.send({
                status: true,
                instances: cm.status()
            });
        });
 
    //stop all crawlers
        app.post("/crawler/stopAll", function (req, res) {
            cm.stopAll();
            res.send({
                status: true,
                instances: cm.status()
            });
        });

	//stop crawling
		app.post("/crawler/stop", function (req, res) {
			cm.stop(req.body.name);
            res.send({
                status: true,
                instances: cm.status()
            });
		});
    };
}());