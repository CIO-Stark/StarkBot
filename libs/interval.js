/*
    Manipulate setInterval

    @author: Guilherme Oka (goka@br.ibm.com)
    @version: 1.0
*/
(function () {
    "use strict";

//intervals namespace
    var data = {};

//interval manager backbone
    var interval = {
        load: function(intervals){},
        get: function(name){},
        set: function(name, func, delay){},
        del: function(name){},
        start: function(name){},
        stop: function(name){}
    };

//load and start intervals
    interval.load = function(intervals){
        var instance;
        for(instance in intervals){
            if(intervals.hasOwnProperty(instance)){
                interval.set(instance, intervals[instance].func, intervals[instance].delay);
                interval.start(instance);
            }
        }
    };

//get interval
    interval.get = function(name){
        if(data.hasOwnProperty(name)){
            return data[name];
        }
        return false;
    };

//set new interval
    interval.set = function(name, func, delay){
        interval.del(name);
        data[name] = {
            executions: 0,
            status: false,
            handler: false,
            func: func,
            delay: delay
        };
        return interval.get(name);
    };

//remove interval data
    interval.del = function(name){
        interval.stop(name);    
        delete data[name];
        return (data.hasOwnProperty(name)) ? false : true;
    };

//start interval
    interval.start = function(name){
        var instance = interval.get(name);
        if(instance && instance.status === false){
            instance.handler = setInterval(function(){
                instance.func();
                instance.executions++;
            }, instance.delay);
            instance.status = true;
            return true;
        }
        return false;
    };

//stop intervla
    interval.stop = function(name){
        var instance = interval.get(name);
        if(instance && instance.status === true){
            clearInterval(instance.handler);
            instance.status = false;
            return true;
        }
        return false;
    };
    
    module.exports = function(intervals){
        var i = interval;
        if(intervals){
            i.load(intervals);
        }
        return i;
    };
}());