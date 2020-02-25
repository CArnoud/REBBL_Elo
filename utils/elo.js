class Elo {
    constructor(norm, stretchingFactor, maxChange, dbElo) {
        this.elo = this.dbEloToDict(dbElo);
        this.norm = norm;
        this.stretchingFactor = stretchingFactor;
        this.maxChange = maxChange;
    }

    dbEloToDict(dbElo) {
        const result = {};
    
        for(let i in dbElo) {
            result[dbElo[i].teamId] = dbElo[i].rating;
        }
       
        // console.log(result);
        return result;
    }

    getTeamElo(team_id) {
        return this.elo[team_id] ? this.elo[team_id] : this.norm;
    }

    calculateOdds(team_elo, opponent_elo) {
        const diff = team_elo - opponent_elo;
        const exponent = -diff/this.stretchingFactor;
        return 1 / (1 + Math.pow(10,exponent));
        // return Math.pow(10,((team_elo - opponent_elo)/this.stretchingFactor));
    }

    /*
    x = Ra - Rb
    exponent = -(x/n)
    E = 1/(1+10^exponent)
    */
    getExpectedResult(team_elo, opponent_elo) {
        return this.calculateOdds(team_elo, opponent_elo);
        // const R1 = this.calculateOdds(team_elo, opponent_elo);
        // const R2 = this.calculateOdds(opponent_elo, team_elo);
        // return R1 / (R1 + R2);
    }

    getUpdatedElo(previous_elo, expected_result, actual_result) {
        return previous_elo + this.maxChange * (actual_result - expected_result);
    }

    async update(game, database) {
        if (game.gameHasBeenPlayed()) {
            const team1RebblId = game.getTeam(0).id;
            const team1 = await database.getTeamByRebblId(team1RebblId);
            const team1Id = team1[0].get('id');

            const team1Elo = this.getTeamElo(team1Id);
            let team1Result = 0.5;

            const team2RebblId = game.getTeam(1).id;
            const team2 = await database.getTeamByRebblId(team2RebblId);
            const team2Id = team2[0].get('id');
            const team2Elo = this.getTeamElo(team2Id);
            let team2Result = 0.5;

            const winner = game.getWinnerId();

            if (winner === team1RebblId) {
                team1Result = 1;
                team2Result = 0;
            }
            else if (winner === team2RebblId) {
                team1Result = 0;
                team2Result = 1;
            }

            const e1 = this.getExpectedResult(team1Elo, team2Elo);
            const e2 = this.getExpectedResult(team2Elo, team1Elo);

            this.elo[team1Id] = this.getUpdatedElo(team1Elo, e1, team1Result);
            this.elo[team2Id] = this.getUpdatedElo(team2Elo, e2, team2Result);

            if (this.elo[team1Id] < 0) {
                console.log(team1Id + ' negative Elo! ' + JSON.stringify(game.getTeam(0)));
            }

            if (this.elo[team2RebblId] < 0) {
                console.log(team2Id + ' negative Elo! ' + JSON.stringify(game.getTeam(1)));
            }

            // if (database) {
            //     const dbTeam1 = await database.getTeamByRebblId(game.getTeam(0).id);
            //     const dbTeam2 = await database.getTeamByRebblId(game.getTeam(1).id);
            //     const dbGame = await database.getMatchByRebblId(game.match_id);
            //     await database.insertElo(dbTeam1[0].get('id'), dbGame[0].get('id'), this.elo[team1RebblId], team1Elo, e1, team1Result);
            //     await database.insertElo(dbTeam2[0].get('id'), dbGame[0].get('id'), this.elo[team2RebblId], team2Elo, e2, team2Result);
            // }
        } else {
            console.log('Atempt to update Elo but game has not been played ' + JSON.stringify(game));
        }
    }

    async updateFullSeason(season, database, weekToStopAt) {
        const games = season.getGames();        

        for (let i in games) {
            if (!weekToStopAt || games[i].round < weekToStopAt) {                        
                await this.update(games[i], database);
            }
        }
    }

    getElo() {
        return this.elo;
    }

    async saveAllRatings(database) {
        Object.keys(this.elo).forEach(async (key) => {
            await database.insertCurrentElo(key, this.elo[key]);
        });
    }
};

exports.Elo = Elo;
