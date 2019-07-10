class Predictor {
    constructor(eloCalculator) {
        this.eloCalculator = eloCalculator;
    }

    predictWinner(game) {
        const team1 = game.getTeam(0).id;
        const team2 = game.getTeam(1).id;
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
        return this.predictWinner(game) === game.getWinnerId();
    }

    predictSeason(season) {
        const games = season.getGames();
        let correct = 0;

        for (let i in games) {
            for (let j in games[i]) {
                for (let k in games[i][j]) {
                    const game = games[i][j][k];

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
