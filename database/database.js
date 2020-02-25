const Sequelize = require('./sequelize_wrapper');

class Database {
    constructor() {
        
    }

    connect() {
        console.log('Called database connect.');
        this.connection = Sequelize.get_connection();
        console.log('Connection initialized: ' + (this.connection !== undefined));
        // console.log(this.connection.models);
    }

    async end() {
        this.connection.close().then(() => {
            console.log('Database connection ended.');
        });        
    }

    async insertTeam(teamObj) {
        // {
        //     id: rebblObj.opponents[0].team.id,
        //     name: rebblObj.opponents[0].team.name,
        //     coach_id: rebblObj.opponents[0].coach.id,
        //     tv: rebblObj.opponents[0].team.value,
        //     race: rebblObj.legacy ? getNormalizedRace(rebblObj.opponents[0].team.race) : rebblObj.opponents[0].team.race
        // }

        // find race
        const [race, createdRace] = await this.connection.models.race.findOrCreate({ where: { name: teamObj.race }, defaults: { name: teamObj.race } });

        // assemble model
        const model = {
            rebbl_id: teamObj.id,
            name: teamObj.name,
            raceId: race.id
        };

        // insert
        const [team, createdTeam] = await this.connection.models.team.findOrCreate({where: { rebbl_id: teamObj.id}, defaults: model});
        return team;
    }

    async getTeamByRebblId(rebbl_id) {
        return this.connection.models.team.findAll({ where: { rebbl_id: rebbl_id } }); 
    }

    async getTeam(team_id) {
        return this.connection.models.team.findAll({ where: { id: team_id } });
    }

    async getMatchByRebblId(rebbl_id) {
        return this.connection.models.match.findAll({ where: { match_id: rebbl_id } });
    }

    async insertCompetition(competition, seasonName, leagueId) {
        const [season, seasonWasCreated] = await this.connection.models.season.findOrCreate({ where: { name: seasonName, leagueId: leagueId }, defaults: { name: seasonName, leagueId: leagueId } });

        const model = {
            name: competition.name,
            seasonId: season.id
        };

        const [row, created] = await this.connection.models.competition.findOrCreate({ where: { name: competition.name, seasonId: season.id }, defaults: model });
        return row;
    }

    async getLeagues() {
        return this.connection.models.league.findAll();
    }

    async getSeasons() {
        return this.connection.models.season.findAll();
    }

    async getCompetitionsFromSeason(seasonId) {        
        return this.connection.models.competition.findAll({ where: { seasonId: seasonId } });
    }

    async getCompetitions() {
        return this.connection.models.competition.findAll();
    }

    async getGamesFromCompetition(competitionId) {
        return this.connection.models.match.findAll({ where: { competitionId: competitionId } });
    }

    async getGamesFromCompetitionAndRound(competitionId, round) {
        return this.connection.models.match.findAll({ where: { competitionId: competitionId, round: round } });
    }

    async getGamesFromSeason(seasonId) {
        const competitions = await this.getCompetitionsFromSeason(seasonId);
        const games = [];
        for (let i=0; i < competitions.length; i++) {
            games.push(await this.getGamesFromCompetition(competitions[i].id));
        }
        return games;
    }

    async getGamesFromRound(seasonId, round) {
        const competitions = await this.getCompetitionsFromSeason(seasonId);
        const games = [];
        for (let i = 0; i < competitions.length; i++) {
            games.push(await this.getGamesFromCompetitionAndRound(competitions[i].id, round));
        }
        return games;
    }

    async insertGame(gameObj, competitionId) {
        const model = {
            round: gameObj.round,
            match_id: gameObj.match_id,
            competitionId: competitionId,
            home_team_id: gameObj.teams[0].id,
            home_team_tv: gameObj.teams[0].tv,
            away_team_id: gameObj.teams[1].id,
            away_team_tv: gameObj.teams[1].tv,
            winner_id: gameObj.winner_id
        };

        await this.insertTeam(gameObj.teams[0]);
        await this.insertTeam(gameObj.teams[1]);

        const [row, created] = await this.connection.models.match.findOrCreate({ where: { round: model.round, competitionId: competitionId, home_team_id: model.home_team_id }, defaults: model });
        if (!created && row.match_id != model.match_id) {
            await this.connection.models.match.update(model, { where: { id: row.id } });
        }
    }

    async insertElo(teamId, matchId, rating, previous_rating, expected_result, actual_result) {
        const model = {
            rating: rating,
            previous_rating: previous_rating,
            expected_result: expected_result,
            actual_result: actual_result,
            teamId: teamId,
            matchId: matchId
        };

        const where = {
            teamId: teamId,
            matchId: matchId
        };

        const [row, created] = await this.connection.models.elo.findOrCreate({ where: where, defaults: model });
        return row;
    }

    async insertCurrentElo(teamId, rating) {
        const model = {
            rating: rating,
            teamId: teamId
        };

        const where = {
            teamId: teamId
        }

        const [row, created] = await this.connection.models['current-elo'].findOrCreate({ where: where, defaults: model });
        if (!created && model.rating != row.rating) {
            await this.connection.models['current-elo'].update(model, { where: { id: row.id } });
        }
        return row;
    }

    async getCurrentElos() {
        return await this.connection.models['current-elo'].findAll({ raw: true });
    }

    async insertPrediction(home_team_rating, away_team_rating, predicted_winner_id, expected_result, gameId) {
        const model = {
            home_team_rating: home_team_rating,
            away_team_rating: away_team_rating,
            predicted_winner_id: predicted_winner_id,
            expected_result: expected_result,
            matchId: gameId
        };

        const where = {
            matchId: gameId
        };

        const [row, created] = await this.connection.models.prediction.findOrCreate({ where: where, defaults: model });
        return row;
    }

    async getPredictionFromGame(gameFromDb) {
        return await this.connection.models.prediction.findAll({ where: { matchId: gameFromDb.id }, raw: true });
    }
}

exports.Database = Database;
