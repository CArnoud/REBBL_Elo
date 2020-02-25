const CONFIG = {
    ELO: {
        norm: 1500,
        stretchingFactor: 400,
        maxChange: 40
    },
    FILE: {
        filePath: './files/',
        currentEloFileName: 'files/elo/current.json',
        raceMatchupsFileName: 'files/race/matchups.json',
        raceRecordsFileName: 'files/race/records.json',
        predictionFileName: 'files/predictions/predictions.json',
        htmlPredictionsFilePath: 'html/predictions.html',
        weekReviewFilePath: 'html/review.html'
    }
};

module.exports = CONFIG;
