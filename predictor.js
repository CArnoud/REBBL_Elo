const fileHelper = require('./utils/fileHelper');
const seasonNames = require('./utils/rebbl').seasonNames;
const config = require('./utils/config');
const Game = require('./models/game');

const seasonName = seasonNames[1];
const elo = JSON.parse(fileHelper.readFile('files/elo/elo.json'));

let totalGames = 0;
let totalCorrect = 0;
let totalDraws = 0;

function calculateOdds(team_elo, opponent_elo) {
    return Math.pow(10,((team_elo - opponent_elo)/config.ELO.stretchingFactor));
}

function getExpectedResult(team_elo, opponent_elo) {
    const R1 = calculateOdds(team_elo, opponent_elo);
    const R2 = calculateOdds(opponent_elo, team_elo);
    return R1 / (R1 + R2);
}

function gameToString(game) {
    const result = game.team_ids[0] + '(' + (elo[game.team_ids[0]] ? elo[game.team_ids[0]] : config.ELO.norm) + ') vs ' +
        game.team_ids[1] + '(' + (elo[game.team_ids[1]] ? elo[game.team_ids[1]] : config.ELO.norm) + ')\n' +
        'winner: ' + game.winner_id;
    return result;
}
 
function predictionResultFromGame(game) {
    const team1 = game.team_ids[0];
    let team1Mmr = elo[team1] ? elo[team1] : config.ELO.norm;
    let team1Result = 0.5;

    const team2 = game.team_ids[1];
    let team2Mmr = elo[team2] ? elo[team2] : config.ELO.norm;
    let team2Result = 0.5;

    const winner = game.winner_id;

    if (winner === team1) {
        team1Result = 1;
        team2Result = 0;
    }
    else if (winner === team2) {
        team1Result = 0;
        team2Result = 1;
    }  

    const e1 = getExpectedResult(team1Mmr, team2Mmr);
    const e2 = getExpectedResult(team2Mmr, team1Mmr);

    console.log(e1 + ' ' + e2);

    let points = 0;
    totalGames++;
    if (e1 > e2) {
        if (winner === team1) {
            points = e1 * 1;
            totalCorrect++;
        }
        else if (winner === team2) {
            points = 0;
        }
        else {
            points = e1 * 0.5;
            totalDraws++;
        }
    }
    else if (e1 < e2) {
        if (winner === team1) {
            points = 0;
        }
        else if (winner === team2) {
            points = e2 * 1;
            totalCorrect++;
        }
        else {
            points = e2 * 0.5;
            totalDraws++;
        }
    }
    else {
        totalGames--;
        if (!winner) {
            totalDraws++;
            // totalCorrect++;            
            points = 1;
        }
    }

    return points;
}

function readDivision(seasonName, fileName) {
    return JSON.parse(fileHelper.readFile('files/' + seasonName + '/' + fileName));
}

const fileNames = fileHelper.readDir('files/' + seasonName);
const results = [];
for (let i = 0; i < fileNames.length; i++) {
    results.push(readDivision(seasonName, fileNames[i]));
}

let sum = 0;
for (let i in results) {
    for (let j in results[i][0]) {
        const game = results[i][0][j];
        console.log(Game.toString(game, 
            elo[game.team_ids[0]] ? elo[game.team_ids[0]] : config.ELO.norm, 
            elo[game.team_ids[1]] ? elo[game.team_ids[1]] : config.ELO.norm));
        const points = predictionResultFromGame(results[i][0][j]);
        sum = sum + points;
        console.log(points + '\n');
    }
}

// for (let i in results[0][0]) {
//     totalGames++;
//     console.log(gameToString(results[0][0][i]));
//     const points = predictionResultFromGame(results[0][0][i]);
//     sum = sum + points;
//     console.log(points + '\n');
// }

console.log('\nsum ' + sum);
console.log('avg ' + (sum/totalGames));

console.log('\ntotal games ' + totalGames);
console.log('total correct ' + totalCorrect);
console.log('total draws ' + totalDraws);
console.log('ratio ' + (totalCorrect/totalGames));
console.log('ratio excluding draws ' + (totalCorrect/(totalGames-totalDraws)));
