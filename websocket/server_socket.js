
function serverSocket(server){
	var io = require('socket.io')(server);
	io.on('connection',function(socket){
		
	});
};

module.exports = serverSocket;