const fileHelper = require('../utils/fileHelper.js');
const seasonNames = require('../utils/rebbl').seasonNames;
const config = require('../utils/config');
const Elo = require('../utils/elo').Elo;
const Game = require('../models/game').Game;
const matchups = require('../files/race/matchups');


const seasonName = seasonNames[11];
const roundIndex = 9;


// Load elo
const currentElo = JSON.parse(fileHelper.readFile(config.FILE.currentEloFileName));
const eloCalculator = new Elo(config.ELO.norm, config.ELO.stretchingFactor, config.ELO.maxChange, currentElo);

// Load divisions
const directoryPath = config.FILE.filePath + seasonName;
const fileNames = fileHelper.readDir(directoryPath);

// Load predictions
const predictions = JSON.parse(fileHelper.readFile(config.FILE.predictionFileName));

let totalGames = 0;
let totalCorrect = 0;
let totalDraws = 0;
let gamesToBePlayed = 0;
let biggestUpsetString = "";
let biggestUpsetChance = 100;

for (let i=0; i < fileNames.length; i++) {
    const rounds = JSON.parse(fileHelper.readFile(directoryPath + '/' + fileNames[i]));
    const games = rounds[roundIndex];
    let numberOfGames = 0;
    let correctPicks = 0;
    let draws = 0;
    gamesToBePlayed = gamesToBePlayed + games.length;

    // Proccess games
    for (let j in games) {
        const currentGame = new Game(games[j]);
        const teams = currentGame.getTeams();

        if (Game.isGameValid(games[j])) {
            // game has been played and is not an admin game
            if (currentGame.getWinnerId() === getFavoriteId(teams)) {
                correctPicks++;
            }
            else {
                if (!currentGame.getWinnerId()) {
                    totalDraws++;
                    draws++;
                }
                else {
                    const underdog = getFavoriteId(teams) === teams[0].id ? teams[1] : teams[0];
                    const chance = eloCalculator.getExpectedResult(eloCalculator.getTeamElo(underdog.id), eloCalculator.getTeamElo(getFavoriteId(teams)));
                    if (chance < biggestUpsetChance) {
                        biggestUpsetString = underdog.name + ' ' + chance;
                        biggestUpsetChance = chance;
                        console.log(biggestUpsetString);
                    }
                }
            }

            numberOfGames++;
        }
        else {
            if (currentGame.match_id) {
                gamesToBePlayed--; // removes admin games
            }
        }        
    }

    console.log(fileNames[i] + ': ' + correctPicks + '-' + draws + '-' + (numberOfGames - correctPicks - draws));
    totalGames = totalGames + numberOfGames;
    totalCorrect = totalCorrect + correctPicks;
    numberOfGames = 0;
    correctPicks = 0;
}

console.log('Total: \n' + totalCorrect + ' out of ' + totalGames + ' (' + (totalCorrect/totalGames).toFixed(4) + ')');
console.log(totalCorrect + ' out of ' + (totalGames - totalDraws) + ' without draws (' + (totalCorrect/(totalGames-totalDraws)).toFixed(4) + ')');
console.log((gamesToBePlayed - totalGames) + ' left to be played');

function getFavoriteId(teams) {
    const elo1 = eloCalculator.getTeamElo(teams[0].id);
    const elo2 = eloCalculator.getTeamElo(teams[1].id);
    return elo1 > elo2 ? teams[0].id : teams[1].id;
}
