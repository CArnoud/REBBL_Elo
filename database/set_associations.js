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
        match_id: Sequelize.STRING,
        home_team_id: Sequelize.STRING,
        home_team_tv: Sequelize.INTEGER,
        away_team_id: Sequelize.STRING,
        away_team_tv: Sequelize.INTEGER,
        winner_id: Sequelize.STRING,
        round: Sequelize.INTEGER
    });

    models.Elo = sequelize.define('elo', {
        rating: Sequelize.INTEGER,
        previous_rating: Sequelize.INTEGER,
        expected_result: Sequelize.FLOAT,
        actual_result: Sequelize.FLOAT
    });

    models.CurrentElo = sequelize.define('current-elo', {
        rating: Sequelize.INTEGER
    });

    models.Season.belongsTo(models.League);
    models.Competition.belongsTo(models.Season);
    models.Team.belongsTo(models.Race);
    models.Match.belongsTo(models.Competition);
    models.Elo.belongsTo(models.Team);
    models.Elo.belongsTo(models.Match);
    models.CurrentElo.belongsTo(models.Team);
    return models;
}

module.exports = setAssociations;
