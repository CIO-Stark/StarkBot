(function(scope){
    "use strict";
    require('dotenv').config({ silent: true });
    var cfenv = require("cfenv");

//middleware load
	var app = require("express")();
	var compression = require("compression");
	var cors = require("cors");
    var bodyParser = require("body-parser");
    var cloudant = require("./helpers/cloudant");
    var summoner = require("simplecrawler");
    var cheerio = require("cheerio");
    var moment = require("moment");
    var interval = require("./libs/interval");//setup
    var request = require("request-promise");
    var api = {
        endpoint: "http://ibm-cognitive-clipping-advanced-orchestrator/orchestrator/processReturn",
        source: "nodecrawler"
    };
    var processData = function(data){//process data on orchestrator and return
        var options = {
            uri: api.endpoint,
            method: "POST",
            json: true,
            body: {
                source: api.source,
                data: data 
            }
        };
        return new Promise(function(resolve, reject){
            request(options).then(function(response){
                console.log("processReturn response", response);
                resolve(response);
            }).catch(function(error){
                reject(error);
            });
        });
    };

//express setup
    app.use(compression());
    app.use(cors());
	app.use(bodyParser.urlencoded({ extended: true }));
    app.use(bodyParser.json({ limit: "100mb" }));

//set routes
    require("./routes.js")(app, {
    	cloudant: cloudant,
        summoner: summoner,
        cheerio: cheerio,
        moment: moment,
        interval: interval,
        processData: processData
    });

//start server
    var env = cfenv.getAppEnv();
    app.listen(env.port, env.bind, function () {
        console.log("starkbot running on port", env.port);
    });
})(this);