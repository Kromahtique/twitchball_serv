var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

let gameClients = [];
let twitchClients = [];

app.get('/', (req, res) => {
  //res.sendFile(__dirname + '/index.html');
  res.send({message: "hello!"});
});

io.on('connection', (socket) => {
  console.log("Received connection");

  socket.on('identify', function(data) {
    console.log("identifying...");

    if (data.clientType == "gameClient") {

      if (gameClients.length > 0) {
        return;
      }
      gameClients.push(socket);
      console.log("Game client connection.");
      socket.on('disconnect', function() {

      });

    } else if (data.clientType == "twitchClient") {

      const clientIndex = twitchClients.filter(c => {
        return c.id == data.id
      });
      
      if (clientIndex.length > 0) {
        return;
      }

        console.log("Sending join...");
        gameClients.forEach(c => {
          c.emit('join', {
            name: data.name,
            team: "blue"
          });
        });

      twitchClients.push(data);

      console.log(data.name + " joined.");

      socket.on('move', function(data) {

      const clientIndex = twitchClients.filter(c => {
        return data.id == data.id
      });
      if (clientIndex.length == 0) {
        return; 
      }

      console.log(clientIndex[0].name + " move: x:" + data.dir.x + " y: " + data.dir.y);

        gameClients.forEach(c => {
          const username = clientIndex[0].name;
          c.emit('move', {
            name: username,
            dir: {
              x: data.dir.x,
              y: data.dir.y
            }
          });
        });
      });

    }
  });


});

const port = process.env.PORT || 8082;
http.listen(port, () => {
  console.log(`Server listening on *:${port}`);
});
