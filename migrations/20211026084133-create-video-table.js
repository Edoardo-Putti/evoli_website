'use strict';

module.exports = {
    up: async(queryInterface, Sequelize) => {
        await queryInterface.createTable('Video', {
            vid: {
                type: Sequelize.STRING(32),
                allowNull: false,
                defaultValue: Sequelize.Sequelize.literal('replace(uuid(),"-","")'),
                primaryKey: true
            },
            title: {
                type: Sequelize.STRING(255),
                allowNull: true
            },
            duration: {
                type: Sequelize.INTEGER,
                allowNull: true
            },
            folder: {
                type: Sequelize.STRING(255),
                allowNull: true
            },
            url: {
                type: Sequelize.STRING(255),
                allowNull: true
            },
            uid: {
                type: Sequelize.STRING(32),
                allowNull: true,
                references: {
                    model: 'teacher',
                    key: 'uid'
                }
            },
            video_code: {
                type: Sequelize.STRING(20),
                allowNull: true
            },
            comment: {
                type: Sequelize.STRING(600),
                allowNull: true,
                defaultValue: "''"
            }
        }, {
            Sequelize,
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

    },

    down: async(queryInterface, Sequelize) => {
        await queryInterface.dropTable('Video');
    }
};