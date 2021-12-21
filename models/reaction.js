const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
    return sequelize.define('Reaction', {
        rid: {
            type: DataTypes.STRING(32),
            allowNull: false,
            defaultValue: Sequelize.Sequelize.literal('replace(uuid(),"-","")'),
            primaryKey: true
        },
        type: {
            type: DataTypes.STRING(1000),
            allowNull: true
        },
        at_second: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        video_code: {
            type: DataTypes.STRING(20),
            allowNull: true
        },
        user_name: {
            type: DataTypes.STRING(100),
            allowNull: true
        },
        visible: {
            type: DataTypes.SMALLINT,
            allowNull: true
        }
    }, {
        sequelize,
        tableName: 'reaction',
        timestamps: false,
        indexes: [{
                name: "PRIMARY",
                unique: true,
                using: "BTREE",
                fields: [
                    { name: "rid" },
                ]
            },
            {
                name: "video_code",
                using: "BTREE",
                fields: [
                    { name: "video_code" },
                    { name: "user_name" },
                ]
            },
        ]
    });
};