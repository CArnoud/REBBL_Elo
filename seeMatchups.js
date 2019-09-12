const fileHelper = require('./utils/fileHelper.js');
const seasonNames = require('./utils/rebbl').seasonNames;
const config = require('./utils/config');
const Elo = require('./utils/elo').Elo;
const Game = require('./models/game').Game;
const matchups = require('./files/race/matchups');

const tableify = require('tableify');

const seasonName = seasonNames[11];
const divisionIndex = 21;
const roundIndex = 4;

// Load elo
const currentElo = JSON.parse(fileHelper.readFile(config.FILE.currentEloFileName));
const eloCalculator = new Elo(config.ELO.norm, config.ELO.stretchingFactor, config.ELO.maxChange, currentElo);

// Load games
const directoryPath = config.FILE.filePath + seasonName;
const fileNames = fileHelper.readDir(directoryPath);
const rounds = JSON.parse(fileHelper.readFile(directoryPath + '/' + fileNames[divisionIndex]));
const games = rounds[roundIndex];

const table = [];

// Proccess games
for (let i in games) {
    const currentGame = new Game(games[i]);
    const teams = currentGame.getTeams();

    console.log(
        getTeamString(teams[0], teams[1]) +
        // 'VS\n' +
        getTeamString(teams[1], teams[0]) +
        // getRaceMatchupString(teams) +
        // 'Winner: ' + currentGame.winner_id +
        // '\n'
        ''
    );

    if (!teams[0].name.toLowerCase().includes('admin') &&
        !teams[1].name.toLowerCase().includes('admin')) {
        if (i > 0) {
            table.push({});
        }
        table.push(getTeamRow(teams[0], teams[1]));
        table.push(getTeamRow(teams[1], teams[0]));
    }
}

function getRaceMatchupString(teams) {
    const raceIndex = teams[0].race > teams[1].race ? teams[1].race + teams[0].race : teams[0].race + teams[1].race;
    return matchups[raceIndex][teams[0].race] + '-' +
        matchups[raceIndex]['draw'] + '-' +
        matchups[raceIndex][teams[1].race] + ' vs ' + teams[1].race;
}

function getTeamString(team, opponent) {
    const elo = eloCalculator.getTeamElo(team.id);
    const oppElo = eloCalculator.getTeamElo(opponent.id);

    return team.name.padEnd(32) + 
        // team.id + 
        ' - ' + 
        team.tv.toString().padStart(4) + 
        ' TV ' + team.race.padEnd(12, ' ') + 
        ' (' + Math.round(elo) + ' Elo): ' + 
        (eloCalculator.getExpectedResult(elo, oppElo)*100).toFixed(2) + '%' + 
        '\n';
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

 
var html = tableify(table); 
console.log(html);
