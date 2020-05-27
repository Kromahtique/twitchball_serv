let token = '';
let tuid = '';
let username = '';
let ws;

let id = "";

const twitch = window.Twitch.ext;

// create the request options for our Twitch API calls
const requests = {
  set: createRequest('POST', 'cycle'),
  get: createRequest('GET', 'query'),
  auth: createRequest('GET', 'auth')
};

function generateId() {
  let chars = 'qwertyuiopasdfghjklzxcvbnm0123456789';
  for (let i = 0; i < 8; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
}

function createRequest (type, method) {
  return {
    type: type,
    url: location.protocol + '//localhost:8082/' + method,
    success: updateBlock,
    error: logError
  };
}

function setAuth (token) {
  Object.keys(requests).forEach((req) => {
    twitch.rig.log('Setting auth headers');
    requests[req].headers = { 'Authorization': 'Bearer ' + token };
  });
}

twitch.onContext(function (context) {
  twitch.rig.log(context);
});

twitch.onAuthorized(function (auth) {
  // save our credentials
  token = auth.token;
  tuid = auth.userId;
  twitch.rig.log(JSON.stringify(auth));

  // enable the button
  $('#connect').removeAttr('disabled');

  setAuth(token);
  $.ajax(requests.auth);
});

function updateBlock (hex) {
  twitch.rig.log('Updating block color');
  $('#color').css('background-color', hex);
}

function logError(_, error, status) {
  twitch.rig.log('EBS request returned '+status+' ('+error+')');
}

function logSuccess(hex, status) {
  twitch.rig.log('EBS request returned '+hex+' ('+status+')');
}

function createWebsocket() {
    if (ws) {
      return;
    }
    ws = new WebSocket('ws://localhost:8082/', 'echo-protocol');

    ws.onopen = function(event) {
      twitch.rig.log('CONNECTED');
      $('#send').removeAttr('disabled');
    };

    ws.onerror = function(error) {
      console.log(error.message);
    };

  twitch.rig.log('ws://localhost:8082/');
}


$(function () {
  // when we click the cycle button
  generateId();
  $('#connect').click(function () {
    if(!token) { return twitch.rig.log('Not authorized'); }

    createWebsocket();
    ws.send(JSON.stringify({command: "join", id: id}))
    // $.ajax(requests.auth);
  });

  $('#send').click(function () {
    twitch.rig.log(token);
    ws.send(JSON.stringify({command: "move", id: id, dir:{x: 0, y: 0}}));
  });
});
