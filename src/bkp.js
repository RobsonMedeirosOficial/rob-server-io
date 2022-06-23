const io = require('socket.io')(process.env.PORT || 3000, { //8124 is the local port we are binding the pingpong server to
 
});




io.on('connection', (socket) => {

    socket.on('test', (data) => {
      console.log('Received: ' + data);	

      
      socket.emit('SERVER', soma.toString());

    });

	socket.on('disconnect', (reason) => {
		console.log('[' + (new Date()).toUTCString() + '] ' + socket.id + ' disconnected after ' + ' pings. Reason: ' + reason);
	});

});

// App Code starts here
console.log('Server is running!');