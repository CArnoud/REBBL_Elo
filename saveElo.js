const fileHelper = require('./utils/fileHelper.js');
const seasonNames = require('./utils/rebbl').seasonNames;
const config = require('./utils/config');
const Elo = require('./utils/elo').Elo;
const Season = require('./models/season').Season;

const numberOfSeasonsToLoad = 12;
const weekToStopAt = 1;


const eloCalculator = new Elo(config.ELO.norm, config.ELO.stretchingFactor, config.ELO.maxChange, {});
for (let i = 0; i < seasonNames.length && i < numberOfSeasonsToLoad; i++) {
    const season = new Season(seasonNames[i]);
    if (i === seasonNames.length - 1) {
        eloCalculator.updateFullSeason(season, weekToStopAt);
    }   
    else {
        eloCalculator.updateFullSeason(season);
    }    
}

// save result to a file
const result = eloCalculator.getElo();
fileHelper.writeFile(config.FILE.currentEloFileName, JSON.stringify(result));
