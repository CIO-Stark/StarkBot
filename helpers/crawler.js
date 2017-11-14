(function () {
    "use strict";
    var instances = {};
    var crawledUrls = {};
    var dataPipe = [];
    var crawled = 0;
    var parseError = 0;
    var saveError = 0;
    var fetchError = 0;

    module.exports = function (modules) {
        var crawler = require("../setups/crawler")(modules);
        var profile = require("../helpers/profile")(modules);
        var interval = crawler.interval();
        var processData = modules.processData;

    //add crawled item
        var addCrawledUrl = function(date, url, profile){
            if(!alreadyCrawledUrl(date, url)){
                date = date.replace(/-/gi, "");
                if(!crawledUrls.hasOwnProperty(date)){
                    crawledUrls[date] = [];    
                }
                crawledUrls[date].push(url);
                crawled++;
                if(instances.hasOwnProperty(profile)){
                    instances[profile].crawled++;    
                }
            }
        };

    //verify crawledUrl existance
        var alreadyCrawledUrl = function(date, url){
            date = date.replace(/-/gi, "");
            if(crawledUrls.hasOwnProperty(date) && crawledUrls[date].length > 0){
                var status = crawledUrls[date].indexOf(url) > -1;
                if(status){
                    console.log("already crawled item", date, url);
                }
                else{
                    console.log("new item", date, url);
                }               
                return status;
            }
            return false;
        };

    //load all instances
        var loadInstances = function(){
            return new Promise(function(resolve, reject){
                profile.methods.load().then(function(data){
                    data.forEach(function(instance){
                        instances[instance.name] = {
                            crawler: false,
                            status: false,
                            config: instance.config,
                            url: instance.url,
                            name: instance.name,
                            dom: instance.dom,
                            crawled: 0
                        };
                    });
                    console.log("Starkbot instances loaded");
                    resolve(instances);
                }).catch(function(error){
                    console.log("Failed to load Starkbot instances");
                    reject(error);
                });
            });  
        };

    //load all crawled urls from db
        var loadCrawledUrls = function(){
            var parseDocs = function(docs){
                docs.forEach(function(doc){
                    addCrawledUrl(doc.data.date, doc.link, doc.source);
                });
            };
            var selectors = {
                "selector": {
                    "_id": {
                        "$gt": null
                    }
                }
            };
            return new Promise(function(resolve, reject){
                crawler.db.get(selectors).then(function(data){
                    console.log("Starkbot crawled urls loaded");
                    parseDocs(data.docs);
                    resolve(crawledUrls);
                }).catch(function(error){
                    console.log("Failed to load Starkbot crawled urls");
                    reject(error);
                });
            });  
        };

    //prepare bulk inserts
        var dataBatch = function(size){
            size = Math.max(200, (size || 200));
            var batch = {
                docs: dataPipe.splice(0, size)
            };
            return new Promise(function(resolve, reject){
                crawler.db.bulkInsert(batch).then(function(data){
                    resolve(batch);
                }).catch(function(error){
                    dataPipe = dataPipe.concat(batch.docs);
                    reject(error);
                });
            });
        };

    //setup intervals
        interval.load({
            "dataPipe": {
                func: function(){
                    if(dataPipe.length > 0){
                        dataBatch().then(function(batch){
                            console.log("dataBatch success: docs length", batch.docs.length);
                            batch.docs.forEach(function(doc){
                                addCrawledUrl(doc.data.date, doc.link, doc.source);
                            });
                        }).catch(function(error){
                            console.log("dataBatch error", error.message);
                        });
                    }
                },
                delay: 10000
            }
        });

    //crawler management backbone
        var cm = {
            parseFetch: function(fetchResponse, schema){},
            validateData: function(data, schema){},
            getData: function(entity){},
            get: function(name){},
            add: function(data){},
            start: function(name){},
            stop: function(name){},
            status: function(){}
        };

    //parse date
        cm.parseDate = function(date, source){
            var months = [
                { text: "jan", value: "01" },{ text: "fev", value: "02" },{ text: "mar", value: "03" },
                { text: "abr", value: "04" },{ text: "mai", value: "05" },{ text: "jun", value: "06" },
                { text: "jul", value: "07" },{ text: "ago", value: "08" },{ text: "set", value: "09" },
                { text: "out", value: "10" },{ text: "nov", value: "11" },{ text: "dez", value: "12" }
            ];
            var resolveMonth = function(text){
                var result = false;
                var regex = new RegExp(text, "gi");
                months.forEach(function(month){
                    if(month.text.match(regex)){
                        result = month.value;
                        return;
                    }
                });
                return result;
            };
            if(source === "globo"){
                date = date.split(" ")[1];
                date = date.split("/");
                date = date[2]+"-"+date[1]+"-"+date[0];
                return date;
            }
            if(source === "folha"){
                date = date.replace(/\n/gi, "");
                date = date.split("  ")[0];
                date = date.split("/");
                date = date[2]+"-"+date[1]+"-"+date[0];
                return date;
            }
            if(source === "olhardigital"){
                date = date.split(" ")[0];
                date = date.split("/");
                date = date[2]+"-"+date[1]+"-"+date[0];
                return date;
            }
            if(source === "exame"){
                date = date.replace(/(\n|\t| {2,})/gi, "");
                date = date.split(", ")[0];
                date = date.split(" ");
                date[0] = (date[0] < 10) ? "0"+ date[0] : date[0];
                date = date[2]+"-"+resolveMonth(date[1])+"-"+date[0];
                return date;
            }
            if(source === "istoe"){
                date = date.replace(/(\n|\t| {2,})/gi, "");
                date = date.split(" - ")[0];
                date = date.split(".");
                date = "20"+date[2]+"-"+date[1]+"-"+date[0];
                return date;
            }
            if(source === "uol"){
                date = date.split("/");
                date = (date[2].substring(4, 0))+"-"+date[1]+"-"+date[0];
                return date;
            }
            if(source === "tecmundo"){
                date = date.split(" - ")[0];
                date = date.split(" ");
                date = date[2]+"-"+resolveMonth(date[1])+"-"+date[0];
                return date;
            }
            return date;
        };

    //parse fetch response
        cm.parseFetch = function(fetchResponse, schema){
            var data = {},
            handler,
            prop,
            status = true,
            $ = crawler.cheerio.load(fetchResponse);
            for(prop in schema){
                if(schema.hasOwnProperty(prop)){
                    handler = $(schema[prop].selector);
                    data[prop] = "";
                    if(schema[prop].type === "multiple"){
                        handler.each(function(i, element) {
                            data[prop] += $(this).text();
                        });
                    }
                    else if(schema[prop].type === "single"){
                        data[prop] = handler.text();
                    }
                }
            }
            return data;
        };

    //validate data
        cm.validaData = function(data, schema){
            var prop,
            status = true;
            for(prop in schema){
                if(schema.hasOwnProperty(prop) && data.hasOwnProperty(prop)){
                    if(data[prop] === ""){
                        status = false;
                        break;   
                    }
                }
            }
            return status;
        };

    //return saved data
        cm.getData = function(entity){
            var selectors = {
                "selector": {
                    "_id": {
                        "$gt": null
                    },
                    "data.body": {
                        "$regex": "(?i)" + entity
                    }
                }
            };
            return new Promise(function(resolve, reject){
                crawler.db.get(selectors).then(function(docs){
                    resolve(docs);
                }).catch(function(error){
                    reject(error);
                });
            });
        };

    //return data between dates
        cm.getDataPeriod = function(start, end){
            var start = crawler.moment(start, "YYYY-MM-DD");
            var end = crawler.moment(end, "YYYY-MM-DD");
            var checkRange = function(date){
                date = crawler.moment(date, "YYYY-MM-DD");
                return date.isBetween(start, end);
            };
            var selectors = {
                "selector": {
                    "_id": {
                        "$gt": null
                    }
                }
            };
            return new Promise(function(resolve, reject){
                crawler.db.get(selectors).then(function(data){
                    var result = [];
                    data.docs.forEach(function(entry){
                        if(checkRange(entry.data.date)){
                            result.push(entry);
                        }
                    });
                    resolve(result);
                }).catch(function(error){
                    reject(error);
                });
            });
        };

    //return crawler instance
        cm.get = function(name){
            if(instances.hasOwnProperty(name)){
                return instances[name];
            }
            return false;
        };

    //add crawler instance
        cm.add = function(name){
            return new Promise(function(resolve, reject){
                profile.methods.get(name).then(function(data){
                    instances[data.name] = {
                        crawler: false,
                        status: false,
                        config: data.config,
                        url: data.url,
                        name: data.name,
                        dom: data.dom,
                        crawled: 0
                    };
                    resolve(instances[data.name]);
                 }).catch(function(error){
                    reject(error);
                });
            });
        };

    //start crawler instance
        cm.start = function(name){
            var instance = cm.get(name);
            if(instance){
            //summon crawler
                instance.crawler = crawler.summoner(instance.url);
                for(let prop in instance.config){
                    instance.crawler[prop] = instance.config[prop];
                }

            //set events
                instance.crawler
                    .on("crawlstart", function(){
                        console.log("Crawler Started: ", {
                            name: name,
                            url: instance.url,
                            config: instance.config
                        });
                    })
                    .on("fetchcomplete", function(item, response){
                        var parsed = cm.parseFetch(response, instance.dom);
                        if(cm.validaData(parsed, instance.dom)){
                            parsed.date = cm.parseDate(parsed.date, name);
                            if(!alreadyCrawledUrl(parsed.date, item.url)){
                                dataPipe.push({
                                    _id: item.url,
                                    source: name,
                                    link: item.url,
                                    data: parsed
                                });
                            }
                        }
                        else{
                            parseError++;
                            console.log("Crawler Fetch Parse Error", name, item.url);
                        }
                    })
                    .on("fetcherror", function(item, response){
                        fetchError++;
                        console.log("Crawler Fetch Error", name, item.url);
                    })
                    .on("complete", function(){
                        cm.stop(name);
                        console.log("Crawler Completed", name);
                    });
            //start instance
                instance.crawler.start();
                instance.status = true;
                return true;
            }
            return false;
        };

    //start all instances
        cm.startAll = function(){
            for(let instance in instances){
                cm.start(instance);
            }
        };

    //stop crawler instance
        cm.stop = function(name){
            var instance = cm.get(name);
            if(instance){
                instance.crawler.stop(true);
                instance.status = false;
                return true;
            }
            return false;
        };

    //stop all instances
        cm.stopAll = function(){
            for(let instance in instances){
                cm.stop(instance);
            }
        };

    //return all crawler instances data
        cm.status = function(){
            var result = {};
            for(let name in instances){
                let instance = cm.get(name);
                result[name] = {
                    url: instance.url,
                    status: instance.status,
                    crawled: instance.crawled,
                    errors: instance.errors
                };
            }
            return {
                dataPipe: dataPipe.length,
                crawled: crawled,
                parseError: parseError,
                saveError: saveError,
                fetchError: fetchError,
                instances: result
            };
        };

    //startup
        var startPromises = [];
        startPromises.push(loadInstances());
        startPromises.push(loadCrawledUrls());
        Promise.all(startPromises).then(function(data){
            console.log("Starkbot started");
        }).catch(function(error){
            console.log("Failed to start Starkbot", error.message);
        });
        return cm;
    };
}());