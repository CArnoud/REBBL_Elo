const fileHelper = require('./utils/fileHelper.js');
const seasonNames = require('./utils/rebbl').seasonNames;
const config = require('./utils/config');
const Elo = require('./utils/elo').Elo;
const Game = require('./models/game').Game;
const matchups = require('./files/race/matchups');

const tableify = require('tableify');

const seasonName = seasonNames[11];
const firstDivision = 0;
const lastDivision = 18;
const roundIndex = 10;

// Load elo
const currentElo = JSON.parse(fileHelper.readFile(config.FILE.currentEloFileName));
const eloCalculator = new Elo(config.ELO.norm, config.ELO.stretchingFactor, config.ELO.maxChange, currentElo);

// Load divisions
const directoryPath = config.FILE.filePath + seasonName;
const fileNames = fileHelper.readDir(directoryPath);

// Result
let html = "";

for (let i=firstDivision; i < lastDivision + 1; i++) {
    const rounds = JSON.parse(fileHelper.readFile(directoryPath + '/' + fileNames[i]));
    const games = rounds[roundIndex];

    const table = [];

    // Proccess games
    for (let j in games) {
        const currentGame = new Game(games[j]);
        const teams = currentGame.getTeams();

        // console.log(
        //     getTeamString(teams[0], teams[1]) +
        //     getTeamString(teams[1], teams[0]) +
        //     ''
        // );

        if (!teams[0].name.toLowerCase().includes('admin') &&
            !teams[1].name.toLowerCase().includes('admin')) {
            if (j > 0) {
                table.push({});
            }
            table.push(getTeamRow(teams[0], teams[1]));
            table.push(getTeamRow(teams[1], teams[0]));
        }
    }

    html = html + 
        getDivisionNameHtml(i) + 
        tableify(table); 
}

html = addHtmlStyle(html);
fileHelper.writeFile(config.FILE.htmlPredictionsFilePath, html);

function getRaceMatchupString(teams) {
    const raceIndex = teams[0].race > teams[1].race ? teams[1].race + teams[0].race : teams[0].race + teams[1].race;
    if (matchups[raceIndex]) {
        return matchups[raceIndex][teams[0].race] + '-' +
        matchups[raceIndex]['draw'] + '-' +
        matchups[raceIndex][teams[1].race] + ' vs ' + teams[1].race;
    }
    else {
        return "?-?-?";
    }
}

function getTeamRow(team, opponent) {
    const elo = eloCalculator.getTeamElo(team.id);
    const oppElo = eloCalculator.getTeamElo(opponent.id);

    return {
        Name: team.name,
        Race: team.race,
        // TV: team.tv.toString(),
        "Elo Rating": Math.round(elo),
        "Race Matchup (REL and GMAN history)": getRaceMatchupString([team, opponent]),
        "Expected Result": (eloCalculator.getExpectedResult(elo, oppElo)*100).toFixed(2) + '%',       
    }
}

function getDivisionNameHtml(index) {
    let result = (index > firstDivision ? "<p>&nbsp;</p>" : "") + "<h3 class='division-name'>" + fileNames[index] + "</h3>";
    return result.replace(".json", "").replace(".Season 12", "");
}

function addHtmlStyle(html) {
    let result = getHtmlFileBeggining();
    result = result + html.replace(new RegExp("<table>", "g"), "<table class='division'>");
    result = result + "</table></body></html>";
    return result;
}

function getHtmlFileBeggining() {
    return "<!DOCTYPE html>" +
    "<html> " +
    "<head> " +
    "<style> " +
    ".division { " +
    "  font-family: \"Trebuchet MS\", Arial, Helvetica, sans-serif; " +
    "  border-collapse: collapse; " +
    "  width: 100%; " +
    "} " +
    
    ".division td, .division th { " +
    "  border: 1px solid #ddd; " +
    "  padding: 8px; " +
    "} " +
    
    ".division tr:nth-child(2){background-color: #f2f2f2;} " +
    ".division tr:nth-child(5){background-color: #f2f2f2;} " +
    ".division tr:nth-child(8){background-color: #f2f2f2;} " +
    ".division tr:nth-child(11){background-color: #f2f2f2;} " +
    ".division tr:nth-child(14){background-color: #f2f2f2;} " +
    ".division tr:nth-child(17){background-color: #f2f2f2;} " +
    ".division tr:nth-child(20){background-color: #f2f2f2;} " +
    
    ".division tr:hover {background-color: #ddd;} " +
    
    ".division th { " +
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
