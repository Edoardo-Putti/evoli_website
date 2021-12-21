const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
    return sequelize.define('Student', {
        uid: {
            type: DataTypes.STRING(32),
            allowNull: false,
            defaultValue: Sequelize.Sequelize.literal('replace(uuid(),"-","")'),
            primaryKey: true
        },
        email: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        hash: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        salt: {
            type: DataTypes.STRING(40),
            allowNull: true
        }
    }, {
        sequelize,
        tableName: 'student',
        timestamps: false,
        indexes: [{
            name: "PRIMARY",
            unique: true,
            using: "BTREE",
            fields: [
                { name: "uid" },
            ]
        }, ]
    });
};