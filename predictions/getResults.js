const tableify = require('tableify');

const fileHelper = require('../utils/fileHelper.js');
const config = require('../utils/config');
const Database = require('../database/database').Database;
const database = new Database();
database.connect();


const seasonIds = [16, 27, 13]; // 13(REL), 16 (BIGO), 27 (GMAN)
const seasonNames = {
    '13': 'REL',
    '16': 'BIGO',
    '27': 'GMAN'
}
const round = 10;

let correctPicks = 0;
let totalGames = 0;
let totalDraws = 0;
let gamesPlayed = 0;
let predictionScore = 0;

// Result
let html = "";
const table = [];
const overallResults = {
    league: 'Total',
    total: 0,
    played: 0,
    correct: 0,
    drawn: 0
};
let index = 0;

// Load Elo
seasonIds.forEach(async (seasonId) => {
    const competitions = await database.getCompetitionsFromSeason(seasonId);
    const results = {
        league: seasonNames[seasonId.toString()],
        total: 0,
        played: 0,
        correct: 0,
        drawn: 0
    };
    
    for (let i in competitions) {
        const games = await database.getGamesFromCompetitionAndRound(competitions[i].id, round);

        for (let j in games) {
            totalGames++;
            results.total++;    
            let winnerId = null;
            let correct = false;

            if (games[j].match_id) {
                gamesPlayed++;
                results.played++;
                const prediction = (await database.getPredictionFromGame(games[j]))[0];                

                if (games[j].winner_id) {
                    winnerId = (await database.getTeamByRebblId(games[j].winner_id))[0].id;
                } else {
                    totalDraws++;
                    results.drawn++;
                }            

                if (winnerId == prediction.predicted_winner_id) {
                    correct = true;
                    correctPicks++;
                    results.correct++;
                    predictionScore = predictionScore + prediction.expected_result;
                }

                console.log('Game ' + games[j].id +
                    ', match_id ' + games[j].match_id +
                    ', winner ' + winnerId +
                    ', predictedWinner ' + prediction.predicted_winner_id +
                    ', round ' + games[j].round +
                    ', correct ' + correct);
            }
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

    overallResults.total = overallResults.total + results.total;
    overallResults.played = overallResults.played + results.played;
    overallResults.correct = overallResults.correct + results.correct;
    overallResults.drawn = overallResults.drawn + results.drawn;
    index++;

    table.push(getLeagueResultsRow(results));

    if (index === seasonIds.length) {
        table.push(getLeagueResultsRow(overallResults));
        html = addHtmlStyle(tableify(table));
        fileHelper.writeFile(config.FILE.weekReviewFilePath, html);
        database.end();
    }
});

function getLeagueResultsRow(results) {
    return {
        League: results.league,
        // Round: round,
        'Games': results.total,
        'Games Played': results.played,
        'Correct Picks': results.correct,
        'Draws': results.drawn,
        'Overall': (results.correct / results.played * 100).toFixed(2) + '%',
        'Excluding Draws': (results.correct / (results.played - results.drawn) * 100).toFixed(2) + '%'
    };
}

function addHtmlStyle(html) {
    let result = getHtmlFileBeggining();
    result = result + html.replace(new RegExp("<table>", "g"), "<table class='division'>");
    result = result + "</table></body></html>";
    return result;
}

function getPostIntroductionText() {
    return '<h2></h2><p></p>';
}

function getHtmlFileBeggining() {
    return "<!DOCTYPE html>" +
        "<html> " +
        "<head> " +
        "<style> " +
        ".division { " +
        "  font-family: \"Trebuchet MS\", Arial, Helvetica, sans-serif; " +
        "  border-collapse: collapse; " +
        "  width: 100%; " +
        "} " +

        ".division td, .division th { " +
        "  border: 1px solid #ddd; " +
        "  padding: 8px; " +
        "} " +

        ".division tr:nth-child(2){background-color: #f2f2f2;} " +
        ".division tr:nth-child(5){background-color: #f2f2f2;} " +
        ".division tr:nth-child(8){background-color: #f2f2f2;} " +
        ".division tr:nth-child(11){background-color: #f2f2f2;} " +
        ".division tr:nth-child(14){background-color: #f2f2f2;} " +
        ".division tr:nth-child(17){background-color: #f2f2f2;} " +
        ".division tr:nth-child(20){background-color: #f2f2f2;} " +

        ".division tr:hover {background-color: #ddd;} " +

        ".division th { " +
        "  padding-top: 12px; " +
        "  padding-bottom: 12px; " +
        "  text-align: left; " +
        "  background-color: #4CAF50; " +
        "  color: white; " +
        "} " +
        "</style> " +
        "</head> " +
        "<body> " +
        getPostIntroductionText() +
        "<table>";
}
