const CONFIG = {
    ELO: {
        norm: 1000,
        stretchingFactor: 700,
        maxChange: 100
    },
    FILE: {
        filePath: './files/',
        currentEloFileName: 'files/elo/current.json',
        raceMatchupsFileName: 'files/race/matchups.json',
        raceRecordsFileName: 'files/race/records.json'
    }
};

module.exports = CONFIG;
