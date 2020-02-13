const fileHelper = require('../utils/fileHelper.js');
const seasonNames = require('../utils/rebbl').seasonNames;
const config = require('../utils/config');
const Elo = require('../utils/elo').Elo;
const Game = require('../models/game').Game;
// const matchups = require('../files/race/matchups');

const tableify = require('tableify');

const Database = require('../database/database').Database;
const database = new Database();
database.connect();


const seasonId = 36; // 17, 34, 36
const round = 1;

// Load elo
database.getCurrentElos().then(async (currentElo) => {
    const eloCalculator = new Elo(config.ELO.norm, config.ELO.stretchingFactor, config.ELO.maxChange, currentElo);

    // Load games
    const games = await database.getGamesFromRound(seasonId, round);

    const table = [];

    // Proccess games
    for (let i in games) {
        for (let j in games[i]) {
            const currentGame = new Game(games[i][j]);
            const team0 = await database.getTeamByRebblId(currentGame.getTeams()[0].id);
            const team1 = await database.getTeamByRebblId(currentGame.getTeams()[1].id);
            const teams = [ team0[0], team1[0] ];

            // console.log(
            //     getTeamString(teams[0], teams[1], eloCalculator) +
            //     // 'VS\n' +
            //     getTeamString(teams[1], teams[0], eloCalculator) +
            //     // getRaceMatchupString(teams) +
            //     // 'Winner: ' + currentGame.winner_id +
            //     '\n' +
            //     ''
            // );

            if (!teams[0].name.toLowerCase().includes('admin') &&
                !teams[1].name.toLowerCase().includes('admin')) {
                if (i > 0) {
                    table.push({});
                }
                table.push(getTeamRow(teams[0], teams[1], eloCalculator));
                table.push(getTeamRow(teams[1], teams[0], eloCalculator));
            }
        }
    }

    var html = tableify(table);
    console.log(html);
    database.end();
});

function getTeamString(team, opponent, eloCalculator) {
    const elo = eloCalculator.getTeamElo(team.id);
    const oppElo = eloCalculator.getTeamElo(opponent.id);

    return team.name.padEnd(32) + 
        // team.id + 
        ' - ' + 
        team.tv.toString().padStart(4) + 
        ' TV ' + team.race.padEnd(12, ' ') + 
        ' (' + Math.round(elo) + ' Elo): ' + 
        (eloCalculator.getExpectedResult(elo, oppElo)*100).toFixed(2) + '%' + 
        '\n';
}

function getTeamRow(team, opponent, eloCalculator) {
    const elo = eloCalculator.getTeamElo(team.id);
    const oppElo = eloCalculator.getTeamElo(opponent.id);

    return {
        Id: team.rebbl_id,
        Name: team.name,
        Race: team.race,
        // TV: team.tv.toString(), // TODO
        "Elo Rating": Math.round(elo.rating),
        // "Race Matchup (REL and GMAN history)": getRaceMatchupString([team, opponent]),
        "Expected Result": (eloCalculator.getExpectedResult(elo.rating, oppElo.rating)*100).toFixed(2) + '%',       
    }
}
