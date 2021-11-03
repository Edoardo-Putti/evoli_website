const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
    return sequelize.define('Video', {
        vid: {
            type: DataTypes.STRING(32),
            allowNull: false,
            defaultValue: Sequelize.Sequelize.literal('replace(uuid(),"-","")'),
            primaryKey: true
        },
        title: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        duration: {
            type: DataTypes.INTEGER,
            allowNull: true
        },
        folder: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        url: {
            type: DataTypes.STRING(255),
            allowNull: true
        },
        uid: {
            type: DataTypes.STRING(32),
            allowNull: true,
            references: {
                model: 'teacher',
                key: 'uid'
            }
        },
        video_code: {
            type: DataTypes.STRING(20),
            allowNull: true
        },
        comment: {
            type: DataTypes.STRING(600),
            allowNull: true,
            defaultValue: "''"
        },
        new: {
            type: DataTypes.INTEGER(11),
            allowNull: true,
            defaultValue: 0
        }
    }, {
        sequelize,
        tableName: 'Video',
        timestamps: false,
        indexes: [{
                name: "PRIMARY",
                unique: true,
                using: "BTREE",
                fields: [
                    { name: "vid" },
                ]
            },
            {
                name: "video_code",
                using: "BTREE",
                fields: [
                    { name: "video_code" },
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