const Database = require('../database/database').Database;
const database = new Database();
database.connect();

const seasonId = 16; // 13(REL), 16 (BIGO), 27 (GMAN)
const round = 7;

let correctPicks = 0;
let totalGames = 0;
let totalDraws = 0;
let gamesPlayed = 0;
let predictionScore = 0;

// Load Elo
database.getCompetitionsFromSeason(seasonId).then(async (competitions) => {
    for (let i in competitions) {
        const games = await database.getGamesFromCompetitionAndRound(competitions[i].id, round);

        for (let j in games) {
            totalGames++;
            const prediction = (await database.getPredictionFromGame(games[j]))[0];
            let winnerId = null;
            let correct = false;

            if (games[j].winner_id) {
                winnerId = (await database.getTeamByRebblId(games[j].winner_id))[0].id;
            } else {
                totalDraws++;
            }

            if (games[j].match_id) {
                gamesPlayed++;

                if (winnerId == prediction.predicted_winner_id) {
                    correct = true;
                    correctPicks++;
                    predictionScore = predictionScore + prediction.expected_result;
                } 
                else {
                    predictionScore = predictionScore - prediction.expected_result;
                }
            } else {
                predictionScore = predictionScore + 0.5 * prediction.expected_result;
            }

            

            console.log('Game ' + games[j].id + 
                ', winner ' + winnerId + 
                ', predictedWinner ' + prediction.predicted_winner_id +
                ', round ' + games[j].round +
                ', correct ' + correct);
        }
    }

    console.log('\ngames: ' + totalGames +
        ', draws: ' + totalDraws +
        ', correct: ' + correctPicks +
        ', ratio: ' + (correctPicks / gamesPlayed * 100).toFixed(2) + '%' +
        ', ratio (no draws): ' + (correctPicks / (gamesPlayed - totalDraws) * 100).toFixed(2) + '%' + 
        ', games played: ' + gamesPlayed +
        ', prediction score: ' + predictionScore
    );

    database.end();
});
