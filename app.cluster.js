(function(scope, filepath){
	var cluster = require('cluster');
	if(cluster.isMaster){
		var cpus = require('os').cpus(),
		max = cpus.length,
		index = 0;
		for(index; index < max; index++){
			cluster.fork().on('disconnect', function(){
				cluster.fork();
			});
		}
	}
	else{
		require(filepath);
	}
})(this, './app.js');