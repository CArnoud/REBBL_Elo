const seasonNames = require('./utils/rebbl').seasonNames;
const Elo = require('./utils/elo').Elo;
const Season = require('./models/season').Season;
const Predictor = require('./utils/predictor').Predictor;
const config = require('./utils/config');
const fileHelper = require('./utils/fileHelper.js');
const Database = require('./database/database').Database;

const numberOfSeasonsToLoad = 1;
const numberOfSeasonsToSimulate = 11;


// get elo for all parameter sets
const parameterSets = [{
    norm: 1000,
    stretchingFactor: 2000,
    maxChange: 100,
    name: 'config'
}, {
    norm: 1000,
    stretchingFactor: 2 * Math.sqrt(46),
    maxChange: 100,
    name: 'fancy stretching'
}, {
    norm: 1500,
    stretchingFactor: 400,
    maxChange: 40,
    name: 'chess'
}, {
    norm: 1000,
    stretchingFactor: 300,
    maxChange: 30,
    name: 'chess-adjusted'
}, {
    norm: 1000,
    stretchingFactor: 700,
    maxChange: 100,
    name: 'charlitos'
}, {
    norm: 1000,
    stretchingFactor: 10000,
    maxChange: 500,
    name: 'crazy'
}];

savetoDb = async (season) => {
    const database = new Database();
    await database.connect().catch(error => console.log(error));
    await season.saveGameToDatabase(database, season.getGames()[0][0][0]).catch(error => console.log(error));
    await database.end().catch(error => console.log(error));
}

let aSeason;
let eloCalculators = [];
for (m in parameterSets) {
    eloCalculators.push(new Elo(parameterSets[m].norm, parameterSets[m].stretchingFactor, parameterSets[m].maxChange, {}));
    for (let i = 0; i < seasonNames.length && i < numberOfSeasonsToLoad; i++) {
        const season = new Season(seasonNames[i]);        
        eloCalculators[m].updateFullSeason(season);     
        aSeason = season;   
    }
}

// savetoDb(aSeason);

// save all elo checkpoints
let predictors = [];
for (let i in eloCalculators) {
    predictors.push(new Predictor(eloCalculators[i]));
}

// predict results using each of the elos (prediction algorithm doesnt change)
const numberOfGames = [];
const numberOfTeams = [];
const numberOfDraws = [];
const results = [];
let sumRaceMatchups;
let sumRaceRecords;
for (let i in predictors) {
    const predictorResults = [];

    for (let j=numberOfSeasonsToLoad; j < numberOfSeasonsToSimulate + numberOfSeasonsToLoad; j++) {
        const seasonToPredict = new Season(seasonNames[j]);
        if (numberOfGames.length === j - numberOfSeasonsToLoad) {
            numberOfGames.push(seasonToPredict.getNumberOfGames());
            numberOfTeams.push(seasonToPredict.getTeamIds().length);
            numberOfDraws.push(seasonToPredict.getNumberOfDraws());
        }
        predictorResults.push(predictors[i].predictSeason(seasonToPredict));

        if (i === '0') {
            if (sumRaceMatchups) {
                seasonToPredict.addRaceMatchups(sumRaceMatchups);
                seasonToPredict.addRaceRecords(sumRaceRecords);
            }
            sumRaceMatchups = seasonToPredict.getRaceMatchups();
            sumRaceRecords = seasonToPredict.getRaceRecords();
        }        
    }

    results.push(predictorResults);
}

// compare results
console.log(numberOfTeams);
console.log(numberOfGames);
console.log(numberOfDraws);
// console.log(results);

const sums = [];
for (let i in results) {
    let sum = 0;
    for (let j in results[i]) {
        sum = sum + results[i][j];
    }

    sums.push(sum);
}

let totalGames = 0;
let totalDraws = 0;
for (let i in numberOfGames) {
    totalGames = totalGames + numberOfGames[i];
    totalDraws = totalDraws + numberOfDraws[i];
}

console.log(sums);
console.log(totalGames);
console.log(totalDraws);

// console.log(sumRaceMatchups);
// console.log(sumRaceRecords);

fileHelper.writeFile(config.FILE.raceRecordsFileName, JSON.stringify(sumRaceRecords));
fileHelper.writeFile(config.FILE.raceMatchupsFileName, JSON.stringify(sumRaceMatchups));

// console.log('\n\n');
// for (let i=0; i < predictors.length; i++) {
//     console.log(predictors[i].eloCalculator.getTeamElo(2292328));
// }
