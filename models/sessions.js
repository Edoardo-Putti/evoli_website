const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
    return sequelize.define('Sessions', {
        session_id: {
            type: DataTypes.STRING(128),
            allowNull: false,
            primaryKey: true
        },
        expires: {
            type: DataTypes.INTEGER.UNSIGNED,
            allowNull: false
        },
        data: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    }, {
        sequelize,
        tableName: 'Sessions',
        timestamps: false,
        indexes: [{
            name: "PRIMARY",
            unique: true,
            using: "BTREE",
            fields: [
                { name: "session_id" },
            ]
        }, ]
    });
};