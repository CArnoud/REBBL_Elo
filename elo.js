const fileHelper = require('./utils/fileHelper.js');
const seasonNames = require('./utils/rebbl').seasonNames;
const config = require('./utils/config');

const numberOfSeasons = 1;
let elo = {};

function readDivision(seasonName, fileName) {
    return JSON.parse(fileHelper.readFile('files/' + seasonName + '/' + fileName));
}

function readSeason(seasonName) {
    const fileNames = fileHelper.readDir('files/' + seasonName);
    const results = [];
    for (let i = 0; i < fileNames.length; i++) {
        results.push(readDivision(seasonName, fileNames[i]));
    }

    return results;
}

function calculateOdds(team_elo, opponent_elo) {
    return Math.pow(10,((team_elo - opponent_elo)/config.ELO.stretchingFactor));
}

function getExpectedResult(team_elo, opponent_elo) {
    const R1 = calculateOdds(team_elo, opponent_elo);
    const R2 = calculateOdds(opponent_elo, team_elo);
    return R1 / (R1 + R2);
}

function getUpdatedElo(previous_elo, expected_result, actual_result) {
    return previous_elo + config.ELO.maxChange * (actual_result - expected_result);
}

function updateEloForGame(game) {
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

    elo[team1] = getUpdatedElo(team1Mmr, e1, team1Result);
    elo[team2] = getUpdatedElo(team2Mmr, e2, team2Result);

    // console.log(team1 + ' ' + team2 + ' ' + team1Mmr + ' ' + team2Mmr + 
    //     '-> e: ' + e1 + ',' + e2 + ' res: ' + team1Result + ',' + team2Result +
    //     '-> ' + elo[team1] + ',' + elo[team2]);
}

for (let i = 0; i < seasonNames.length && i < numberOfSeasons; i++) {
    const results = readSeason(seasonNames[i]);

    for (let j=0; j < results.length; j++) {
        for (let k=0; k < results[j].length; k++) {
            for (let l = 0; l < results[j][k].length; l++) {
                updateEloForGame(results[j][k][l]);
            }
        }
    }    
}

console.log(elo);
console.log(Object.keys(elo).length);

let eloList = [];
let sum = 0;
for (let i in elo) {
    eloList.push(elo[i]);
    sum = sum + elo[i];
}

// console.log('sum ' + sum);
// console.log('avg ' + (sum / eloList.length));

fileHelper.writeFile('files/elo/elo.json', JSON.stringify(elo));
