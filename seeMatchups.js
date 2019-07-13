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
    const elo0 = eloCalculator.getTeamElo(teams[0].id);
    const elo1 = eloCalculator.getTeamElo(teams[1].id);

    console.log(
        teams[0].id + ' - ' + teams[0].race.padEnd(12, ' ') + ' (' + Math.round(elo0) + '): ' + (eloCalculator.getExpectedResult(elo0, elo1)*100).toFixed(2) + '%\n' +
        'VS\n' +
        teams[1].id + ' - ' + teams[1].race.padEnd(12, ' ') + ' (' + Math.round(elo1) + '): ' + (eloCalculator.getExpectedResult(elo1, elo0)*100).toFixed(2) + '%\n' +
        '\n'
    );
}
