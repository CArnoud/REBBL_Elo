const fileHelper = require('./utils/fileHelper');
const seasonNames = require('./utils/rebbl').seasonNames;
const config = require('./utils/config');
const Game = require('./models/game');
const Season = require('./models/season').Season;
const Elo = require('./utils/elo').Elo;
const Predictor = require('./utils/predictor').Predictor;

const seasonName = seasonNames[1];
const elo = JSON.parse(fileHelper.readFile('files/elo/elo.json'));

let totalGames = 0;
let totalCorrect = 0;
let totalDraws = 0;

const results = new Season(seasonName).getGames();
const eloCalculator = new Elo(config.ELO.norm, config.ELO.stretchingFactor, config.ELO.maxChange, elo);
const predictor = new Predictor(eloCalculator);
for (let i in results) {
    for (let j in results[i][0]) {
        const game = results[i][0][j];
        console.log(Game.toString(game, 
            elo[game.team_ids[0]] ? elo[game.team_ids[0]] : config.ELO.norm, 
            elo[game.team_ids[1]] ? elo[game.team_ids[1]] : config.ELO.norm));
        totalGames++;
        if (predictor.isPredictorCorrect(game)) {
            totalCorrect++;
        }
        if (game.winner_id === null) {
            totalDraws++;
        }
    }
}

console.log('\ntotal games ' + totalGames);
console.log('total correct ' + totalCorrect);
console.log('total draws ' + totalDraws);
console.log('ratio ' + (totalCorrect/totalGames));
console.log('ratio excluding draws ' + (totalCorrect/(totalGames-totalDraws)));
