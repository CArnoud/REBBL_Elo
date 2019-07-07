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
}

exports.Predictor = Predictor;
