import XMLHttpRequest from 'xmlhttprequest';

const command = process.argv[2];

const xhr = new XMLHttpRequest.XMLHttpRequest();

//xhr.setRequestHeader("Content-Type: application/json", "Authorization: Basic //AuthKey");

switch(command) {
	case "kickall":

		xhr.open("GET", "http://localhost:3000/?origin=command&c=" + command)
		xhr.send();
	break;
	
	/*case "kick":

		xhr.open("GET", "http://localhost:3000/?c=" + command)
		xhr.send();
	break;
	
	case "ban":

		xhr.open("GET", "http://localhost:3000/?c=" + command)
		xhr.send();
	break;
	
	case "assignTeam":

		xhr.open("GET", "http://localhost:3000/?c=" + command)
		xhr.send();
	break;
	
	case "kickall":

		xhr.open("GET", "http://localhost:3000/?c=" + command)
		xhr.send();
	break;
	
	case "kickall":

		xhr.open("GET", "http://localhost:3000/?c=" + command)
		xhr.send();
	break;*/

	default:
		console.log("Command not found");
	break;

}

setTimeout((function() {
    return process.exit(22);
}), 100);