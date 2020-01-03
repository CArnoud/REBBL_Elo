const Sequelize = require('./sequelize_wrapper');

class Database {
    constructor() {
        // this.connection = require('./associations')();
    }

    connect() {
        console.log('Called database connect.');
        this.connection = Sequelize.get_connection();
        console.log('Connection initialized: ' + (this.connection !== undefined));
        console.log(this.connection.models);
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

        const [row, created] = await this.connection.models.match.findOrCreate({ where: { round: model.round, competitionId: competitionId, home_team_id: model.home_team_id }, defaults: model });
        return row;
    }
}

exports.Database = Database;
