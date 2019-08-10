const mysql = require('mysql');

class Database {
    constructor() {
        this.connection = mysql.createConnection({
            host     : 'localhost',
            user     : 'root',
            password : '',
            database : 'rebbl'
          });
        this.connection.connect();
    }

    end() {
        this.connection.end();
    }

    createTeam = async (teamObj) => {
        // {
        //     id: rebblObj.opponents[0].team.id,
        //     name: rebblObj.opponents[0].team.name,
        //     coach_id: rebblObj.opponents[0].coach.id,
        //     tv: rebblObj.opponents[0].team.value,
        //     race: rebblObj.legacy ? getNormalizedRace(rebblObj.opponents[0].team.race) : rebblObj.opponents[0].team.race
        // }
        const queryString = "INSERT INTO team SET ?";
        const team = {
            id: teamObj.id,
            name: teamObj.name,
            currentElo: 1000
        }

        this.connection.query(queryString, team, (error, result) => {
            if (error) {
                throw error;
            }
            else {
                return;
            }
        });
    }
}

exports.Database = Database;
