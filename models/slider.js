const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
    return sequelize.define('Slider', {
        sid: {
            type: DataTypes.STRING(32),
            allowNull: false,
            defaultValue: Sequelize.Sequelize.literal('replace(uuid(),"-","")'),
            primaryKey: true
        },
        appreciation: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        understanding: {
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
        tableName: 'slider',
        timestamps: false,
        indexes: [{
                name: "PRIMARY",
                unique: true,
                using: "BTREE",
                fields: [
                    { name: "sid" },
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