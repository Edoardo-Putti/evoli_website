'use strict';

module.exports = {
    up: async(queryInterface, Sequelize) => {
        await queryInterface.createTable('Sessions', {
            session_id: {
                type: Sequelize.STRING(128),
                allowNull: false,
                primaryKey: true
            },
            expires: {
                type: Sequelize.INTEGER.UNSIGNED,
                allowNull: false
            },
            data: {
                type: Sequelize.TEXT,
                allowNull: true
            }
        }, {
            Sequelize,
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
    },

    down: async(queryInterface, Sequelize) => {
        await queryInterface.dropTable('Sessions');
    }
};