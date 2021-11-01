'use strict';

module.exports = {
    up: async(queryInterface, Sequelize) => {
        await queryInterface.createTable('Reaction', {
            rid: {
                type: Sequelize.STRING(32),
                allowNull: false,
                defaultValue: Sequelize.Sequelize.literal('replace(uuid(),"-","")'),
                primaryKey: true
            },
            type: {
                type: Sequelize.STRING(1000),
                allowNull: true
            },
            at_second: {
                type: Sequelize.INTEGER,
                allowNull: true
            },
            video_code: {
                type: Sequelize.STRING(20),
                allowNull: true
            },
            user_name: {
                type: Sequelize.STRING(100),
                allowNull: true
            },
            visible: {
                type: Sequelize.SMALLINT,
                allowNull: true
            }
        }, {
            Sequelize,
            tableName: 'Reaction',
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
    },

    down: async(queryInterface, Sequelize) => {
        await queryInterface.dropTable('Reaction');
    }
};