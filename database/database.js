const Sequelize = require('sequelize');
const associations = require('./associations');


class Database {
    constructor() {
        // this.connection = require('./associations')();
    }

    async connect() {
        console.log('Called database connect.');
        this.connection = await associations();
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
console.log('insertteam');
        const model = {
            rebbl_id: teamObj.id,
            name: teamObj.name
        };
        var selector = { where: { rebbl_id: teamObj.id } };
        const [team, created] = await this.connection.models.team.findOrCreate({where: { rebbl_id: teamObj.id}, defaults: model});
        console.log(team);
        console.log('created ' + created);
    }
}

exports.Database = Database;
