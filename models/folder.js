const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
    return sequelize.define('Folder', {
        fid: {
            type: DataTypes.STRING(32),
            allowNull: false,
            defaultValue: sequelize.Sequelize.literal('replace(uuid(),"-","")'),
            primaryKey: true
        },
        name: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        uid: {
            type: DataTypes.STRING(32),
            allowNull: true,
            references: {
                model: 'Teacher',
                key: 'uid'
            }
        }
    }, {
        sequelize,
        tableName: 'folder',
        timestamps: false,
        indexes: [{
                name: "PRIMARY",
                unique: true,
                using: "BTREE",
                fields: [
                    { name: "fid" },
                ]
            },
            {
                name: "uid",
                using: "BTREE",
                fields: [
                    { name: "uid" },
                ]
            },
        ]
    });
};