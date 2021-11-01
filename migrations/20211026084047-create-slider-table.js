'use strict';

module.exports = {
    up: async(queryInterface, Sequelize) => {
        await queryInterface.createTable('Slider', {
            sid: {
                type: Sequelize.STRING(32),
                allowNull: false,
                defaultValue: Sequelize.Sequelize.literal('replace(uuid(),"-","")'),
                primaryKey: true
            },
            appreciation: {
                type: Sequelize.INTEGER,
                allowNull: true
            },
            understanding: {
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
            tableName: 'Slider',
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

    },

    down: async(queryInterface, Sequelize) => {
        await queryInterface.dropTable('Slider');
    }
};