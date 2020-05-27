const fs = require('fs');
const Hapi = require('hapi');
const path = require('path');
const Boom = require('boom');
const color = require('color');
const ext = require('commander');
const WebSocketServer = require('websocket').server;
const http = require('http');
const jsonwebtoken = require('jsonwebtoken');
const io = require('socket.io');
const app = require('express')();

const key = 'jCN/B5U9zIlW4Gu3vsxtFTDZCAQ9bPqB9oYyptrgDxI=';
// const request = require('request');

// The developer rig uses self-signed certificates.  Node doesn't accept them
// by default.  Do not use this in production.
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

// Use verbose logging during development.  Set this to false for production.
const verboseLogging = true;
const verboseLog = verboseLogging ? console.log.bind(console) : () => { };

// Service state variables
const initialColor = color('#6441A4');      // set initial color; bleedPurple
const bearerPrefix = 'Bearer ';             // HTTP authorization headers have this prefix
const colorWheelRotation = 30;
const channelColors = {};

let viewerClients = [];
let streamerClients = [];

const STRINGS = {
  secretEnv: usingValue('secret'),
  clientIdEnv: usingValue('client-id'),
  serverStarted: 'Server running at %s',
  secretMissing: missingValue('secret', 'EXT_SECRET'),
  clientIdMissing: missingValue('client ID', 'EXT_CLIENT_ID'),
  cyclingColor: 'Cycling color for c:%s on behalf of u:%s',
  sendColor: 'Sending color %s to c:%s',
  invalidAuthHeader: 'Invalid authorization header',
  invalidJwt: 'Invalid JWT'
};

ext.
  version(require('../package.json').version).
  option('-s, --secret <secret>', 'Extension secret').
  option('-c, --client-id <client_id>', 'Extension client ID').
  parse(process.argv);

// const secret = Buffer.from(getOption('secret', 'ENV_SECRET'), 'base64');
const secret = Buffer.from(key, 'base64');
const clientId = getOption('clientId', 'ENV_CLIENT_ID');

const serverOptions = {
  host: 'localhost',
  port: 8081,
  routes: {
    cors: {
      origin: ['*']
    }
  }
};
const serverPathRoot = path.resolve(__dirname, '..', 'conf', 'server');
if (fs.existsSync(serverPathRoot + '.crt') && fs.existsSync(serverPathRoot + '.key')) {
  serverOptions.tls = {
    // If you need a certificate, execute "npm run cert".
    cert: fs.readFileSync(serverPathRoot + '.crt'),
    key: fs.readFileSync(serverPathRoot + '.key')
  };
}
const server = new Hapi.Server(serverOptions);

(async () => {
  server.route({
    method: 'GET',
    path: '/auth',
    handler: authHandler
  });

  //startWebSocket();
  startSocketIO();
})();

function startSocketIO() {
	app.get('/', (req, res) => {
	  res.sendFile(__dirname + '/index.html');
	});

	io.on('connection', (socket) => {
	  console.log('a user connected');
	});

	http.listen(8082, () => {
	  console.log('listening on *:8082');
	});
}

function usingValue (name) {
  return `Using environment variable for ${name}`;
}

function missingValue (name, variable) {
  const option = name.charAt(0);
  return `Extension ${name} required.\nUse argument "-${option} <${name}>" or environment variable "${variable}".`;
}

// Get options from the command line or the environment.
function getOption (optionName, environmentName) {
  const option = (() => {
    if (ext[optionName]) {
      return ext[optionName];
    } else if (process.env[environmentName]) {
      console.log(STRINGS[optionName + 'Env']);
      return process.env[environmentName];
    }
    console.log(STRINGS[optionName + 'Missing']);
    process.exit(1);
  })();
  console.log(`Using "${option}" for ${optionName}`);
  return option;
}

// Verify the header and the enclosed JWT.
function verifyAndDecode (header) {
  if (header.startsWith(bearerPrefix)) {
    try {
      const token = header.substring(bearerPrefix.length);
      return jsonwebtoken.verify(token, secret, { algorithms: ['HS256'] });
    }
    catch (ex) {
      throw Boom.unauthorized(STRINGS.invalidJwt);
    }
  }
  throw Boom.unauthorized(STRINGS.invalidAuthHeader);
}

function authHandler(req) {
  console.log("AUTH REQUEST");
  // Verify all requests.
  const payload = verifyAndDecode(req.headers.authorization);
  const { channel_id: channelId, opaque_user_id: opaqueUserId } = payload;

  return null;
}

function startWebSocket() {
  const server = http.createServer(function(request, response) {
    console.log((new Date()) + ' Received request for ' + request.url);
    response.writeHead(404);
    response.end();
  });
  server.listen(8082, function() {
    console.log((new Date()) + ' Server is listening on port 8082');
  });
  const webServer = new WebSocketServer({
    httpServer: server,
    autoAcceptConnections: false
  });

  webServer.on('request', function connection(socket) {
    var connection = socket.accept('echo-protocol', socket.origin);

    connection.on('message', function(message) {
      if (message.type === 'utf8') {
        const req = JSON.parse(message.utf8Data);

        if (req.command == "join") {
          if (clientId[req.id] == null) {
            console.log(req.id + " joined.");
            clientId[req.id] = {
              goals: 0
            }
          }
        } else if (req.command == "move") {
          if (clientId[req.id] != null) {
            console.log(req.id + " moved.");
          }
        }

      }
    })
  });

}
