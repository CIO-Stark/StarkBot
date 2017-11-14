(function () {
    "use strict";

    module.exports = function(modules){
        var db = modules.cloudant("data");
        var summoner = modules.summoner;
        var cheerio = modules.cheerio;
        var moment = modules.moment;
        var interval = modules.interval;

        return {
            db: db,
            summoner: summoner,
            cheerio: cheerio,
            moment: moment,
            interval: interval
        };
    };
}());