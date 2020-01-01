const Sequelize = require('sequelize');


const setAssociations = (sequelize) => {
    const models = {};
    models.League = sequelize.define('league', {
        name: Sequelize.STRING,
        simple_name: Sequelize.STRING
    });

    models.Season = sequelize.define('season', {
        name: Sequelize.STRING
    });

    models.Competition = sequelize.define('competition', {
        name: Sequelize.STRING,
    });

    models.Race = sequelize.define('race', {
        name: Sequelize.STRING,
    });

    models.Team = sequelize.define('team', {
        rebbl_id: Sequelize.STRING,
        name: Sequelize.STRING,
        coach_id: Sequelize.STRING
    });

    models.Match = sequelize.define('match', {
        rebbl_id: Sequelize.STRING,
        name: Sequelize.STRING,
        match_id: Sequelize.STRING,
        home_team_id: Sequelize.STRING,
        away_team_id: Sequelize.STRING,
    });

    models.Season.belongsTo(models.League);
    models.Competition.belongsTo(models.Season);
    models.Team.belongsTo(models.Race);
    models.Match.belongsTo(models.Competition);
    return models;
}
module.exports = setAssociations;
