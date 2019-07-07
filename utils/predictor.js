class Predictor {
    constructor(eloCalculator) {
        this.eloCalculator = eloCalculator;
    }

    predictWinner(game) {
        const team1 = game.team_ids[0];
        const team2 = game.team_ids[1];
        const team1Elo = this.eloCalculator.getTeamElo(team1);
        const team2Elo = this.eloCalculator.getTeamElo(team2);

        const e1 = this.eloCalculator.getExpectedResult(team1Elo, team2Elo);
        const e2 = this.eloCalculator.getExpectedResult(team2Elo, team1Elo);

        if (e1 > e2) {
            return team1;
        }
        else if (e2 > e1) {
            return team2;
        }
        else {
            return null;
        }
    }

    isPredictorCorrect(game) {
        return this.predictWinner(game) === game.winner_id;
    }

    predictSeason(season) {
        const games = season.getGames();
        let correct = 0;

        //temp 
        let teamId;

        for (let i in games) {
            for (let j in games[i]) {
                for (let k in games[i][j]) {
                    const game = games[i][j][k];

                    //temp 
                    if (!teamId) {
                        teamId = game.team_ids[0];
                    }
                    if (teamId === game.team_ids[0] || teamId === game.team_ids[1]) {
                        console.log('team ' + teamId + ' ' + this.eloCalculator.getTeamElo(teamId) + ' (' +
                        this.eloCalculator.getTeamElo(game.team_ids[0]) + ' vs ' + this.eloCalculator.getTeamElo(game.team_ids[1]) +
                        '): ' + (game.winner_id? this.eloCalculator.getTeamElo(game.winner_id):'draw'));
                    }
                    // /temp 

                    if (this.isPredictorCorrect(game)) {
                        correct++;
                    }

                    this.eloCalculator.update(game);
                }
            }
        }

        return correct;
    }
}

exports.Predictor = Predictor;
