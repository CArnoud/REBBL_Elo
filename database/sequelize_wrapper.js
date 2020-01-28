const set_associations = require('./set_associations');
const Sequelize = require('sequelize');


exports.get_connection = () => {
    const sequelize = new Sequelize('rebbl', 'root', 'password', {
        host: 'localhost',
        dialect: 'mysql'
    });
    // sequelize.models = set_associations(sequelize);
    set_associations(sequelize);
    return sequelize;
};

exports.get_models = (connection) => {
    return set_associations(connection);
};
