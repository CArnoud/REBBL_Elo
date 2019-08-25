const fileHelper = require('../utils/fileHelper.js');
const seasonNames = require('../utils/rebbl').seasonNames;
const config = require('../utils/config');
const Elo = require('../utils/elo').Elo;
const Game = require('../models/game').Game;
const matchups = require('../files/race/matchups');


const seasonName = seasonNames[11];
const roundIndex = 1;


// Load elo
const currentElo = JSON.parse(fileHelper.readFile(config.FILE.currentEloFileName));
const eloCalculator = new Elo(config.ELO.norm, config.ELO.stretchingFactor, config.ELO.maxChange, currentElo);

// Load divisions
const directoryPath = config.FILE.filePath + seasonName;
const fileNames = fileHelper.readDir(directoryPath);

// Load predictions
const predictions = JSON.parse(fileHelper.readFile(config.FILE.predictionFileName));

let numberOfGames = 0;
for (let i=0; i < fileNames.length; i++) {
    const rounds = JSON.parse(fileHelper.readFile(directoryPath + '/' + fileNames[i]));
    const games = rounds[roundIndex];

    // Proccess games
    for (let j in games) {
        const currentGame = new Game(games[j]);
        const teams = currentGame.getTeams();

        if (currentGame.match_id) {
            numberOfGames++;
        }        
    }

    console.log(numberOfGames + ' - ' + games.length);
    numberOfGames = 0;
}
