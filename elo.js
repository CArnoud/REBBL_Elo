const fileHelper = require('./utils/fileHelper.js');

const seasonNames = require('./utils/rebbl').seasonNames;

const normElo = 1000;
//const stretchingFactor = 2 * Math.sqrt(numberOfTeams);
const stretchingFactor = 2000;
const maxEloChange = 100;

const numberOfSeasons = 1;
let elo = {};

function readFile(seasonName, fileName) {
    return JSON.parse(fileHelper.readFile('files/' + seasonName + '/' + fileName));
}

function readSeason(seasonName) {
    const fileNames = fileHelper.readDir('files/' + seasonName);
    const results = [];
    for (let i = 0; i < fileNames.length; i++) {
        results.push(readFile(seasonName, fileNames[i]));
    }

    return results;
}

function calculateOdds(team_elo, opponent_elo) {
    return Math.pow(10,((team_elo - opponent_elo)/stretchingFactor));
}

function getExpectedResult(team_elo, opponent_elo) {
    R1 = calculateOdds(team_elo, opponent_elo);
    R2 = calculateOdds(opponent_elo, team_elo);
    return R1 / (R1 + R2);
}

function getUpdatedElo(previous_elo, expected_result, actual_result) {
    return previous_elo + maxEloChange * (actual_result - expected_result);
}

function updateEloForGame(game) {
    const team1 = game.team_ids[0];
    let team1Mmr = elo[team1] ? elo[team1] : normElo;
    let team1Result = 0.5;

    const team2 = game.team_ids[1];
    let team2Mmr = elo[team2] ? elo[team2] : normElo;
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

function updateEloForRound(round) {
    for (let i = 0; i < round.length; i++) {
        updateEloForGame(round[i]);
    }
}

function updateEloForSeason(season) {
    for (let i = 0; i < season.length; i++) {
        updateEloForRound(season[i]);
    }
}

for (let i = 0; i < seasonNames.length && i < numberOfSeasons; i++) {
    const results = readSeason(seasonNames[i]);

    for (let j=0; j < results.length; j++) {
        updateEloForSeason(results[j]);
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
