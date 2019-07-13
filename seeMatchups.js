const fileHelper = require('./utils/fileHelper.js');
const seasonNames = require('./utils/rebbl').seasonNames;
const config = require('./utils/config');
const Elo = require('./utils/elo').Elo;
const Game = require('./models/game').Game;

const seasonName = seasonNames[10];
const divisionIndex = 0;
const roundIndex = 5;

// Load elo
const currentElo = JSON.parse(fileHelper.readFile(config.FILE.currentEloFileName));
const eloCalculator = new Elo(config.ELO.norm, config.ELO.stretchingFactor, config.ELO.maxChange, currentElo);

// Load games
const directoryPath = config.FILE.filePath + seasonName;
const fileNames = fileHelper.readDir(directoryPath);
const rounds = JSON.parse(fileHelper.readFile(directoryPath + '/' + fileNames[divisionIndex]));
const games = rounds[roundIndex];

// Proccess games
for (let i in games) {
    const currentGame = new Game(games[i]);
    const teams = currentGame.getTeams();

    console.log(
        getTeamString(teams[0], teams[1]) +
        'VS\n' +
        getTeamString(teams[1], teams[0]) +
        'Winner: ' + currentGame.winner_id +
        '\n'
    );
}

function getTeamString(team, opponent) {
    const elo = eloCalculator.getTeamElo(team.id);
    const oppElo =  eloCalculator.getTeamElo(opponent.id);

    return team.id + ' - ' + team.tv.toString().padStart(4) + ' TV ' + team.race.padEnd(12, ' ') + ' (' + Math.round(elo) + '): ' 
        + (eloCalculator.getExpectedResult(elo, oppElo)*100).toFixed(2) + '%\n';
}
