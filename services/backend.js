var app = require('express')();
var http = require('http').createServer(app);
var io = require('socket.io')(http);

let gameClients = [];
let twitchClients = [];

function assignTeam() {
  let blue = 0;
  let red = 0;

  twitchClients.forEach(c => {
    if (c.team == "blue") {
      blue++;
    } else if (c.team == "red") {
      red++
    };
  });

  if (blue > red) {
    return "red";
  } else {
    return "blue";
  }
}

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

        const newPlayer = {
          name: data.name,
          team: assignTeam(),
          id: data.id
        };

        gameClients.forEach(c => {
          c.emit('join', {
            name: newPlayer.name,
            team: newPlayer.team
          });
        });

      twitchClients.push(newPlayer);

      console.log(data.name + " joined.");

      socket.on('move', function(data) {

      const clientIndex = twitchClients.filter(c => {
        return c.id == data.id
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
