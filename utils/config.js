const CONFIG = {
    ELO: {
        norm: 1000,
        stretchingFactor: 300,
        maxChange: 30
    },
    FILE: {
        filePath: './files/',
        currentEloFileName: 'files/elo/current.json',
        raceMatchupsFileName: 'files/race/matchups.json',
        raceRecordsFileName: 'files/race/records.json'
    }
};

module.exports = CONFIG;
