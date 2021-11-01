'use strict';

module.exports = {
    up: async(queryInterface, Sequelize) => {
        await queryInterface.createTable('Teacher', {
            uid: {
                type: Sequelize.STRING(32),
                allowNull: false,
                defaultValue: Sequelize.Sequelize.literal('replace(uuid(),"-","")'),
                primaryKey: true
            },
            email: {
                type: Sequelize.STRING(255),
                allowNull: true
            },
            hash: {
                type: Sequelize.STRING(100),
                allowNull: true
            },
            salt: {
                type: Sequelize.STRING(40),
                allowNull: true
            }
        }, {
            Sequelize,
            tableName: 'Teacher',
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

    },

    down: async(queryInterface, Sequelize) => {
        await queryInterface.dropTable('Teacher');
    }
};