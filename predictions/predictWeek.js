const fileHelper = require('../utils/fileHelper.js');
const seasonNames = require('../utils/rebbl').seasonNames;
const config = require('../utils/config');
const Elo = require('../utils/elo').Elo;
const Game = require('../models/game').Game;
const matchups = require('../files/race/matchups');


const seasonName = seasonNames[11];
const roundIndex = 3;


// Load elo
const currentElo = JSON.parse(fileHelper.readFile(config.FILE.currentEloFileName));
const eloCalculator = new Elo(config.ELO.norm, config.ELO.stretchingFactor, config.ELO.maxChange, currentElo);

// Load divisions
const directoryPath = config.FILE.filePath + seasonName;
const fileNames = fileHelper.readDir(directoryPath);


function getRaceMatchupString(teams) {
    const raceIndex = teams[0].race > teams[1].race ? teams[1].race + teams[0].race : teams[0].race + teams[1].race;
    return matchups[raceIndex][teams[0].race] + '-' +
        matchups[raceIndex]['draw'] + '-' +
        matchups[raceIndex][teams[1].race] + ' vs ' + teams[1].race;
}


function getTeamPrediction(team, opponent) {
    const elo = eloCalculator.getTeamElo(team.id);
    const oppElo = eloCalculator.getTeamElo(opponent.id);

    return {
        Name: team.name,
        Race: team.race,
        // TV: team.tv.toString(),
        "Elo Rating": Math.round(elo),
        "Race Matchup": getRaceMatchupString([team, opponent]),
        "Expected Result": (eloCalculator.getExpectedResult(elo, oppElo)).toFixed(4),
    }
}

const predictions = [];
for (let i=0; i < fileNames.length; i++) {
    const rounds = JSON.parse(fileHelper.readFile(directoryPath + '/' + fileNames[i]));
    const games = rounds[roundIndex];
    const division = {
        division: fileNames[i],
        predictions: []
    };

    // Proccess games
    for (let j in games) {
        const currentGame = new Game(games[j]);
        const teams = currentGame.getTeams();

        division.predictions.push([
            getTeamPrediction(teams[0], teams[1]),
            getTeamPrediction(teams[1], teams[0])
        ]);
    }

    predictions.push(division);
}

fileHelper.writeFile(config.FILE.predictionFileName, JSON.stringify(predictions));
