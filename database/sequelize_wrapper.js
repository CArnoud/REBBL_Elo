const set_associations = require('./set_associations');
const Sequelize = require('sequelize');


exports.get_connection = () => {
    const sequelize = new Sequelize('rebbl', 'root', 'password', {
        host: 'localhost',
        dialect: 'mysql'
    });
    set_associations(sequelize);
    return sequelize;
}
