var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

let gameClients = [];
let twitchClients = [];

app.get('/', (req, res) => {
  //res.sendFile(__dirname + '/index.html');
});

io.on('connection', (socket) => {

  socket.on('identify', function(data) {
  		if (data.clientType == "gameClient") {

  			gameClients.push(socket);
			socket.on('disconnect', function() {

			});

  		} else if (data.clientType == "twitchClient") {

  			twitchClients.push(socket);
			socket.on('join', function() {
				gameClients.forEach(c => {
					c.emit('join', {
						name: "Kromah",
						team: "blue"
					});
				});
			});

			socket.on('move', function() {
				gameClients.forEach(c => {
					c.emit('move', {
						name: "Kromah",
						dir: {
							x: 0.5,
							y: 0.5
						}
					});
				});
			});

  		}
  });

  
});

http.listen(8082, () => {
  console.log('listening on *:8082');
});