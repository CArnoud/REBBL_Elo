class Elo {
    constructor(norm, stretchingFactor, maxChange) {
        this.elo = {};
        this.norm = norm;
        this.stretchingFactor = stretchingFactor;
        this.maxChange = maxChange;
    }

    getTeamElo(team_id) {
        return this.elo[team_id] ? this.elo[team_id] : this.norm;
    }

    calculateOdds(team_elo, opponent_elo) {
        return Math.pow(10,((team_elo - opponent_elo)/this.stretchingFactor));
    }

    getExpectedResult(team_elo, opponent_elo) {
        const R1 = this.calculateOdds(team_elo, opponent_elo);
        const R2 = this.calculateOdds(opponent_elo, team_elo);
        return R1 / (R1 + R2);
    }

    getUpdatedElo(previous_elo, expected_result, actual_result) {
        return previous_elo + this.maxChange * (actual_result - expected_result);
    }

    update(game) {
        const team1 = game.team_ids[0];
        let team1Elo = this.getTeamElo(team1);
        let team1Result = 0.5;

        const team2 = game.team_ids[1];
        let team2Elo = this.getTeamElo(team2);
        let team2Result = 0.5;

        const winner = game.winner_id;

        if (winner === team1) {
            team1Result = 1;
            team2Result = 0;
        }
        else if (winner === team2) {
            team1Result = 0;
            team2Result = 1;
        }

        const e1 = this.getExpectedResult(team1Elo, team2Elo);
        const e2 = this.getExpectedResult(team2Elo, team1Elo);

        this.elo[team1] = this.getUpdatedElo(team1Elo, e1, team1Result);
        this.elo[team2] = this.getUpdatedElo(team2Elo, e2, team2Result);
    }

    getElo() {
        return this.elo;
    }
};

exports.Elo = Elo;