const Sequelize = require('sequelize');


const setAssociations = (sequelize) => {
    const League = sequelize.define('league', {
        name: Sequelize.STRING,
    });

    const Season = sequelize.define('season', {
        name: Sequelize.STRING,
    });

    const Competition = sequelize.define('competition', {
        name: Sequelize.STRING,
    });

    const Race = sequelize.define('race', {
        name: Sequelize.STRING,
    });

    const Team = sequelize.define('team', {
        rebbl_id: Sequelize.STRING,
        name: Sequelize.STRING,
        coach_id: Sequelize.STRING
    });

    const Match = sequelize.define('match', {
        rebbl_id: Sequelize.STRING,
        name: Sequelize.STRING,
        match_id: Sequelize.STRING,
        home_team_id: Sequelize.STRING,
        away_team_id: Sequelize.STRING,
    });

    Season.belongsTo(League);
    Competition.belongsTo(Season);
    Team.belongsTo(Race);
    Match.belongsTo(Competition);
    return sequelize;
}
module.exports = setAssociations;
