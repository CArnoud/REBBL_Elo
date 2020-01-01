const Sequelize = require('./sequelize_wrapper');

class Database {
    constructor() {
        // this.connection = require('./associations')();
    }

    async connect() {
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
        console.log('created ' + createdTeam);
    }
}

exports.Database = Database;
