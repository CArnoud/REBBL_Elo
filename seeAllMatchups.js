const fileHelper = require('./utils/fileHelper.js');
const config = require('./utils/config');
const Elo = require('./utils/elo').Elo;
const Game = require('./models/game').Game;

const tableify = require('tableify');

const Database = require('./database/database').Database;
const database = new Database();
database.connect();


const seasonId = 13; // 13(REL), 16 (BIGO), 27 (GMAN)
const round = 7;

const mainPostLink = 'https://news.rebbl.net/post/rebbl-elo-week-6-review-791';


// Result
let html = "";

// Load Elo
database.getCompetitionsFromSeason(seasonId).then(async (competitions) => {
    const currentElo = await database.getCurrentElos();
    const eloCalculator = new Elo(config.ELO.norm, config.ELO.stretchingFactor, config.ELO.maxChange, currentElo);

    for (let i in competitions) {
        const table = [];
        const games = await database.getGamesFromCompetitionAndRound(competitions[i].id, round);

        for (let j in games) {
            const currentGame = new Game(games[j]);
            const team0 = await database.getTeamByRebblId(currentGame.getTeams()[0].id);
            const team1 = await database.getTeamByRebblId(currentGame.getTeams()[1].id);
            const teams = [team0[0], team1[0]];

            if (!teams[0].name.toLowerCase().includes('admin') &&
                !teams[1].name.toLowerCase().includes('admin')) {
                if (j > 0) {
                    table.push({});
                }
                table.push(getTeamRow(teams[0], teams[1], eloCalculator, database));
                table.push(getTeamRow(teams[1], teams[0], eloCalculator, database));

                await savePrediction(database, games[j].id, teams[0].id, teams[1].id, eloCalculator);
            }
        }

        html = html +
            getDivisionNameHtml(i, competitions[i].name) +
            tableify(table); 
    }

    html = addHtmlStyle(html);
    fileHelper.writeFile(config.FILE.htmlPredictionsFilePath, html);
    database.end();
});

// function getRaceMatchupString(teams) {
//     const raceIndex = teams[0].race > teams[1].race ? teams[1].race + teams[0].race : teams[0].race + teams[1].race;
//     if (matchups[raceIndex]) {
//         return matchups[raceIndex][teams[0].race] + '-' +
//         matchups[raceIndex]['draw'] + '-' +
//         matchups[raceIndex][teams[1].race] + ' vs ' + teams[1].race;
//     }
//     else {
//         return "?-?-?";
//     }
// }

async function savePrediction(database, gameId, home_team_id, away_team_id, eloCalculator) {
    const home_elo = eloCalculator.getTeamElo(home_team_id);
    const away_elo = eloCalculator.getTeamElo(away_team_id);
    let winners_expected_result = 0.5;
    let predicted_winner_id = null;

    if (home_elo > away_elo) {
        predicted_winner_id = home_team_id;
        winners_expected_result = eloCalculator.getExpectedResult(home_elo, away_elo);
    } else if (away_elo > home_elo) {
        predicted_winner_id = away_team_id;
        winners_expected_result = eloCalculator.getExpectedResult(away_elo, home_elo);
    }

    await database.insertPrediction(home_elo, away_elo, predicted_winner_id, winners_expected_result, gameId);
}

function getTeamRow(team, opponent, eloCalculator) {
    const elo = eloCalculator.getTeamElo(team.id);
    const oppElo = eloCalculator.getTeamElo(opponent.id);

    // console.log(JSON.stringify(team));
    // console.log(team.rebbl_id + ' rating ' + elo);

    return {
        Team: "<a href=\"https://rebbl.net/rebbl/team/" + team.rebbl_id + "\">" + team.name + "</a>",
        Race: team.raceId, // TODO translate
        // TV: team.tv.toString(), // TODO
        "Elo Rating": Math.round(elo),
        // "Race Matchup (REL and GMAN history)": getRaceMatchupString([team, opponent]), // TODO
        "Expected Result": (eloCalculator.getExpectedResult(elo, oppElo)*100).toFixed(2) + '%',       
    }
}

function getDivisionNameHtml(index, competitionName) {
    let result = (index > 0 ? "<p>&nbsp;</p>" : "") + "<h3 class='division-name'>" + competitionName + "</h3>";
    return result.replace(".json", "").replace(".Season 12", "");
}

function addHtmlStyle(html) {
    let result = getHtmlFileBeggining();
    result = result + html.replace(new RegExp("<table>", "g"), "<table class='division'>");
    result = result + "</table></body></html>";
    return result;
}

function getPostIntroductionText() {
    return '<p>For a review from the previous week, please read this <a href=' + mainPostLink + ">post</a></p>";
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
