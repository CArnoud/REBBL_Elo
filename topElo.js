const fileHelper = require('./utils/fileHelper.js');
const seasonNames = require('./utils/rebbl').seasonNames;
const config = require('./utils/config');
const Elo = require('./utils/elo').Elo;
const Game = require('./models/game').Game;
const matchups = require('./files/race/matchups');
const tableify = require('tableify');

const seasonName = seasonNames[11];
const numberOfTeamsToPrint = 20;

// Load elo
const currentElo = JSON.parse(fileHelper.readFile(config.FILE.currentEloFileName));

// Load divisions
const directoryPath = config.FILE.filePath + seasonName;
const fileNames = fileHelper.readDir(directoryPath);


compare = (team1, team2) => {
    const elo1 = currentElo[team1.id];
    const elo2 = currentElo[team2.id];

    if (elo1 && elo2 && elo1 > elo2) {
        return -1;
    } 
    if (elo1 && elo2 && elo1 < elo2)  {
        return 1;
    }
    return 0;
}

teamToObject = (team) => {
    const elo = currentElo[team.id];
    return {
        id: team.id,
        name: team.name,
        race: team.race,
        elo: elo
    }
}

teamObjectToRow = (position, obj) => {
    return {
        Position: '#' + position,
        Team: obj.name,
        Race: obj.race,
        "Elo Rating": obj.elo.toFixed(0)
    }
}

let topTeams = [];
for (let i=0; i < fileNames.length; i++) {
    const rounds = JSON.parse(fileHelper.readFile(directoryPath + '/' + fileNames[i]));
    const games = rounds[12];

    // Proccess games
    for (let j in games) {
        const currentGame = new Game(games[j]);
        const teams = currentGame.getTeams();
        
        topTeams.push(teamToObject(teams[0]));
        topTeams.push(teamToObject(teams[1]));
    }
}
topTeams.sort(compare);

const table = [];
for (let i = 0; i < numberOfTeamsToPrint; i++) {
    table.push(teamObjectToRow(i+1, topTeams[i]));
}



function addHtmlStyle(html) {
    let result = getHtmlFileBeggining();
    result = result + html.replace(new RegExp("<table>", "g"), "<table class='topteams'>");
    result = result + "</table></body></html>";
    return result;
}

html = addHtmlStyle(tableify(table));

console.log(html);

function getHtmlFileBeggining() {
    return "<!DOCTYPE html>" +
    "<html> " +
    "<head> " +
    "<style> " +
    ".topteams { " +
    "  font-family: \"Trebuchet MS\", Arial, Helvetica, sans-serif; " +
    "  border-collapse: collapse; " +
    "  width: 100%; " +
    "} " +
    
    ".topteams td, .topteams th { " +
    "  border: 1px solid #ddd; " +
    "  padding: 8px; " +
    "} " +
    
    ".topteams tr:nth-child(2){background-color: #f2f2f2;} " +
    ".topteams tr:nth-child(4){background-color: #f2f2f2;} " +
    ".topteams tr:nth-child(6){background-color: #f2f2f2;} " +
    ".topteams tr:nth-child(8){background-color: #f2f2f2;} " +
    ".topteams tr:nth-child(10){background-color: #f2f2f2;} " +
    ".topteams tr:nth-child(12){background-color: #f2f2f2;} " +
    ".topteams tr:nth-child(14){background-color: #f2f2f2;} " +
    ".topteams tr:nth-child(16){background-color: #f2f2f2;} " +
    ".topteams tr:nth-child(18){background-color: #f2f2f2;} " +
    ".topteams tr:nth-child(20){background-color: #f2f2f2;} " +
    
    ".topteams tr:hover {background-color: #ddd;} " +
    
    ".topteams th { " +
    "  padding-top: 12px; " +
    "  padding-bottom: 12px; " +
    "  text-align: left; " +
    "  background-color: #4CAF50; " +
    "  color: white; " +
    "} " +
    "</style> " +
    "</head> " +
    "<body> " +
    "<table>";
}

