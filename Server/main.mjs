import express from 'express';
import tmi from 'tmi.js';
import {getRandomName} from './fakeNames.mjs'
import {auth} from './auth.mjs';


const app = express();

const opts = auth;

const client = new tmi.client(opts);

let moves = {
	blue: [],
	red: []
}
let players = [];
let playersDictionnary = [];
let newPlayers = [];
let command = "";

let maxPlayer = 5;
let chosenTeam = "blue";

app.get('/', function (req, res) {
  const team = req.query.t;
  if (req.query && req.query.c) {
  	command = req.query.c;

  	if (command == "clear") {
  		command = "";
  	}
  }

  res.send({
  	"newPlayers": newPlayers,
  	"moves": moves[team],
  	"command": command
  });

  if (team) {
  	newPlayers.length = 0;
  	moves[team].length = 0;
  }
})

app.listen(3000, function () {

})

// connectToChat();


function connectToChat() {
	client.on('message', onMessageHandler);
	//client.on('connected', onConnectedHandler);
	//feedRandomData();
	client.connect();
}

function feedRandomData() {
	if (Math.random() > 0.3 && maxPlayer > 0) {
		maxPlayer --;
		const name = getRandomName();
		const team = chosenTeam;
		if (chosenTeam == "red") {
			chosenTeam = "blue";
		} else {
			chosenTeam = "red";
		}
		players[name] = {
			goals: 0,
			team
		};
		playersDictionnary.push(name);
		newPlayers.push({
			name,
			team
		});
		console.log(`${name} joined!`);
	}

	for (let i = 0; i < playersDictionnary.length; i++) {
		const player = players[playersDictionnary[i]];
		const team = player.team;

		if (player && Math.random() > .75 && playersDictionnary[i] != "kromahtique_") {
			moves[team].push({
				name: playersDictionnary[i],
				dir: (Math.floor(Math.random() * 10) + 1)
			});
		}
	}
	

	setTimeout(() => feedRandomData(), 300);
}

function onMessageHandler (target, context, msg, self) {
	const name = context['display-name'];
	let toNumber = parseInt(msg);
	if (msg == "!join") {
		if (players[name] == null) {

			players[name] = {
				goals: 0,
				team: chosenTeam
			};	
			playersDictionnary.push(name);
			newPlayers.push({
				name,
				team: chosenTeam
			});
			console.log(`${name} joined the ${chosenTeam} team!`);

			if (chosenTeam == "red") {
				chosenTeam = "blue";
			} else {
				chosenTeam = "red";
			}
		}
	} else if (!isNaN(toNumber) && toNumber >= 1 && toNumber <= 9) {
		if (players[name] != null) {
			const team = players[name].team;
			moves[team].push({
				name,
				dir: toNumber
			});
		}
	}
}

function kickAll() {

}
